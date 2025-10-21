
// Button variants with consistent styling
const buttonVariants = {
  primary: "bg-blue-500 text-white hover:bg-blue-600",
  secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
  success: "bg-green-500 text-white hover:bg-green-600",
  danger: "bg-red-500 text-white hover:bg-red-600",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
};

const buttonSizes = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2",
  lg: "px-6 py-3 text-lg",
};

export const Button = ({ 
  children, 
  variant = "secondary", 
  size = "md", 
  active = false,
  disabled = false,
  className = "",
  onClick,
  ...props 
}) => {
  const baseClasses = "rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50";
  const variantClasses = active ? buttonVariants.primary : buttonVariants[variant];
  const sizeClasses = buttonSizes[size];
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Specialized button for toggle functionality
export const ToggleButton = ({ isActive, ...props }) => (
  <Button active={isActive} {...props} />
);

// Button group for related actions
export const ButtonGroup = ({ children, className = "" }) => (
  <div className={`flex gap-2 ${className}`}>
    {children}
  </div>
);