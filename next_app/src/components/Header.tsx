import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import HamburgerMenu from "./HamburgerMenu";

type HeaderProps = {
  title: string;
  icon: React.ReactNode;
  userId?: string;
};

const Header = ({ title, icon, userId }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="pt-2">
      <nav className="flex justify-between items-center">
        <div style={{ marginLeft: "8px" }}>{icon}</div>
        <div className="text-xl font-bold">{title}</div>
        <button onClick={toggleMenu} style={{ marginRight: "8px" }}>
          <FaBars size={25} />
        </button>
      </nav>
      {isOpen && <HamburgerMenu closeMenu={toggleMenu} userId={userId} />}
    </header>
  );
};

export default Header;
