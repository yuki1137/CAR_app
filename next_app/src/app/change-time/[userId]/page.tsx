"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";
import Header from "../../../components/Header";
import { FaRegCalendarAlt } from "react-icons/fa";

const Page = ({ params }: { params: { userId: string } }) => {
  const userId = params.userId;

  if (!userId) {
    return <div>NO DATA</div>;
  }

  return (
    <div>
      <Header title="目標の変更" icon={<FaRegCalendarAlt size={30} />} userId={userId} />
      <h1>id: {userId}</h1>
    </div>
  );
};

export default Page;
