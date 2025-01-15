import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user._id;
    const client = await clientPromise;
    const db = client.db("Samsung");
    const usersCollection = db.collection("users");

    const url = new URL(request.url);
    const chatId = url.searchParams.get("chatId");

    if (chatId) {
      const user = await usersCollection.findOne(
        { _id: new ObjectId(userId), "chats._id": new ObjectId(chatId) },
        { projection: { "chats.$": 1 } }
      );

      if (!user || !user.chats || user.chats.length === 0) {
        return NextResponse.json({ message: "Chat not found" }, { status: 404 });
      }

      return NextResponse.json(user.chats[0]);
    }

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { "chats._id": 1, "chats.updatedAt": 1 } }
    );

    if (!user || !user.chats) {
      return NextResponse.json({ message: "No chats found" }, { status: 404 });
    }

    const chatsSummary = user.chats.map((chat: { _id: ObjectId, updatedAt: Date }) => ({
      id: chat._id.toString(),
      updatedAt: chat.updatedAt,
    }));

    return NextResponse.json({ count: chatsSummary.length, chats: chatsSummary });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user._id;
    const client = await clientPromise;
    const db = client.db("Samsung");
    const usersCollection = db.collection("users");

    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "create") {
      const newChat = {
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [],
      };

      const result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $push: { chats: newChat } }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json({ message: "Failed to create chat" }, { status: 400 });
      }

      return NextResponse.json(newChat, { status: 201 });
    }

    if (action === "addToChat") {
      const body = await request.json();
      const { chatId, role, message } = body;

      if (!chatId || !role || !message) {
        return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
      }

      const updatedChat = {
        role,
        message,
        timestamp: new Date(),
      };

      const result = await usersCollection.updateOne(
        { _id: new ObjectId(userId), "chats._id": new ObjectId(chatId) },
        {
          $push: { "chats.$.history": updatedChat },
          $set: { "chats.$.updatedAt": new Date() },
        }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json({ message: "Failed to update chat" }, { status: 400 });
      }

      return NextResponse.json({ message: "Chat updated" });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

