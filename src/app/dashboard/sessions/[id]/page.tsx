"use client";

import { useEffect, useState } from "react";
import { getSession, Session } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Calendar, FileText, ArrowLeft, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import ReactMarkdown from 'react-markdown';

export default function SessionDetailPage() {
    const { user } = useAuth();
    const params = useParams();
    const sessionId = params.id as string;

    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && sessionId) {
            getSession(user.uid, sessionId).then((data) => {
                setSession(data);
                setIsLoading(false);
            });
        }
    }, [user, sessionId]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p>Session not found.</p>
                <Link href="/dashboard" className="text-purple-600 hover:underline mt-2">Back to Dashboard</Link>
            </div>
        )
    }

    // Determine what content to show for analysis
    const analysisContent = session.analysis?.raw_analysis || session.summary || "No analysis available.";

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft size={16} className="mr-1" />
                Back to Dashboard
            </Link>

            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{session.title || "Untitled Session"}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {session.created_at && (session.created_at as any).seconds
                            ? format(new Date((session.created_at as any).seconds * 1000), "PPP p")
                            : "Unknown Date"
                        }
                    </div>
                    <div className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {session.status || "Completed"}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Left Column: AI Analysis */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <div className="flex items-center gap-2 mb-4 text-purple-700">
                            <BrainCircuit size={20} />
                            <h2 className="font-semibold text-lg">AI Analysis</h2>
                        </div>
                        <div className="prose prose-sm prose-purple max-w-none text-gray-600 leading-relaxed">
                            <ReactMarkdown>{analysisContent}</ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* Right Column: Transcript */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px] sticky top-8">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 font-semibold text-gray-700">
                                <FileText size={18} />
                                Transcript
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {session.transcript ? (
                                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-mono text-xs md:text-sm">
                                    {session.transcript}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                                    Transcript not available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
