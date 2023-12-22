"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";

const Page = () => {
  const router = useRouter();
  console.log(router.query);
  const { id } = router.query;
  // const [userData, setUserData] = useState(null);

  // useEffect(() => {
  //   // idが存在するか確認
  //   if (id) {
  //     // ユーザーの詳細情報を取得
  //     const fetchUserData = async () => {
  //       try {
  //         const response = await axios.get(`/api/users/${id}`);
  //         setUserData(response.data);
  //       } catch (error) {
  //         console.error("Error fetching user data:", error);
  //       }
  //     };

  //     fetchUserData();
  //   }
  // }, [id]);

  if (!id) {
    return <div>NO DATA</div>;
  }

  return (
    <div>
      <h1>id: {id}</h1>
    </div>
  );
};

export default Page;
