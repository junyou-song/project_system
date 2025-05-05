import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // 根据你的项目结构，可能需要添加或修改这些路径
  ],
  theme: {
    extend: {
      fontFamily: {
        // 定义 sans 字体栈
        sans: [
          '"PingFang SC"',         // 1. 优先使用苹方 (适用于 macOS/iOS 中文环境)
          'system-ui',             // 2. 使用系统默认 UI 字体 (现代浏览器)
          '-apple-system',         // 3. 兼容旧版 macOS/iOS
          'BlinkMacSystemFont',    // 4. Chrome on macOS
          '"Segoe UI"',           // 5. Windows 默认 UI 字体
          'Roboto',                // 6. Android 默认字体
          '"Helvetica Neue"',      // 7. 备选西文字体 (macOS/iOS)
          'Arial',                 // 8. 通用西文字体
          '"Noto Sans SC"',        // 9. 备选开源中文字体 (可由 Google Fonts 引入)
          'sans-serif',            // 10. 浏览器默认无衬线字体
          '"Apple Color Emoji"',   // 支持 Emoji
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        // 你也可以在这里定义 serif 或其他字体栈
        // serif: ['Georgia', 'serif'],
      },
      // 在这里扩展其他主题设置，例如颜色、间距等
      // backgroundImage: {
      //   'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      //   'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      // },
    },
  },
  plugins: [
    // 在这里添加 Tailwind CSS 插件
  ],
};

export default config;