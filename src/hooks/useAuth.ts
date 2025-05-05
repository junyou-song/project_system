import { useState, useEffect, useCallback } from 'react';
import { loginUser } from '@/utils/api/authapi';
import { credentials, LoginResponse } from '@/types/auth';
import { User } from '@/types/user';
import { getUserProfile } from '@/utils/api/userapi';

// Token过期时间设置（例如2小时）
const TOKEN_EXPIRY_MS = 2 * 60 * 60 * 1000; 
// 添加重试配置
const MAX_RETRY_ATTEMPTS = 2; // 最大重试次数
const RETRY_DELAY_MS = 1000; // 重试延迟(毫秒)

interface StoredAuthData {
  token: string;
  expiresAt: number; // 过期时间戳
}

export const useAuth = () => { 
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);

  // 保存认证信息到localStorage
  const saveAuthData = useCallback((token: string) => {
    try {
      const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
      const authData: StoredAuthData = {
        token,
        expiresAt
      };
      localStorage.setItem('authData', JSON.stringify(authData));
      setToken(token);
      setTokenExpiresAt(expiresAt);
      console.log('[useAuth] 已保存认证信息，过期时间:', new Date(expiresAt).toLocaleString());
    } catch (error) {
      console.error('[useAuth] 保存认证信息失败:', error);
    }
  }, []);

  // 清除认证状态
  const clearAuthState = useCallback(() => {
    setUser(null);
    setToken(null);
    setTokenExpiresAt(null);
    localStorage.removeItem('authData');
    console.log('[useAuth] 已清除认证状态');
  }, []);

  // 检查token是否过期
  const isTokenExpired = useCallback(() => {
    if (!tokenExpiresAt) return true;
    return Date.now() >= tokenExpiresAt;
  }, [tokenExpiresAt]);

  // 初始化认证状态
  useEffect(() => {
    let isMounted = true;
    console.log('[useAuth] 钩子初始化');

    const initAuth = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      console.log('[useAuth] 检查认证状态...');
      setIsLoading(true);

      try {
        // 从localStorage读取认证数据
        const storedAuthDataStr = localStorage.getItem('authData');
        
        if (!storedAuthDataStr) {
          console.log('[useAuth] 未找到认证数据');
          if (isMounted) clearAuthState();
          return;
        }

        const storedAuthData = JSON.parse(storedAuthDataStr) as StoredAuthData;
        console.log('[useAuth] 找到本地存储的token，过期时间:', new Date(storedAuthData.expiresAt).toLocaleString());

        // 检查token是否过期
        if (Date.now() >= storedAuthData.expiresAt) {
          console.log('[useAuth] Token已过期，需要重新登录');
          if (isMounted) {
            clearAuthState();
            setError('登录已过期，请重新登录');
          }
          return;
        }

        // 设置token状态
        if (isMounted) {
          setToken(storedAuthData.token);
          setTokenExpiresAt(storedAuthData.expiresAt);
        }

        // 获取用户信息，带重试机制
        let attempts = 0;
        let lastError = null;
        
        while (attempts <= MAX_RETRY_ATTEMPTS) {
          try {
            console.log(`[useAuth] 尝试获取用户信息... (尝试 ${attempts + 1}/${MAX_RETRY_ATTEMPTS + 1})`);
            const initialUser = await getUserProfile();
            if (isMounted) {
              console.log('[useAuth] 用户信息获取成功:', initialUser);
              setUser(initialUser);
              setError(null);
              setSuccessMessage(null);
            }
            // 成功获取用户信息，跳出重试循环
            break;
          } catch (fetchError) {
            lastError = fetchError;
            console.error(`[useAuth] 获取用户信息失败 (尝试 ${attempts + 1}/${MAX_RETRY_ATTEMPTS + 1}):`, fetchError);
            
            // 如果是401错误（认证问题）则不重试
            if (fetchError instanceof Error && fetchError.message.includes('401')) {
              console.log('[useAuth] 认证错误(401)，不再重试');
              break;
            }
            
            attempts++;
            if (attempts <= MAX_RETRY_ATTEMPTS) {
              console.log(`[useAuth] ${RETRY_DELAY_MS/1000}秒后重试...`);
              // 等待一段时间后重试
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            }
          }
        }
        
        // 所有重试都失败了，处理最终的错误
        if (attempts > MAX_RETRY_ATTEMPTS && lastError) {
          console.error('[useAuth] 获取用户信息失败，已达最大重试次数:', lastError);
          if (isMounted) {
            if (lastError instanceof Error && lastError.message.includes('401')) {
              // 仅当确定是认证问题（401）时才清除认证状态
              clearAuthState();
              setError('会话已过期，请重新登录');
            } else {
              // 其他错误可能是网络或服务器问题，保留token但提示错误
              setError('无法获取用户信息，请检查网络连接');
            }
          }
        }
      } catch (err) {
        console.error('[useAuth] 初始化认证状态时出错:', err);
        if (isMounted) {
          clearAuthState();
          setError('检查认证状态时出错');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // 设置自动检查token过期的定时器
    const tokenCheckInterval = setInterval(() => {
      if (tokenExpiresAt && Date.now() >= tokenExpiresAt) {
        console.log('[useAuth] Token过期检测: 已过期');
        clearAuthState();
        setError('登录已过期，请重新登录');
        clearInterval(tokenCheckInterval);
      }
    }, 60000); // 每分钟检查一次

    return () => {
      isMounted = false;
      clearInterval(tokenCheckInterval);
    };
  }, [clearAuthState, saveAuthData]);

  // 登录函数
  const login = async (credentials: credentials) => {
    setError(null);
    setIsLoading(true);
    let success = false;
    try {
      const response = await loginUser(credentials);
      if (!response.token) {
        console.error('[useAuth] 登录响应中没有token');
        setError('登录失败：服务器未返回有效的认证令牌');
        return false;
      }

      console.log('[useAuth] 登录成功, 设置token');
      saveAuthData(response.token);
      setSuccessMessage('登录成功！正在加载用户信息');
      
      // 登录成功后立即获取用户信息
      try {
        const userProfile = await getUserProfile();
        setUser(userProfile);
        success = true;
      } catch (userError) {
        console.error('[useAuth] 登录后获取用户信息失败:', userError);
        setError('登录成功但无法获取用户信息');
        // 这里可以选择不清除token，因为token本身可能是有效的
        success = false;
      }
    } catch (err) {
      setSuccessMessage(null); 
      if (err instanceof Error) {
        console.error('[useAuth] 登录失败:', err.message);
        setError(err.message);
      } else {
        console.error('[useAuth] 登录时发生未知错误:', err);
        setError('登录时发生未知错误');
      }
      clearAuthState();
      success = false;
    } finally {
      setIsLoading(false);
    }
    return success;
  }

  // 退出登录
  const logout = () => {
    console.log('[useAuth] 执行退出登录');
    clearAuthState();
    setError(null);
    setSuccessMessage(null);
  }

  return { 
    isLoading,
    user,
    token,
    error,
    successMessage,
    isAuthenticated: !!token && !isTokenExpired(),
    login,
    logout,
    tokenExpiresAt
  }
}