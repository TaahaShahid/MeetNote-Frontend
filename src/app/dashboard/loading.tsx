import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="flex-1 h-[calc(100vh-64px)] md:h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 text-purple-600">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="text-sm font-medium animate-pulse text-gray-500">Loading...</p>
            </div>
        </div>
    );
}
