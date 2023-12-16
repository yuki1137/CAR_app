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
        Header: "Name",
        accessor: (d: User) => d.name,
      },
      {
        Header: "Promised Time",
        accessor: (d: User) => convertTimeToHHMMFormat(d.promisedTime),
      },
      {
        Header: "ID",
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
    backgroundColor: "#f2f2f2",
  };

  const tdStyles = {
    border: "1px solid black",
    padding: "8px",
  };

  const tableContainerStyles = {
    overflowX: "auto", // 横スクロールを有効にする
  };

  const idCellStyles = {
    maxWidth: "100px" as const, // 最大幅を設定
    overflow: "hidden" as const, // はみ出したテキストを隠す
    textOverflow: "ellipsis" as const, // 省略記号を表示
    whiteSpace: "nowrap" as const, // 改行を防ぐ
  };

  return (
    <>
      <Header title="管理ページ" icon={<FaUserCog size={30} />} />
      <button onClick={handleAddUser}>add user</button>
      <div>isLoading: {isLoading ? "true" : "false"} </div>
      <ul>
        {users &&
          users.map((user: User) => (
            <li key={user.id}>
              {/* && 演算子は論理AND演算を行い、左側の式（型チェック）が true の場合にのみ右側の式（値の出力）が評価される */}
              {user.name} {typeof user.promisedTime === "string" && user.promisedTime}
            </li>
          ))}
      </ul>
      <table {...getTableProps()} style={tableStyles}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()} style={thStyles} key={column.id}>
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.id}>
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
    </>
  );
}
