
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  BriefcaseBusiness,
  ArrowRight,
  Plus,
  LoaderCircle,
  Search,
  Layers3,
  Pencil,
  Trash2,
  Power,
  X,
  RefreshCw,
} from "lucide-react";

import Footer from "../../components/layout/Footer";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const categories = [
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
  status: "active" | "inactive";
  createdAt: string;
}

interface ServiceForm {
  title: string;
  description: string;
  category: string;
  pricingType: "fixed" | "hourly" | "negotiable";
  price: string;
}

const emptyForm: ServiceForm = {
  title: "",
  description: "",
  category: "Technology",
  pricingType: "negotiable",
  price: "",
};

export default function MyServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const [deletingService, setDeletingService] =
    useState<Service | null>(null);

  const [processingId, setProcessingId] = useState<string | null>(
    null
  );

  const fetchMyServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/services/my-services`,
        { withCredentials: true }
      );

      const myServices =
        response.data.services ||
        response.data.data?.services ||
        response.data.data ||
        [];

      setServices(myServices);
    } catch (err) {
      console.error("Fetch my services error:", err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ||
              "We couldn't load your services."
          : "We couldn't load your services."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyServices();
  }, [fetchMyServices]);

  const activeServices = services.filter(
    (service) => service.status === "active"
  );

  const inactiveServices = services.filter(
    (service) => service.status === "inactive"
  );

  const filteredServices = services.filter((service) =>
    `${service.title} ${service.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const formatPrice = (service: Service) => {
    if (service.pricingType === "negotiable") {
      return "Negotiable";
    }

    return `₦${service.price?.toLocaleString("en-NG") || "0"}`;
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setActionError("");

    setForm({
      title: service.title,
      description: service.description,
      category: service.category,
      pricingType: service.pricingType,
      price:
        service.price !== null && service.price !== undefined
          ? String(service.price)
          : "",
    });
  };

  const closeEditModal = () => {
    if (saving) return;

    setEditingService(null);
    setForm(emptyForm);
    setActionError("");
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingService) return;

    setSaving(true);
    setActionError("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      pricingType: form.pricingType,
      price:
        form.pricingType === "negotiable"
          ? null
          : Number(form.price),
    };

    try {
      await axios.patch(
        `${API_URL}/services/${editingService._id}`,
        payload,
        { withCredentials: true }
      );

      setEditingService(null);
      setForm(emptyForm);
      await fetchMyServices();
    } catch (err) {
      console.error("Update service error:", err);

      setActionError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ||
              "Unable to update this service."
          : "Unable to update this service."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    const nextStatus =
      service.status === "active" ? "inactive" : "active";

    try {
      setProcessingId(service._id);

      await axios.patch(
        `${API_URL}/services/${service._id}`,
        { status: nextStatus },
        { withCredentials: true }
      );

      await fetchMyServices();
    } catch (err) {
      console.error("Change service status error:", err);

      window.alert(
        axios.isAxiosError(err)
          ? err.response?.data?.message ||
              "Unable to change service status."
          : "Unable to change service status."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingService) return;

    try {
      setProcessingId(deletingService._id);

      await axios.delete(
        `${API_URL}/services/${deletingService._id}`,
        { withCredentials: true }
      );

      setDeletingService(null);
      await fetchMyServices();
    } catch (err) {
      console.error("Delete service error:", err);

      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ||
            "Unable to delete this service."
        : "Unable to delete this service.";

      window.alert(message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      <main className="page-container py-10 md:py-14">
        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <BriefcaseBusiness size={14} />
              SERVICE MANAGEMENT
            </span>

            <h1 className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl">
              My Services
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Manage the services you offer to other University
              of Ilorin students.
            </p>
          </div>

          <Link
            to="/student/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            <Plus size={18} />
            Create a Service
          </Link>
        </div>

        {/* STATISTICS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <Layers3 size={18} />
              <span className="text-sm font-medium">
                Total Services
              </span>
            </div>
            <p className="font-heading text-3xl font-extrabold">
              {services.length}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium">
                Active Services
              </span>
            </div>
            <p className="font-heading text-3xl font-extrabold text-emerald-500">
              {activeServices.length}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-sm font-medium">
                Inactive Services
              </span>
            </div>
            <p className="font-heading text-3xl font-extrabold text-amber-500">
              {inactiveServices.length}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your services..."
              className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <button
            onClick={fetchMyServices}
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle
              className="animate-spin text-primary"
              size={32}
            />
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p className="mb-4 text-sm text-destructive">{error}</p>
            <button
              onClick={fetchMyServices}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && services.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <BriefcaseBusiness
              size={42}
              className="mx-auto mb-4 text-muted-foreground"
            />

            <h2 className="mb-2 font-heading text-xl font-bold">
              You haven't published any services yet
            </h2>

            <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-muted-foreground">
              Showcase your skills and let other students discover
              what you can help them with.
            </p>

            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Create Your First Service
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* NO SEARCH RESULTS */}
        {!loading &&
          !error &&
          services.length > 0 &&
          filteredServices.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
              <Search
                size={32}
                className="mx-auto mb-3 text-muted-foreground"
              />
              <h3 className="font-heading text-lg font-bold">
                No matching services
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try searching with another keyword.
              </p>
            </div>
          )}

        {/* SERVICE CARDS */}
        {!loading && !error && filteredServices.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => {
              const isProcessing = processingId === service._id;

              return (
                <article
                  key={service._id}
                  className="flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                      {service.category}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        service.status === "active"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {service.status}
                    </span>
                  </div>

                  <h2 className="mb-3 font-heading text-lg font-bold">
                    {service.title}
                  </h2>

                  <p className="mb-5 line-clamp-4 flex-1 text-sm leading-6 text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="mb-4 border-t border-border pt-4">
                    <p className="text-lg font-extrabold">
                      {formatPrice(service)}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {service.pricingType} pricing
                    </p>
                  </div>

                  <p className="mb-5 text-xs text-muted-foreground">
                    Published{" "}
                    {new Date(service.createdAt).toLocaleDateString(
                      "en-NG",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      disabled={isProcessing}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary disabled:opacity-50"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleToggleStatus(service)}
                      disabled={isProcessing}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : (
                        <Power size={15} />
                      )}
                      {service.status === "active"
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </div>

                  <button
                    onClick={() => setDeletingService(service)}
                    disabled={isProcessing}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    Delete Service
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* EDIT MODAL */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-extrabold">
                  Edit Service
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update the information students see about your service.
                </p>
              </div>

              <button
                onClick={closeEditModal}
                disabled={saving}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
                aria-label="Close edit form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Service Title
                </label>
                <input
                  required
                  minLength={3}
                  maxLength={100}
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Description
                </label>
                <textarea
                  required
                  minLength={20}
                  maxLength={2000}
                  rows={5}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {form.description.length}/2000 characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Pricing Type
                  </label>
                  <select
                    value={form.pricingType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pricingType: e.target.value as ServiceForm["pricingType"],
                        price:
                          e.target.value === "negotiable"
                            ? ""
                            : form.price,
                      })
                    }
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>

                {form.pricingType !== "negotiable" && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Price (₦)
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      placeholder="Enter amount"
                      className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {actionError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {actionError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="rounded-xl border border-border px-5 py-3 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 size={22} />
            </div>

            <h2 className="font-heading text-xl font-extrabold">
              Delete this service?
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              You're about to delete{" "}
              <strong className="text-foreground">
                {deletingService.title}
              </strong>
              . This action cannot be undone. Services with existing
              request or connection history are protected by the server.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setDeletingService(null)}
                disabled={processingId === deletingService._id}
                className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={processingId === deletingService._id}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {processingId === deletingService._id && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
