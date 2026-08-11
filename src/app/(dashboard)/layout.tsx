import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [
    { count: residentsCount },
    { count: recordsCount },
    { count: vaccinationsCount },
    { count: maternalCount },
    { data: { user } }
  ] = await Promise.all([
    supabase.from("residents").select("*", { count: "exact", head: true }),
    supabase.from("health_records").select("*", { count: "exact", head: true }),
    supabase.from("vaccinations").select("*", { count: "exact", head: true }),
    supabase.from("maternal_care_logs").select("*", { count: "exact", head: true }),
    supabase.auth.getUser()
  ]);

  const counts = {
    residents: residentsCount || 0,
    records: recordsCount || 0,
    vaccinations: vaccinationsCount || 0,
    maternal: maternalCount || 0,
  };

  const userInfo = {
    name: user?.user_metadata?.full_name || "Admin User",
    email: user?.email || "admin@user.com"
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-background)" }}>
      <Sidebar counts={counts} user={userInfo} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: "var(--color-background)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
