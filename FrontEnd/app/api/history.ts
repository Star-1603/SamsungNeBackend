import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import clientPromise from "../../../lib/mongodb";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const client = await clientPromise;
  const historyCollection = client.db().collection("history");

  if (req.method === "POST") {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    await historyCollection.insertOne({
      userId: session.user.id,
      query,
      createdAt: new Date(),
    });

    return res.status(201).json({ message: "Query stored successfully" });
  }

  if (req.method === "GET") {
    const history = await historyCollection
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(history);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
