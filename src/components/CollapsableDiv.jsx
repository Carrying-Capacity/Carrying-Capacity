import React, { useState, useRef, useEffect } from "react";

const CollapsibleBox = ({ children, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  // Update height on toggle
  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
  <div className="bg-gray-100 rounded shadow w-full max-w-full mx-auto pb-4">
  {/* Header with title and toggle button */}
      <div className="flex items-center justify-between px-4 py-2 cursor-pointer">
        <h4 className="m-0">{title}</h4>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-500 hover:text-blue-700 transition"
        >
          {isOpen ? "Close" : "View"}
        </button>
      </div>

      {/* Collapsible content */}
      <div
        style={{ maxHeight: `${height}px` }}
        className="overflow-hidden transition-all duration-500 ease-in-out"
      >
        <div ref={contentRef} className="px-4 py-2 border-t border-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleBox;
