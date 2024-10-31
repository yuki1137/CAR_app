"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";
import Header from "../../../components/Header";
import { FaBed, FaCheck, FaTrashAlt, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import DatePicker, { DateObject, Value } from "react-multi-date-picker";
import Button from "../../../components/Button";
import { useTable, useSortBy, usePagination, Row, IdType, Column } from "react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Absence } from "@prisma/client";
import { IconContext } from "react-icons";
import { FaCalendarDays } from "react-icons/fa6";
import CustomLinearProgress from "../../../components/CustomLinearProgress";

const Page = ({ params }: { params: { userId: string } }) => {
  const userId = params.userId;
  //DatePickerで今日以降の日付のみ選択可能にする
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  // const initialDate = new DateObject(tomorrow);

  let isReasonChange = false;

  const reasonInputClicked = () => {
    let isReasonChange = true;
  };

  // const [reasonInputClicked]
  const [absenceReason, setAbsenceReason] = useState("");
  const [absenceDate, setAbsenceDate] = useState<DateObject[]>([]); //初期値を入れると複数選択できなくなる
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

  interface AbsenceResponse {
    time: string; // ISO 8601フォーマットの日付
    status: string; // 例: "Registered", "Failed" など
    // 他にも必要に応じてフィールドを追加する
  }

  interface AbsenceResponse {
    time: string;
    status: string;
  }

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (data: { userId: string; absenceTimes: string[]; reason: string }) => {
      const response = await axios.post("/api/absence", data);
      return response.data; // POSTリクエストの結果を返す
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences", userId] });
    },
  });

  const handleDateChange = (date: DateObject | DateObject[] | null) => {
    // DatePickerからnullまたはDateObjectの配列が渡されることを期待
    if (date instanceof DateObject) {
      setAbsenceDate([date]); // 単一のDateObjectの場合、配列に変換
    } else {
      setAbsenceDate(date || []); // DateObjectの配列またはnullの場合
    }
  };

  const handleClick = async () => {
    setIsButtonClicked(true);

    if (!Array.isArray(absenceDate) || !absenceDate.every((date) => date instanceof DateObject)) {
      console.error("Invalid date format");
      return;
    }

    const formattedAbsenceDates = absenceDate.map((date) => {
      if (date instanceof DateObject) {
        return date.format("YYYY-MM-DD");
      }
      return "";
    });

    // mutate 関数を使用して POST リクエストを行う
    formattedAbsenceDates.forEach((absenceTime) => {
      mutate({
        userId: userId,
        absenceTimes: [`${absenceTime}T10:30:00+09:00`],
        reason: absenceReason,
      });
    });

    // フィールドをクリアする
    setAbsenceDate([]);
    setAbsenceReason("");
    setIsButtonClicked(false);
  };

  const [isDarkMode, setIsDarkMode] = useState(false);
  // ダークモードかどうかを判定するための useEffect
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    // メディアクエリの変更を監視する
    const handler = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    mediaQuery.addListener(handler);

    // コンポーネントのアンマウント時にリスナーを削除
    return () => mediaQuery.removeListener(handler);
  }, []);

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

  const [pageIndex] = useState(0);
  const pageSize = 10;
  const [tableData, setTableData] = useState<Absence[]>([]);

  useEffect(() => {
    if (absences) {
      setTableData(absences);
    }
  }, [absences]);

  // カスタムソート関数の定義
  const dateSort = (rowA: Row<Absence>, rowB: Row<Absence>, columnId: IdType<Absence>) => {
    const dateA = new Date(rowA.values[columnId]);
    const dateB = new Date(rowB.values[columnId]);
    return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
  };

  const columns: Column<Absence>[] = React.useMemo(
    () => [
      {
        Header: "",
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
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    prepareRow,
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
  };

  //テーブルを包むコンテナ(テーブルを包含するHTML要素)のスタイル
  const tableContainerStyles = {
    overflowX: "auto" as const,
    width: "80%",
    margin: "0 auto",
  };

  //Reasonセルのスタイル
  const idCellStyles = {
    maxWidth: "100px" as const,
    overflow: "auto" as const,
    whiteSpace: "nowrap" as const,
    border: "1px solid" as const,
  };

  const getTdStyles = (isGray: boolean) => {
    const baseStyles = {
      border: "1px solid",
      padding: "8px",
      textAlign: "center" as "center",
      overflow: "auto",
    };

    // ダークモードかライトモードに基づいて動的にテキストカラーを設定
    const colorStyles = isDarkMode
      ? { color: isGray ? "gray" : "white" }
      : { color: isGray ? "gray" : "black" };

    return { ...baseStyles, ...colorStyles };
  };

  if (!userId) {
    return <div>NO DATA</div>;
  }
  return (
    <div>
      <Header title="公欠の登録" icon={<FaBed size={30} />} userId={userId} />
      {isLoading ? <CustomLinearProgress /> : <div></div>}
      <h2 className="text-xl  text-center  my-6">いつ公欠しますか？</h2>
      <div className="flex justify-center items-center mb-4">
        <div className="mr-2">
          <FaCalendarDays />
        </div>
        <DatePicker
          multiple={true}
          value={absenceDate}
          onChange={handleDateChange}
          minDate={tomorrow}
          className="my-4 ml-2"
          inputClass="date-input"
          style={{ width: "150px" }}
        />
      </div>
      <div className="text-xl justify-center text-center ">
        <input
          type="text"
          className="h-20 justify-center border border-gray-300 p-2 rounded-md my-3 text-sm"
          value={absenceReason}
          onChange={handleAbsenceReasonChange}
          onClick={reasonInputClicked}
          placeholder="公欠理由を記述（例：帰省）"
        />
      </div>
      <div className="flex justify-center" style={{ marginBottom: "40px" }}>
        <Button onClick={handleClick} isDisabled={isButtonDisabled} size="medium">
          登録
        </Button>
      </div>
      <h2 className="text-xl  text-center  my-4">予約一覧</h2>

      {/* ///ここからはテーブルの表示/// */}
      {isPopupVisible && (
        <div
          className={`fixed inset-0 flex items-center justify-center ${
            isDarkMode ? "bg-black" : "bg-gray-500"
          } bg-opacity-50`}
        >
          <div
            className={`p-6 rounded shadow-lg  border border-gray-400 ${
              isDarkMode ? "dark-mode-bg" : "bg-white"
            }`}
          >
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
        <div className="flex justify-end items-center px-7 my-1">
          <div>
            {rows.length > 0
              ? `${currentPageIndex * pageSize + 1}
               -${Math.min((currentPageIndex + 1) * pageSize, rows.length)} 
               / ${rows.length} 件`
              : "公欠未登録"}
          </div>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className={`px-1 py-2 ${!canPreviousPage ? "text-gray-400" : ""}`}
          >
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
      </div>
    </div>
  );
};

export default Page;
