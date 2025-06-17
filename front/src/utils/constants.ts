
import { PublicKey } from '@solana/web3.js';
import { appConfig } from '../config/app';

export const SOLANA_CLUSTER = appConfig.solana.cluster;

export const PROGRAM_ID = new PublicKey(appConfig.solana.programId);

export const COMMUNITY_SEED = 'community';
export const MEMBERSHIP_SEED = 'membership';
export const POLL_SEED = 'poll';
export const VOTE_SEED = 'vote';
