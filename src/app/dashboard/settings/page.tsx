"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Save, Loader2, Globe, Mail, Bell } from "lucide-react";

export default function SettingsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [settings, setSettings] = useState({
        language: "English",
        email_notifications: true,
        notification_email: ""
    });

    const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/settings`;

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            if (!user) return;

            try {
                const token = await user.getIdToken();
                const response = await fetch(`${API_URL}/`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setSettings({
                        language: data.language || "English",
                        email_notifications: data.email_notifications ?? true,
                        notification_email: data.notification_email || ""
                    });
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                setMessage({ type: 'error', text: "Failed to load settings." });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [user]);

    // Save Settings
    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        setMessage(null);

        try {
            const token = await user.getIdToken();
            const response = await fetch(`${API_URL}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: "Settings saved successfully!" });
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            console.error("Failed to save settings:", error);
            setMessage({ type: 'error', text: "Failed to save settings." });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-500 mb-8">Manage your analysis preferences and notifications.</p>

            {message && (
                <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                {/* Language Settings */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Globe size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Analysis Language</h2>
                            <p className="text-sm text-gray-500">Choose the language for summaries and action items.</p>
                        </div>
                    </div>

                    <div className="max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Output Language
                        </label>
                        <select
                            value={settings.language}
                            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="English">English</option>
                            <option value="Urdu">Urdu</option>
                            <option value="French">French</option>
                            <option value="Spanish">Spanish</option>
                            <option value="German">German</option>
                        </select>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                            <p className="text-sm text-gray-500">Manage how you receive meeting results.</p>
                        </div>
                    </div>

                    <div className="space-y-6 max-w-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                                <p className="text-xs text-gray-500">Receive summaries via email when processing is done.</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, email_notifications: !settings.email_notifications })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${settings.email_notifications ? 'bg-purple-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.email_notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {settings.email_notifications && (
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Mail size={16} className="text-gray-400" />
                                    <label className="block text-sm font-medium text-gray-700">
                                        Notification Email
                                    </label>
                                </div>
                                <input
                                    type="email"
                                    value={settings.notification_email}
                                    onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                                    placeholder={user?.email || "Enter email"}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Leave empty to use your login email ({user?.email}).
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
