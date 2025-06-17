import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from '@/idl/community_management.json';
import { getCommunityPDA, getMembershipPDA, getPollPDA, getVotePDA } from '@/utils/pda';
import { appConfig } from '@/config/app';
import { Member, Poll, Vote, Community, CommunityManagement } from '@/services/types';
import { WalletAnchorType } from '@/hooks/useAnchorWalletAdapter';

const CLUSTER_URL = import.meta.env.VITE_SOLANA_CLUSTER;

const getAnchorProgram = (wallet: WalletAnchorType): Program<CommunityManagement> => {
    const connection = new Connection(CLUSTER_URL, 'confirmed');
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    return new Program<CommunityManagement>(idl as Idl, provider);
};

export const communityService = {
    async initializeCommunity(name: string, description: string, wallet: WalletAnchorType): Promise<void> {
        if (appConfig.useMockData) {
            console.log('[MOCK] Initializing community', name);
            return new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const program = getAnchorProgram(wallet);
        const [communityPda] = getCommunityPDA(name);

        console.log("Program ID being used:", program.programId.toBase58());

        await program.methods
        .initializeCommunity(name, description)
        .accountsStrict({
            community: communityPda,
            admin: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    },

    async fetchCommunity(name: string, wallet?: WalletAnchorType): Promise<Community | null> {
        if (appConfig.useMockData) {
            return {
                name,
                description: 'Mock community description',
                admin: new PublicKey('MockAdmin123...'),
                memberCount: 5,
                totalPolls: 3,
            };
        }

        try {
            const program = getAnchorProgram(wallet);
            const [communityPda] = getCommunityPDA(name);
            const communityAccount = await program.account.community.fetch(communityPda);

            return {
                name: communityAccount.name,
                description: communityAccount.description,
                admin: new PublicKey(communityAccount.admin.toBase58()),
                memberCount: communityAccount.memberCount.toNumber(),
                totalPolls: communityAccount.totalPolls.toNumber(),
            };
        } catch (error) {
            console.error('Error fetching community:', error);
            return null;
        }
    },

    async fetchPendingMembers(name: string, wallet?: WalletAnchorType): Promise<Member[]> {
        if (appConfig.useMockData) {
            return [
                { 
                    address: new PublicKey('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'),
                    joinedAt: new Date(),
                    isApproved: false,

                },
                { 
                    address: new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'),
                    joinedAt: new Date(),
                    isApproved: false
                },
            ];
        }

        try {
            const program = getAnchorProgram(wallet);
            const [communityPda] = getCommunityPDA(name);

            // Fetch all memberships for this community
            const memberships = await program.account.membership.all([
                {
                    memcmp: {
                        offset: 8, // Skip discriminator
                        bytes: communityPda.toBase58(),
                    },
                },
            ]);

            return memberships
            .filter((member) => !member.account.isApproved)
            .map((m) => ({
                address: new PublicKey(m.account.member.toBase58()),
                joinedAt: new Date(m.account.joinedAt.toNumber() * 1000),
                isApproved: m.account.isApproved
            }));
        } catch (error) {
            console.error('Error fetching pending members:', error);
            return [];
        }
    },

    async approveMembership(name: string, memberAddress: PublicKey, wallet: WalletAnchorType): Promise<void> {
        if (appConfig.useMockData) {
            console.log('[MOCK] Approving member:', memberAddress);
            return new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const program = getAnchorProgram(wallet);
        const [communityPda] = getCommunityPDA(name);
        const memberPubkey = new PublicKey(memberAddress);
        const [membershipPda] = getMembershipPDA(communityPda, memberPubkey);

        await program.methods
        .approveMembership()
        .accountsStrict({
            community: communityPda,
            membership: membershipPda,
            admin: wallet.publicKey,
        })
        .rpc();
    },

    async joinCommunity(name: string, wallet: WalletAnchorType): Promise<void> {
        if (appConfig.useMockData) {
            console.log('[MOCK] Joining community:', name);
            return new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const program = getAnchorProgram(wallet);
        const [communityPda] = getCommunityPDA(name);
        const [membershipPda] = getMembershipPDA(communityPda, wallet.publicKey);

        await program.methods
        .joinCommunity()
        .accountsStrict({
            membership: membershipPda,
            community: communityPda,
            member: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    },

    async createPoll(
        communityName: string,
        question: string,
        options: string[],
        endTime: anchor.BN,
        wallet: WalletAnchorType
    ): Promise<void> {
        if (appConfig.useMockData) {
            console.log('[MOCK] Creating poll:', question);
            return new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const program = getAnchorProgram(wallet);
        const [communityPda] = getCommunityPDA(communityName);
        const [membershipPda] = getMembershipPDA(communityPda, wallet.publicKey);

        // Get current total polls to determine poll PDA
        const communityAccount = await program.account.community.fetch(communityPda);
        const [pollPda] = getPollPDA(communityPda, communityAccount.totalPolls);

        const endTimeUnix = new anchor.BN(Math.floor(endTime.getTime() / 1000));

        await program.methods
        .createPoll(question, options, endTimeUnix)
        .accountsStrict({
            poll: pollPda,
            community: communityPda,
            membership: membershipPda,
            creator: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    },

    async fetchPolls(communityName: string, wallet?: WalletAnchorType): Promise<Poll[]> {
        if (appConfig.useMockData) {
            return [
                {
                    community: new PublicKey('0x123'),
                    question: 'What should be our next community project?',
                    options: ['Website', 'Mobile App', 'Discord Bot'],
                    voteCounts: [5, 8, 3],
                    endTime: new Date(Date.now() + 86400000),
                    isActive: true,
                    totalVotes: 16,
                    creator: new PublicKey('Creator123...'),
                },
            ];
        }

        try {
            const program = getAnchorProgram(wallet);
            const [communityPda] = getCommunityPDA(communityName);

            // Fetch all polls for this community
            const polls = await program.account.poll.all([
                {
                    memcmp: {
                        offset: 8, // Skip discriminator
                        bytes: communityPda.toBase58(),
                    },
                },
            ]);

            return polls.map((p) => ({
                id: p.publicKey,
                community: p.account.community,
                creator: p.account.creator,
                question: p.account.question,
                options: p.account.options,
                voteCounts: p.account.voteCounts.map((bn: anchor.BN) => bn.toNumber()),
                endTime: new Date(p.account.endTime.toNumber() * 1000),
                totalVotes: p.account.totalVotes.toNumber(),
                isActive: p.account.isActive,
            }));
        } catch (error) {
            console.error('Error fetching polls:', error);
            return [];
        }
    },

    async castVote(
        communityName: string,
        pollIndex: number,
        optionIndex: number,
        wallet: WalletAnchorType
    ): Promise<void> {
        if (appConfig.useMockData) {
            console.log('[MOCK] Casting vote:', { pollIndex, optionIndex });
            return new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const program = getAnchorProgram(wallet);
        const [communityPda] = getCommunityPDA(communityName);
        const [membershipPda] = getMembershipPDA(communityPda, wallet.publicKey);
        const [pollPda] = getPollPDA(communityPda, new anchor.BN(pollIndex));
        const [votePda] = getVotePDA(pollPda, wallet.publicKey);

        await program.methods
        .castVote(optionIndex)
        .accountsStrict({
            vote: votePda,
            poll: pollPda,
            membership: membershipPda,
            voter: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    },

    async closePoll(
        communityName: string,
        pollIndex: number,
        wallet: WalletAnchorType
    ): Promise<void> {
        if (appConfig.useMockData) {
            console.log('[MOCK] Closing poll:', pollIndex);
            return new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const program = getAnchorProgram(wallet);
        const [communityPda] = getCommunityPDA(communityName);
        const [pollPda] = getPollPDA(communityPda, new anchor.BN(pollIndex));

        await program.methods
        .closePoll()
        .accountsStrict({
            poll: pollPda,
            community: communityPda,
            authority: wallet.publicKey,
        })
        .rpc();
    },

    async checkMembershipStatus(
        communityName: string,
        wallet: WalletAnchorType
    ): Promise<{ isMember: boolean; isApproved: boolean } | null> {
        if (appConfig.useMockData) {
            return { isMember: true, isApproved: true };
        }

        try {
            const program = getAnchorProgram(wallet);
            const [communityPda] = getCommunityPDA(communityName);
            const [membershipPda] = getMembershipPDA(communityPda, wallet.publicKey);

            const membershipAccount = await program.account.membership.fetch(membershipPda);

            return {
                isMember: true,
                isApproved: membershipAccount.isApproved,
            };
        } catch (error) {
            // If account doesn't exist, user is not a member
            return { isMember: false, isApproved: false };
        }
    },
};
