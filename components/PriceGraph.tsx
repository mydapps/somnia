"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Trade {
    id: number;
    shares: string;
    eth_amount: string;
    usd_price: string;
    created_at: string;
}

export default function PriceGraph({ communityName }: { communityName: string }) {
    const [data, setData] = useState<{ date: string; price: number }[]>([]);

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const res = await fetch(`/api/trades?communityName=${communityName}`);
                const trades: Trade[] = await res.json();

                if (Array.isArray(trades)) {
                    const chartData = trades.map(t => {
                        const ethAmount = parseFloat(t.eth_amount);
                        const shares = parseFloat(t.shares); // Raw units
                        const usdPrice = parseFloat(t.usd_price || "0");

                        // Price per Share (1000 units) in ETH
                        // shares is raw units. 1 Share = 1000 units.
                        // Price per unit = ethAmount / shares
                        // Price per 1000 units = (ethAmount / shares) * 1000
                        const pricePerShareETH = (ethAmount / shares) * 1000;

                        // Price in USD
                        const priceUSD = pricePerShareETH * (usdPrice || 0);

                        return {
                            date: new Date(t.created_at).toLocaleDateString(),
                            price: priceUSD > 0 ? priceUSD : pricePerShareETH // Fallback to ETH if USD is 0
                        };
                    });
                    setData(chartData);
                }
            } catch (err) {
                console.error("Failed to fetch trades for graph", err);
            }
        };
        fetchTrades();
    }, [communityName]);

    return (
        <Card className="neo-shadow border-2 border-black">
            <CardHeader>
                <CardTitle className="text-xl font-bold uppercase">Price History (USD)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis dataKey="date" stroke="#000" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#000" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ border: '2px solid black', borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                            />
                            <Line type="monotone" dataKey="price" stroke="#0096FF" strokeWidth={3} dot={{ r: 4, fill: "black" }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 font-bold">
                        No trade data available yet.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
