import React from "react";
import "../GameProducts/style.css";

const Product = () => {
  return (
    <>
      <div className="product">
        <div>
          <img src="/cat.jpg" alt="" id="cat-img" />
        </div>
        <div className="product-label">
          <p className="cn">CN:糖果大战</p>
          <p className="en">EN:Candy Wars</p>
        </div>
      </div>
    </>
  );
};

export default Product;
