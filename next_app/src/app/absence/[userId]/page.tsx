"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";
import Header from "../../../components/Header";
import { FaBed, FaCheck, FaTrashAlt } from "react-icons/fa";
import DatePicker, { DateObject, Value } from "react-multi-date-picker";
import Button from "../../../components/Button";
import { useTable, useSortBy, usePagination, Row, IdType, Column } from "react-table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Absence } from "@prisma/client";
import { IconContext } from "react-icons";

const Page = ({ params }: { params: { userId: string } }) => {
  const userId = params.userId;
  //DatePickerで今日以降の日付のみ選択可能にする
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const initialDate = new DateObject(tomorrow);

  const [absenceDate, setAbsenceDate] = useState<Value>([initialDate]);
  const [absenceReason, setAbsenceReason] = useState("公欠理由を記述（例：帰省）");
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  
  const handleAbsenceReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //event.target.value で入力フィールドの現在の値を取得
    setAbsenceReason(event.target.value);
  };

  const isButtonDisabled =
    isButtonClicked ||
    !Array.isArray(absenceDate) ||
    absenceDate.length === 0 ||
    absenceReason === "";

  // POSTリクエストのための useMutation フック
  const { mutate } = useMutation({
    mutationFn: async (data: { userId: string; absenceTimes: string[]; reason: string }) => {
      await axios.post("/api/absence", data);
    },
  });

  const handleClick = async () => {
    setIsButtonClicked(true);

    if (!Array.isArray(absenceDate) || !absenceDate.every((date) => date instanceof DateObject)) {
      console.error("Invalid date format");
      return;
    }

    const formattedAbsenceDates = absenceDate.map((date) => {
      if (date instanceof DateObject) {
        return `${date.format("YYYY-MM-DD")}T10:30:00+09:00`;
      }
      return "";
    });

    // mutate 関数を使用して POST リクエストを行う
    mutate({
      userId: userId,
      absenceTimes: formattedAbsenceDates,
      reason: absenceReason,
    });

    // フィールドをクリアする
    setAbsenceDate([]);
    setAbsenceReason("");
    setIsButtonClicked(false);
  };

  ////ここからはテーブルの設定////

  // ポップアップの表示状態と削除対象のIDを管理
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // 削除ボタンをクリックしたときのハンドラー
  const handleDeleteClick = (id: string) => {
    setIsPopupVisible(true);
    setDeleteTargetId(id);
  };

  // ポップアップの「はい」ボタンをクリックしたときのハンドラー
  const confirmDelete = () => {
    if (deleteTargetId) {
      handleDelete(deleteTargetId);
      setIsPopupVisible(false);
      setDeleteTargetId(null);
    }
  };

  // ポップアップの「いいえ」ボタンをクリックしたときのハンドラー
  const cancelDelete = () => {
    setIsPopupVisible(false);
    setDeleteTargetId(null);
  };

  const { data: absences, isLoading } = useQuery<Absence[]>({
    queryKey: ["absences", userId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/user?id=${userId}`);
      return data.absences;
    },
  });
  console.log(absences);

  const handleDelete = async (id: string) => {
    // 削除APIを呼び出す
    try {
      await axios.delete(`/api/absence?id=${id}`);
      // データを再読み込みするか、ローカルの状態を更新する
      console.log("Deleted successfully");
      setTableData((prev) => prev.filter((absence) => absence.id !== id));
    } catch (error) {
      console.error("Error deleting absence", error);
    }
  };

  const [pageIndex] = useState(0); //現在のpageIndex（ページ番号）を作成,初期値を0にしページネーションにおいて最初のページを指し、ページ番号のカウントが0から始まるようにする
  const pageSize = 10; //一度に表示されるデータの数、ここでは1ページあたりのアイテム数が10個
  const [tableData, setTableData] = useState<Absence[]>([]); //tableDataは表に表示されるデータ、User型のオブジェクトの配列で、初期値は空

  // useEffectは関数の実行タイミングをReactのレンダリング後まで遅らせるhook
  // useEffect(() => { A }, [B]) の場合Bが変更されたらAを実行する

  useEffect(() => {
    if (absences) {
      //users変数が存在すれば（nullやundefinedでなければ）setTableDataを実行する
      setTableData(absences);
    }
  }, [absences]); //usersが変更されたときにsetTableDataを実行する

  // カスタムソート関数の定義
  const dateSort = (rowA: Row<Absence>, rowB: Row<Absence>, columnId: IdType<Absence>) => {
    const dateA = new Date(rowA.values[columnId]);
    const dateB = new Date(rowB.values[columnId]);
    return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
  };

  const columns: Column<Absence>[] = React.useMemo(
    () => [
      {
        Header: "操作",
        id: "actions", // `accessor` の代わりに `id` を使用
        Cell: ({ row }: { row: Row<Absence> }) => {
          // 日付の比較
          const absenceDate = new Date(row.original.absenceTime);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // 時間をリセットして今日の日付のみにする

          if (absenceDate < today) {
            // 日付が今日よりも前の場合
            return (
              <span>
                <IconContext.Provider value={{ color: "gray", size: "20" }}>
                  <FaCheck />
                </IconContext.Provider>
              </span>
            );
          } else {
            // 日付が今日またはそれ以降の場合
            return (
              <button onClick={() => handleDeleteClick(row.original.id)} style={{ color: "red" }}>
                <FaTrashAlt size={20} />
              </button>
            );
          }
        },
      },
      {
        Header: "日付",
        accessor: (d: Absence) => new Date(d.absenceTime).toLocaleDateString(),
        sortType: dateSort,
        id: "absenceTime",
      },
      {
        Header: "理由",
        accessor: (d: Absence) => d.reason,
        id: "reason",
      },
    ],
    [], //useMemoの依存配列
  );

  const tableInstance = useTable(
    {
      columns,
      data: tableData,
      // 初期のソート状態を設定
      initialState: { pageIndex, pageSize, sortBy: [{ id: "absenceTime", desc: false }] },
    },
    useSortBy,
    usePagination,
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

  //Reasonセルのスタイル
  const idCellStyles = {
    maxWidth: "100px" as const, // セルの最大幅を100ピクセルに設定
    overflow: "auto" as const, // セル内の文字がセルのサイズを超えた場合に、スクロールバーが自動的に表示される
    whiteSpace: "nowrap" as const, // nowrapはテキストを強制的に1行に保持し 改行を防ぐ
    border: "1px solid" as const, //要素の境界線のスタイル
  };

  const getTdStyles = (isGray: boolean) => {
    const baseStyles = {
      border: "1px solid",
      padding: "8px",
      textAlign: "center" as "center",
      overflow: "auto",
    };
  
    // ダークモード対応のスタイルを追加
    const darkModeStyles = {
      '@media (prefers-color-scheme: dark)': {
        color: 'white', // ダークモードでは白色
      },
      color: isGray ? 'gray' : 'initial', // 通常モードでは既存のロジックを使用
    };
  
    return { ...baseStyles, ...darkModeStyles };
  };
  
  if (!userId) {
    return <div>NO DATA</div>;
  }
  return (
    <div>
      <Header title="公欠の登録" icon={<FaBed size={30} />} userId={userId} />
      <h2 className="text-xl  text-center  my-8">いつ公欠しますか？</h2>
      <div className="text-xl  justify-center text-center my-4">
        <DatePicker
          multiple={true}
          value={absenceDate}
          onChange={setAbsenceDate}
          minDate={tomorrow}
        />
        <input
          type="text"
          // value="公欠理由を記述（例：帰省"
          className="h-20 justify-center border-2 border-gray-600 p-2 rounded-md my-4 text-sm"
          value={absenceReason}
          onChange={handleAbsenceReasonChange}
        />
      </div>
      <div className="flex justify-center">
        <Button onClick={handleClick} isDisabled={isButtonDisabled} size="medium" className="my-2">
          登録
        </Button>
      </div>
      <h2 className="text-xl  text-center  my-8">予約一覧</h2>

      {/* ///ここからはテーブルの表示/// */}
      {isPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-center mb-4">本当に削除しますか？</p>
            <div className="flex justify-center space-x-4">
              <button
                className="hover:bg-gray-300 font-bold py-2 px-4 rounded"
                onClick={confirmDelete}
              >
                はい
              </button>
              <button
                className="hover:bg-gray-300 font-bold py-2 px-4 rounded"
                onClick={cancelDelete}
              >
                いいえ
              </button>
            </div>
          </div>
        </div>
      )}
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
            {page.map((row: Row<Absence>, index: number) => {
              prepareRow(row);

              // 各行に対して日付が今日より前かどうかを判断
              const absenceDate = new Date(row.original.absenceTime);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isBeforeToday = absenceDate < today;

              return (
                <tr {...row.getRowProps()} key={index}>
                  {row.cells.map((cell) => {
                    // 「操作」列以外で、日付が今日より前の場合に灰色のスタイルを適用
                    const cellStyles =
                      cell.column.id !== "actions" && isBeforeToday
                        ? {
                            ...getTdStyles(true),
                            ...(cell.column.id === "reason" ? idCellStyles : {}),
                          }
                        : {
                            ...getTdStyles(false),
                            ...(cell.column.id === "reason" ? idCellStyles : {}),
                          };

                    return (
                      <td
                        {...cell.getCellProps()}
                        style={cellStyles} // ここで `cellStyles` を適用
                        key={cell.column.id}
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;

//このtypscript,next.js14
