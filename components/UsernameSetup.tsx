"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function UsernameSetup() {
    const { address, isConnected } = useAccount();
    const [isOpen, setIsOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isConnected && address) {
            checkUsername();
        } else {
            setIsOpen(false);
        }
    }, [isConnected, address]);

    const checkUsername = async () => {
        try {
            const res = await fetch(`/api/user?address=${address}`);
            const data = await res.json();
            if (!data.username) {
                setIsOpen(true);
            }
        } catch (err) {
            console.error("Failed to check username", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;

        setIsLoading(true);
        setError("");

        try {
            const res = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, username })
            });

            const data = await res.json();

            if (res.ok) {
                setIsOpen(false);
                window.location.reload(); // Reload to update UI with new username
            } else {
                setError(data.error || "Failed to set username");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[425px] neo-shadow border-2 border-black" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase">Welcome to dapps.co</DialogTitle>
                    <DialogDescription className="font-bold text-gray-500">
                        Pick a unique username to get started. This will be your identity on the platform.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Input
                            placeholder="Enter username (e.g. Crypto King)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="neo-shadow-sm"
                        />
                        {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                    </div>
                    <Button
                        type="submit"
                        className="w-full font-bold neo-shadow-sm bg-[#FFDE00] text-black hover:bg-[#FFE55C]"
                        disabled={isLoading || !username}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLoading ? "Setting up..." : "Start Exploring"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
