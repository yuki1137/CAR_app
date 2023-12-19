import clsx from "clsx";
import React, { useState } from "react";

interface ButtonProps {
  onClick: () => void;
  isDisabled?: boolean;
  children?: React.ReactNode;
  color?: keyof typeof ableColors;
  size?: keyof typeof ableSizes;
  className?: string;
}

const ableSizes = {
  medium: "m-1 px-4 py-2 text-md",
  large: "m-2 px-6 py-3 text-3xl font-bold",
};
const ableColors = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
};

const disabledColor = "bg-gray-300 text-gray-500 cursor-not-allowed";

const Button = ({ onClick, isDisabled, children, color, size, className }: ButtonProps) => {
  const handleClick = () => {
    if (isDisabled) return;
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "rounded-md ",
        ableSizes[size ?? "medium"],
        isDisabled ? disabledColor : ableColors[color ?? "primary"],
        className,
      )}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
};

export default Button;
