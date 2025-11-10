import React from "react";
import { HomeOutlined } from "@ant-design/icons";
import "./style.css";

const GameStore = () => {
  return (
    <div className="main-content">
      <div className="router">
        <HomeOutlined />
        <div>
          {"/ Third-Game /"} <span className="span">{"Game Store"}</span>
        </div>
      </div>
    </div>
  );
};

export default GameStore;
