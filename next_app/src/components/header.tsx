import React, { useState } from "react";

type HeaderProps = {
  title: string;
};

const Header = ({ title }: HeaderProps) => {
  // ボタンがクリックされたかどうかを管理する状態変数
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ボタンクリック時の処理
  const toggleMenu = () => {
    setIsMenuOpen(true); // ボタンがクリックされたことを示す
  };

  const [isHomeOpen, setIsHomeOpen] = useState(false);

  const toggleHome = () => {
    setIsMenuOpen(true);
  };

  return (
    <header>
      <nav className="flex justify-between ">
        <button onClick={toggleHome}>ホームボタン</button>
        <div className="text-xl ">{title}</div>
        <button onClick={toggleMenu}>ハンバーガーメニュー</button>
      </nav>
      {/*isMenuOpen が true のときにテキストが表示される*/}
      {isMenuOpen && <div>ハンバーガーメニュー</div>}
      {isHomeOpen && <div>ホームボタン</div>}
    </header>
  );
};

export default Header;
