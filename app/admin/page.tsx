import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";
import { Activity } from "@/app/models/Activity";
import { LLMModelDoc } from "@/app/models/LLMModel";
import { AdminPage } from "./admin-page";
import { ADMIN_EMAIL } from "./config";

export default async function Admin() {
  const session = await auth();

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    notFound();
  }

  await connectToDatabase();

  const users = await User.find().sort({ createdAt: -1 }).lean();
  const activities = await Activity.find()
    .sort({ timestamp: -1 })
    .lean();
  const models = await LLMModelDoc.find().sort({ sorted: 1 }).lean();

  // Serialize for client component
  const serializedUsers = users.map((u: any) => ({
    email: u.email,
    name: u.name || "",
    image: u.image || "",
    createdAt: u.createdAt?.toISOString() || "",
    creditUSD: Math.round((u.creditUSD ?? 0) * 100) / 100,
  }));

  const serializedActivities = activities.map((a: any) => ({
    email: a.email,
    event: a.event,
    timestamp: a.timestamp?.toISOString() || "",
  }));

  const serializedModels = models.map((m: any) => ({
    _id: m._id.toString(),
    name: m.name,
    available: m.available,
    sorted: m.sorted,
    costPerMillion: m.costPerMillion ?? 0,
    provider: {
      id: m.provider.id,
      providerName: m.provider.providerName,
      providerType: m.provider.providerType,
      sorted: m.provider.sorted,
    },
  }));

  return (
    <AdminPage
      users={serializedUsers}
      activities={serializedActivities}
      models={serializedModels}
    />
  );
}
