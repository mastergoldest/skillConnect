
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Clock3,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageCircle,
  ClipboardList,
} from "lucide-react";

import Footer from "../../components/layout/Footer";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface ServiceRequest {
  _id: string;
  requestMessage: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "completed";
  providerResponse?: string;
  createdAt: string;
  service: {
    _id: string;
    title: string;
    category: string;
    pricingType: string;
    price: number | null;
  };
  provider: {
    _id: string;
    fullName: string;
    faculty?: string;
    department?: string;
  } | null;
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  accepted: "bg-green-500/10 text-green-600 border-green-500/20",
  declined: "bg-red-500/10 text-red-600 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  completed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const MyRequests = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/service-requests/my-requests`,
          {
            withCredentials: true,
            signal: controller.signal,
          }
        );

        setRequests(response.data.requests || []);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || "Unable to load your requests."
            : "Something went wrong."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRequests();

    return () => controller.abort();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatPrice = (request: ServiceRequest) => {
    if (request.service.pricingType === "negotiable") {
      return "Negotiable";
    }

    return `₦${request.service.price?.toLocaleString("en-NG") || "0"}${request.service.pricingType === "hourly" ? " / hour" : ""
      }`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                My Service Requests
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Track the services you've requested from other students.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <XCircle className="mx-auto text-red-500" size={35} />
            <h2 className="mt-4 text-lg font-bold">
              Unable to load requests
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircle size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              No service requests yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              When you request a service from another student, it will appear
              here. You can track its progress from this page.
            </p>

            <Link
              to="/services"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {requests.length} request{requests.length !== 1 ? "s" : ""}
              </p>
            </div>

            {requests.map((request) => (
              <div
                key={request._id}
                className="rounded-2xl border border-border bg-card p-5 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {request.service.category}
                    </span>

                    <h2 className="mt-3 text-lg font-bold">
                      {request.service.title}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Provider: {request.provider?.fullName || "Provider unavailable"}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-primary">
                      {formatPrice(request)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${statusStyles[request.status] || ""
                      }`}
                  >
                    {request.status === "pending" ? (
                      <Clock3 size={14} />
                    ) : request.status === "accepted" ||
                      request.status === "completed" ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                    {request.status}
                  </span>
                </div>

                <div className="my-5 border-t border-border" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Your request message
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                    {request.requestMessage}
                  </p>
                </div>

                {request.providerResponse && (
                  <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Provider's response
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                      {request.providerResponse}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 size={14} />
                  Requested on {formatDate(request.createdAt)}
                </div>

                <div className="mt-5">
                  <Link
                    to={`/services/${request.service._id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:opacity-75"
                  >
                    View Service
                    <ArrowLeft className="rotate-180" size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyRequests;
