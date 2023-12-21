"use client";
import { User } from "@prisma/client";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { string } from "zod";
import { stringify } from "querystring";
import Header from "../components/Header";
import { FaHome } from "react-icons/fa";
import { useState, useEffect } from "react";

type PostDataType = {
  name: string;
  promisedTime: string;
};

export default function Page() {
  const [data, setData] = useState<User[]>([]);
  const { isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axios.get("/api/users");
      console.log(data);
      return data;
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (data: PostDataType) => {
      const { data: res } = await axios.post("/api/users", data);
      console.log(res);
    },
  });

  const [selectedName, setSelectedName] = useState<string>(""); // 選択された名前を管理

  const handleAddUser = () => {
    mutate({ name: "Carlie", promisedTime: "2021-01-01" });
  };

  //以下追加したコード

  useEffect(() => {
    // データを取得する非同期関数
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/users"); // 適切なエンドポイントに変更
        setData(response.data); // 取得したデータをステートにセット
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // 非同期関数を呼び出し

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // マウント時に1回だけ実行

  return (
    <>
      <Header title="HE研登校管理" icon={<FaHome size={30} />} />
      <button onClick={handleAddUser}>add user</button>
      <div>isLoading: {isLoading ? "true" : "false"} </div>

      {/* プルダウンリスト */}
      <label>
        Select a name:
        <select value={selectedName} onChange={(e) => setSelectedName(e.target.value)}>
          {/* 初期オプション */}
          <option value="">Select...</option>
          {/* data から取得した名前をオプションとしてマップ */}
          {data &&
            data.map((user) => (
              <option key={user.id} value={user.name}>
                {user.name}
              </option>
            ))}
        </select>
      </label>
      {/* 選択された名前を表示 */}
      <div>Selected Name: {selectedName}</div>

      <ul>
        {data &&
          data.map((user) => (
            <li key={user.id}>
              {user.name} {typeof user.promisedTime === "string" && user.promisedTime}
            </li>
          ))}
      </ul>
    </>
  );
}
