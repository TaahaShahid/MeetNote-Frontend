"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Mic, Shield, Zap, Sparkles } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  const features = [
    {
      icon: <BrainCircuit size={24} />,
      title: "AI Analysis",
      description: "Advanced natural language processing to extract key insights and summaries from your meetings.",
    },
    {
      icon: <Mic size={24} />,
      title: "Audio Intelligence",
      description: "High-fidelity audio processing pipeline that ensures every word is captured with crystal clarity.",
    },
    {
      icon: <Zap size={24} />,
      title: "Instant Transcription",
      description: "Turn your speech into structured text in seconds with our optimized Speechbrain backend.",
      delay: 0.4
    },
    {
      icon: <Shield size={24} />,
      title: "Secure Storage",
      description: "Your data is encrypted and stored securely using enterprise-grade Firebase infrastructure.",
      delay: 0.6
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Overlay */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-20 max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2">
          <img src="/meetnote.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold text-gray-900">MeetNote</span>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-purple-200 rounded-full blur-[100px] opacity-20 animate-pulse" />
          <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-blue-200 rounded-full blur-[100px] opacity-20 animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium mb-6 border border-purple-100">
              <Sparkles size={14} />
              <span>Now with improved AI Analysis</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Your Intelligent <br />
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Meeting Companion</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Transform your conversations into actionable knowledge. Record, transcribe, and analyze your meetings with the power of Speechbrain.
            </motion.p>

            <motion.div variants={itemVariants}>
              <button
                onClick={handleGetStarted}
                className="group inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                {loading ? "Loading..." : user ? "Go to Dashboard" : "Get Started"}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why MeetNote?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Built for professionals who need more than just a transcript.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-6 rounded-2xl bg-gray-50 hover:bg-purple-50 hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-900 group-hover:text-purple-600 group-hover:scale-110 transition-all duration-300 shadow-sm mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2026 MeetNote. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
