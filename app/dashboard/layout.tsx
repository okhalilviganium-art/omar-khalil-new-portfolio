import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import DashboardShell from "@/components/dashboard/shared/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <>
      <link href="/css/dashboard.css" rel="stylesheet" />
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}
