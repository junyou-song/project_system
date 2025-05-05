import { http, HttpResponse } from 'msw'
import { credentials, LoginResponse } from '@/types/auth'
import { User } from '@/types/user'
import { rebateHandlers } from './handlers/rebate'; // 导入返利申请处理器

const mockUserName = 'admin';
const mockPassword = 'admin';

// 模拟用户数据
const mockUser: User = {
  id: 'mock-user-id-123',
  username: mockUserName,
  email: 'admin@example.com',
  role: 'admin'
};

// 开启宽松模式，接受任何token
const LENIENT_MODE = true;

// Token过期配置（2小时）
const TOKEN_EXPIRY_MS = 2 * 60 * 60 * 1000;

// 活跃的token存储和过期时间
interface TokenInfo {
  token: string;
  expiresAt: number;
  userId: string;
}

// 在内存中存储活跃token
let activeTokens: TokenInfo[] = [];

// 生成token的函数
const generateToken = (userId: string): TokenInfo => {
  // 随机生成一个token
  const randomPart = Math.random().toString(36).substring(2);
  const token = `mock-jwt-${userId}-${Date.now()}-${randomPart}`;
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  
  // 存储到活跃token列表
  const tokenInfo: TokenInfo = { token, expiresAt, userId };
  activeTokens.push(tokenInfo);
  
  console.log(`[MSW] 生成新token: ${token.substring(0, 15)}... 过期时间: ${new Date(expiresAt).toLocaleString()}`);
  
  return tokenInfo;
};

// 清理过期token
const cleanupExpiredTokens = () => {
  const now = Date.now();
  const initialCount = activeTokens.length;
  activeTokens = activeTokens.filter(t => t.expiresAt > now);
  const removedCount = initialCount - activeTokens.length;
  
  if (removedCount > 0) {
    console.log(`[MSW] 清理了 ${removedCount} 个过期token，当前活跃token: ${activeTokens.length}`);
  }
};

// 验证token
const validateToken = (token: string): { valid: boolean; userId?: string } => {
  // 清理过期token
  cleanupExpiredTokens();
  
  // 在宽松模式下，任何非空token都被视为有效
  if (LENIENT_MODE && token) {
    return { valid: true, userId: mockUser.id };
  }
  
  // 检查token是否在活跃列表中
  const tokenInfo = activeTokens.find(t => t.token === token);
  if (!tokenInfo) {
    console.log(`[MSW] Token无效: ${token.substring(0, 15)}...`);
    return { valid: false };
  }
  
  // 检查是否过期
  if (Date.now() > tokenInfo.expiresAt) {
    console.log(`[MSW] Token已过期: ${token.substring(0, 15)}...`);
    // 从活跃列表中移除
    activeTokens = activeTokens.filter(t => t.token !== token);
    return { valid: false };
  }
  
  console.log(`[MSW] Token有效: ${token.substring(0, 15)}... 用户ID: ${tokenInfo.userId}`);
  return { valid: true, userId: tokenInfo.userId };
};

// 从请求头中提取token
const extractTokenFromRequest = (request: Request): string | null => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // 去掉'Bearer '前缀
};

console.log('[MSW] 处理程序已加载，准备拦截API请求', LENIENT_MODE ? '(宽松模式)' : '');

// 在这里定义你的所有 API 模拟处理器
export const handlers = [
  // 登录接口
  http.post<never, credentials>('/api/auth/login', async ({ request }) => {
    console.log('[MSW] 拦截到登录请求');
    const body = await request.json() as credentials;
    // 模拟延迟
    await new Promise(res => setTimeout(res, 300));

    // 模拟验证
    if (body.username === mockUserName && body.password === mockPassword) {
      console.log('[MSW] 模拟登录成功:', body.username);
      
      // 生成新token
      const tokenInfo = generateToken(mockUser.id);
      
      return HttpResponse.json<LoginResponse>({ 
        token: tokenInfo.token
      });
    } else {
      console.log('[MSW] 模拟登录失败:', body.username);
      return HttpResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      );
    }
  }),

  // --- 模拟获取用户信息接口 ---
  http.get('/api/users/me', ({ request }) => {
    console.log('[MSW] 拦截到获取用户信息请求');
    
    // 从请求头获取token
    const token = extractTokenFromRequest(request);
    if (!token) {
      console.log('[MSW] /api/users/me: 未提供token');
      return new HttpResponse(null, { 
        status: 401, 
        statusText: 'Unauthorized' 
      });
    }
    
    // 验证token
    const { valid, userId } = validateToken(token);
    if (!valid) {
      console.log('[MSW] /api/users/me: token无效或已过期');
      return new HttpResponse(
        JSON.stringify({ message: 'Token无效或已过期' }), 
        { 
          status: 401, 
          statusText: 'Unauthorized',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Token有效：返回模拟用户信息
    console.log('[MSW] /api/users/me: token有效，返回用户信息');
    return HttpResponse.json<User>(mockUser); 
  }),
  
  // 登出接口
  http.post('/api/auth/logout', ({ request }) => {
    console.log('[MSW] 拦截到登出请求');
    
    // 从请求头获取token
    const token = extractTokenFromRequest(request);
    if (token) {
      // 从活跃token列表中移除
      const initialCount = activeTokens.length;
      activeTokens = activeTokens.filter(t => t.token !== token);
      const removed = initialCount - activeTokens.length;
      
      console.log(`[MSW] 登出成功，移除token: ${token.substring(0, 15)}... (${removed > 0 ? '已移除' : '未找到'})`);
    }
    
    return HttpResponse.json({ message: '登出成功' });
  }),
  
  // 添加返利申请处理器
  ...rebateHandlers,
  
  // 修改通配符处理程序，只处理/api/开头的请求
  http.all('/api/*', ({ request }) => {
    // 检查请求URL
    const url = new URL(request.url);
    const path = url.pathname;
    console.log('[MSW] 捕获到未明确处理的API请求:', request.method, path);
    
    // 在宽松模式下返回通用成功响应
    if (LENIENT_MODE) {
      console.log('[MSW] 宽松模式: 为未定义的API路径返回成功响应');
      return HttpResponse.json(
        { message: '操作成功', success: true, data: {} },
        { status: 200 }
      );
    }
    
    return HttpResponse.json(
      { message: '未找到API端点' },
      { status: 404 }
    );
  })
] 