'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ConnectWallet } from '@/components/ConnectWallet';
import TradeShares from '@/components/TradeShares';
import CommunityFeed from '@/components/CommunityFeed';
import PriceGraph from '@/components/PriceGraph';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contract';
import { formatEther } from 'viem';
import Image from 'next/image';

export default function CommunityPage() {
    const params = useParams();
    const name = params.name as string;

    const { data: details, isLoading } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getCommunityDetails',
        args: [name],
    });

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#F5F5F5] p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="text-xl font-bold">Loading community...</div>
                    </div>
                </div>
            </main>
        );
    }

    // details: [name, type, buyPrice, sellPrice, shares, totalFees, owner]

    if (!details || !details[0]) {
        return (
            <main className="min-h-screen bg-[#F5F5F5] p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="text-xl font-bold">Community not found</div>
                    </div>
                </div>
            </main>
        );
    }

    const exists = details && details[6] !== '0x0000000000000000000000000000000000000000';

    return (
        <main className="min-h-screen bg-[#FDFDFD] font-mono text-black">
            {/* Navbar */}
            <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <div className="w-10 h-10 relative cursor-pointer">
                                <Image src="/logo.png" alt="dapps.co" fill className="object-contain" />
                            </div>
                        </Link>
                        <Link href="/" className="hover:underline">
                            <h1 className="text-3xl font-black uppercase tracking-tighter">dapps.co</h1>
                        </Link>
                    </div>
                    <ConnectWallet />
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6 space-y-8">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="border-2 border-black hover:bg-[#FFDE00]">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase">{name}</h1>
                        <p className="text-sm text-gray-500 font-bold">Community Dashboard</p>
                    </div>
                </header>

                {exists ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column: Stats & Trade */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Stats Card */}
                            <div className="border-2 border-black p-6 neo-shadow bg-white space-y-4">
                                <h2 className="text-xl font-black bg-[#0096FF] text-white inline-block px-2 py-1 uppercase">Market Stats</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <span className="text-sm font-bold text-gray-500">Total Shares</span>
                                        <span className="text-xl font-black">{details ? Number(details[4]) / 1000 : 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <span className="text-sm font-bold text-gray-500">Buy Price</span>
                                        <span className="text-xl font-black">{details ? formatEther(details[2]) : 0} SOMI</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <span className="text-sm font-bold text-gray-500">Sell Price</span>
                                        <span className="text-xl font-black">{details ? formatEther(details[3]) : 0} SOMI</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-500">Total Fees</span>
                                        <span className="text-xl font-black">{details ? formatEther(details[5]) : 0} SOMI</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t-2 border-black">
                                    <div className="text-xs font-mono break-all text-gray-400">Owner: {details ? details[6] : ''}</div>
                                </div>
                            </div>

                            {/* Trade Widget */}
                            <TradeShares communityName={name} />
                        </div>

                        {/* Right Column: Feed & Graph */}
                        <div className="lg:col-span-2 space-y-6">
                            <PriceGraph communityName={name} />
                            <CommunityFeed communityName={name} />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-black neo-shadow bg-white">
                        <h2 className="text-3xl font-black mb-4 uppercase">Community Not Found</h2>
                        <p className="mb-8 font-bold text-gray-500">The community "{name}" does not exist yet.</p>
                        <Link href="/">
                            <Button variant="neo" size="lg">Go Back & Create It</Button>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
