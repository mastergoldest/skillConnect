
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  LogOut,
  LoaderCircle,
  AlertCircle,
  X,
  GraduationCap,
  Mail,
  Building2,
  BookOpen,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface PendingStudent {
  id: string;
  fullName: string;
  email: string;
  matricNumber: string;
  faculty: string;
  department: string;
  academicLevel: string;
  verificationStatus: string;
  uploadedAt?: string;
  createdAt?: string;
}

function AdminDashboard() {
  const { user, logout } = useAuth();

  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedStudent, setSelectedStudent] =
    useState<PendingStudent | null>(null);

  const [previewUrl, setPreviewUrl] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const [processingId, setProcessingId] = useState("");

  // FETCH PENDING STUDENTS
  const fetchPendingStudents = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/admin/verification/pending`,
        { withCredentials: true }
      );

      setStudents(response.data.data || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to load pending student verifications."
        );
      } else {
        setError("Something went wrong while loading students.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  // PREVIEW STUDENT ID CARD
  const handlePreview = async (student: PendingStudent) => {
    try {
      setSelectedStudent(student);
      setPreviewUrl("");
      setIsPreviewLoading(true);
      setShowRejectForm(false);
      setRejectionReason("");

      const response = await axios.get(
        `${API_URL}/admin/verification/${student.id}/student-id`,
        { withCredentials: true }
      );

      setPreviewUrl(response.data.data.imageUrl);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to load the student's ID card."
        );
      } else {
        setError("Unable to load the student's ID card.");
      }

      setSelectedStudent(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // APPROVE STUDENT
  const handleApprove = async (student: PendingStudent) => {
    try {
      setProcessingId(student.id);
      setError("");
      setSuccess("");

      const response = await axios.post(
        `${API_URL}/admin/verification/${student.id}/approve`,
        {},
        { withCredentials: true }
      );

      setSuccess(response.data.message);
      setSelectedStudent(null);

      await fetchPendingStudents();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Unable to approve student."
        );
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setProcessingId("");
    }
  };

  // REJECT STUDENT
  const handleReject = async () => {
    if (!selectedStudent) return;

    if (rejectionReason.trim().length < 10) {
      setError("Please provide a rejection reason of at least 10 characters.");
      return;
    }

    try {
      setProcessingId(selectedStudent.id);
      setError("");
      setSuccess("");

      const response = await axios.post(
        `${API_URL}/admin/verification/${selectedStudent.id}/reject`,
        { reason: rejectionReason },
        { withCredentials: true }
      );

      setSuccess(response.data.message);
      setSelectedStudent(null);
      setShowRejectForm(false);
      setRejectionReason("");

      await fetchPendingStudents();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Unable to reject student."
        );
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setProcessingId("");
    }
  };

  const closePreview = () => {
    setSelectedStudent(null);
    setPreviewUrl("");
    setShowRejectForm(false);
    setRejectionReason("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                SkillConnect
              </h1>
              <p className="text-xs text-muted-foreground">
                Administration Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:bg-muted"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* PAGE INTRO */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-primary">
            ADMINISTRATION
          </p>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard Overview
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage student identity verification and platform activities.
          </p>
        </div>

        {/* STAT CARD */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Verifications
                </p>

                <h3 className="mt-2 text-3xl font-bold">
                  {students.length}
                </h3>
              </div>

              <div className="rounded-xl bg-warning/10 p-3 text-warning">
                <Clock3 size={24} />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Students waiting for identity review.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Verification Queue
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  {students.length > 0 ? "Requires attention" : "All caught up"}
                </h3>
              </div>

              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Users size={24} />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Current student verification workload.
            </p>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-success/20 bg-success/10 p-4 text-sm text-success">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* PENDING STUDENTS */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <h3 className="font-bold">Student Verification Requests</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Review submitted student identity documents.
              </p>
            </div>

            <button
              onClick={fetchPendingStudents}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={isLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
              <LoaderCircle className="animate-spin text-primary" size={32} />
              <p className="text-sm text-muted-foreground">
                Loading verification requests...
              </p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <div className="mb-4 rounded-2xl bg-success/10 p-4 text-success">
                <CheckCircle2 size={30} />
              </div>

              <h4 className="font-semibold">No pending verifications</h4>

              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                There are currently no student identity documents waiting for
                review.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <GraduationCap size={21} />
                    </div>

                    <div>
                      <h4 className="font-semibold">{student.fullName}</h4>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {student.matricNumber}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {student.department} · {student.academicLevel} Level
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Submitted:{" "}
                        {student.uploadedAt
                          ? new Date(student.uploadedAt).toLocaleDateString()
                          : "Date unavailable"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePreview(student)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <Eye size={16} />
                    Review Application
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* STUDENT ID PREVIEW MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="font-bold">Student Verification Review</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Review the student's information and identity document.
                </p>
              </div>

              <button
                onClick={closePreview}
                className="rounded-lg p-2 transition hover:bg-muted"
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-5 overflow-y-auto p-5">
              {/* STUDENT INFORMATION */}
              <div className="grid gap-4 rounded-xl bg-muted/50 p-4 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <Users size={17} className="mt-0.5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full name</p>
                    <p className="text-sm font-medium">
                      {selectedStudent.fullName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail size={17} className="mt-0.5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="break-all text-sm font-medium">
                      {selectedStudent.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <GraduationCap size={17} className="mt-0.5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Matric number</p>
                    <p className="text-sm font-medium">
                      {selectedStudent.matricNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Building2 size={17} className="mt-0.5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Faculty</p>
                    <p className="text-sm font-medium">
                      {selectedStudent.faculty}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <BookOpen size={17} className="mt-0.5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm font-medium">
                      {selectedStudent.department}
                    </p>
                  </div>
                </div>
              </div>

              {/* ID CARD IMAGE */}
              <div>
                <h4 className="mb-3 text-sm font-semibold">
                  Submitted Student ID Card
                </h4>

                <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 p-3">
                  {isPreviewLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <LoaderCircle
                        className="animate-spin text-primary"
                        size={30}
                      />
                      <p className="text-xs text-muted-foreground">
                        Securely loading ID card...
                      </p>
                    </div>
                  ) : previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Student identity card"
                      className="max-h-80 max-w-full rounded-lg object-contain"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      ID card preview unavailable.
                    </p>
                  )}
                </div>
              </div>

              {/* REJECTION FORM */}
              {showRejectForm && (
                <div className="space-y-3 rounded-xl border border-danger/20 bg-danger/5 p-4">
                  <label className="text-sm font-semibold">
                    Reason for rejection
                  </label>

                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this student's ID card cannot be accepted..."
                    rows={4}
                    maxLength={500}
                    className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />

                  <p className="text-right text-xs text-muted-foreground">
                    {rejectionReason.length}/500 characters
                  </p>

                  <button
                    onClick={handleReject}
                    disabled={processingId === selectedStudent.id}
                    className="w-full rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {processingId === selectedStudent.id
                      ? "Processing..."
                      : "Confirm Rejection"}
                  </button>
                </div>
              )}
            </div>

            {/* MODAL ACTIONS */}
            {!showRejectForm && (
              <div className="flex flex-col gap-3 border-t border-border p-5 sm:flex-row">
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={isPreviewLoading || !previewUrl || !!processingId}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-danger/30 px-4 py-3 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-50"
                >
                  <XCircle size={17} />
                  Reject
                </button>

                <button
                  onClick={() => handleApprove(selectedStudent)}
                  disabled={isPreviewLoading || !previewUrl || !!processingId}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-success px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {processingId === selectedStudent.id ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                  Approve Student
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
