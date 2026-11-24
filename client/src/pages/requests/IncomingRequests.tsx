
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
  Inbox,
  MessageSquare,
  UserRound,
  Send,
  RefreshCw,
} from "lucide-react";

import Footer from "../../components/layout/Footer";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface IncomingRequest {
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
  requester: {
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

const IncomingRequests = () => {
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseMessages, setResponseMessages] = useState<
    Record<string, string>
  >({});
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/service-requests/incoming`,
        { withCredentials: true }
      );

      setRequests(response.data.requests || []);
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Unable to load incoming requests."
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleResponse = async (
    requestId: string,
    status: "accepted" | "declined"
  ) => {
    try {
      setRespondingId(requestId);
      setActionError("");

      const providerResponse = responseMessages[requestId] || "";

      const response = await axios.patch(
        `${API_URL}/service-requests/${requestId}/respond`,
        {
          status,
          providerResponse: providerResponse.trim(),
        },
        { withCredentials: true }
      );

      const updatedRequest = response.data.request;

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId ? updatedRequest : request
        )
      );

      setActiveRequestId(null);
    } catch (err) {
      setActionError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Unable to update this request."
          : "Something went wrong. Please try again."
      );
    } finally {
      setRespondingId(null);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatPrice = (request: IncomingRequest) => {
    if (request.service.pricingType === "negotiable") {
      return "Negotiable";
    }

    return `₦${request.service.price?.toLocaleString("en-NG") || "0"}${request.service.pricingType === "hourly" ? " / hour" : ""
      }`;
  };

  const pendingCount = requests.filter(
    (request) => request.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
  

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Inbox size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Incoming Requests
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review and respond to students requesting your services.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {actionError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">
            {actionError}
          </div>
        )}

        {!loading && !error && (
          <div className="mb-6 flex flex-wrap gap-3">
            <div className="rounded-xl border border-border bg-card px-5 py-4">
              <p className="text-sm text-muted-foreground">Total requests</p>
              <p className="mt-1 text-2xl font-bold">{requests.length}</p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-card px-5 py-4">
              <p className="text-sm text-muted-foreground">Awaiting response</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">
                {pendingCount}
              </p>
            </div>
          </div>
        )}

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

            <button
              onClick={fetchRequests}
              className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Try Again
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Inbox size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              No incoming requests yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              When another student requests one of your services, the request
              will appear here.
            </p>

            <Link
              to="/services"
              className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {requests.map((request) => {
              const isPending = request.status === "pending";
              const isActive = activeRequestId === request._id;

              return (
                <article
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

                      <p className="mt-1 text-sm font-semibold text-primary">
                        {formatPrice(request)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${statusStyles[request.status] || ""
                        }`}
                    >
                      {isPending ? (
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

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserRound size={20} />
                    </div>

                    <div>
                      <p className="font-semibold">
                        {request.requester?.fullName || "Student account unavailable"}
                      </p>

                      {(request.requester?.faculty || request.requester?.department) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {request.requester.faculty}
                          {request.requester.faculty && request.requester.department
                            ? " • "
                            : ""}
                          {request.requester.department}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Student's request
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                      {request.requestMessage}
                    </p>
                  </div>

                  {request.providerResponse && (
                    <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Your response
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                        {request.providerResponse}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 size={14} />
                    Received {formatDate(request.createdAt)}
                  </div>

                  {isPending && (
                    <div className="mt-6 border-t border-border pt-5">
                      {!isActive ? (
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => {
                              setActionError("");
                              setActiveRequestId(request._id);
                            }}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                          >
                            <CheckCircle2 size={17} />
                            Accept Request
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActionError("");
                              setActiveRequestId(request._id);
                            }}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
                          >
                            <XCircle size={17} />
                            Decline Request
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label
                              htmlFor={`response-${request._id}`}
                              className="mb-2 block text-sm font-semibold"
                            >
                              Your response (optional)
                            </label>

                            <textarea
                              id={`response-${request._id}`}
                              rows={3}
                              maxLength={500}
                              value={responseMessages[request._id] || ""}
                              onChange={(event) =>
                                setResponseMessages((previous) => ({
                                  ...previous,
                                  [request._id]: event.target.value,
                                }))
                              }
                              placeholder="Write a short message to the student..."
                              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              disabled={respondingId === request._id}
                              onClick={() =>
                                handleResponse(request._id, "accepted")
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                            >
                              {respondingId === request._id ? (
                                <Loader2 size={17} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={17} />
                              )}
                              Confirm Acceptance
                            </button>

                            <button
                              type="button"
                              disabled={respondingId === request._id}
                              onClick={() =>
                                handleResponse(request._id, "declined")
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 px-5 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                            >
                              <XCircle size={17} />
                              Decline Request
                            </button>

                            <button
                              type="button"
                              disabled={respondingId === request._id}
                              onClick={() => setActiveRequestId(null)}
                              className="rounded-xl border border-border px-5 py-3 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-5">
                    <Link
                      to={`/services/${request.service._id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:opacity-75"
                    >
                      View Service
                      <ArrowLeft className="rotate-180" size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default IncomingRequests;
