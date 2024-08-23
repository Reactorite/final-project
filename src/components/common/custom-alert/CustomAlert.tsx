import React, { useEffect } from "react";
import "./CustomAlert.css";

interface CustomAlertProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ message, type = "success", duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return "🎉"; 
      case "error":
        return "🚫"; 
      case "warning":
        return "⚠️"; 
      case "info":
        return "ℹ️"; 
      default:
        return null;
    }
  };

  return (
    <div className={`custom-alert custom-alert-${type}`}>
      <span className="custom-alert-icon">{getIcon()}</span>
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
  );
};

export default CustomAlert;
