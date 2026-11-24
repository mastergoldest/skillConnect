import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
    type ChangeEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    UserRound,
    Mail,
    GraduationCap,
    Building2,
    BookOpen,
    ShieldCheck,
    CheckCircle2,
    Clock3,
    AlertCircle,
    Plus,
    X,
    Save,
    LogOut,
    Sparkles,
    Camera,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/ThemeToggle";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function MyProfile() {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isUploadingPicture, setIsUploadingPicture] = useState(false);
    useEffect(() => {
        if (!user) return;

        setFullName(user.fullName || "");
        setBio(user.bio || "");
        setSkills(user.skills || []);
    }, [user]);

    if (!user) return null;

    const isVerified = user.verificationStatus === "verified";
    const isRejected = user.verificationStatus === "rejected";

    const hasChanges =
        fullName.trim() !== user.fullName ||
        bio !== (user.bio || "") ||
        JSON.stringify(skills) !== JSON.stringify(user.skills || []);

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    const handleAddSkill = () => {
        const trimmedSkill = newSkill.trim();

        setErrorMessage("");
        setSuccessMessage("");

        if (trimmedSkill.length < 2) {
            setErrorMessage("A skill must contain at least 2 characters.");
            return;
        }

        if (trimmedSkill.length > 50) {
            setErrorMessage("A skill cannot exceed 50 characters.");
            return;
        }

        if (skills.length >= 15) {
            setErrorMessage("You can add a maximum of 15 skills.");
            return;
        }

        if (
            skills.some(
                (skill) => skill.toLowerCase() === trimmedSkill.toLowerCase()
            )
        ) {
            setErrorMessage("You have already added this skill.");
            return;
        }

        setSkills((previous) => [...previous, trimmedSkill]);
        setNewSkill("");
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills((previous) =>
            previous.filter((skill) => skill !== skillToRemove)
        );
    };

    const handleProfilePictureUpload = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setErrorMessage("");
        setSuccessMessage("");

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            setErrorMessage("Only JPG, PNG, and WEBP images are allowed.");
            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setErrorMessage("Image size must not exceed 2MB.");
            event.target.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("profilePicture", file);

        setIsUploadingPicture(true);

        try {
            await axios.post(
                `${API_URL}/profile/picture`,
                formData,
                {
                    withCredentials: true,
                }
            );

            await refreshUser();

            setSuccessMessage("Profile picture updated successfully.");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(
                    error.response?.data?.message ||
                    "Unable to upload your profile picture."
                );
            } else {
                setErrorMessage("Something went wrong while uploading your picture.");
            }
        } finally {
            setIsUploadingPicture(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };


    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        if (fullName.trim().length < 2) {
            setErrorMessage("Your full name must contain at least 2 characters.");
            return;
        }

        setIsSaving(true);

        try {
            await axios.patch(
                `${API_URL}/profile`,
                {
                    fullName: fullName.trim(),
                    bio: bio.trim(),
                    skills,
                },
                {
                    withCredentials: true,
                }
            );

            await refreshUser();

            setSuccessMessage("Your profile has been updated successfully.");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(
                    error.response?.data?.message ||
                    "Unable to update your profile. Please try again."
                );
            } else {
                setErrorMessage("Something went wrong. Please try again.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const verificationLabel = isVerified
        ? "Verified student"
        : isRejected
            ? "Verification rejected"
            : "Pending verification";

    return (
        <div className="min-h-screen bg-background text-foreground">


                <main className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
                    {/* Page heading */}
                    <section className="mb-8">
                        <p className="mb-2 text-sm font-medium text-primary">
                            ACCOUNT SETTINGS
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            My Profile
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                            Manage your personal information and showcase your skills to
                            other students.
                        </p>
                    </section>

                    {/* Profile overview */}
                    <section className="mb-8 rounded-2xl border border-border bg-card p-6">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                            <div className="relative h-20 w-20 shrink-0">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-3xl font-bold text-primary">
                                    {user.profilePicture?.url ? (
                                        <img
                                            src={user.profilePicture.url}
                                            alt={user.fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        user.fullName.charAt(0).toUpperCase()
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleProfilePictureUpload}
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingPicture}
                                    aria-label="Change profile picture"
                                    className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-primary text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                                >
                                    {isUploadingPicture ? (
                                        <span className="text-xs">...</span>
                                    ) : (
                                        <Camera size={16} />
                                    )}
                                </button>
                            </div>


                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl font-bold">{user.fullName}</h2>

                                <p className="mt-1 break-all text-sm text-muted-foreground">
                                    {user.email}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                        Student account
                                    </span>

                                    {user.isProvider && (
                                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                                            Service provider
                                        </span>
                                    )}

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${isVerified
                                            ? "bg-green-500/10 text-green-600"
                                            : isRejected
                                                ? "bg-red-500/10 text-red-500"
                                                : "bg-amber-500/10 text-amber-600"
                                            }`}
                                    >
                                        {verificationLabel}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Verification notice */}
                    {!isVerified && (
                        <section
                            className={`mb-8 rounded-2xl border p-5 ${isRejected
                                ? "border-red-500/30 bg-red-500/5"
                                : "border-amber-500/30 bg-amber-500/5"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {isRejected ? (
                                    <AlertCircle className="mt-1 shrink-0 text-red-500" />
                                ) : (
                                    <Clock3 className="mt-1 shrink-0 text-amber-500" />
                                )}

                                <div>
                                    <h3 className="font-semibold">
                                        {isRejected
                                            ? "Student verification rejected"
                                            : "Student verification pending"}
                                    </h3>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {isRejected
                                            ? "Your student identity verification was rejected. Review the rejection reason and submit a corrected ID card."
                                            : "Complete your student identity verification to access all SkillConnect features."}
                                    </p>

                                    {isRejected && user.rejectionReason && (
                                        <p className="mt-3 text-sm text-red-500">
                                            <strong>Reason:</strong> {user.rejectionReason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Profile editor */}
                    <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
                        <section className="rounded-2xl border border-border bg-card p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-bold">Personal information</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Update the information displayed on your profile.
                                </p>
                            </div>


                            <form onSubmit={handleSave} className="space-y-6">
                                {/* Full name */}
                                <div>
                                    <label
                                        htmlFor="fullName"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Full name
                                    </label>

                                    <input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(event) => setFullName(event.target.value)}
                                        maxLength={100}
                                        required
                                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                {/* Bio */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label
                                            htmlFor="bio"
                                            className="text-sm font-medium"
                                        >
                                            About me
                                        </label>

                                        <span className="text-xs text-muted-foreground">
                                            {bio.length}/500
                                        </span>
                                    </div>

                                    <textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(event) => setBio(event.target.value)}
                                        maxLength={500}
                                        rows={5}
                                        className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="Tell other students a little about yourself, your experience, and what you do..."
                                    />
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        My skills
                                    </label>

                                    <p className="mb-3 text-xs text-muted-foreground">
                                        Add the skills you have or services you can provide.
                                        Maximum 15 skills.
                                    </p>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(event) => setNewSkill(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    handleAddSkill();
                                                }
                                            }}
                                            maxLength={50}
                                            placeholder="e.g. Web Development"
                                            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />

                                        <button
                                            type="button"
                                            onClick={handleAddSkill}
                                            disabled={!newSkill.trim() || skills.length >= 15}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Plus size={17} />
                                            Add skill
                                        </button>
                                    </div>

                                    <div className="mt-4 flex min-h-12 flex-wrap gap-2">
                                        {skills.length > 0 ? (
                                            skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2 text-sm"
                                                >
                                                    {skill}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                        aria-label={`Remove ${skill}`}
                                                        className="text-muted-foreground transition hover:text-red-500"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                You have not added any skills yet.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Feedback */}
                                {errorMessage && (
                                    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-500">
                                        {errorMessage}
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-600">
                                        {successMessage}
                                    </div>
                                )}

                                {/* Save */}
                                <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        Your changes are saved to your account.
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={isSaving || !hasChanges}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Save size={17} />
                                        {isSaving ? "Saving changes..." : "Save changes"}
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Academic information */}
                        <div className="space-y-6">
                            <section className="rounded-2xl border border-border bg-card p-6">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                                        <GraduationCap size={22} />
                                    </div>

                                    <div>
                                        <h2 className="font-bold">Academic information</h2>
                                        <p className="text-xs text-muted-foreground">
                                            Your registered student details.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <InfoItem
                                        icon={<Mail size={17} />}
                                        label="Email address"
                                        value={user.email}
                                        detail={user.emailVerified ? "Verified" : "Not verified"}
                                    />

                                    <InfoItem
                                        icon={<ShieldCheck size={17} />}
                                        label="Matric number"
                                        value={user.matricNumber || "Not provided"}
                                    />

                                    <InfoItem
                                        icon={<Building2 size={17} />}
                                        label="Faculty"
                                        value={user.faculty || "Not provided"}
                                    />

                                    <InfoItem
                                        icon={<BookOpen size={17} />}
                                        label="Department"
                                        value={user.department || "Not provided"}
                                    />

                                    <InfoItem
                                        icon={<GraduationCap size={17} />}
                                        label="Academic level"
                                        value={
                                            user.academicLevel
                                                ? `${user.academicLevel} Level`
                                                : "Not provided"
                                        }
                                    />
                                </div>

                                <p className="mt-5 rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground">
                                    Academic information is read-only. Contact the platform
                                    administrator if any of these details need correction.
                                </p>
                            </section>

                            {/* Profile tips */}
                            <section className="rounded-2xl border border-border bg-card p-6">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                                        <Sparkles size={21} />
                                    </div>

                                    <h2 className="font-bold">Build a strong profile</h2>
                                </div>

                                <p className="text-sm leading-6 text-muted-foreground">
                                    A complete profile helps other students understand your
                                    experience and the skills you can offer.
                                </p>

                                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-primary" />
                                        Use your correct full name.
                                    </li>

                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-primary" />
                                        Write a clear description about yourself.
                                    </li>

                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-primary" />
                                        Add skills that reflect what you can do.
                                    </li>
                                </ul>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
       
    );
}

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    detail?: string;
}

function InfoItem({ icon, label, value, detail }: InfoItemProps) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-primary">{icon}</div>

            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 break-words text-sm font-semibold">{value}</p>

                {detail && (
                    <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                )}
            </div>
        </div>
    );
}

export default MyProfile;
