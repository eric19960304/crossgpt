import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";
import { ADMIN_EMAIL } from "@/app/admin/config";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ emails: [] });
  }

  await connectToDatabase();

  const users = await User.find(
    { email: { $regex: q, $options: "i" } },
    { email: 1, _id: 0 },
  )
    .sort({ email: 1 })
    .limit(10)
    .lean();

  return NextResponse.json({ emails: users.map((u: any) => u.email) });
}
