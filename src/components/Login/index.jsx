import React, { useState } from "react";
import { Form, Input, Button, message, Card, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import apiService from "../../services/api";
import "./style.css";

const { Title, Text } = Typography;

const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await apiService.login(values.email, values.password);
      
      if (response.code === 200 && response.data && response.data.token) {
        // Verify token was stored
        const token = localStorage.getItem('token');
        if (token) {
          message.success('Login successful!');
          // Small delay to ensure state updates
          setTimeout(() => {
            onLoginSuccess && onLoginSuccess(response.data);
          }, 100);
        } else {
          message.error('Login failed: Token not stored');
          setLoading(false);
        }
      } else {
        message.error(response.message || 'Login failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="login-container">
      <Card className="login-card" bordered>
        <div className="login-header">
          <div className="login-logo">
            <img src="/logo.png" alt="OK777" className="login-logo-image" />
          </div>
          <Title level={2} className="login-title">Admin Login</Title>
          <Text type="secondary" className="login-subtitle">
            Please sign in to your account
          </Text>
        </div>
        <Form
          name="login"
          className="login-form"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label={<span className="form-label">Email</span>}
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<UserOutlined className="input-icon" />}
              placeholder="Enter your email address"
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className="form-label">Password</span>}
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="Enter your password"
              className="login-input"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              loading={loading}
              block
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

