"use client";
import { User } from "@prisma/client";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import { FaHome } from "react-icons/fa";
import { useState } from "react";
import Button from "../components/Button";
import { useRouter } from "next/navigation";
import CustomLinearProgress from "../components/CustomLinearProgress";

export default function Page() {
  const router = useRouter();
  // FIX: たまにisLoadingがtrueのままになってしまう
  const { data, isLoading, error } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axios.get("/api/users");
      console.log(data);
      return data;
    },
  });

  const [selectedName, setSelectedName] = useState<string>("");
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "") {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
      setSelectedName(e.target.value);
    }
  };

  const handleClick = () => {
    if (isLoading || !data) {
      return;
    }
    const selectedUser = data.find((user) => user.name === selectedName);

    if (selectedUser) {
      const url = `/attend/${selectedUser.id}`;
      router.push(url);
    }
  };

  return (
    <>
      <Header title="HE研登校管理" icon={<FaHome size={30} />} />
      {isLoading ? <CustomLinearProgress /> : <div></div>}
      {error ? (
        <div>エラーが発生しました： {error.message}</div>
      ) : (
        <div>
          <div className="flex justify-center pt-8 pb-2 font-bold">
            ユーザー選択（全{data ? data.length : " "}名）
          </div>
          <label className="flex justify-center">
            <select
              value={selectedName}
              onChange={handleSelect}
              className="w-32 px-2 py-2 rounded-md block appearance-none bg-white border border-gray-900 text-black"
            >
              {/* 初期オプション */}
              <option value=""></option>
              {/* data から取得した名前をオプションとしてマップ */}
              {data &&
                data.map((user) => (
                  <option key={user.id} value={user.name} className="text-black">
                    {user.name}
                  </option>
                ))}
            </select>
            <Button
              onClick={handleClick}
              isDisabled={isDisabled}
              color="primary"
              className="flex justify-center"
            >
              決定
            </Button>
          </label>
        </div>
      )}
    </>
  );
}
