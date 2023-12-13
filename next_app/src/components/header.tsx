import React, { useState } from "react";
import { FaHome, FaBars } from "react-icons/fa";

type HeaderProps = {
  title: string;
};

const Header = ({ title }: HeaderProps) => {
  const homeIcon = "/images/home-icon.png";
  const menuIcon = "/images/menu-icon.png";

  const toggleHome = () => {};
  const toggleMenu = () => {};

  return (
    <header className="pt-2">
      <nav className="flex justify-between items-center">
        <button onClick={toggleHome} style={{ marginLeft: "5px" }}>
          <FaHome size={30} />
        </button>
        <div className="text-xl" style={{ fontFamily: "Noto Sans JP, sans-serif" }}>
          {title}
        </div>
        <button onClick={toggleMenu} style={{ marginRight: "8px" }}>
          <FaBars size={25} />
        </button>
      </nav>
    </header>
  );
};

export default Header;
