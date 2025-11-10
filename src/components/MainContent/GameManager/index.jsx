import React from "react";
import GameProducts from "./GameProducts";
import { HomeOutlined } from "@ant-design/icons";
import "./style.css";

const GameManager = () => {
  return (
    <div className="main-content">
      <div className="router">
        <HomeOutlined />
        <div>
          {"/ Third-Game /"} <span className="span">{"Game Manager"}</span>
        </div>
      </div>
      <GameProducts />
    </div>
  );
};

export default GameManager;
