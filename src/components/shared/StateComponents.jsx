import React from "react";

// Loading spinner component
export const LoadingSpinner = ({ size = "md", message = "Loading..." }) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}></div>
      {message && <span className="ml-3 text-gray-600">{message}</span>}
    </div>
  );
};

// Error message component
export const ErrorMessage = ({ message, details, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-600 font-medium">{message}</p>
    {details && (
      <p className="text-sm text-red-500 mt-2">{details}</p>
    )}
    {onRetry && (
      <button 
        onClick={onRetry}
        className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

// Empty state component
export const EmptyState = ({ message = "No data found.", icon, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
    {icon && <div className="mb-4 text-gray-400">{icon}</div>}
    <p className="text-lg">{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// Combined loading wrapper that handles loading, error, and empty states
export const DataStateWrapper = ({ 
  loading, 
  error, 
  data, 
  children, 
  loadingMessage = "Loading...",
  errorMessage = "Failed to load data",
  emptyMessage = "No data available"
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner message={loadingMessage} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={errorMessage}
        details={typeof error === 'string' ? error : error?.message}
      />
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return <EmptyState message={emptyMessage} />;
  }

  return children;
};