'use client';

import React from 'react';
import { Popover } from 'antd';
import { WechatOutlined, QqOutlined, MailOutlined } from '@ant-design/icons';
import ContactPopoverContent from './ContactPopoverContent';

// 引用全局配色
import { colors } from '@/data/resumeData'; 

// --- 移除旧的独立颜色定义 ---
/*
const SKY_BLUE_BG = '#1CB9ED';    // 天空蓝背景 (主区域)
const DARK_GREY_BG = '#4A4A4A';   // 深灰背景 (页头 & 页脚)
const DEEP_MUSTARD_YELLOW = '#F7B733'; // **加深的芥末黄** (用作形状点缀)
const LIGHT_GREY_SHAPE = '#F3F4F6'; // 浅灰色 (用于形状点缀)
const WHITE_TEXT = '#FFFFFF';      // 白色文字/元素
*/
// ---------------------------------------------

interface FrontPageFooterProps {
  iconWrapperStyle: string;
}

export default function FrontPageFooter({ iconWrapperStyle}: FrontPageFooterProps) {

  return (
    <footer
      className="py-8 px-6 md:px-16 lg:px-32 mt-auto z-20"
      style={{ background: colors.PRIMARY }} // **改为新的主色背景**
    >
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-xl font-semibold mb-4" style={{ color: colors.WHITE_TEXT }}>关于</h3>
          <div className="flex items-center ">
            <img src="/Information/照片.jpg" alt="Avatar" className="w-25 h-25 rounded-full mr-3" />
            <p className="text-sm" style={{ color: colors.WHITE_TEXT, opacity: 0.85 }}>
              一个用于展示项目作品和成果的在线平台。
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4" style={{ color: colors.WHITE_TEXT }}>相关链接</h3>
          <ul className="list-none space-y-2">
            <li>
              <a href="#" className="hover:underline text-sm" style={{ color: colors.WHITE_TEXT, opacity: 0.85 }}>
                - 设计作品集
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline text-sm" style={{ color: colors.WHITE_TEXT, opacity: 0.85 }}>
                - 技术博客
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4" style={{ color: colors.WHITE_TEXT }}>联系方式</h3>
          <p className="text-sm mb-4" style={{ color: colors.WHITE_TEXT, opacity: 0.85 }}>
            如有任何疑问或合作意向，请通过以下方式联系。
          </p>
          <div className="flex space-x-4">
            <Popover content={<ContactPopoverContent type="wechat" />} title="联系微信" trigger="hover">
              <div className={iconWrapperStyle} style={{ background: '#25D366' }}>
                <WechatOutlined style={{ fontSize: '18px', color: colors.WHITE_TEXT }} />
              </div>
            </Popover>
            <Popover content={<ContactPopoverContent type="qq" />} title="联系QQ" trigger="hover">
              <div className={iconWrapperStyle} style={{ background: '#1DA1F2' }}>
                <QqOutlined style={{ fontSize: '18px', color: colors.WHITE_TEXT }} />
              </div>
            </Popover>
            <Popover content={<ContactPopoverContent type="email" />} title="联系邮箱" trigger="hover">
              <div className={iconWrapperStyle} style={{ background: '#EA4335' }}>
                <MailOutlined style={{ fontSize: '18px', color: colors.WHITE_TEXT }} />
              </div>
            </Popover>
          </div>
        </div>
      </div>
    </footer>
  );
}