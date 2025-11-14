import React from "react";
import { Button } from "antd";
import { PlayCircleOutlined, EditOutlined } from "@ant-design/icons";
import "../GameProducts/style.css";

const Product = ({
  image = "/cat.jpg",
  cnName = "糖果大战",
  enName = "Candy Wars",
  onLaunch,
  onEdit,
}) => {
  return (
    <div className="product">
      <div className="product-image-container">
        <img src={image} alt="" className="product-image" />
        <div className="product-overlay">
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            className="product-action-btn product-launch-btn"
            onClick={onLaunch}
          >
            Launch
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            className="product-action-btn product-edit-btn"
            onClick={onEdit}
          >
            Edit
          </Button>
        </div>
      </div>
      <div className="product-label">
        <p className="cn">CN:{cnName}</p>
        <p className="en">EN:{enName}</p>
      </div>
    </div>
  );
};

export default Product;
