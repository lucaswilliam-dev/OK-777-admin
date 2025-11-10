import React from "react";
import "../GameProducts/style.css";

const Product = () => {
  return (
    <>
      <div className="product">
        <div>
          <img
            src="/cat.jpg"
            alt=""
            style={{ width: "107px", height: "140px" }}
          />
        </div>
        <div className="product-label">
          <p>CN:糖果大战</p>
          <p>EN:Candy Wars</p>
        </div>
      </div>
    </>
  );
};

export default Product;
