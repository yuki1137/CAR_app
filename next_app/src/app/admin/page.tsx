"use client";
import React, { useEffect, useState } from "react";
import { User } from "@prisma/client";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { string } from "zod";
import { stringify } from "querystring";
import Header from "../../components/Header";
import { FaUserCog, FaAngleRight, FaAngleLeft } from "react-icons/fa";
import { userAgent } from "next/server";
import convertTimeToHHMMFormat from "../../utils/convertTimeToHHMMFormat";
import convertHMtoDatetime from "../../utils/convertHMtoDatetime";
import { useTable, usePagination, Row } from "react-table";
import DrumTimePicker from "../../components/DrumTimePicker";
import Button from "../../components/Button";
import CustomLinearProgress from "../../components/CustomLinearProgress";

type PostDataType = {
  name: string;
  promisedTime: string;
};

export default function Page() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axios.get("/api/users");
      return data;
    },
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (data: PostDataType) => {
      const { data: res } = await axios.post("/api/users", data);
      console.log(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const [userName, setUserName] = useState("");
  const [promisedTime, setPromisedTime] = useState("");
  const isButtonDisabled = userName === ""; // userNameが空ならisButtonDisabledはtrue

  // ユーザー名を更新する関数、テキスト入力の変更イベントが発生すると呼び出される
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //event.target.value で入力フィールドの現在の値を取得
    setUserName(event.target.value);
  };

  const handleTime = (hour: number, minute: number) => {
    const time = convertHMtoDatetime(hour, minute);
    setPromisedTime(time);
  };

  //登録ボタンを押すとユーザーデータが登録される
  const handleClick = () => {
    mutate({ name: userName, promisedTime });
    setUserName(""); // ユーザー名をクリア
    setPromisedTime(""); // 目標時間をクリア
  };

  const [pageIndex] = useState(0);
  const pageSize = 10;
  const [tableData, setTableData] = useState<User[]>([]);

  useEffect(() => {
    if (users) {
      setTableData(users);
    }
  }, [users]);

  const columns = React.useMemo(
    () => [
      //アロー関数、columns配列の中身の関数を定義
      {
        Header: "ユーザー名",
        accessor: (d: User) => d.name, //accessor関数でテーブルの各行に表示される値をどのように取得するかを定義
      },
      {
        Header: "目標時間",
        accessor: (d: User) => convertTimeToHHMMFormat(d.promisedTime),
      },
      {
        Header: "ID",
        accessor: (d: User) => d.id,
        id: "id",
      },
    ],
    [],
  );

  const tableInstance = useTable(
    //useTableはテーブルのデータを管理するためのhook
    {
      columns,
      data: tableData,
      initialState: { pageIndex, pageSize }, //テーブルの初期状態
    },
    usePagination, //テーブルデータのページング（ページ分割）を行うことができるhook
  );

  //tableInstanceオブジェクトからテーブルのレンダリングと操作に必要な一連のプロパティと関数を抽出
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    prepareRow, //各行（<tr>）をレンダリングする前に呼び出す必要がある関数。行に必要なプロパティやイベントハンドラを準備する
    state: { pageIndex: currentPageIndex },
    rows,
  } = tableInstance;

  //テーブル全体のスタイル
  const tableStyles = {
    borderCollapse: "collapse" as "collapse",
    width: "100%",
  };

  //テーブルのヘッダー行のスタイル
  const thStyles = {
    border: "1px solid",
    padding: "8px",
    textAlign: "center" as "center",
  };

  //テーブルのデータセルのスタイル
  const tdStyles = {
    border: "1px solid",
    padding: "8px",
    textAlign: "center" as "center",
    overflow: "auto",
  };

  //テーブルを包むコンテナ(テーブルを包含するHTML要素)のスタイル
  const tableContainerStyles = {
    overflowX: "auto" as const, // テーブルが水平方向のコンテナのサイズを超えた場合の挙動。"auto"なので必要に応じて水平方向のスクロールバーが表示される
    width: "80%",
    margin: "0 auto",
  };

  //IDセルのスタイル
  const idCellStyles = {
    maxWidth: "100px" as const,
    overflow: "auto" as const,
    whiteSpace: "nowrap" as const,
    border: "1px solid" as const,
  };

  return (
    <>
      <Header title="管理ページ" icon={<FaUserCog size={30} />} />
      {isLoading ? <CustomLinearProgress /> : <div></div>}
      <h2 className="text-xl  text-center my-4">ユーザー一覧</h2>
      <div style={tableContainerStyles}>
        {/* getTableProps 関数が返すオブジェクト内のすべてのプロパティと値が、<table> タグに個別のプロパティとして適用 */}
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
            {/* .map() メソッドを使用して、この配列の各行（row）を反復処理,index は、配列内の各行の位置 */}
            {page.map((row: Row<User>, index: number) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={index}>
                  {row.cells.map((cell) => (
                    //セルを作成
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
      <div className="flex justify-end items-center px-7 my-1">
        <div>
          {rows.length > 0
            ? `${currentPageIndex * pageSize + 1}
               -${Math.min((currentPageIndex + 1) * pageSize, rows.length)} 
               / ${rows.length} 件`
            : "ユーザーデータがありません"}
        </div>
        <button
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
          className={`px-1 py-2 ${!canPreviousPage ? "text-gray-400" : ""}`}
        >
          {/* previousPageをアロー関数で呼び出すことでユーザーがボタンをクリックした時にのみ nextPage 関数が実行される。ページがロードされるたびに実行されない。 */}
          <FaAngleLeft size={25} />
        </button>
        <button
          onClick={() => nextPage()}
          disabled={!canNextPage}
          className={`px-2 py-2 ${!canNextPage ? "text-gray-400" : ""}`}
        >
          <FaAngleRight size={25} />
        </button>
      </div>
      <div className="text-center justify-center my-8">
        <h2 className="text-xl text-center my-2">新しいユーザーを登録</h2>
        <h3 className="text-lg text-center my-2">ユーザー名</h3>
        <input
          type="text"
          className="border p-2 rounded-md"
          value={userName}
          onChange={handleNameChange}
        />
        <h3 className="text-lg text-center my-2">目標時間の設定</h3>
        <DrumTimePicker handleTime={handleTime} />
        <Button onClick={handleClick} isDisabled={isButtonDisabled} className="my-4" size="medium">
          登録
        </Button>
      </div>
    </>
  );
}
