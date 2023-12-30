import React, { useState } from "react";

type HamburgerButtonProps = {
  icon: React.ReactNode;
  title: string;
  toggleEvent: () => void;
};

const HamburgerButton = ({ icon, title, toggleEvent }: HamburgerButtonProps) => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <button
        onClick={toggleEvent}
        className={`flex items-center w-full hover:bg-gray-300 ${
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "border-white"
            : "border-black"
        }`}
        style={{ height: "75px" }}
      >
        <div className="ml-8 mr-8">{icon}</div>
        <div className="text-xl">{title}</div>
      </button>
    </div>
  );
};

export default HamburgerButton;
