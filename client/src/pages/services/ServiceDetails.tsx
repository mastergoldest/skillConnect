
import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  GraduationCap,
  Loader2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserRound,
  Send,
  CheckCircle2,
  X,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  pricingType: "fixed" | "hourly" | "negotiable";
  price: number | null;
  status: string;
  provider: {
    _id: string;
    fullName: string;
    faculty?: string;
    department?: string;
    verificationStatus: string;
    profilePicture?: {
      url?: string;
    } | null;

    bio?: string;

    skills?: string[];
  };
  createdAt: string;

}

const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Request form states
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchService = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/services/${id}`, {
          withCredentials: true,
          signal: controller.signal,
        });

        setService(response.data.service);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || "Unable to load this service."
            : "Something went wrong."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (id) fetchService();

    return () => controller.abort();
  }, [id]);

  const formatPrice = () => {
    if (!service || service.pricingType === "negotiable") {
      return "Negotiable";
    }

    return `₦${service.price?.toLocaleString("en-NG") || "0"}${service.pricingType === "hourly" ? " / hour" : ""
      }`;
  };

  // Submit service request
  const handleRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!service) return;

    setRequestError("");
    setRequestSuccess("");

    if (requestMessage.trim().length < 10) {
      setRequestError("Please describe what you need in at least 10 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${API_URL}/service-requests/${service._id}`,
        {
          requestMessage: requestMessage.trim(),
        },
        {
          withCredentials: true,
        }
      );

      setRequestSuccess(
        response.data.message || "Your service request was submitted successfully."
      );

      setRequestMessage("");
      setShowRequestForm(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          setRequestError("Please log in before requesting this service.");
        } else if (status === 403) {
          setRequestError(
            err.response?.data?.message ||
            "Your student account must be verified before requesting a service."
          );
        } else if (status === 409) {
          setRequestError(
            err.response?.data?.message ||
            "You already have a pending request for this service."
          );
        } else {
          setRequestError(
            err.response?.data?.message ||
            "Unable to submit your request. Please try again."
          );
        }
      } else {
        setRequestError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/services"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to Services
        </Link>

        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="text-xl font-bold">Service unavailable</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>

            <Link
              to="/services"
              className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              Browse Services
            </Link>
          </div>
        ) : service ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            <section className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {service.category}
                  </span>

                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600">
                    Active service
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {service.title}
                </h1>

                <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 size={16} />
                  Posted{" "}
                  {new Date(service.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <div className="my-8 border-t border-border" />

                <h2 className="text-xl font-bold">About this service</h2>

                <p className="mt-4 whitespace-pre-wrap leading-8 text-muted-foreground">
                  {service.description}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <h2 className="text-xl font-bold">About the provider</h2>

                <div className="mt-6 flex items-start gap-4">
                  {service.provider.profilePicture?.url ? (
                    <img
                      src={service.provider.profilePicture.url}
                      alt={`${service.provider.fullName}'s profile`}
                      className="h-14 w-14 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserRound size={26} />
                    </div>
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold">
                        {service.provider.fullName}
                      </h3>

                      {service.provider.verificationStatus === "verified" && (
                        <BadgeCheck size={19} className="text-green-500" />
                      )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      SkillConnect student provider
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {service.provider.faculty && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <GraduationCap size={18} />
                      {service.provider.faculty}
                    </div>
                  )}

                  {service.provider.department && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin size={18} />
                      {service.provider.department}
                    </div>
                  )}
                  {/* Provider About Me */}
                  {service.provider.bio?.trim() && (
                    <div className="mt-6 border-t border-border pt-6">
                      <h3 className="font-semibold">About Me</h3>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                        {service.provider.bio}
                      </p>
                    </div>
                  )}

                  {/* Provider Skills */}
                  {service.provider.skills &&
                    service.provider.skills.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold">Skills</h3>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {service.provider.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {service.provider.verificationStatus === "verified" && (
                    <div className="flex items-center gap-3 text-sm text-green-600">
                      <ShieldCheck size={18} />
                      Student identity verified
                    </div>
                  )}
                </div>
              </div>
            </section>

            <aside>
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                  Service pricing
                </p>

                <h2 className="mt-2 text-3xl font-bold text-primary">
                  {formatPrice()}
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Interested in this service? Send the provider a request
                  explaining what you need.
                </p>

                {requestSuccess && (
                  <div className="mt-5 flex gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
                    <CheckCircle2 size={20} className="shrink-0" />
                    <p>{requestSuccess}</p>
                  </div>
                )}

                {requestError && (
                  <div className="mt-5 flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                    <X size={20} className="shrink-0" />
                    <p>{requestError}</p>
                  </div>
                )}

                {!showRequestForm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRequestError("");
                      setRequestSuccess("");
                      setShowRequestForm(true);
                    }}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    <MessageCircle size={18} />
                    Request This Service
                  </button>
                ) : (
                  <form onSubmit={handleRequestSubmit} className="mt-6 space-y-4">
                    <div>
                      <label
                        htmlFor="requestMessage"
                        className="mb-2 block text-sm font-semibold"
                      >
                        Describe what you need
                      </label>

                      <textarea
                        id="requestMessage"
                        value={requestMessage}
                        onChange={(event) => {
                          setRequestMessage(event.target.value);
                          setRequestError("");
                        }}
                        placeholder="Hello, I'm interested in your service. I need help with..."
                        rows={6}
                        minLength={10}
                        maxLength={1000}
                        required
                        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />

                      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                        <span>Minimum 10 characters</span>
                        <span>{requestMessage.length}/1000</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || requestMessage.trim().length < 10}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Sending Request...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Submit Request
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        setShowRequestForm(false);
                        setRequestError("");
                      }}
                      className="w-full rounded-xl border border-border px-5 py-3 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </form>
                )}

                <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
                  Your request will be sent directly to the service provider.
                </p>
              </div>
            </aside>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetails;
