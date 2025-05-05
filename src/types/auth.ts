
export interface credentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username?: string; // 可选，如果后端返回的话
}

export interface ErrorResponse {
  message: string;
}