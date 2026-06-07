"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { CloudUpload, Loader2, Music, AlertCircle } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

export default function UploadPage() {
    const { user, minutesBalance } = useAuth();
    const router = useRouter();

    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0); // Fake progress for UX

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        setError(null);
        if (!file.type.startsWith("audio/")) {
            setError("Please upload a valid audio file.");
            return;
        }
        setFile(file);
    };

    const handleUpload = async () => {
        if (!file || !user) return;

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            const idToken = await user.getIdToken();
            const sessionId = `session_${Date.now()}`;
            const wsUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/ws/session/${sessionId}?token=${idToken}`;

            console.log("Connecting to WebSocket:", wsUrl);

            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("WebSocket connected. Starting stream...");
                const reader = new FileReader();

                reader.onload = (e) => {
                    if (e.target?.result) {
                        const buffer = e.target.result as ArrayBuffer;
                        ws.send(buffer);
                        console.log("File sent.");
                        ws.close();

                        // Simulate processing time then redirect
                        // Since the backend processes async after close, we might want to poll or just redirect to a "Processing" state page.
                        // For now, redirect to dashboard which will eventually show the result.

                        setUploadProgress(100);
                        setTimeout(() => {
                            router.push("/dashboard");
                        }, 1000);
                    }
                };

                reader.readAsArrayBuffer(file);
            };

            ws.onerror = (e) => {
                console.error("WebSocket error:", e);
                setError("Connection failed. Please ensure the backend server is running.");
                setIsUploading(false);
            };

            ws.onclose = () => {
                console.log("WebSocket closed");
            };

        } catch (err) {
            console.error("Upload error:", err);
            setError("An error occurred during upload.");
            setIsUploading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Upload Audio</h1>
                <p className="text-gray-500 mt-2">Upload your recording for analysis.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">

                {!file ? (
                    <div
                        className={clsx(
                            "border-2 border-dashed rounded-xl p-12 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer",
                            isDragging ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-400 hover:bg-gray-50"
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                            <CloudUpload size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Click to upload or drag and drop</h3>
                        <p className="text-gray-500 mt-2">MP3, WAV, M4A (Max 100MB)</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="audio/*"
                            onChange={handleFileSelect}
                        />
                    </div>
                ) : (
                    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <Music size={24} />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{file.name}</p>
                                <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="text-gray-400 hover:text-red-500 text-sm font-medium"
                                disabled={isUploading}
                            >
                                Change
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm text-left">
                                <AlertCircle size={16} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        {minutesBalance <= 0 && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm text-left">
                                <AlertCircle size={20} className="shrink-0" />
                                <span>
                                    Your minutes are zero. Please <Link href="/dashboard/plans" className="font-bold underline">purchase a plan</Link> to continue.
                                </span>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={isUploading || minutesBalance <= 0}
                            className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <CloudUpload size={20} />
                                    Start Analysis
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
