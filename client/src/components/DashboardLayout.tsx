
import { Outlet } from "react-router-dom";
import Navbar from "./layout/Navbar";
import DashboardSidebar from "./dashboard/DashboardSidebar";

interface DashboardLayoutProps {
  role: "student" | "admin";
}

export default function DashboardLayout({
  role,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="flex min-h-[calc(100vh-76px)] flex-col lg:flex-row">
        <DashboardSidebar role={role} />

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
