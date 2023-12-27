import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import HamburgerMenu from "./HamburgerMenu";

type HeaderProps = {
  title: string;
  icon: React.ReactNode;
};

const Header = ({ title, icon }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {HamburgerMenu};
  

  return (
    <header className="pt-2">
      <nav className="flex justify-between items-center">
        <div style={{ marginLeft: "8px" }}>{icon}</div>
        <div className="text-xl">{title}</div>
        <button onClick={toggleMenu} style={{ marginRight: "8px" }}>
          <FaBars size={25} />
        </button>
      </nav>
    </header>
  );
};

export default Header;
