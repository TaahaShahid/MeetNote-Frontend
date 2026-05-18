"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PlansPage() {
    const plans = [
        {
            id: "basic",
            name: "Basic",
            minutes: 300,
            price: 10,
            description: "Perfect for casual users and short meetings.",
            features: ["300 Minutes", "Standard Support", "Basic Analytics"],
            popular: false,
        },
        {
            id: "pro",
            name: "Pro",
            minutes: 900,
            price: 25,
            description: "Ideal for professionals and regular meetings.",
            features: ["900 Minutes", "Priority Support", "Advanced Analytics"],
            popular: true,
        },
        {
            id: "ultra",
            name: "Ultra",
            minutes: 5000,
            price: 85,
            originalPrice: 100,
            description: "For heavy users and large teams.",
            features: ["5000 Minutes", "24/7 Premium Support", "Custom Analytics"],
            popular: false,
        }
    ];

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                    Top up your minutes to continue recording and analyzing your meetings.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div 
                        key={plan.id}
                        className={`relative bg-white rounded-2xl shadow-sm border p-8 flex flex-col ${
                            plan.popular ? 'border-purple-500 shadow-purple-100 ring-1 ring-purple-500' : 'border-gray-200'
                        }`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
                                MOST POPULAR
                            </div>
                        )}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                            <p className="text-gray-500">{plan.description}</p>
                        </div>
                        <div className="mb-8">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-extrabold text-gray-900">${plan.price}</span>
                                {plan.originalPrice && (
                                    <span className="text-lg text-gray-400 line-through">${plan.originalPrice}</span>
                                )}
                            </div>
                            <p className="text-gray-500 mt-2 font-medium">{plan.minutes} Minutes</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" />
                                    <span className="text-gray-600">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Link 
                            href={`/dashboard/plans/checkout?plan=${plan.id}`}
                            className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-colors ${
                                plan.popular 
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                            }`}
                        >
                            Select {plan.name}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
