import NextAuth from 'next-auth'
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { connectDB } from '@/util/database';

export const authOptions = {
  providers: [
    // https://next-auth.js.org/
    // OAuth authentication providers...
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRETE
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
  ],
  secret : process.env.NEXTAUTH_SECRET,
  adapter : MongoDBAdapter(connectDB)
};

export default NextAuth(authOptions);
