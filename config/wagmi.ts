import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

export const somnia = defineChain({
    id: 5031,
    name: 'Somnia',
    nativeCurrency: {
        decimals: 18,
        name: 'SOMI',
        symbol: 'SOMI',
    },
    rpcUrls: {
        default: { http: ['https://api.infra.mainnet.somnia.network/'] },
    },
    blockExplorers: {
        default: { name: 'Somnia Explorer', url: 'https://somnia.socialscan.io/' },
    },
    testnet: false,
});

export const config = getDefaultConfig({
    appName: 'dapps.co',
    projectId: 'YOUR_PROJECT_ID',
    chains: [somnia],
    ssr: true,
});
