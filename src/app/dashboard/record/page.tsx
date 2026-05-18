"use client";

import { useAuth } from "@/context/AuthContext";
import { Mic, Square, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

export default function RecordPage() {
    const { user, loading, minutesBalance } = useAuth();
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [status, setStatus] = useState<"idle" | "recording" | "processing">("idle");
    const [sessionId, setSessionId] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Auth Protection
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Timer Logic
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);


    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) wsRef.current.close();
            if (audioContextRef.current) audioContextRef.current.close();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const drawWaveform = () => {
        if (!analyzerRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext("2d");
        if (!canvasCtx) return;

        const bufferLength = analyzerRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);

            analyzerRef.current!.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = "rgb(255, 255, 255)";
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = "rgb(147, 51, 234)"; // Purple-600
            canvasCtx.beginPath();

            const sliceWidth = (canvas.width * 1.0) / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * canvas.height) / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };

        draw();
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Audio Context Setup for Visualizer
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            analyzerRef.current = audioContextRef.current.createAnalyser();
            analyzerRef.current.fftSize = 2048;
            source.connect(analyzerRef.current);
            drawWaveform();

            // WebSocket Setup
            const id = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            setSessionId(id);
            const idToken = await user?.getIdToken();
            const wsUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/ws/session/${id}?token=${idToken}`;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("WebSocket connected");
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                        ws.send(event.data);
                    }
                };

                mediaRecorder.start(1000); // Send chunks every 1 second
                setIsRecording(true);
                setStatus("recording");
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                alert("Connection error. Please try again.");
                setIsRecording(false);
            };

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && wsRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); // Stop mic
            setIsRecording(false);
            setStatus("processing");

            // Wait briefly to ensure last chunk sends, then close
            setTimeout(() => {
                if (wsRef.current) {
                    wsRef.current.close();
                }
                // Redirect to session page
                if (sessionId) {
                    router.push(`/dashboard/sessions/${sessionId}`);
                }
            }, 1000);
        }
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }, [sessionId, router]);

    // Check minutes limit
    useEffect(() => {
        if (isRecording && duration > 0 && duration >= minutesBalance * 60) {
            stopRecording();
            alert("Minutes exhausted! Your recording has been stopped and is now processing.");
        }
    }, [duration, isRecording, minutesBalance, stopRecording]);

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-purple-600" /></div>;

    return (
        <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh] space-y-12">
            <div className="w-full text-left">
                <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
                    <ArrowLeft size={16} className="mr-1" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Live Recording</h1>
                <p className="text-gray-500 mt-2">Record your in-person meetings directly.</p>
            </div>

            {/* Visualizer Area */}
            <div className="w-full h-64 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden relative">
                {!isRecording && status === "idle" && (
                    <div className="text-gray-400 flex flex-col items-center gap-2">
                        <Mic size={48} />
                        <p>Ready to record</p>
                    </div>
                )}
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={256}
                    className={`w-full h-full absolute inset-0 ${!isRecording ? 'opacity-0' : 'opacity-100'}`}
                />
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-6">
                <div className="text-5xl font-mono font-bold text-gray-900 tabular-nums">
                    {formatTime(duration)}
                </div>

                {minutesBalance <= 0 && status === "idle" && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm text-left max-w-sm w-full mb-2">
                        <AlertCircle size={20} className="shrink-0" />
                        <span>
                            Your minutes are zero. Please <Link href="/dashboard/plans" className="font-bold underline">purchase a plan</Link> to continue.
                        </span>
                    </div>
                )}

                {status === "processing" ? (
                    <div className="flex items-center gap-2 text-purple-600 font-medium animate-pulse">
                        <Loader2 className="animate-spin" />
                        Finishing recording...
                    </div>
                ) : (
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={minutesBalance <= 0 && !isRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isRecording
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                            }`}
                    >
                        {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={32} />}
                    </button>
                )}

                <p className="text-sm text-gray-500 font-medium">
                    {isRecording ? "Listening..." : "Click microphone to start"}
                </p>
            </div>
        </div>
    );
}
