import { PublicKey } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";

const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID);

export const getCommunityPDA = (name: string): [PublicKey, number] => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('community'), Buffer.from(name)],
    PROGRAM_ID
  );
};

export const getMembershipPDA = (
  communityPda: PublicKey,
  memberPubkey: PublicKey
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('membership'),
      communityPda.toBuffer(),
      memberPubkey.toBuffer(),
    ],
    PROGRAM_ID
  );
};

export const getPollPDA = (
  communityPda: PublicKey,
  pollIndex: anchor.BN
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('poll'),
      communityPda.toBuffer(),
      pollIndex.toArrayLike(Buffer, 'le', 8),
    ],
    PROGRAM_ID
  );
};

export const getVotePDA = (
  pollPda: PublicKey,
  voterPubkey: PublicKey
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('vote'),
      pollPda.toBuffer(),
      voterPubkey.toBuffer(),
    ],
    PROGRAM_ID
  );
};
