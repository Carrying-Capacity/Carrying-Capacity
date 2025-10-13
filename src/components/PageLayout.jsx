import React from "react";
import "../pages/PagesFormat.css";

export default function PageLayout({ children, className = "" }) {
  return (
    <div className={`home-container ${className}`}>
      <div className="content-stripe">
        {children}
      </div>
    </div>
  );
}