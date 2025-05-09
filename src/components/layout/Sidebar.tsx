'use client';
import React from 'react';
import { Layout, Menu, Button, Avatar, Space, Tooltip, Flex } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { 
  UserOutlined, 
  DollarCircleOutlined, 
  CheckSquareOutlined, 
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@/hooks/useNavigation';
import Image from 'next/image';
import '../../styles/sidebar.css'; // 引入自定义CSS

interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapse }) => {
  const { navigateTo, navigateWithConfirm } = useNavigation();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const keysToOpenRef = useRef<string[] | null>(null);

  useEffect(() => {
    const defaultOpen = ['/main/rebate', '/main/densotask'].filter(path => pathname.startsWith(path));
    if (!collapsed) {
      setOpenKeys(defaultOpen);
    }
  }, [pathname]);

  // const isInPath = (path: string) => {
  //   return pathname.startsWith(path);
  // };

  const handleMenuClick = (e: { key: string }) => {
    if (collapsed && e.key.split('/').length > 3) {
      handleCollapse();
    }
    
    // 根据不同的路径设置不同的加载消息
    const loadingMessages: Record<string, string> = {
      '/main/dashboard': '正在加载仪表盘...',
      '/main/profile': '正在加载个人信息...',
      '/main/clients': '正在加载客户管理...',
      '/main/rebate/description': '正在加载返利项目描述...',
      '/main/rebate/use/overviewpage': '正在加载返利申请一览...',
      '/main/rebate/use/new': '正在准备创建返利申请...',
      '/main/densotask/description': '正在加载任务平台描述...',
      '/main/densotask/use': '正在加载任务平台...',
      '/main/documents': '正在加载文档中心...',
      '/main/settings': '正在加载系统设置...'
    };
    
    // 确定可能有未保存内容的页面路径
    const pathsWithConfirm = ['/main/rebate/use/new'];
    
    // 获取当前选中页面的路径
    const path = e.key;
    
    // 判断是否需要确认对话框
    if (pathsWithConfirm.includes(pathname)) {
      navigateWithConfirm(path, {
        shouldConfirm: true,
        confirmMessage: '您可能有未保存的内容，确定要离开吗？',
        loadingMessage: loadingMessages[path] || '正在加载页面...'
      });
    } else {
      navigateTo(path, { 
        loadingMessage: loadingMessages[path] || '正在加载页面...'
      });
    }
  };

  const handleLogoutClick = () => {
    console.log('Logout clicked');
    navigateWithConfirm('/login?logout=success', {
      shouldConfirm: true,
      confirmMessage: '确定要退出登录吗？',
      loadingMessage: '正在退出登录...',
      onComplete: () => {
        logout();
      }
    });
  };

  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    keysToOpenRef.current = null;
    if (newCollapsed) {
      setOpenKeys([]);
    }
    if (onCollapse) {
      onCollapse(newCollapsed);
    }
  };

  useEffect(() => {
    if (!collapsed && keysToOpenRef.current) {
      setOpenKeys(keysToOpenRef.current);
      keysToOpenRef.current = null;
    }
  }, [collapsed]);

  const handleOpenChange = (keys: string[]) => {
    if (collapsed) {
      const newKeyToOpen = keys.find(key => !openKeys.includes(key));
      if (newKeyToOpen) {
        keysToOpenRef.current = keys;
        handleCollapse();
      } else {
        setOpenKeys(keys);
      }
    } else {
      setOpenKeys(keys);
    }
  };

  // 计算logo的translateX值
  const SIDEBAR_COLLAPSED_WIDTH = 80;
  const ICON_WIDTH = 25;
  const translateXValue = collapsed ? (SIDEBAR_COLLAPSED_WIDTH  - ICON_WIDTH) / 4 : 0;

  return (
    <div 
      className="fixed left-6 top-6 bottom-6 z-50 transition-all duration-300"
      style={{ 
        width: collapsed ? 80 : 220,
        background: '#F5F5F5'
      }}
    >
      <Tooltip title={collapsed ? "展开菜单" : "收起菜单"}>
        <Button 
          type="default"
          shape="circle"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
          onClick={handleCollapse}
          className="sidebar-collapse-button"
        />
      </Tooltip>

      <div 
        className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className={`flex items-center border-b border-gray-100 h-[65px] overflow-hidden px-4 py-5`}>
          <div className={`flex items-center min-w-0 ${!collapsed ? 'flex-grow mr-2' : ''}`}>
            <Image 
              src="/logo.svg" 
              alt="Logo" 
              width={25} 
              height={25} 
              className="flex-shrink-0 transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(${translateXValue}px)` }}
            />
            <span
              className={`ml-3 font-semibold text-gray-800 whitespace-nowrap transition-opacity duration-300 ease-in-out ${ 
                collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              style={{ transitionDelay: collapsed ? '0s' : '0.1s' }}
            >
              项目管理系统
            </span>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto custom-sidebar-menu">
          <Menu
            theme="light"
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={[pathname]}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            onClick={handleMenuClick}
            triggerSubMenuAction="click"
            items={[
              {
                key: '/main/dashboard',
                icon: <DashboardOutlined />,
                label: '仪表盘',
                className: 'custom-menu-item',
              },
              {
                key: '/main/profile',
                icon: <UserOutlined />,
                label: '我的信息',
                className: 'custom-menu-item',
              },
              {
                key: '/main/clients',
                icon: <TeamOutlined />,
                label: '客户管理',
                className: 'custom-menu-item',
              },
              {
                key: '/main/rebate',
                icon: <DollarCircleOutlined />,
                label: '返利申请',
                className: 'custom-menu-item',
                children: [
                  {
                    key: '/main/rebate/description',
                    label: '项目描述',
                    className: 'custom-submenu-item',
                  },
                  {
                    key: '/main/rebate/use/overviewpage',
                    label: '项目展示',
                    className: 'custom-submenu-item',
                  },
                ],
              },
              {
                key: '/main/densotask',
                icon: <CheckSquareOutlined />,
                label: '任务平台',
                className: 'custom-menu-item',
                children: [
                  {
                    key: '/main/densotask/description',
                    label: '项目描述',
                    className: 'custom-submenu-item',
                  },
                  {
                    key: '/main/densotask/use',
                    label: '项目展示',
                    className: 'custom-submenu-item',
                  },
                ]
              },
              {
                key: '/main/documents',
                icon: <FileTextOutlined />,
                label: '文档中心',
                className: 'custom-menu-item',
              },
            ]}
            style={{ 
              borderRight: 0,
            }}
            className="border-0 bg-transparent"
          />
        </div>
        
        <div className="border-t border-gray-100 p-4">
          <Flex align="center" justify="space-between">
            {!collapsed && (
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <span
                  className={`text - gray - 600 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                  {user?.username || '用户'}
                </span>
              </Space>
            )}
            {collapsed && (
              <Avatar size="small" icon={<UserOutlined />} />
            )}
            <Space>
              {!collapsed && (
                <Tooltip title="设置">
                  <Button 
                    type="text" 
                    icon={<SettingOutlined />} 
                    size="small"
                    onClick={() => navigateTo('/main/settings', { loadingMessage: '正在加载系统设置...' })} 
                  />
                </Tooltip>
              )}
              <Tooltip title="退出登录">
                <Button 
                  type="text" 
                  icon={<LogoutOutlined />} 
                  size="small"
                  onClick={handleLogoutClick} 
                  danger
                />
              </Tooltip>
            </Space>
          </Flex>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
