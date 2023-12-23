"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";

const Page = ({ params }: { params: { userId: string } }) => {
  const userId = params.userId;

  if (!userId) {
    return <div>NO DATA</div>;
  }

  return (
    <div>
      <h1>id: {userId}</h1>
    </div>
  );
};

export default Page;
