"use client";

import { useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { formatEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function TradeShares({ communityName }: { communityName: string }) {
    const [mode, setMode] = useState<"buy" | "sell">("buy");
    const [amount, setAmount] = useState("");
    const { address: userAddress } = useAccount();
    const { writeContract, data: hash, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    // Convert shares to units (multiply by 1000)
    const parseSharesToUnits = (shares: string): bigint => {
        if (!shares) return 0n;
        const numShares = parseFloat(shares);
        if (isNaN(numShares)) return 0n;
        // Multiply by 1000 to get units, ensure max 3 decimals
        const units = Math.floor(numShares * 1000);
        return BigInt(units);
    };

    const units = parseSharesToUnits(amount);

    // Read user holdings
    const { data: holdings } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "communityShares",
        args: [communityName, userAddress || "0x0"],
    });

    // Calculate Cost/Return
    const { data: costData } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: mode === "buy" ? "getRequiredETHForShares" : "getExpectedSellReturn",
        args: [communityName, units],
    });

    const costOrReturn = costData ? (costData as [bigint, bigint, bigint, bigint, bigint])[mode === "buy" ? 0 : 1] : 0n;

    const handleTrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !userAddress || !costData) return;

        // Validate decimal places (max 3)
        const decimalPlaces = (amount.split('.')[1] || '').length;
        if (decimalPlaces > 3) {
            alert("Maximum 3 decimal places allowed");
            return;
        }

        try {
            if (mode === "buy") {
                writeContract({
                    address: CONTRACT_ADDRESS as `0x${string}`,
                    abi: CONTRACT_ABI,
                    functionName: "buyShares",
                    args: [communityName, units, "0x0000000000000000000000000000000000000000"],
                    value: (costData as [bigint, bigint, bigint, bigint, bigint])[0],
                });
            } else {
                writeContract({
                    address: CONTRACT_ADDRESS as `0x${string}`,
                    abi: CONTRACT_ABI,
                    functionName: "sellShares",
                    args: [communityName, units],
                });
            }
        } catch (error) {
            console.error("Error trading:", error);
        }
    };

    // Save to DB after success
    if (isSuccess && hash) {
        const saveTrade = async () => {
            try {
                // Fetch ETH price as proxy for STT
                let usdPrice = 0;
                try {
                    const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
                    const priceData = await priceRes.json();
                    usdPrice = priceData.ethereum.usd;
                } catch (e) {
                    console.error("Failed to fetch price", e);
                }

                await fetch('/api/trades', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        communityName,
                        trader: userAddress,
                        isBuy: mode === "buy",
                        shares: units.toString(), // Store raw units
                        ethAmount: formatEther(costOrReturn),
                        txHash: hash,
                        usdPrice,
                        sttAmount: formatEther(costOrReturn),
                    })
                });
                window.location.reload();
            } catch (err) {
                console.error("Failed to save trade", err);
            }
        };
        if (!localStorage.getItem(`saved_trade_${hash}`)) {
            localStorage.setItem(`saved_trade_${hash}`, 'true');
            saveTrade();
        }
    }

    return (
        <Card className="neo-shadow border-2 border-black">
            <CardHeader>
                <CardTitle className="text-xl font-bold uppercase">Trade Shares</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Button
                        onClick={() => setMode("buy")}
                        className={`flex-1 font-bold border-2 border-black ${mode === "buy" ? "bg-[#0096FF] text-white" : "bg-white text-black"}`}
                    >
                        Buy
                    </Button>
                    <Button
                        onClick={() => setMode("sell")}
                        className={`flex-1 font-bold border-2 border-black ${mode === "sell" ? "bg-[#FF5C00] text-white" : "bg-white text-black"}`}
                    >
                        Sell
                    </Button>
                </div>

                <div className="text-sm font-bold">
                    Your Holding: {holdings ? (Number(holdings) / 1000).toString() : "0"} Shares
                </div>

                <form onSubmit={handleTrade} className="space-y-4">
                    <Input
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="Amount (e.g., 1.5 shares)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="neo-shadow-sm"
                    />

                    <div className="text-sm font-bold">
                        {mode === "buy" ? "Cost" : "Return"}: {costData ? formatEther(costOrReturn) : "..."} SOMI
                    </div>

                    <Button
                        type="submit"
                        className={`w-full font-bold neo-shadow-sm border-2 border-black ${mode === "buy" ? "bg-[#0096FF] hover:bg-[#4DB5FF]" : "bg-[#FF5C00] hover:bg-[#FF8547]"} text-white`}
                        disabled={isPending || isConfirming || !costData}
                    >
                        {isPending || isConfirming ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isPending ? "Confirming..." : isConfirming ? "Processing..." : (mode === "buy" ? "Buy Shares" : "Sell Shares")}
                    </Button>
                    {isSuccess && <div className="text-xs text-green-700 font-bold">Trade Successful!</div>}
                </form>
            </CardContent>
        </Card>
    );
}
