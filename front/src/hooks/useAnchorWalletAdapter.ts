import {
    type SignerWalletAdapterProps,
} from '@solana/wallet-adapter-base';
import { useWallet, type WalletContextState } from '@solana/wallet-adapter-react';
import { type PublicKey } from '@solana/web3.js';

export interface WalletAnchorType {
    publicKey: PublicKey | null;
    signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined;
    signAllTransactions: SignerWalletAdapterProps['signAllTransactions'] | undefined;
}

export interface WalletExtended extends WalletContextState {
    anchorWallet: WalletAnchorType;
}

export const useWalletExt = (): WalletExtended => {
    const wallet = useWallet();

    const anchorWallet: WalletAnchorType = {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
    };

    return {
        ...wallet,
        anchorWallet,
    };
};
