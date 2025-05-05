'use client';

import React from 'react';

interface Props {
  type: 'wechat' | 'qq' | 'email';
}

const popoverContentStyle = "bg-white rounded-lg p-3 shadow-lg";
const popoverTextStyle = "text-sm text-gray-700 mb-1";
const popoverLinkStyle = "text-sm text-blue-500 hover:text-blue-700 hover:underline";

export default function ContactPopoverContent({ type }: Props) {

  if (type === 'wechat') {
    return (
      <div className={popoverContentStyle}>
        <p className={popoverTextStyle}>扫描二维码添加微信</p>
        <img src="/Information/Wechat.jpg" alt="WeChat QR Code" width={150} />
      </div>
    );
  }

  if (type === 'qq') {
    return (
      <div className={popoverContentStyle}>
        <p className={popoverTextStyle}>QQ: 1471857092</p>
        <a
          href="tencent://message/?uin=1471857092&Site=在线QQ&Menu=yes" target="_blank" rel="noopener noreferrer"
          className={popoverLinkStyle}
        >
          点击发起QQ聊天
        </a>
      </div>
    );
  }

  if (type === 'email') {
    return (
      <div className={popoverContentStyle}>
        <p className={popoverTextStyle}>邮箱: sjy1471857092@163.com</p>
        <a
          href="mailto:sjy1471857092@163.com"
          className={popoverLinkStyle}
        >
          点击发送邮件
        </a>
      </div>
    );
  }

  return null; // Return null if type doesn't match
} 