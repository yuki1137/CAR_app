"use client";
import React, { useEffect, useState } from "react";
import { User } from "@prisma/client";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { string } from "zod";
import { stringify } from "querystring";
import Header from "../../components/Header";
import { FaUserCog, FaAngleRight, FaAngleLeft } from "react-icons/fa";
import { userAgent } from "next/server";
import convertTimeToHHMMFormat from "../../utils/convertTimeToHHMMFormat";
import { useTable, usePagination, Row } from "react-table";
import DrumTimePicker from "../../components/DrumTimePicker";
import Button from "../../components/Button";

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

  const { mutate } = useMutation({
    mutationFn: async (data: PostDataType) => {
      const { data: res } = await axios.post("/api/users", data);
      console.log(res);
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
    const time = new Date(
      //固定の年月日をつける,左に0をつけて2桁にする、日本時間にする
      `2000-01-01T${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}:00+09:00`,
    ); // ISO8601形式の文字列に変換
    setPromisedTime(time.toISOString());
  };

  //登録ボタンを押すとユーザーデータが登録される
  const handleClick = () => {
    mutate({ name: userName, promisedTime });
    setUserName(""); // ユーザー名をクリア
    setPromisedTime(""); // 目標時間をクリア
  };

  const [pageIndex] = useState(0); //現在のpageIndex（ページ番号）を作成,初期値を0にしページネーションにおいて最初のページを指し、ページ番号のカウントが0から始まるようにする
  const pageSize = 10; //一度に表示されるデータの数、ここでは1ページあたりのアイテム数が10個
  const [tableData, setTableData] = useState<User[]>([]); //tableDataは表に表示されるデータ、User型のオブジェクトの配列で、初期値は空

  // useEffectは関数の実行タイミングをReactのレンダリング後まで遅らせるhook
  // useEffect(() => { A }, [B]) の場合Bが変更されたらAを実行する

  useEffect(() => {
    if (users) {
      //users変数が存在すれば（nullやundefinedでなければ）setTableDataを実行する
      setTableData(users);
    }
  }, [users]); //usersが変更されたときにsetTableDataを実行する

  const columns = React.useMemo(
    //変数columnsで表の列の情報を格納する。
    //テーブルの列定義はコンポーネントのレンダリングごとに変更されないので,useMemoを使用することで列定義が変更されない限り、以前に計算された定義を再利用する
    () => [
      //アロー関数、columns配列の中身の関数を定義
      {
        Header: "ユーザー名",
        accessor: (d: User) => d.name, //accessor関数でテーブルの各行に表示される値をどのように取得するかを定義
        //accessor関数の引数はUser型のオブジェクトdで、d.nameでdオブジェクトのnameプロパティの値を取得
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
    [], //useMemoの依存配列（第二引数）,空なのでこの列定義はコンポーネントの再レンダリング時に再計算されない
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
    //テーブル要素（<table>タグ）に適用すべきプロパティとイベントハンドラを提供、react-tableが内部的にテーブルの状態と相互作用を管理できるようになる
    getTableBodyProps,
    //テーブル本体（<tbody>タグ）に適用するプロパティとイベントハンドラを提供
    headerGroups,
    //テーブルのヘッダー行（<thead>内の<tr>）を表すオブジェクトの配列。各ヘッダーグループは、一つ以上のヘッダー行に関する情報を含んでいる
    page,
    //現在のページに表示される行（データ）の配列。ページネーションが有効なので現在のページに対応するデータのみを含む
    nextPage,
    //テーブルの次のページに移動するための関数
    previousPage,
    //テーブルの前のページに移動するための関数
    canNextPage,
    //、次のページへの移動が可能かどうかを示すブール値。次のページボタンの有効/無効状態を制御
    canPreviousPage,
    //前のページへの移動が可能かどうかを示すブール値
    prepareRow,
    //各行（<tr>）をレンダリングする前に呼び出す必要がある関数。行に必要なプロパティやイベントハンドラを準備する
    state: { pageIndex: currentPageIndex },
    rows,
  } = tableInstance;

  if (isLoading) {
    //isLoadingがtrueであればLoading...を表示
    return <div>Loading...</div>;
  }

  //テーブル全体のスタイル
  const tableStyles = {
    borderCollapse: "collapse" as "collapse", //隣接するセルの境界線を1つにまとめる,as "collapse"でこの値が文字列型であることを強調
    width: "100%", //テーブルが親要素の全幅をうめる。テーブルは利用可能な全幅を使用する
  };

  //テーブルのヘッダー行のスタイル
  const thStyles = {
    border: "1px solid", //要素の境界線のスタイル。solidは実線という意味
    padding: "8px", //要素の内側の余白
    textAlign: "center" as "center", //テキストの水平方向の配置は中央
    // backgroundColor: "white", //要素の背景色
  };

  //テーブルのデータセルのスタイル
  const tdStyles = {
    border: "1px solid", //要素の境界線のスタイル
    padding: "8px", //要素の内側の余白
    textAlign: "center" as "center", //テキストの水平方向の配置は中央
    overflow: "auto", //コンテンツがセルのサイズを超えた場合の挙動を指定,"auto"で必要に応じてスクロールバーが表示される
  };

  //テーブルを包むコンテナ(テーブルを包含するHTML要素)のスタイル
  const tableContainerStyles = {
    overflowX: "auto" as const, // テーブルが水平方向のコンテナのサイズを超えた場合の挙動。"auto"なので必要に応じて水平方向のスクロールバーが表示される
    width: "80%", // コンテナの幅を80%に設定
    margin: "0 auto", // marginプロパティは、コンテナの外側の余白を設定。"0 auto"は、上下の余白を0にし、左右の余白を自動調整する
  };

  //IDセルのスタイル
  const idCellStyles = {
    maxWidth: "100px" as const, // セルの最大幅を100ピクセルに設定
    overflow: "auto" as const, // セル内の文字がセルのサイズを超えた場合に、スクロールバーが自動的に表示される
    whiteSpace: "nowrap" as const, // nowrapはテキストを強制的に1行に保持し 改行を防ぐ
    border: "1px solid" as const, //要素の境界線のスタイル
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Header title="管理ページ" icon={<FaUserCog size={30} />} />
      <h2 className="text-xl  text-center my-4">ユーザー一覧</h2>
      <div style={tableContainerStyles}>
        {/* getTableProps 関数が返すオブジェクト内のすべてのプロパティと値が、<table> タグに個別のプロパティとして適用 */}
        <table {...getTableProps()} style={tableStyles}>
          <thead>
            {/* ヘッダー行を作成、.map()メゾットでheaderGroups配列の中身を展開し、各ヘッダーグループに対して<tr>タグを作成 */}
            {/* indexは何行目のヘッダーかを表し、各要素を一意に識別するために使用される */}
            {headerGroups.map((headerGroup, index) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                {/* ヘッダー行の各セルを作成 */}
                {/* .map()メゾットでheaderGroup.headers配列の中身を展開し、各ヘッダーに対して<th>タグを作成 */}
                {/* columはヘッダー行内の個々の列を表し、各要素を一意に識別するために使用される */}
                {headerGroup.headers.map((column) => (
                  // ヘッダーセルに必要なプロパティを展開
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
                //行を作成,key={index} は、Reactがリスト内の各行を一意に識別する
                <tr {...row.getRowProps()} key={index}>
                  {/* 各行に含まれるセル（cell）を .map() メソッドで反復処理 */}
                  {row.cells.map((cell) => (
                    //セルを作成
                    <td
                      {...cell.getCellProps()}
                      // ID列なら idCellStyles を、それ以外なら tdStyles を使用
                      style={cell.column.id === "id" ? idCellStyles : tdStyles}
                      // 同じ行内の各セルを一意に識別する
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
          className="border-2 border-gray-600 p-2 rounded-md"
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
