import axios from 'axios';

export const Client = axios.create({
  baseURL: '',  // 保持为空字符串，因为我们的API路径已经包含 /api 前缀
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- 添加请求拦截器 ---
Client.interceptors.request.use(
  (config) => {
    // 尝试从 localStorage 获取认证数据
    const authDataStr = localStorage.getItem('authData');
    
    if (authDataStr) {
      try {
        // 解析认证数据
        const authData = JSON.parse(authDataStr);
        
        // 检查token是否过期
        if (authData.token && authData.expiresAt > Date.now()) {
          // 如果token存在且未过期，将其添加到Authorization请求头中
          config.headers.Authorization = `Bearer ${authData.token}`;
          console.log('[Axios Interceptor] Token添加到请求头');
        } else {
          // token过期，记录日志
          console.log('[Axios Interceptor] Token已过期，请求发送时不包含token');
          // 可以在这里移除过期的token
          localStorage.removeItem('authData');
        }
      } catch (error) {
        console.error('[Axios Interceptor] 解析认证数据失败:', error);
        localStorage.removeItem('authData');
      }
    } else {
      console.log('[Axios Interceptor] 未找到认证数据，请求发送时不包含token');
    }
    
    // 添加请求URL日志
    console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config; // 返回修改后的配置
  },
  (error) => {
    // 处理请求配置时的错误
    console.error('[Axios Interceptor] Request error:', error);
    return Promise.reject(error);
  }
);
// ---------------------

// 添加响应拦截器，用于记录响应状态和错误
Client.interceptors.response.use(
  (response) => {
    console.log(`[Axios Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`[Axios Error] ${error.response.status} ${error.config?.url}`, error.response.data);
      
      // 处理401错误（未授权）
      if (error.response.status === 401) {
        // 可能是token过期或无效，清除本地存储的认证数据
        localStorage.removeItem('authData');
        console.log('[Axios Interceptor] 收到401响应，已清除认证数据');
        
        // 如果需要，可以在这里添加重定向到登录页面的逻辑
        // window.location.href = '/login?session=expired';
      }
    } else if (error.request) {
      console.error('[Axios Error] No response received:', error.request);
    } else {
      console.error('[Axios Error] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 未来可以在这里添加响应拦截器 (Response Interceptor) 来处理全局错误或 Token 刷新

