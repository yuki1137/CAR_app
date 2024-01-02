"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";
import Header from "../../../components/Header";
import { FaRegCalendarAlt } from "react-icons/fa";

import DatePicker, { Value } from "react-multi-date-picker";

const Page = ({ params }: { params: { userId: string } }) => {
  const userId = params.userId;
  const today = new Date();
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  const [values, setValues] = useState<Value>([today, tomorrow]);

  if (!userId) {
    return <div>NO DATA</div>;
  }

  return <DatePicker multiple value={values} onChange={setValues} />;

  return (
    <div>
      <Header title="目標の変更" icon={<FaRegCalendarAlt size={30} />} userId={userId} />
      <h1>id: {userId}</h1>
    </div>
  );
};

export default Page;
