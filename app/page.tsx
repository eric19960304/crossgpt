import { redirect } from "next/navigation";

// Root redirect is handled by middleware auth callback.
// This is a fallback in case middleware doesn't catch it.
export default function App() {
  redirect("/login");
}
