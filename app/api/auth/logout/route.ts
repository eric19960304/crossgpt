import { auth } from "@/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Activity } from "@/app/models/Activity";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectToDatabase();
    await Activity.create({ email: session.user.email, event: "logout" });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Logout] Failed to record logout activity:", e);
    return NextResponse.json({ ok: true });
  }
}
