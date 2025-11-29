import React, { useEffect, useState } from "react";
import "./Skeleton.css";

/**
 * Progressive loading bar that appears at the top of the page
 * Provides visual feedback during data loading
 */
const ProgressBar = ({ loading, duration = 300 }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setProgress(0);
      
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            return prev; // Hold at 90% until loading completes
          }
          return prev + Math.random() * 15;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      // Complete the progress bar
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, duration);
    }
  }, [loading, duration]);

  if (!visible) return null;

  return (
    <div className="progress-bar-container">
      <div 
        className="progress-bar" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;

