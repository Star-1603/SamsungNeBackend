import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      name: string;
      email: string;
    };
  }

  interface User {
    _id: ObjectId, // User's unique ID
    email: String,
    name: String,
    chats: [
      {
        _id: ObjectId, // Unique ID for each chat
        createdAt: Date,
        updatedAt: Date,
        history: [
          {
            role: String, // 'user' or 'bot'
            message: String,
            timestamp: Date
          }
        ]
      }
    ]
  }  
}
