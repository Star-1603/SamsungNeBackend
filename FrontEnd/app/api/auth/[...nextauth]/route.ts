import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const client = await clientPromise;
        const db = client.db("Samsung");
        const usersCollection = db.collection("users");

        // Check if the user already exists
        const user = await usersCollection.findOne({ email: credentials.email });

        if (user) {
          // Verify the hashed password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid password");
          }
          return { id: user._id.toString(), name: user.name, email: user.email };
        } else {
          // User does not exist, create a new user
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = {
            email: credentials.email,
            password: hashedPassword,
            name: "New User", // You can customize this
            createdAt: new Date(),
          };

          const result = await usersCollection.insertOne(newUser);
          return { id: result.insertedId.toString(), name: newUser.name, email: newUser.email };
        }
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // Add `_id` to the token
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add `_id` to the session
      if (token.id) {
        session.user._id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

