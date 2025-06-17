import { useState, useEffect, useCallback } from 'react';
import { useWalletExt } from '@/hooks/useAnchorWalletAdapter';
import { communityService } from '@/lib/communityService';
import { Community, Poll, MembershipStatus } from '@/services/types';

export const useCommunity = (communityName: string) => {
    const { connected, publicKey, anchorWallet } = useWalletExt();

    const [community, setCommunity] = useState<Community | null>(null);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCommunity = useCallback(async () => {
        if (!communityName) return;

        setIsLoading(true);
        setError(null);

        console.log("@ community name: ", communityName);
        try {
            const communityData = await communityService.fetchCommunity(communityName);
            setCommunity(communityData);
        } catch (err) {
            setError('Failed to fetch community data');
            console.error('Error fetching community:', err);
        } finally {
            setIsLoading(false);
        }
    }, [communityName]);

    const fetchPolls = useCallback(async () => {
        if (!communityName) return;

        try {
            const pollsData = await communityService.fetchPolls(communityName);
            setPolls(pollsData);
        } catch (err) {
            console.error('Error fetching polls:', err);
        }
    }, [communityName]);

    const fetchMembershipStatus = useCallback(async () => {
        if (!communityName || !connected || !publicKey) return;

        try {
            const status = await communityService.checkMembershipStatus(
                communityName,
                anchorWallet
            );
            setMembershipStatus(status);
        } catch (err) {
            console.error('Error fetching membership status:', err);
        }
    }, [communityName, connected, publicKey]);

    const joinCommunity = useCallback(async () => {
        if (!communityName || !connected || !publicKey) {
            throw new Error('Wallet not connected');
        }

        try {
            await communityService.joinCommunity(communityName, anchorWallet);
            await fetchMembershipStatus(); // Refresh status
            return true;
        } catch (err) {
            console.error('Error joining community:', err);
            throw err;
        }
    }, [communityName, connected, publicKey, fetchMembershipStatus]);

    const createPoll = useCallback(async (
        question: string,
        options: string[],
        endTime: Date
    ) => {
        if (!communityName || !connected || !publicKey) {
            throw new Error('Wallet not connected');
        }

        try {
            await communityService.createPoll(
                communityName,
                question,
                options,
                endTime,
                anchorWallet
            );
            await fetchPolls(); // Refresh polls
            return true;
        } catch (err) {
            console.error('Error creating poll:', err);
            throw err;
        }
    }, [communityName, connected, publicKey, fetchPolls]);

    const vote = useCallback(async (pollIndex: number, optionIndex: number) => {
        if (!communityName || !connected || !publicKey) {
            throw new Error('Wallet not connected');
        }

        try {
            await communityService.castVote(
                communityName,
                pollIndex,
                optionIndex,
                anchorWallet
            );
            await fetchPolls(); // Refresh polls
            return true;
        } catch (err) {
            console.error('Error casting vote:', err);
            throw err;
        }
    }, [communityName, connected, publicKey, fetchPolls]);

    const closePoll = useCallback(async (pollIndex: number) => {
        if (!communityName || !connected || !publicKey) {
            throw new Error('Wallet not connected');
        }

        try {
            await communityService.closePoll(communityName, pollIndex, anchorWallet);
            await fetchPolls(); // Refresh polls
            return true;
        } catch (err) {
            console.error('Error closing poll:', err);
            throw err;
        }
    }, [communityName, connected, publicKey, fetchPolls]);

    const refresh = useCallback(async () => {
        await Promise.all([
            fetchCommunity(),
            fetchPolls(),
            fetchMembershipStatus(),
        ]);
    }, [fetchCommunity, fetchPolls, fetchMembershipStatus]);

    // Fetch data when component mounts or dependencies change
    useEffect(() => {
        fetchCommunity();
    }, [fetchCommunity]);

    useEffect(() => {
        fetchPolls();
    }, [fetchPolls]);

    useEffect(() => {
        fetchMembershipStatus();
    }, [fetchMembershipStatus]);

    return {
        community,
        polls,
        membershipStatus,
        isLoading,
        error,
        actions: {
            joinCommunity,
            createPoll,
            vote,
            closePoll,
            refresh,
        },
    };
};
