"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface ActivityItem {
    type: 'post' | 'trade';
    id: number;
    user_address: string;
    details: string;
    community_name: string;
    created_at: string;
}

export default function GlobalActivity() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await fetch('/api/activity');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setActivities(data);
                }
            } catch (err) {
                console.error("Failed to fetch activity", err);
            }
        };
        fetchActivity();
        // Poll every 10 seconds
        const interval = setInterval(fetchActivity, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="neo-shadow border-2 border-black bg-white">
            <CardHeader className="border-b-2 border-black bg-white">
                <CardTitle className="text-2xl font-black uppercase">Global Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y-2 divide-black">
                    {activities.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border border-black ${item.type === 'post' ? 'bg-[#FFDE00]' : 'bg-[#0096FF] text-white'}`}>
                                        {item.type.toUpperCase()}
                                    </span>
                                    <Link href={`/community/${item.community_name}`} className="hover:underline">
                                        <span className="font-black uppercase text-sm">{item.community_name}</span>
                                    </Link>
                                </div>
                                <span className="text-xs text-gray-500 font-mono">
                                    {new Date(item.created_at).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="text-sm">
                                <span className="font-mono font-bold bg-black text-white px-1 rounded text-xs mr-2">
                                    {item.user_address.length > 20 ? `${item.user_address.slice(0, 6)}...` : item.user_address}
                                </span>
                                {item.details}
                            </div>
                        </div>
                    ))}
                    {activities.length === 0 && (
                        <div className="p-8 text-center text-gray-500 font-bold">
                            No recent activity.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
