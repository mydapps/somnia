'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './ui/button';
import Image from 'next/image';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { useState, useEffect } from 'react';

export const ConnectWallet = () => {
    const { address } = useAccount();
    const { data: balance } = useBalance({
        address,
    });
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        if (address) {
            fetch(`/api/user?address=${address}`)
                .then(res => res.json())
                .then(data => setUsername(data.username))
                .catch(err => console.error('Failed to fetch username', err));
        } else {
            setUsername(null);
        }
    }, [address]);

    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button onClick={openConnectModal} variant="neo" size="lg" className="flex items-center gap-2">
                                        <div className="w-6 h-6 relative">
                                            <Image src="/logo.png" alt="dapps.co" fill className="object-contain" />
                                        </div>
                                        Connect Wallet
                                    </Button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <Button onClick={openChainModal} variant="destructive">
                                        Wrong network
                                    </Button>
                                );
                            }

                            return (
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <Button
                                        onClick={openChainModal}
                                        style={{ display: 'flex', alignItems: 'center' }}
                                        variant="outline"
                                    >
                                        {chain.hasIcon && (
                                            <div
                                                style={{
                                                    background: chain.iconBackground,
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: 999,
                                                    overflow: 'hidden',
                                                    marginRight: 4,
                                                }}
                                            >
                                                {chain.iconUrl && (
                                                    <img
                                                        alt={chain.name ?? 'Chain icon'}
                                                        src={chain.iconUrl}
                                                        style={{ width: 12, height: 12 }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {chain.name}
                                    </Button>

                                    <Button onClick={openAccountModal} variant="neoBlue" className="flex items-center gap-2">
                                        <div className="w-5 h-5 relative rounded-full overflow-hidden border border-black">
                                            <Image src="/logo.png" alt="dapps.co" fill className="object-cover" />
                                        </div>
                                        {username || account.displayName}
                                        {balance
                                            ? ` (${Number(formatEther(balance.value)).toFixed(4)} ${balance.symbol})`
                                            : ''}
                                    </Button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};
