import React from "react";
import Table from "./Table";
import { HomeOutlined } from "@ant-design/icons";
import "./style.css";

const GameCategory = () => {
  return (
    <div className="main-content">
      <div className="router">
        <HomeOutlined />
        <div>
          {"/ Third-Game /"} <span className="span">{"Game Category"}</span>
        </div>
      </div>
      <Table />
    </div>
  );
};

export default GameCategory;
