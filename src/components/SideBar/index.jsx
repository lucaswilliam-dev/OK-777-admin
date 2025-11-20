import React, { useEffect, useMemo, useCallback, memo } from "react";
import { Menu } from "antd";
import { BarChartOutlined, DownOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../../contexts";
import "./style.css";

// Map menu keys to routes
const keyToRouteMap = {
  "game-category": "/game-category",
  "game-provider": "/game-provider",
  "game-manager": "/game-manager",
  "game-store": "/game-store",
  "game-tags": "/game-tags",
};

// Map routes to menu keys
const routeToKeyMap = {
  "/game-category": "game-category",
  "/game-provider": "game-provider",
  "/game-manager": "game-manager",
  "/game-store": "game-store",
  "/game-tags": "game-tags",
  "/": "game-category", // Fallback for root path
};

const SideBar = memo(() => {
  const {
    state,
    setSelectedKey,
    toggleMenuExpanded,
  } = useAppContext();

  // Only extract what we need from state to prevent unnecessary re-renders
  const selectedKey = state.sidebar.selectedKey;
  const isMenuExpanded = state.sidebar.isMenuExpanded;
  const navigate = useNavigate();
  const location = useLocation();

  // Sync selectedKey with current route
  useEffect(() => {
    const currentKey = routeToKeyMap[location.pathname];
    if (currentKey && currentKey !== selectedKey) {
      setSelectedKey(currentKey);
    }
  }, [location.pathname, selectedKey, setSelectedKey]);

  // Memoize menuItems to prevent recreation on every render
  const menuItems = useMemo(() => [
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
  ], []);

  const toggleMenu = useCallback(() => {
    toggleMenuExpanded();
  }, [toggleMenuExpanded]);

  const handleMenuClick = useCallback(({ key }) => {
    setSelectedKey(key);
    const route = keyToRouteMap[key];
    if (route) {
      navigate(route);
    }
  }, [setSelectedKey, navigate]);

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
});

SideBar.displayName = 'SideBar';

export default SideBar;
