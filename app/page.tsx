"use client";

import { useState, useEffect } from "react";
import { ConnectWallet } from "@/components/ConnectWallet";
import CreateCommunity from "@/components/CreateCommunity";
import GlobalActivity from "@/components/GlobalActivity";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

interface Community {
  id: number;
  name: string;
  owner: string;
  tx_hash: string;
  created_at: string;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await fetch('/api/communities');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCommunities(data);
        }
      } catch (err) {
        console.error("Failed to fetch communities", err);
      }
    };
    fetchCommunities();
  }, []);

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#FDFDFD] font-mono text-black">
      {/* Navbar */}
      <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image src="/logo.png" alt="dapps.co" fill className="object-contain" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">dapps.co</h1>
          </div>
          <ConnectWallet />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-[#FFDE00] border-b-4 border-black py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Build Your <br /> Community Economy on Somnia
          </h2>
          <p className="text-xl md:text-2xl font-bold max-w-2xl mx-auto">
            Create, trade, and grow with on-chain communities. The social network owned by you.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-3 gap-8 -mt-10 relative z-10">
        {/* Left Column: Create */}
        <div className="lg:col-span-1">
          <CreateCommunity />
        </div>

        {/* Right Column: Explore */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="neo-shadow border-2 border-black bg-white">
            <CardHeader className="border-b-2 border-black bg-white">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <CardTitle className="text-2xl font-black uppercase">Explore Communities</CardTitle>
                <Input
                  placeholder="Search communities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="neo-shadow-sm max-w-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {filteredCommunities.map((c) => (
                  <Link key={c.id} href={`/community/${c.name}`}>
                    <div className="group relative p-4 border-2 border-black bg-white hover:bg-[#0096FF] hover:text-white transition-all cursor-pointer neo-shadow-sm hover:translate-x-1 hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-black uppercase truncate">{c.name}</h3>
                        <span className="text-xs font-bold border-2 border-black px-2 py-0.5 bg-[#FFDE00] text-black rounded-full">
                          #{c.id}
                        </span>
                      </div>
                      <div className="text-xs opacity-70 font-mono truncate">
                        Owner: <span className="font-bold text-black">
                          {c.owner_display || `${c.owner.slice(0, 6)}...${c.owner.slice(-4)}`}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                {filteredCommunities.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500 font-bold">
                    No communities found matching "{search}".
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Global Activity */}
          <GlobalActivity />
        </div>
      </div>
    </main>
  );
}
