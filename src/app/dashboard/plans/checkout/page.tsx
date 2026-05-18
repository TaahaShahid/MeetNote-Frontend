"use client";

import { useAuth } from "@/context/AuthContext";
import { topUpMinutes } from "@/lib/firestore";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { CreditCard, Loader2, ArrowLeft, ShieldCheck, Lock, Smartphone, Wallet } from "lucide-react";
import Link from "next/link";

const plans = {
    basic: { name: "Basic", minutes: 300, price: 10 },
    pro: { name: "Pro", minutes: 900, price: 25 },
    ultra: { name: "Ultra", minutes: 5000, price: 85 }
};

function CheckoutForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, refreshMinutes } = useAuth();
    const planId = searchParams.get("plan") as keyof typeof plans;
    const plan = plans[planId];

    const [isProcessing, setIsProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("card");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !plan) return;

        setIsProcessing(true);
        try {
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            await topUpMinutes(user.uid, plan.minutes);
            await refreshMinutes();
            
            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        } catch (error) {
            console.error("Payment failed", error);
            alert("Payment failed. Please try again.");
            setIsProcessing(false);
        }
    };

    if (!plan) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500">Invalid plan selected.</p>
                <Link href="/dashboard/plans" className="text-purple-600 hover:underline mt-4 inline-block">Go back to plans</Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="p-8 max-w-md mx-auto text-center">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-500">Your account has been credited with {plan.minutes} minutes.</p>
                <p className="text-sm text-gray-400 mt-4">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link href="/dashboard/plans" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
                <ArrowLeft size={16} className="mr-1" />
                Back to Plans
            </Link>
            
            <div className="bg-white rounded-3xl shadow-xl shadow-purple-900/5 border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Secure Checkout</h2>
                        <p className="text-gray-500 text-sm mt-1">Upgrade to the <strong>{plan.name}</strong> plan ({plan.minutes} mins)</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-gray-900">${plan.price}</div>
                        <div className="text-xs text-gray-500">Total amount</div>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-900 mb-4">Select Payment Method</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button 
                                type="button"
                                onClick={() => setPaymentMethod("card")}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'card' ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}
                            >
                                <CreditCard size={24} className="mb-2" />
                                <span className="text-xs font-semibold">Card</span>
                            </button>
                            <button 
                                type="button"
                                onClick={() => setPaymentMethod("paypal")}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'paypal' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}
                            >
                                <Wallet size={24} className="mb-2" />
                                <span className="text-xs font-semibold">PayPal</span>
                            </button>
                            <button 
                                type="button"
                                onClick={() => setPaymentMethod("apple")}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'apple' ? 'border-gray-900 bg-gray-100 text-gray-900 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'}`}
                            >
                                <Smartphone size={24} className="mb-2" />
                                <span className="text-xs font-semibold">Apple Pay</span>
                            </button>
                        </div>
                    </div>

                    {paymentMethod === "card" && (
                        <div className="space-y-5 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cardholder Name</label>
                                <input type="text" required className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium text-gray-900" placeholder="John Doe" defaultValue="Demo User" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="text" required className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium text-gray-900 tracking-wide" placeholder="0000 0000 0000 0000" defaultValue="4242 4242 4242 4242" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
                                    <input type="text" required className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium text-gray-900" placeholder="MM/YY" defaultValue="12/25" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">CVC</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="text" required className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium text-gray-900" placeholder="123" defaultValue="123" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentMethod !== "card" && (
                        <div className="mb-8 p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center bg-gray-50/50">
                            {paymentMethod === "paypal" ? <Wallet size={48} className="text-blue-500 mb-4" /> : <Smartphone size={48} className="text-gray-900 mb-4" />}
                            <p className="text-sm text-gray-600 font-medium">You will be securely redirected to complete your purchase.</p>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500 mb-6 bg-green-50 text-green-700 py-2 rounded-lg">
                        <ShieldCheck size={16} />
                        <span>Payments are 100% secure and encrypted</span>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full py-4 px-6 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold shadow-lg shadow-gray-900/20 disabled:opacity-70 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] text-lg"
                    >
                        {isProcessing ? (
                            <><Loader2 className="animate-spin" size={24} /> Processing...</>
                        ) : (
                            `Pay $${plan.price}`
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" /></div>}>
            <CheckoutForm />
        </Suspense>
    );
}
