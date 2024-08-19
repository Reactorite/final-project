import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './LoadingSpinner.css'; 

export default function LoadingSpinner() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 5);

    return () => clearInterval(interval);
  }, []);

  const radius = 30; // Smaller radius
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="d-flex justify-content-center align-items-center position-relative" style={{ width: '80px', height: '80px' }}>
      <svg width="80" height="80"> {/* Smaller dimensions */}
        <circle
          className="progress-circle-bg"
          cx="40"
          cy="40"
          r={radius}
          strokeWidth="10"
        />
        <circle
          className="progress-circle-fg"
          cx="40"
          cy="40"
          r={radius}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="position-absolute font-weight-bold" style={{ fontSize: '1em' }}>{progress}%</div>
    </div>
  );
}