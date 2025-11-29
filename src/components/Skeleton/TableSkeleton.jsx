import React from "react";
import "./Skeleton.css";

/**
 * Skeleton loader for table rows
 * Mimics the actual table structure for a natural loading experience
 */
const TableSkeleton = ({ rows = 10, columns = 7 }) => {
  return (
    <div className="skeleton-table-container">
      <table className="skeleton-table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <th key={colIndex}>
                <div className="skeleton-line skeleton-header" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <div className="skeleton-line skeleton-cell" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;

