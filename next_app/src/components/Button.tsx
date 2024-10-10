import clsx from "clsx";
import React, { useState } from "react";


const ableSizes = {
  medium: "m-1 px-4 py-2 text-md",
  large: "m-2 px-6 py-3 text-3xl font-bold",
};
const ableColors = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
};

const disabledColor = "bg-gray-300 text-gray-500 cursor-not-allowed";


interface ButtonProps {
  onClick?: () => void;  // onClickをオプションに
  isDisabled?: boolean;
  children?: React.ReactNode;
  color?: keyof typeof ableColors;
  size?: keyof typeof ableSizes;
  className?: string;
}

const Button = ({ onClick, isDisabled, children, color, size, className }: ButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => {
    if (isDisabled) return;
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (isDisabled || !onClick) return; // onClickがない場合は何もしない
    onClick();
  };

  return (
    <button
      type="submit" // ここで明示的にtypeを指定するか、propsで受け取る
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={clsx(
        "rounded-md transition duration-300 ease-in-out transform",
        ableSizes[size ?? "medium"],
        isDisabled ? disabledColor : ableColors[color ?? "primary"],
        isPressed && !isDisabled && "scale-95",
        className,
      )}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
};

export default Button;
