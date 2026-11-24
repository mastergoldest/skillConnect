import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">

      <div className="page-container py-14">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          <div className="lg:col-span-2">

            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles size={21} />
              </div>

              <span className="font-heading text-xl font-extrabold">
                Skill<span className="text-primary">Connect</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
              A university-focused platform designed to help students
              discover skills, find services and connect with talented
              members of their campus community.
            </p>

          </div>

          <div>
            <h3 className="font-heading font-bold">
              Explore
            </h3>

            <div className="mt-5 flex flex-col gap-4 text-sm text-muted-foreground">
              <a href="#categories" className="hover:text-primary">
                Categories
              </a>

              <a href="#how-it-works" className="hover:text-primary">
                How It Works
              </a>

              <a href="#home" className="hover:text-primary">
                Home
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-bold">
              Account
            </h3>

            <div className="mt-5 flex flex-col gap-4 text-sm text-muted-foreground">
              <Link to="/login" className="hover:text-primary">
                Log In
              </Link>

              <Link to="/register" className="hover:text-primary">
                Create Account
              </Link>
            </div>
          </div>

        </div>

        <div className="mt-14 flex flex-col justify-between gap-5 border-t border-border pt-7 sm:flex-row sm:items-center">

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SkillConnect. All rights reserved.
          </p>

          <p className="text-xs text-muted-foreground">
            Designed for the University of Ilorin student community.
          </p>

        </div>

      </div>
    </footer>
  );
}