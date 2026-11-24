
import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";

import axios from "axios";

import {
  ShieldCheck,
  Mail,
  GraduationCap,
  Building2,
  BookOpen,
  UserRound,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileImage,
  LoaderCircle,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import CreateServiceForm from "../../components/services/CreateServiceForm";
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function StudentDashboard() {
  const { user, refreshUser } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  useEffect(() => {
    if (!selectedFile) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  if (!user) return null;



  const isVerified = user.verificationStatus === "verified";
  const isRejected = user.verificationStatus === "rejected";
  const hasStudentIdCard = user.hasStudentIdCard;

  const verificationLabel = isVerified
    ? "Verified"
    : isRejected
      ? "Verification rejected"
      : "Pending verification";

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setUploadError("");
    setUploadSuccess("");

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only JPEG, PNG and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Your image must not exceed 5MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select your student ID card image first.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const formData = new FormData();
      formData.append("studentIdCard", selectedFile);

      const response = await axios.post(
        `${API_URL}/verification/student-id`,
        formData,
        {
          withCredentials: true,
        }
      );

      setUploadSuccess(
        response.data.message ||
        "Your student ID card was uploaded successfully."
      );

      setSelectedFile(null);

      await refreshUser();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setUploadError(
          error.response?.data?.message ||
          "Unable to upload your student ID card. Please try again."
        );
      } else {
        setUploadError("Something went wrong. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-w-0 flex-1 flex min-h-[calc(100vh-73px)] flex-col lg:flex-row">


      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <section className="mb-8">
          <p className="mb-2 text-sm font-medium text-primary">
            STUDENT DASHBOARD
          </p>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {user.fullName.split(" ")[0]} 👋
          </h1>

          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Manage your SkillConnect account and discover opportunities to
            connect with other students.
          </p>
        </section>

        {/* Verification notice */}
        <section
          className={`mb-8 rounded-2xl border p-5 ${isVerified
            ? "border-green-500/30 bg-green-500/5"
            : isRejected
              ? "border-red-500/30 bg-red-500/5"
              : "border-amber-500/30 bg-amber-500/5"
            }`}
        >
          <div className="flex items-start gap-3">
            {isVerified ? (
              <CheckCircle2 className="mt-1 shrink-0 text-green-500" />
            ) : isRejected ? (
              <AlertCircle className="mt-1 shrink-0 text-red-500" />
            ) : (
              <Clock3 className="mt-1 shrink-0 text-amber-500" />
            )}

            <div>
              <h2 className="font-semibold">{verificationLabel}</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {isVerified
                  ? "Your student identity has been approved. You can access verified-student activities."
                  : isRejected
                    ? "Your student verification was rejected. Review the reason and submit a corrected ID card."
                    : hasStudentIdCard
                      ? "Your student ID card has been submitted and is awaiting administrator review."
                      : "Your student identity is awaiting verification. Submit your student ID card below to continue."}
              </p>

              {!user.emailVerified && (
                <p className="mt-2 text-sm text-amber-600">
                  Your email address has not been verified yet.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Student ID verification */}
        {!isVerified && (
          <section className="mb-8 rounded-2xl border border-border bg-card p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <ShieldCheck size={24} />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Student identity verification
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a clear picture of your University of Ilorin student
                  ID card for administrator review.
                </p>
              </div>
            </div>

            {!user.emailVerified ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-sm text-amber-600">
                  Please verify your email address before uploading your
                  student ID card.
                </p>
              </div>
            ) : (
              <>
                {isRejected && user.rejectionReason && (
                  <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                    <p className="mb-1 text-sm font-semibold text-red-500">
                      Reason for rejection
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {user.rejectionReason}
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Please correct the issue and upload your ID card again.
                    </p>
                  </div>
                )}

                {hasStudentIdCard && !isRejected && (
                  <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                    <Clock3 className="shrink-0 text-amber-500" size={20} />
                    <p className="text-sm text-muted-foreground">
                      Your ID card has already been submitted. Please wait
                      for an administrator to review it.
                    </p>
                  </div>
                )}

                {(!hasStudentIdCard || isRejected) && (
                  <>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-5 py-8 text-center transition hover:border-primary hover:bg-primary/5">
                      <Upload className="mb-3 text-primary" size={30} />

                      <span className="font-semibold">
                        Choose your student ID card
                      </span>

                      <span className="mt-1 text-xs text-muted-foreground">
                        JPEG, PNG or WebP · Maximum 5MB
                      </span>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                    </label>

                    {preview && (
                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-semibold">
                            Selected image preview
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setUploadError("");
                            }}
                            disabled={uploading}
                            className="flex items-center gap-1 text-xs text-red-500"
                          >
                            <X size={14} />
                            Remove
                          </button>
                        </div>

                        <img
                          src={preview}
                          alt="Selected student ID card preview"
                          className="max-h-72 w-full rounded-xl border border-border object-contain"
                        />

                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <FileImage size={15} />
                          <span className="break-all">
                            {selectedFile?.name}
                          </span>
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-500">
                        {uploadError}
                      </div>
                    )}

                    {uploadSuccess && (
                      <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-600">
                        {uploadSuccess}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {uploading ? (
                        <>
                          <LoaderCircle size={18} className="animate-spin" />
                          Uploading ID card...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Submit ID card for verification
                        </>
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </section>
        )}

        {/* Account information */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Your student information</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your registered academic details.
              </p>
            </div>

            <UserRound className="text-primary" size={22} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard
              icon={<Mail size={19} />}
              label="Email address"
              value={user.email}
              detail={user.emailVerified ? "Email verified" : "Not verified"}
            />

            <InfoCard
              icon={<GraduationCap size={19} />}
              label="Faculty"
              value={user.faculty || "Not provided"}
            />

            <InfoCard
              icon={<Building2 size={19} />}
              label="Department"
              value={user.department || "Not provided"}
            />

            <InfoCard
              icon={<BookOpen size={19} />}
              label="Academic level"
              value={
                user.academicLevel
                  ? `${user.academicLevel} Level`
                  : "Not provided"
              }
            />

            <InfoCard
              icon={<ShieldCheck size={19} />}
              label="Student verification"
              value={verificationLabel}
              detail="Identity verification status"
            />
          </div>
        </section>
        {/* Service publishing */}
        <section className="mb-8">
          {isVerified ? (
            <CreateServiceForm />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold">Offer your skills on SkillConnect</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Complete your student identity verification to publish services
                and connect with students who need your skills.
              </p>

              <p className="mt-3 text-sm font-semibold text-amber-600">
                Student verification required.
              </p>
            </div>
          )}
        </section>
        {/* Next steps */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <UserRound size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Complete your student profile
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your profile will help other students understand who you are
                and the services you can offer. More profile management
                features will be available as SkillConnect develops.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>

  );
}

interface InfoCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  detail?: string;
}

function InfoCard({ icon, label, value, detail }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2 text-primary">
        {icon}
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      </div>

      <p className="break-words font-semibold">{value}</p>

      {detail && (
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      )}
    </div>
  );
}

export default StudentDashboard;
