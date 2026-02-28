import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ hasSufficientCredits: false, balance: 0 });
  }

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email })
    .select("creditUSD")
    .lean() as any;

  const balance = Math.round((user?.creditUSD ?? 0) * 100) / 100;
  return NextResponse.json({
    hasSufficientCredits: balance > 0,
    balance,
  });
}
