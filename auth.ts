import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";
import { Activity } from "@/app/models/Activity";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? "";
        token.name = user.name ?? "";
        token.picture = user.image ?? "";

        // Record login: upsert user and create activity
        try {
          await connectToDatabase();
          await User.findOneAndUpdate(
            { email: user.email },
            {
              $set: { name: user.name, image: user.image },
              $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true },
          );
          await Activity.create({ email: user.email, event: "login" });
        } catch (e) {
          console.error("[Auth] Failed to record login activity:", e);
        }
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
});
