'use client';

import React from 'react';
import Link from 'next/link';
import { Popover } from 'antd';
import { WechatOutlined, QqOutlined, MailOutlined } from '@ant-design/icons';
import ContactPopoverContent from './ContactPopoverContent';

// 引用全局配色 (假设从 resumeData 导入)
import { colors } from '@/data/resumeData'; 

interface FrontPageHeaderProps {
  iconWrapperStyle: string;
}

export default function FrontPageHeader({ iconWrapperStyle}: FrontPageHeaderProps) {

  return (
    <header
      className="w-full mx-auto flex items-center justify-between h-16 px-6 md:px-16 lg:px-32 shadow-md z-20"
      style={{ background: colors.PRIMARY }} // 使用新的主色背景
    >
      <div>
        <Link href="/" className="text-2xl font-bold" style={{ color: colors.WHITE_TEXT }}>Project System</Link>
      </div>

      <div className="flex items-center space-x-4">
        <Popover content={<ContactPopoverContent type="wechat" />} title="联系微信" trigger="hover">
          <div className={iconWrapperStyle} style={{ background: '#25D366' }}>
            <WechatOutlined style={{ fontSize: '20px', color: colors.WHITE_TEXT }} />
          </div>
        </Popover>
        <Popover content={<ContactPopoverContent type="qq" />} title="联系QQ" trigger="hover">
          <div className={iconWrapperStyle} style={{ background: '#1DA1F2' }}>
            <QqOutlined style={{ fontSize: '20px', color: colors.WHITE_TEXT }} />
          </div>
        </Popover>
        <Popover content={<ContactPopoverContent type="email" />} title="联系邮箱" trigger="hover">
          <div className={iconWrapperStyle} style={{ background: '#EA4335' }}>
            <MailOutlined style={{ fontSize: '20px', color: colors.WHITE_TEXT }} />
          </div>
        </Popover>
      </div>
    </header>
  );
}