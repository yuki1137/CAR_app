import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useCallback } from "react";
import prisma from "../lib/prisma";

type Props = {
  count: number;
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const count = await prisma.user.count();
  return {
    props: {
      count,
    },
  };
};

export default function Index(props: Props) {
  const router = useRouter();
  const onSubmit = useCallback(async () => {
    const res = await fetch("/api/addUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();
    if (json.ok) {
      console.log(json);
      router.push("/");
    } else {
      alert(JSON.stringify(json));
    }
  }, []);

  return (
    <>
      <div>user count: {props.count}</div>
      <button onClick={() => onSubmit()}>create post</button>
    </>
  );
}
