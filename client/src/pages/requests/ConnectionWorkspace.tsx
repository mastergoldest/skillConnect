
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Send,
    MessageCircle,
    Loader2,
    UserRound,
    BriefcaseBusiness,
    AlertCircle,
} from "lucide-react";

import socket from "../../lib/socket";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Participant {
    _id: string;
    fullName: string;
}

interface Connection {
    _id: string;
    status: string;
    requester: Participant;
    provider: Participant;
    service?: {
        title: string;
        category: string;
    };
    serviceRequest?: {
        requestMessage: string;
    };
}

interface MessageItem {
    _id: string;
    content: string;
    sender: Participant;
    createdAt: string;
}

export default function ConnectionWorkspace() {
    const { connectionId } = useParams();

    const [connection, setConnection] = useState<Connection | null>(null);
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [currentUserId, setCurrentUserId] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [joined, setJoined] = useState(false);
    const [error, setError] = useState("");

    const bottomRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const addMessage = useCallback((newMessage: MessageItem) => {
        setMessages((previous) => {
            if (previous.some((item) => item._id === newMessage._id)) {
                return previous;
            }

            return [...previous, newMessage];
        });
    }, []);

    // Load connection, current user and message history.
    useEffect(() => {
        if (!connectionId) return;

        let cancelled = false;

        const loadWorkspace = async () => {
            try {
                setLoading(true);
                setError("");

                const [connectionResponse, messagesResponse, userResponse] =
                    await Promise.all([
                        fetch(
                            `${API_URL}/service-requests/connections/${connectionId}`,
                            { credentials: "include" }
                        ),
                        fetch(`${API_URL}/messages/${connectionId}`, {
                            credentials: "include",
                        }),
                        fetch(`${API_URL}/auth/me`, {
                            credentials: "include",
                        }),
                    ]);

                const connectionResult = await connectionResponse.json();
                const messagesResult = await messagesResponse.json();
                const userResult = await userResponse.json();

                if (
                    !connectionResponse.ok ||
                    !messagesResponse.ok ||
                    !userResponse.ok
                ) {
                    throw new Error(
                        connectionResult.message ||
                        messagesResult.message ||
                        userResult.message ||
                        "Unable to load workspace."
                    );
                }
                const loadedConnection =
                    connectionResult.data?.connection ||
                    connectionResult.data;

                const loadedMessages =
                    messagesResult.messages || [];

                const currentUser =
                    userResult.user ||
                    userResult.data?.user ||
                    userResult.data;

                const userId = currentUser?._id || currentUser?.id;

                if (!loadedConnection?._id || !userId) {
                    console.error("Connection data:", loadedConnection);
                    console.error("Current user data:", currentUser);

                    throw new Error("Unable to identify your account or connection.");
                }

                if (!cancelled) {
                    setConnection(loadedConnection);
                    setMessages(loadedMessages);
                    setCurrentUserId(userId);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load conversation."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadWorkspace();

        return () => {
            cancelled = true;
        };
    }, [connectionId]);

    // Connect to Socket.IO and join this conversation.
    useEffect(() => {
        if (!connectionId || !connection || !currentUserId) return;

        const joinRoom = () => {
            socket.emit(
                "join_connection",
                connectionId,
                (result: { success: boolean; message?: string }) => {
                    if (result.success) {
                        setJoined(true);
                    } else {
                        setJoined(false);
                        setError(result.message || "Unable to join conversation.");
                    }
                }
            );
        };

        const handleNewMessage = (newMessage: MessageItem) => {
            addMessage(newMessage);
        };

        socket.on("connect", joinRoom);
        socket.on("new_message", handleNewMessage);

        socket.connect();

        if (socket.connected) {
            joinRoom();
        }

        return () => {
            socket.off("connect", joinRoom);
            socket.off("new_message", handleNewMessage);

            socket.emit("leave_connection", connectionId);
            socket.disconnect();
            setJoined(false);
        };
    }, [connectionId, connection, currentUserId, addMessage]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        const content = message.trim();

        if (!content || sending || !joined || !connectionId) return;

        try {
            setSending(true);

            const response = await fetch(`${API_URL}/messages/${connectionId}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Message could not be sent.");
            }

            const sentMessage = result.data?.message || result.data;

            if (sentMessage?._id) {
                addMessage(sentMessage);
            }

            setMessage("");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Message could not be sent."
            );
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (error && !connection) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5 dark:bg-gray-950">
                <div className="max-w-md text-center">
                    <AlertCircle className="mx-auto mb-4 text-red-500" size={40} />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Workspace unavailable
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
                    <Link
                        to="/my-connections"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white"
                    >
                        <ArrowLeft size={18} />
                        Back to connections
                    </Link>
                </div>
            </div>
        );
    }

    if (!connection) return null;

    const otherParticipant =
        connection.requester._id === currentUserId
            ? connection.provider
            : connection.requester;

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6">
            <div className="mx-auto max-w-5xl">
                <Link
                    to="/my-connections"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400"
                >
                    <ArrowLeft size={18} />
                    Back to connections
                </Link>

                {/* Workspace header */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                <UserRound size={23} />
                            </div>

                            <div>
                                <h1 className="font-bold text-gray-900 dark:text-white">
                                    {otherParticipant.fullName}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {connection.requester._id === currentUserId
                                        ? "Service Provider"
                                        : "Service Requester"}
                                </p>
                            </div>
                        </div>

                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {connection.status}
                        </span>
                    </div>

                    <div className="mt-5 flex items-start gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                        <BriefcaseBusiness
                            size={20}
                            className="mt-1 text-blue-600"
                        />
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {connection.service?.title || "Service"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {connection.service?.category || "Service connection"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chat area */}
                <div className="mt-5 flex h-[65vh] min-h-[450px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white">
                                Conversation
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {joined ? "Connected" : "Connecting..."}
                            </p>
                        </div>
                        <MessageCircle className="text-blue-600" size={21} />
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                        {messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <MessageCircle
                                    size={40}
                                    className="mb-3 text-gray-300 dark:text-gray-700"
                                />
                                <p className="font-semibold text-gray-700 dark:text-gray-300">
                                    Start the conversation
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Send a message to get things started.
                                </p>
                            </div>
                        ) : (
                            messages.map((item) => {
                                const isMine = item.sender._id === currentUserId;

                                return (
                                    <div
                                        key={item._id}
                                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${isMine
                                                    ? "rounded-br-sm bg-blue-600 text-white"
                                                    : "rounded-bl-sm bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap break-words text-sm">
                                                {item.content}
                                            </p>
                                            <p
                                                className={`mt-2 text-right text-[10px] ${isMine
                                                        ? "text-blue-100"
                                                        : "text-gray-500 dark:text-gray-400"
                                                    }`}
                                            >
                                                {new Date(item.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {error && connection && (
                        <p className="px-4 pb-2 text-sm text-red-500">{error}</p>
                    )}

                    <form
                        onSubmit={sendMessage}
                        className="flex items-end gap-3 border-t border-gray-100 p-4 dark:border-gray-800"
                    >
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your message..."
                            rows={1}
                            maxLength={3000}
                            className="max-h-32 min-h-12 flex-1 resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />

                        <button
                            type="submit"
                            disabled={!message.trim() || sending || !joined}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Send message"
                        >
                            {sending ? (
                                <Loader2 className="animate-spin" size={19} />
                            ) : (
                                <Send size={19} />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
