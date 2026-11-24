
import { useEffect, useState } from "react";
import axios from "axios";
import {
    BriefcaseBusiness,
    Users,
    Clock3,
    CheckCircle2,
    MessageCircle,
    RefreshCw,
    AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Student {
    _id: string;
    fullName: string;
    faculty?: string;
    department?: string;
}

interface Service {
    _id: string;
    title: string;
    category: string;
    pricingType?: string;
    price?: number | null;
}

interface ServiceRequest {
    requestMessage: string;
    providerResponse?: string;
    createdAt: string;
}

interface Connection {
    _id: string;
    status: "active" | "completed" | "cancelled";
    requester: Student;
    provider: Student;
    service: Service;
    serviceRequest: ServiceRequest | null;
    createdAt: string;
    updatedAt: string;
}

export default function MyConnections() {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchConnections = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/service-requests/my-connections`,
                { withCredentials: true }
            );

            setConnections(response.data.connections || []);
        } catch (err) {
            console.error("Fetch connections error:", err);

            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load your connections. Please try again."
                );
            } else {
                setError("Something went wrong while loading your connections.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    const activeCount = connections.filter(
        (connection) => connection.status === "active"
    ).length;

    const completedCount = connections.filter(
        (connection) => connection.status === "completed"
    ).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
                <div className="text-center">
                    <RefreshCw className="mx-auto mb-4 animate-spin text-indigo-600" size={32} />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Loading your connections...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            <BriefcaseBusiness size={17} />
                            Service Management
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            My Connections
                        </h1>

                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Manage your accepted service requests and collaborations.
                        </p>
                    </div>

                    <button
                        onClick={fetchConnections}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                {/* Statistics */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                            <Users size={20} />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Connections
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                            {connections.length}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                            <CheckCircle2 size={20} />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Active Connections
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                            {activeCount}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                            <BriefcaseBusiness size={20} />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Completed
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                            {completedCount}
                        </h2>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                        <AlertCircle size={19} className="mt-0.5 shrink-0" />
                        <div>
                            <p>{error}</p>
                            <button
                                onClick={fetchConnections}
                                className="mt-2 font-semibold underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!error && connections.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-800 dark:bg-gray-900">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                            <BriefcaseBusiness size={30} />
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            No connections yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                            When a service provider accepts your request, or you accept a
                            student's request, your connection will appear here.
                        </p>
                    </div>
                )}

                {/* Connections */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {connections.map((connection) => (
                        <div
                            key={connection._id}
                            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                        >
                            <div className="mb-5 flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                        <BriefcaseBusiness size={21} />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">
                                            {connection.service?.title || "Service unavailable"}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {connection.service?.category || "Service"}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${connection.status === "active"
                                            ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                                            : connection.status === "completed"
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                        }`}
                                >
                                    {connection.status}
                                </span>
                            </div>

                            <div className="space-y-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Requester
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                        {connection.requester?.fullName || "Unavailable"}
                                    </p>
                                </div>

                                <div className="h-px bg-gray-200 dark:bg-gray-700" />

                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Service Provider
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                        {connection.provider?.fullName || "Unavailable"}
                                    </p>
                                </div>
                            </div>

                            {connection.serviceRequest?.requestMessage && (
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Original Request
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-300">
                                        {connection.serviceRequest.requestMessage}
                                    </p>
                                </div>
                            )}

                            {connection.serviceRequest?.providerResponse && (
                                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-950/20">
                                    <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                                        Provider's Response
                                    </p>
                                    <p className="mt-1 text-sm text-green-800 dark:text-green-300">
                                        {connection.serviceRequest.providerResponse}
                                    </p>
                                </div>
                            )}

                            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                                <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    <Clock3 size={14} />
                                    Connected {formatDate(connection.createdAt)}
                                </span>

                                <Link
                                    to={`/connections/${connection._id}`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    <MessageCircle size={17} />
                                    Open Workspace
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
