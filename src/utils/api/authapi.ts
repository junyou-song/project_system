import axios from 'axios';
import { Client } from '../Client';
import { credentials, LoginResponse, ErrorResponse } from '@/types/auth';


export const loginUser = async function loginUser(credentials: credentials): Promise<LoginResponse> {
  try {
    const response = await Client.post<LoginResponse>('/api/auth/login', credentials)
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);

    let errorMessage = '登录时发生未知错误'; // 默认错误消息

    if (axios.isAxiosError(error)) { // 检查是否是 Axios 抛出的错误
      if (error.response) {
        console.error('Server Response Error:', error.response.status, error.response.data);
        // 后端/MSW mock 在出错时返回类似 { message: '...' } 的结构
        const serverMessage = (error.response.data as ErrorResponse)?.message;
        if (serverMessage) {
          errorMessage = serverMessage;
        } else if (error.response.status === 401) {
          errorMessage = '用户名或密码错误'; // 对 401 未授权给一个通用提示
        } else {
          errorMessage = `服务器错误 (${error.response.status})`;
        }
      } else if (error.request) {
        // 请求已发出，但没有收到响应 (例如网络问题)
        console.error('No Response Received:', error.request);
        errorMessage = '无法连接到服务器，请检查网络';
      } else {
        // 设置请求时发生了错误
        console.error('Axios Error Message:', error.message);
        errorMessage = `请求设置错误: ${error.message}`;
      }
    } else {
      // 不是 Axios 错误
      console.error('Non-Axios Error:', error);
      if (error instanceof Error) {
        errorMessage = error.message;
      }
    }
    throw new Error(errorMessage);
  }
}