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
    const [somiPrice, setSomiPrice] = useState<number>(0.01); // Default fallback

    useEffect(() => {
        // Fetch current SOMI price
        const fetchSomiPrice = async () => {
            try {
                const res = await fetch('/api/somi-price');
                const data = await res.json();
                if (data.usd_price) {
                    setSomiPrice(data.usd_price);
                }
            } catch (err) {
                console.error('Failed to fetch SOMI price', err);
            }
        };
        fetchSomiPrice();
    }, []);

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const res = await fetch(`/api/trades?communityName=${communityName}`);
                const trades: Trade[] = await res.json();

                if (Array.isArray(trades)) {
                    const chartData = trades.map(t => {
                        const ethAmount = parseFloat(t.eth_amount);
                        const shares = parseFloat(t.shares); // Raw units from DB

                        // Convert units to actual shares (divide by 1000)
                        const actualShares = shares / 1000;

                        // Price per share in SOMI
                        const pricePerShareSOMI = actualShares > 0 ? ethAmount / actualShares : 0;

                        // Convert to USD using current SOMI price
                        const priceUSD = pricePerShareSOMI * somiPrice;

                        return {
                            date: new Date(t.created_at).toLocaleDateString(),
                            price: priceUSD
                        };
                    });
                    setData(chartData);
                }
            } catch (err) {
                console.error("Failed to fetch trades for graph", err);
            }
        };
        fetchTrades();
    }, [communityName, somiPrice]); // Re-fetch when SOMI price updates


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
