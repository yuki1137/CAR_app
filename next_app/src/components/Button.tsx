import clsx from "clsx";
import React, { useState } from "react";

interface ButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
  color?: keyof typeof ableColors;
  size?: keyof typeof ableSizes;
}

const ableSizes = {
  small: "px-2 py-1 text-sm",
  medium: "px-4 py-2 text-md",
  large: "px-6 py-3 text-lg",
};
const ableColors = {
  primary: "bg-green-600 text-white hover:bg-green-900",
  secondary: "bg-gray-600 text-white hover:bg-gray-900",
  disabled: "bg-red-600 text-white  hover:bg-red-900",
};

const Button = ({ onClick, className, children, color, size }: ButtonProps) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (!isClicked) {
      setIsClicked(true);
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "px-4 py-2 rounded-md ",
        ableSizes[size ?? "medium"],
        ableColors[color ?? "primary"],
        isClicked ? ableColors.disabled : ableColors[color ?? "primary"],
      )}
      disabled={isClicked}
    >
      {children}
    </button>
  );
};

export default Button;
