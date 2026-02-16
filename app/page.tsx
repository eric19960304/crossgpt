import { Analytics } from "@vercel/analytics/react";
import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const serverConfig = getServerSideConfig();

export default async function App() {
  const session = await auth();

  // If user is authenticated, redirect to chat
  if (session?.user) {
    redirect("/chat");
  }

  // If not authenticated, redirect to login
  redirect("/login");

  return (
    <>
      <Home />
      {serverConfig?.isVercel && (
        <>
          <Analytics />
        </>
      )}
    </>
  );
}
