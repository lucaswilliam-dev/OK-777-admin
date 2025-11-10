import React from "react";
import Table from "./Table";
import { HomeOutlined } from "@ant-design/icons";
import "./style.css";

const GameProvider = () => {
  return (
    <div className="main-content">
      <div className="router">
        <HomeOutlined />
        <div>
          {"/ Third-Game /"} <span className="span">{"Game Provider"}</span>
        </div>
      </div>
      <Table />
    </div>
  );
};

export default GameProvider;
