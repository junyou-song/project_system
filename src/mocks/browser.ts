import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 配置 Mock Service Worker 使用定义的 handlers
export const worker = setupWorker(...handlers) 