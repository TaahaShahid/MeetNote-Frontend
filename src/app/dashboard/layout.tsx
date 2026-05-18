"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, Mic, LayoutDashboard, User as UserIcon, Menu, X, UploadCloud, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Extracted Sidebar component to prevent re-renders
const SidebarContent = ({
    user,
    pathname,
    minutesBalance,
    onClose,
    logout
}: {
    user: any,
    pathname: string,
    minutesBalance: number,
    onClose: () => void,
    logout: () => void
}) => {
    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Record Meeting", href: "/dashboard/record", icon: Mic },
        { label: "Upload Audio", href: "/dashboard/upload", icon: UploadCloud },
        { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <img src="/meetnote.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                        MeetNote
                    </h1>
                </motion.div>
                <button
                    className="md:hidden text-gray-500"
                    onClick={onClose}
                >
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                                // Optional: close menu on navigation on mobile
                                if (window.innerWidth < 768) {
                                    onClose();
                                }
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-purple-50 text-purple-700 shadow-sm font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <Icon size={20} />
                                {item.label}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 border-t border-gray-200 bg-gray-50/50"
            >
                <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl hover:bg-gray-100 transition-colors">
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border border-gray-200 object-cover shadow-sm"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                            {user?.displayName?.[0] || <UserIcon size={18} />}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.displayName || "User"}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>

                <div className="mb-4 px-4 py-3 bg-white border border-purple-100 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600 font-medium">Credits</span>
                            <span className="text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-md">{minutesBalance} min</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, Math.max(0, (minutesBalance / 100) * 100))}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full" 
                            />
                        </div>
                        <Link href="/dashboard/plans" className="flex items-center justify-center w-full gap-2 text-sm text-white bg-gray-900 hover:bg-gray-800 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                            Top Up Minutes
                        </Link>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </motion.div>
        </div>
    );
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, logout, minutesBalance } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (loading) return null;

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center px-4 z-20 justify-between">
                <div className="flex items-center gap-2">
                    <img src="/meetnote.png" alt="Logo" className="w-6 h-6 object-contain" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                        MeetNote
                    </h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600 p-2">
                    <Menu size={24} />
                </button>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-gray-200 z-10">
                <SidebarContent
                    user={user}
                    pathname={pathname}
                    minutesBalance={minutesBalance}
                    onClose={() => setIsMobileMenuOpen(false)}
                    logout={logout}
                />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-30 md:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 w-64 h-full bg-white shadow-xl"
                        >
                            <SidebarContent
                                user={user}
                                pathname={pathname}
                                minutesBalance={minutesBalance}
                                onClose={() => setIsMobileMenuOpen(false)}
                                logout={logout}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
                {children}
            </main>
        </div>
    );
}
