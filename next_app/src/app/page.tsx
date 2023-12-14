"use client";
import { User } from "@prisma/client";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { string } from "zod";
import { stringify } from "querystring";
import Header from "../components/header";
import { FaHome } from "react-icons/fa";

type PostDataType = {
  name: string;
  promisedTime: string;
};

export default function Page() {
  const { data, isLoading } = useQuery<User[]>({
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

  const handleAddUser = () => {
    mutate({ name: "Carlie", promisedTime: "2021-01-01" });
  };

  return (
    <>
      <Header title="HE研登校管理" icon={<FaHome size={30} />} />
      <button onClick={handleAddUser}>add user</button>
      <div>isLoading: {isLoading ? "true" : "false"} </div>
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
