import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/app/lib/mongodb";
import { User } from "@/app/models/User";
import { Activity } from "@/app/models/Activity";
import { AdminPage } from "./admin-page";

const ADMIN_EMAIL = "ericlauchiho@gmail.com";

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

  // Serialize for client component
  const serializedUsers = users.map((u: any) => ({
    email: u.email,
    name: u.name || "",
    image: u.image || "",
    createdAt: u.createdAt?.toISOString() || "",
  }));

  const serializedActivities = activities.map((a: any) => ({
    email: a.email,
    event: a.event,
    timestamp: a.timestamp?.toISOString() || "",
  }));

  return (
    <AdminPage users={serializedUsers} activities={serializedActivities} />
  );
}
