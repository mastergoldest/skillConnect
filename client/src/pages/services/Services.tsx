
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  LoaderCircle,
  BriefcaseBusiness,
  UserRound,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const categories = [
  "All",
  "Technology",
  "Graphics & Design",
  "Writing & Translation",
  "Education & Tutoring",
  "Business",
  "Photography & Video",
  "Home & Lifestyle",
  "Other",
];

interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  pricingType: "fixed" | "hourly" | "negotiable";
  price?: number | null;
  provider: {
    _id: string;
    fullName: string;
    faculty?: string;
    department?: string;
     profilePicture?: {
    url?: string;
  } | null;

  bio?: string;

  skills?: string[];
  };
  createdAt: string;
 
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalServices: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/services`, {
          params: {
            search,
            category,
            page,
            limit: 12,
          },
          signal: controller.signal,
        });

        setServices(response.data.services);
        setPagination(response.data.pagination);
      } catch (err) {
        if (axios.isCancel(err)) return;

        setError(
          "We couldn't load services. Please check your connection and try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchServices();

    return () => controller.abort();
  }, [search, category, page]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategory = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="page-container py-12 md:py-16">
        {/* PAGE INTRO */}
        <div className="mb-10 max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
            <BriefcaseBusiness size={15} />
            STUDENT SERVICES
          </span>

          <h1 className="mb-4 font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
            Discover skills.
            <span className="text-primary"> Connect with talent.</span>
          </h1>

          <p className="text-base leading-7 text-muted-foreground">
            Find talented University of Ilorin students offering services,
            or discover someone who can help you bring your ideas to life.
          </p>
        </div>

        {/* SEARCH */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for a skill or service..."
              className="h-14 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* CATEGORY FILTER */}
          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <SlidersHorizontal size={16} />
              Filter by category
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => handleCategory(item)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${category === item
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS HEADER */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold">
              Available Services
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {pagination
                ? `${pagination.totalServices} services found`
                : "Explore available student services"}
            </p>
          </div>

          <Link
            to="/student/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            Offer a Service
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle className="animate-spin text-primary" size={32} />
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="mb-4 text-sm text-destructive">{error}</p>

            <button
              onClick={() => setPage((current) => current)}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Retry
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && services.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <BriefcaseBusiness
              size={38}
              className="mx-auto mb-4 text-muted-foreground"
            />

            <h3 className="mb-2 font-heading text-xl font-bold">
              No services found
            </h3>

            <p className="text-sm text-muted-foreground">
              Try another search or select a different category.
            </p>
          </div>
        )}

        {/* SERVICE CARDS */}
        {!loading && !error && services.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service._id}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
              >
                <span className="mb-4 w-fit rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                  {service.category}
                </span>

                <h3 className="mb-3 font-heading text-lg font-bold">
                  {service.title}
                </h3>

                <p className="mb-6 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">
                  {service.description}
                </p>

                <div className="mb-5 flex items-center gap-3 border-t border-border pt-5">
                  {service.provider?.profilePicture?.url ? (
                    <img
                      src={service.provider.profilePicture.url}
                      alt={`${service.provider.fullName}'s profile`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserRound size={19} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {service.provider?.fullName || "Student provider"}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {service.provider?.department || "University of Ilorin"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold">
                      {service.pricingType === "negotiable"
                        ? "Negotiable"
                        : `₦${service.price?.toLocaleString("en-NG")}`}
                    </p>

                    <p className="text-xs capitalize text-muted-foreground">
                      {service.pricingType}
                    </p>
                  </div>

                  <Link
                    to={`/services/${service._id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-bold transition hover:border-primary hover:text-primary"
                  >
                    View Details
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && !error && pagination && pagination.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              disabled={!pagination.hasPreviousPage}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-xl border border-border px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm font-semibold text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl border border-border px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
