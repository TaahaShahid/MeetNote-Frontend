"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const { user, signInWithGoogle, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push("/dashboard");
        }
    }, [user, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner border border-white/10 overflow-hidden p-1">
                        <img src="/meetnote.png" alt="MeetNote Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">MeetNote</h1>
                    <p className="text-gray-300">Your intelligent meeting companion</p>
                </div>

                <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                    <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    Sign in with Google
                </button>

                <div className="mt-8 text-center text-sm text-gray-400">
                    <p>Secure authentication via Firebase</p>
                </div>
            </div>
        </div>
    );
}
