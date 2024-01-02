import React, { useState, useEffect } from "react";
import HamburgerButton from "./HamburgerButton";
import { FaBed, FaGithub, FaHome, FaTimes, FaBusinessTime } from "react-icons/fa";
import { useRouter } from "next/navigation";

type HamburgerMenuProps = {
  closeMenu: () => void;
  userId?: string;
};

const HamburgerMenu = ({ closeMenu, userId }: HamburgerMenuProps) => {
  const router = useRouter();
  // 閉じるときと開けるときでアニメーションを逆転
  const [isClosing, setIsClosing] = useState(false);
  const handleMenuClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeMenu();
    }, 300);
  };

  const redirectAbsent = () => {
    if (userId) {
      handleMenuClose();
      router.push(`/absence/${userId}`);
    }
  };

  const redirectPromisedTime = () => {
    if (userId) {
      handleMenuClose();
      router.push(`/change-time/${userId}`);
    }
  };
  const redirectGit = () => {
    if (userId) {
      handleMenuClose();
      router.push(`https://github.com/oXyut/check-attendance-docker`);
    }
  };
  const redirectHome = () => {
    if (userId) {
      handleMenuClose(); // メニューを閉じる
      router.push(`/attend/${userId}`);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isClosing ? "animate-slideOut" : "animate-slideIn"
      } flex flex-col min-h-screen ${
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "bg-black border-white"
          : "bg-white border-black"
      }`}
    >
      <div className="justify-center flex items-center" style={{ height: "75px" }}>
        <div className="text-2xl ml-16 mr-16">メニュー</div>
        <button onClick={handleMenuClose}>
          <FaTimes size={30} />
        </button>
      </div>
      {userId && ( //admin,welcomeページでは表示しない
        <>
          <div className="border-t-2" style={{ borderColor: "var(--border-color)" }}>
            <HamburgerButton
              icon={<FaHome size={40} />}
              title="登校を記録"
              toggleEvent={redirectHome}
            />
          </div>
          <div className="border-t-2" style={{ borderColor: "var(--border-color)" }}>
            <HamburgerButton
              icon={<FaBed size={40} />}
              title="公欠の登録"
              toggleEvent={redirectAbsent}
            />
          </div>
          <div className="border-t-2" style={{ borderColor: "var(--border-color)" }}>
            <HamburgerButton
              icon={<FaBusinessTime size={40} />}
              title="登校目標時刻の変更"
              toggleEvent={redirectPromisedTime}
            />
          </div>
        </>
      )}
      <div className="border-t-2 border-b-2 " style={{ borderColor: "var(--border-color)" }}>
        <HamburgerButton
          icon={<FaGithub size={40} />}
          title="開発に参加しよう"
          toggleEvent={redirectGit}
        />
      </div>
    </div>
  );
};

export default HamburgerMenu;
