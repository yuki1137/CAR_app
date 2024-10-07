"use client"; // クライアントコンポーネントとしてマーク

import { useEffect, useState } from "react";
import Header from "@/components/Header"; // ヘッダーをインポート
import { FaHistory } from "react-icons/fa";

const Page = ({ params }: { params: { userId: string } }) => {
  const userId = params.userId; // URLの[userId]からユーザーIDを取得
  const [userName, setUserName] = useState<string | null>(null); // ユーザー名の状態を管理

  return (
    <div>
      <Header title="登校の履歴" icon={<FaHistory size={32} />} userId={userId} />

      <h1>Here is {userName ? userName : "loading..."} page.</h1>
    </div>
  );
};

export default Page;
