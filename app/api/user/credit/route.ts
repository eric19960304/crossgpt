import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email })
    .select("creditUSD")
    .lean() as any;

  const credit = Math.round((user?.creditUSD ?? 0) * 100) / 100;
  return NextResponse.json({ creditUSD: credit });
}
