import React, { useEffect } from "react";
import { Menu } from "antd";
import { BarChartOutlined, DownOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../../contexts";
import "./style.css";

const SideBar = () => {
  const {
    state,
    setSelectedKey,
    toggleMenuExpanded,
  } = useAppContext();

  const { selectedKey, isMenuExpanded } = state.sidebar;
  const navigate = useNavigate();
  const location = useLocation();

  // Map menu keys to routes
  const keyToRouteMap = {
    "game-category": "/",
    "game-provider": "/game-provider",
    "game-manager": "/game-manager",
    "game-store": "/game-store",
    "game-tags": "/game-tags",
  };

  // Map routes to menu keys
  const routeToKeyMap = {
    "/": "game-category",
    "/game-provider": "game-provider",
    "/game-manager": "game-manager",
    "/game-store": "game-store",
    "/game-tags": "game-tags",
  };

  // Sync selectedKey with current route
  useEffect(() => {
    const currentKey = routeToKeyMap[location.pathname];
    if (currentKey && currentKey !== selectedKey) {
      setSelectedKey(currentKey);
    }
  }, [location.pathname, selectedKey, setSelectedKey]);

  const menuItems = [
    {
      key: "game-category",
      label: "Game Category",
    },
    {
      key: "game-provider",
      label: "Game Provider",
    },
    {
      key: "game-manager",
      label: "Game Manager",
    },
    {
      key: "game-store",
      label: "Game Store",
    },
    {
      key: "game-tags",
      label: "Game Tags",
    },
  ];

  const toggleMenu = () => {
    toggleMenuExpanded();
  };

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
    const route = keyToRouteMap[key];
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-header" onClick={toggleMenu}>
        <BarChartOutlined className="sidebar-header-icon" />
        <span className="sidebar-header-text">Third-Game</span>
        <DownOutlined
          className={`sidebar-header-dropdown ${
            isMenuExpanded ? "expanded" : "collapsed"
          }`}
        />
      </div>
      {isMenuExpanded && (
        <Menu
          mode="vertical"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="sidebar-menu"
          onClick={handleMenuClick}
        />
      )}
    </div>
  );
};

export default SideBar;
