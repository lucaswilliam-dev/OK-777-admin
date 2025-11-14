import React from "react";
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

const Header = ({ onLogout }) => {
  // Get user info from localStorage
  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
    return null;
  };

  const user = getUserInfo();

  const handleLogout = () => {
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
  };

  const getUserInitial = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'A';
  };

  const userMenuItems = [
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
  ];

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
              {getUserInitial()}
            </Button>
          </Dropdown>
        </div>
      </header>
    </>
  );
};

export default Header;
