"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";
import Header from "../../../components/Header";
import { FaHome } from "react-icons/fa";

const Page = ({ params }: { params: { userId: string } }) => {
  const userId = params.userId;

  if (!userId) {
    return <div>NO DATA</div>;
  }

  return (
    <div>
      <Header title="HE研登校管理" icon={<FaHome size={30} />}  userId={userId} />
      <h1>id: {userId}</h1>
    </div>
  );
};

export default Page;