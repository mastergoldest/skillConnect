
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Send,
  Inbox,
  MessageCircle,
  ShieldCheck,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";

interface DashboardSidebarProps {
  role: "student" | "admin";
}

const studentLinks = [
  {
    label: "Overview",
    path: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Explore Services",
    path: "/services",
    icon: Search,
  },
  {
    label: "My Requests",
    path: "/my-requests",
    icon: Send,
  },
  {
    label: "Incoming Requests",
    path: "/incoming-requests",
    icon: Inbox,
  },
  {
    label: "My Connections",
    path: "/my-connections",
    icon: MessageCircle,
  },
  {
    label: "My Profile",
    path: "/my-profile",
    icon: UserRound,
},
{
  label: "My Services",
  path: "/my-services",
  icon: BriefcaseBusiness,
},
];

const adminLinks = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
];

function DashboardSidebar({ role }: DashboardSidebarProps) {
  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <aside className="w-full shrink-0 border-b border-border bg-card p-3 lg:min-h-[calc(100vh-73px)] lg:w-64 lg:border-b-0 lg:border-r lg:p-5">
      <div className="mb-4 hidden lg:block">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {role === "admin" ? "Administration" : "Student Menu"}
        </p>
      </div>

      <nav
        aria-label={`${role} dashboard navigation`}
        className="flex gap-2 overflow-x-auto lg:flex-col"
      >
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              end
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon size={19} />
              <span className="whitespace-nowrap">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {role === "admin" && (
        <div className="mt-6 hidden rounded-xl border border-border bg-muted/40 p-4 lg:block">
          <ShieldCheck className="mb-2 text-primary" size={22} />
          <p className="text-sm font-semibold">Admin Access</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Manage student verification and platform activities.
          </p>
        </div>
      )}
    </aside>
  );
}

export default DashboardSidebar;
