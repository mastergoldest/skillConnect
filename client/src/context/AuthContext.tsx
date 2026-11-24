
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";


export interface AuthUser {
    id: string;
    fullName: string;
    email: string;
    accountType: "student" | "admin";
    emailVerified: boolean;
    verificationStatus: "pending" | "verified" | "rejected";
    isProvider: boolean;

    // Academic information
    faculty?: string;
    department?: string;
    academicLevel?: string;
    matricNumber?: string;

    // Verification information
    rejectionReason?: string;
    hasStudentIdCard: boolean;

    // Profile information
    profilePicture?: {
        publicId?: string | null;
        url?: string | null;
    } | null;
    bio?: string;
    skills?: string[];
}


interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    refreshUser: () => Promise<AuthUser | null>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/me`, {
                withCredentials: true,
            });

            const authenticatedUser = response.data.user;

            if (!authenticatedUser?.id) {
                setUser(null);
                return null;
            }

            setUser(authenticatedUser as AuthUser);
            return authenticatedUser as AuthUser;
        } catch {
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = async () => {
        try {
            await axios.post(
                `${API_URL}/auth/logout`,
                {},
                { withCredentials: true }
            );
        } finally {
            setUser(null);
        }
    };

    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: Boolean(user),
                isLoading,
                refreshUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside an AuthProvider.");
    }

    return context;
}
