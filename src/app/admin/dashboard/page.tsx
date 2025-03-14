import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // Redirect to login if the user is not authenticated
    redirect("/login");
  }
  // If authenticated, render the client component
  return <DashboardClient />;
}
