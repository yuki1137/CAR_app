import type { NextApiHandler } from "next";
import prisma from "../../lib/prisma";
// import * as z from "zod";

const handler: NextApiHandler = async (req, res) => {
  console.log("req.body", req.body); // VSCodeのターミナルに出力される
  try {
    await prisma.user.create({
      data: {
        name: "Alice",
        promisedTime: new Date(),
      },
    });
    res.json({
      ok: true,
    });
    return;
  } catch (error) {
    res.json({ ok: false, error });
  }
};
export default handler;
