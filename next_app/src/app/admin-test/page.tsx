"use client";
import React, { useReducer } from "react";
import { User } from "@prisma/client";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { string } from "zod";
import { stringify } from "querystring";
import Header from "../../components/Header";
import { FaUserCog } from "react-icons/fa";
import { userAgent } from "next/server";
import convertTimeToHHMMFormat from "../../utils/convertTimeToHHMMFormat";
import { useTable } from "react-table";

type PostDataType = {
  name: string;
  promisedTime: string;
};

export default function Page() {
  const { data: users, isLoading } = useQuery<User[]>({
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

  const columns = React.useMemo(
    () => [
      {
        Header: "ユーザー名",
        accessor: (d: User) => d.name,
      },
      {
        Header: "目標時間",
        accessor: (d: User) => convertTimeToHHMMFormat(d.promisedTime),
      },
      {
        Header: "id",
        accessor: (d: User) => d.id,
      },
    ],
    [],
  );

  const tableInstance = useTable({
    columns,
    data: users || [],
  });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  if (isLoading) return <div>Loading...</div>;

  const tableStyles = {
    borderCollapse: "collapse" as "collapse",
    width: "100%",
  };

  const thStyles = {
    border: "1px solid black",
    padding: "8px",
    textAlign: "center" as "center",
    backgroundColor: "white",
  };

  const tdStyles = {
    border: "1px solid black",
    padding: "8px",
    textAlign: "center" as const,
  };

  const tableContainerStyles = {
    overflowX: "auto" as const, // 横スクロールを有効にする
    width: "80%", // コンテナの幅を80%に設定
    margin: "0 auto", // 左右の余白を自動調整
  };

  const idCellStyles = {
    maxWidth: "100px" as const, // 最大幅を設定
    overflow: "auto" as const, // 水平スクロールを可能にする
    whiteSpace: "nowrap" as const, // 改行を防ぐ
  };

  return (
    <>
      <Header title="管理ページ" icon={<FaUserCog size={30} />} />
      <button onClick={handleAddUser}>add user</button>
      <div>isLoading: {isLoading ? "true" : "false"} </div>
      <div style={tableContainerStyles}>
        <table {...getTableProps()} style={tableStyles}>
          <thead>
            {headerGroups.map((headerGroup, index) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()} style={thStyles} key={column.id}>
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, index) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={index}>
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      style={cell.column.id === "id" ? idCellStyles : tdStyles}
                      key={cell.column.id}
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
