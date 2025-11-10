import React from "react";
import Table from "./Table";
import { HomeOutlined } from "@ant-design/icons";
import "./style.css";

const GameTag = () => {
  return (
    <div className="main-content">
      <div className="router">
        <HomeOutlined />
        <div>
          {"/ Third-Game /"} <span className="span">{"Game Tags"}</span>
        </div>
      </div>
      <Table />
    </div>
  );
};

export default GameTag;
