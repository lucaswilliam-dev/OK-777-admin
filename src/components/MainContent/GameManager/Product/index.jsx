import React, { useEffect, useRef, useState } from "react";
import { Button, Modal } from "antd";
import { PlayCircleOutlined, EditOutlined } from "@ant-design/icons";
import "../GameProducts/style.css";

const Product = ({
  image = "/cat.jpg",
  cnName = "糖果大战",
  enName = "Candy Wars",
  onLaunch,
  onEdit,
}) => {
  const cnRef = useRef(null);
  const enRef = useRef(null);
  const [cnOverflow, setCnOverflow] = useState(false);
  const [enOverflow, setEnOverflow] = useState(false);

  const checkOverflow = () => {
    if (cnRef.current) {
      setCnOverflow(cnRef.current.scrollWidth > cnRef.current.clientWidth);
    }
    if (enRef.current) {
      setEnOverflow(enRef.current.scrollWidth > enRef.current.clientWidth);
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cnName, enName]);

  const handleReadMore = (label, value) => {
    Modal.info({
      title: `${label} Name`,
      content: <div className="read-more-content">{value}</div>,
      centered: true,
      okText: "Close",
      className: "product-read-more-modal",
    });
  };

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
        <div className="product-label-row">
          <span className="cn" ref={cnRef}>
            CN: {cnName}
          </span>
          {cnOverflow && (
            <button
              type="button"
              className="read-more-btn"
              onClick={() => handleReadMore("Chinese", cnName)}
              aria-label="Show full Chinese name"
              title="Show full Chinese name"
            >
              ...
            </button>
          )}
        </div>
        <div className="product-label-row">
          <span className="en" ref={enRef}>
            EN: {enName}
          </span>
          {enOverflow && (
            <button
              type="button"
              className="read-more-btn"
              onClick={() => handleReadMore("English", enName)}
              aria-label="Show full English name"
              title="Show full English name"
            >
              ...
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
