"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function CreateCommunity() {
    const [name, setName] = useState("");
    const { address: userAddress } = useAccount();
    const { writeContract, data: hash, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    // Read required ETH for community creation (Type 1)
    const { data: requiredETH } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "getRequiredETHForCommunityCreation",
        args: [1n],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name) {
            alert("Community name cannot be empty");
            return;
        }

        // Validate alphanumeric without spaces
        if (!/^[a-zA-Z0-9]+$/.test(name.replace(/\s/g, ''))) {
            alert("Community name must be alphanumeric");
            return;
        }

        if (!requiredETH) {
            alert("Required ETH for creation is not loaded yet");
            return;
        }

        // Normalize: lowercase and remove spaces
        const normalizedName = name.toLowerCase().replace(/\s/g, '');

        try {
            writeContract({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: CONTRACT_ABI,
                functionName: "createCommunity",
                args: [normalizedName, 1n], // Use normalized name
                value: requiredETH as bigint,
            });
        } catch (error) {
            console.error("Error creating community:", error);
        }
    };

    // Save to DB after success
    if (isSuccess && hash && name) {
        const normalizedName = name.toLowerCase().replace(/\s/g, '');
        const saveToDb = async () => {
            try {
                // Fetch ETH price for USD conversion
                let usdPrice = 0;
                try {
                    const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
                    const priceData = await priceRes.json();
                    usdPrice = priceData.ethereum?.usd || 0;
                } catch (err) {
                    console.error('Failed to fetch ETH price', err);
                }

                const sttAmount = requiredETH ? Number(requiredETH) / 1e18 : 0;

                // Save community
                await fetch('/api/communities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: normalizedName,
                        owner: userAddress,
                        txHash: hash,
                    }),
                });

                // Save as a trade (buy with shares=1000 for initial creation)
                await fetch('/api/trades', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        communityName: normalizedName,
                        trader: userAddress,
                        isBuy: true,
                        shares: 1000, // Community creation gives 1 share (1000 units)
                        ethAmount: sttAmount.toFixed(18),
                        txHash: hash,
                        usdPrice,
                        sttAmount: sttAmount.toFixed(18),
                    }),
                });

                setName("");
                window.location.href = `/community/${normalizedName}`;
            } catch (error) {
                console.error("Error saving to DB:", error);
            }
        };
        saveToDb();
    }

    return (
        <Card className="neo-shadow border-2 border-black">
            <CardHeader>
                <CardTitle className="text-xl font-bold uppercase">Create Community</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        placeholder="Community Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="neo-shadow-sm"
                    />
                    <div className="text-sm font-bold">
                        Cost: {requiredETH ? (Number(requiredETH) / 1e18).toFixed(4) : "..."} SOMI
                    </div>
                    <Button
                        type="submit"
                        className="w-full font-bold neo-shadow-sm bg-[#FFDE00] text-black hover:bg-[#FFE55C]"
                        disabled={isPending || isConfirming || !requiredETH}
                    >
                        {isPending || isConfirming ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isPending ? "Confirming..." : isConfirming ? "Creating..." : "Create Community"}
                    </Button>
                    {isSuccess && <div className="text-xs text-green-700 font-bold">Community Created!</div>}
                </form>
            </CardContent>
        </Card>
    );
}
