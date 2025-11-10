import React from "react";
import {
  SearchOutlined,
  AlipayOutlined,
  CommentOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import "./style.css";

const Header = () => {
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
          <Button type="primary" shape="circle">
            A
          </Button>
        </div>
      </header>
    </>
  );
};

export default Header;
