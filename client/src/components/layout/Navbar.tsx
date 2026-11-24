
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Sparkles,
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

import ThemeToggle from "../ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
const navigation = [
  { name: "Home", href: "/#home" },
  { name: "Categories", href: "/#categories" },
  { name: "Services", href: "/services" },
  { name: "How It Works", href: "/#how-it-works" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    user?.accountType === "admin"
      ? "/admin/dashboard"
      : "/student/dashboard";

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // AuthContext clears the local user even if the request fails.
    } finally {
      setIsOpen(false);
      navigate("/", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <nav className="page-container flex h-[76px] items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles size={21} />
          </div>

          <span className="font-heading text-xl font-extrabold tracking-tight">
            Skill<span className="text-primary">Connect</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* DESKTOP ACTIONS */}

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          {!isLoading && (
            user ? (
              <>
                <Link
                  to="/my-profile"
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 transition-colors hover:bg-muted"
                >
                  <Avatar
                    src={user.profilePicture?.url}
                    name={user.fullName}
                    size="md"
                  />

                  <div className="hidden text-left lg:block">
                    <p className="text-sm font-semibold">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      My Profile
                    </p>
                  </div>
                </Link>

                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
                >
                  <LayoutDashboard size={17} />
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-semibold transition-colors hover:text-primary"
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Get Started
                  <ArrowUpRight size={17} />
                </Link>
              </>
            )
          )}
        </div>


        {/* MOBILE ACTIONS */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border"
          >
            {isOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="border-t border-border bg-background px-5 py-5 md:hidden">
          <div className="flex flex-col gap-5">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-muted-foreground"
              >
                {item.name}
              </a>
            ))}

            {!isLoading && (
              user ? (
                <>
                  <Link
                    to="/my-profile"
                    className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 transition-colors hover:bg-muted"
                  >
                    <Avatar
                      src={user.profilePicture?.url}
                      name={user.fullName}
                      size="md"
                    />

                    <div className="hidden text-left lg:block">
                      <p className="text-sm font-semibold">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        My Profile
                      </p>
                    </div>
                  </Link>

                  <Link
                    to={dashboardPath}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">Log in</Link>
                  <Link to="/register">Get Started</Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
