import { spawn } from "child_process";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ADMIN_EMAIL } from "@/app/admin/config";
import { connectToDatabase } from "@/app/lib/mongodb";
import { OperationHistory } from "@/app/models/OperationHistory";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  await connectToDatabase();
  const history = await OperationHistory.find()
    .sort({ performedAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json(history);
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { operationName } = await req.json();
  if (!operationName) {
    return NextResponse.json({ error: "operationName is required" }, { status: 400 });
  }

  await connectToDatabase();

  let status: "successful" | "failed" = "successful";
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "rebuild_and_redeploy.sh");
    const child = spawn("bash", [scriptPath], {
      detached: true,
      stdio: "ignore",
    });
    child.unref();
  } catch {
    status = "failed";
  }

  const record = await OperationHistory.create({ operationName, status });

  return NextResponse.json({
    ok: true,
    status,
    record: {
      _id: record._id,
      operationName: record.operationName,
      performedAt: record.performedAt,
      status: record.status,
    },
  });
}
