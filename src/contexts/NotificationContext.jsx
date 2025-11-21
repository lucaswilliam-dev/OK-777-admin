import React, { createContext, useContext, useCallback, useMemo } from "react";
import { App as AntdApp, notification } from "antd";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = useCallback(
    (type, title, description, options = {}) => {
      api[type]?.({
        message: title,
        description,
        placement: options.placement || "topRight",
        duration: options.duration ?? 3,
        ...options,
      });
    },
    [api]
  );

  const value = useMemo(
    () => ({
      notifySuccess: (title, description, options) =>
        openNotification("success", title, description, options),
      notifyError: (title, description, options) =>
        openNotification("error", title, description, options),
      notifyInfo: (title, description, options) =>
        openNotification("info", title, description, options),
      notifyWarning: (title, description, options) =>
        openNotification("warning", title, description, options),
    }),
    [openNotification]
  );

  return (
    <AntdApp>
      <NotificationContext.Provider value={value}>
        {contextHolder}
        {children}
      </NotificationContext.Provider>
    </AntdApp>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

