import React from "react";
import "./Skeleton.css";

/**
 * Skeleton loader for game product cards
 * Mimics the exact Product component structure used in GameManager
 * Uses the same classes as Product component to ensure proper layout
 */
const GameCardSkeleton = ({ count = 12 }) => {
  return (
    <div className="products">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="product skeleton-product">
          <div className="product-image-container skeleton-product-image-container">
            <div className="skeleton-image" />
          </div>
          <div className="product-label skeleton-product-label">
            <div className="product-label-row skeleton-product-label-row">
              <div className="skeleton-line skeleton-cn" />
            </div>
            <div className="product-label-row skeleton-product-label-row">
              <div className="skeleton-line skeleton-en" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameCardSkeleton;

