
import { useState, type FormEvent } from "react";
import axios from "axios";
import {
  BriefcaseBusiness,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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
  "Web-Dev",
  "Other",
];

interface CreateServiceFormProps {
  onCreated?: () => void;
}

function CreateServiceForm({ onCreated }: CreateServiceFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [pricingType, setPricingType] = useState<
    "fixed" | "hourly" | "negotiable"
  >("negotiable");
  const [price, setPrice] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      (pricingType === "fixed" || pricingType === "hourly") &&
      (!price || Number(price) < 0)
    ) {
      setError("Please enter a valid service price.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        pricingType,
        price:
          pricingType === "negotiable"
            ? null
            : Number(price),
      };

      const response = await axios.post(
        `${API_URL}/services`,
        payload,
        { withCredentials: true }
      );

      setSuccess(
        response.data.message || "Your service has been published successfully!"
      );

      setTitle("");
      setDescription("");
      setCategory("Technology");
      setPricingType("negotiable");
      setPrice("");

      onCreated?.();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
          "Unable to publish your service. Please try again."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-7 flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <BriefcaseBusiness size={24} />
        </div>

        <div>
          <h2 className="text-xl font-bold">Create a Service</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell other University of Ilorin students about the service you offer.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-semibold" htmlFor="service-title">
            Service title
          </label>
          <input
            id="service-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Professional Logo Design"
            minLength={3}
            maxLength={100}
            required
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Use a clear title that describes what you offer.
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold" htmlFor="service-category">
            Category
          </label>
          <select
            id="service-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={inputClass}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold" htmlFor="service-description">
            Service description
          </label>
          <textarea
            id="service-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe your service, your experience, and what students can expect..."
            minLength={20}
            maxLength={2000}
            rows={5}
            required
            className={`${inputClass} resize-y`}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Minimum 20 characters. Maximum 2,000 characters.
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold" htmlFor="pricing-type">
            Pricing type
          </label>
          <select
            id="pricing-type"
            value={pricingType}
            onChange={(event) =>
              setPricingType(
                event.target.value as "fixed" | "hourly" | "negotiable"
              )
            }
            className={inputClass}
          >
            <option value="negotiable">Negotiable</option>
            <option value="fixed">Fixed price</option>
            <option value="hourly">Hourly rate</option>
          </select>
        </div>

        {pricingType !== "negotiable" && (
          <div>
            <label className="text-sm font-semibold" htmlFor="service-price">
              {pricingType === "hourly" ? "Hourly rate (₦)" : "Service price (₦)"}
            </label>
            <input
              id="service-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Enter amount"
              required
              className={inputClass}
            />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-500">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-xl border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-600">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Publishing...
            </>
          ) : (
            "Publish Service"
          )}
        </button>
      </form>
    </section>
  );
}

export default CreateServiceForm;
