import React from "react";
import "../styles/modern-pages.css";

export default function PageLayout({ children, className = "", variant = "classic" }) {
  if (variant === "modern") {
    return (
      <div className={`modern-page-container ${className}`}>
        {children}
      </div>
    );
  }

  // Classic variant (default)
  return (
    <div className={`home-container ${className}`}>
      <div className="content-stripe">
        {children}
      </div>
    </div>
  );
}