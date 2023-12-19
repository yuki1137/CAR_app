"use client";
import { useState } from "react";
import Button from "../../../components/Button";

export default function Page() {
  // テキストボックスの値を管理するための状態
  const [inputValue, setInputValue] = useState("");
  const [displayedText, setDisplayedText] = useState("");

  const handleClick = () => {
    // ボタンがクリックされたときの処理
    console.log("clicked", inputValue);
    setDisplayedText(inputValue);

    // ここで input の値を使って何かしらの処理を行う（例: ページ中央に表示）
  };

  return (
    <div>
      <h1>Button Test</h1>
      <div className="flex  justify-center mb-4">
        <input
          className=""
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        <Button onClick={handleClick}>投稿！</Button>

        {/* ボタンの下に表示するテキスト */}
        {displayedText && <p>本日の投稿時刻: {displayedText}</p>}
      </div>
    </div>
  );
}
