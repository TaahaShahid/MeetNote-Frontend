"use client";

import { useEffect, useState } from "react";
import { getSessions, Session } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Calendar, Clock, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function DashboardPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getSessions(user.uid).then((data) => {
                setSessions(data);
                setIsLoading(false);
            });
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.displayName?.split(" ")[0]}</h1>
                <p className="text-gray-500 mt-2">Here's an overview of your speech analysis sessions.</p>
            </div>

            {/* Stats - Simple counters for now */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Sessions</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{sessions.length}</p>
                </div>
                {/* Add more stats here later */}
            </div>

            {/* Recent Sessions */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Sessions</h2>

                {sessions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <FileText className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No sessions yet</h3>
                        <p className="text-gray-500 mt-1">Upload an audio fill to get started.</p>
                        <Link href="/dashboard/upload" className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                            Upload Audio
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {sessions.map((session) => (
                            <Link
                                key={session.id}
                                href={`/dashboard/sessions/${session.id}`}
                                className="block group"
                            >
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:border-purple-100">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                                {session.title || `Session ${session.id.slice(0, 8)}`}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {/* Handle Timestamp or Date */}
                                                    {session.created_at && (session.created_at as any).seconds
                                                        ? format(new Date((session.created_at as any).seconds * 1000), "PPP")
                                                        : "Unknown Date"
                                                    }
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {/* Placeholder for duration if we had it */}
                                                    Analyzed
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-gray-300 group-hover:text-purple-400" />
                                    </div>
                                    {session.summary && (
                                        <p className="mt-4 text-gray-600 line-clamp-2 text-sm leading-relaxed">
                                            {session.summary}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
