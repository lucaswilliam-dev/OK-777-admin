import React, { useMemo, useCallback, memo } from "react";
import {
  SearchOutlined,
  AlipayOutlined,
  CommentOutlined,
  SunOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, message } from "antd";
import apiService from "../../services/api";
import "./style.css";

const Header = memo(({ onLogout }) => {
  // Memoize user info to avoid re-parsing on every render
  const user = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    return null;
  }, []); // Only parse once on mount

  const handleLogout = useCallback(() => {
    try {
      // Use API service logout to clear all authentication data
      apiService.logout();
      
      // Dispatch custom event for other components/tabs
      window.dispatchEvent(new Event('logout'));
      
      // Call parent logout handler if provided
      if (onLogout) {
        onLogout();
      }
      
      message.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Error during logout');
    }
  }, [onLogout]);

  const getUserInitial = useMemo(() => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'A';
  }, [user?.email]);

  const userMenuItems = useMemo(() => [
    {
      key: 'profile',
      label: (
        <div style={{ padding: '8px 0', minWidth: '150px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{user?.email || 'Admin'}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {user?.role || 'Admin'}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <span onClick={handleLogout} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogoutOutlined /> Logout
        </span>
      ),
    },
  ], [user?.email, user?.role, handleLogout]);

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="/logo.png" alt="" className="logo-image" />
          <div className="logo-letter">OK777 Admin Panel</div>
        </div>
        <div className="menu">
          <Button shape="circle" icon={<SearchOutlined />} />
          <Button shape="circle" icon={<AlipayOutlined />} />
          <Button shape="circle" icon={<CommentOutlined />} />
          <Button shape="circle" icon={<SunOutlined />} />
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Button 
              type="primary" 
              shape="circle" 
              style={{ cursor: 'pointer' }}
              title={user?.email || 'Admin'}
            >
              {getUserInitial}
            </Button>
          </Dropdown>
        </div>
      </header>
    </>
  );
});

Header.displayName = 'Header';

export default Header;
