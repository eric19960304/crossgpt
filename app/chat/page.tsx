import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Home } from "../components/home";

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <Home />;
}
