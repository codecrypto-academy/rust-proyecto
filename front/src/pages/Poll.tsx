import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useWalletExt } from '@/hooks/useAnchorWalletAdapter';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import { useToast } from '@/hooks/use-toast';
import { useCommunity } from '@/hooks/useCommunity';

const Poll = () => {
  const { community: communityName, id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { anchorWallet, publicKey, connected } = useWalletExt();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [pollData, setPollData] = useState<any | null>(null);

  const { polls, actions } = useCommunity(communityName);

  useEffect(() => {
    if (id && polls.length > 0) {
      const matched = polls.find(p => p.id.toBase58() === id);
      if (matched) setPollData(matched);
    }
  }, [id, polls]);

  const handleVote = async () => {
    if (!connected || !publicKey || !anchorWallet) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote",
        variant: "destructive"
      });
      return;
    }

    if (selectedOption === null) {
      toast({
        title: "No option selected",
        description: "Please select an option before voting",
        variant: "destructive"
      });
      return;
    }

    setIsVoting(true);

    try {
      const pollIndex = polls.findIndex(p => p.id.toBase58() === id);
      await actions.vote(pollIndex, selectedOption);
      setHasVoted(true);
      toast({
        title: "Vote cast successfully!",
        description: "Your vote has been recorded on the blockchain",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleClosePoll = async () => {
    try {
      const pollIndex = polls.findIndex(p => p.id.toBase58() === id);
      await actions.closePoll(pollIndex);
      toast({
        title: "Poll closed",
        description: "This poll has been closed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close poll",
        variant: "destructive"
      });
    }
  };

  if (!connected || !pollData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="text-center max-w-md">
            <p className="text-gray-600">{!connected ? 'Connect your wallet to view this poll' : 'Poll not found'}</p>
          </Card>
        </div>
      </div>
    );
  }

  const timeLeft = pollData.endTime.getTime() - new Date().getTime();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const getVotePercentage = (votes: number) => {
    return pollData.totalVotes > 0 ? (votes / pollData.totalVotes) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-charcoal mb-4">{pollData.question}</h1>
                <div className="text-sm text-gray-500 mb-2">
                  Created by: {pollData.creator.toBase58().slice(0, 8)}...{pollData.creator.toBase58().slice(-8)}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${pollData.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {pollData.isActive ? 'Active' : 'Closed'}
                </span>
                {pollData.isActive && (
                  <Button variant="outline" size="sm" onClick={handleClosePoll} className="text-red-600 hover:bg-red-50">
                    Close Poll
                  </Button>
                )}
              </div>
            </div>

            {pollData.isActive && (
              <div className="bg-accent-purple/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-charcoal">Time remaining: {hoursLeft}h {minutesLeft}m</span>
                  <span className="text-sm text-gray-600">{pollData.totalVotes} total votes</span>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <Card>
            <h2 className="text-2xl font-semibold text-charcoal mb-6">{hasVoted ? 'Your Vote' : 'Cast Your Vote'}</h2>
            <div className="space-y-4">
              {pollData.options.map((option: string, index: number) => {
                const votes = pollData.voteCounts[index];
                const percentage = getVotePercentage(votes);
                const isSelected = selectedOption === index;

                return (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }}
                    className={`relative overflow-hidden border-2 rounded-xl transition-all cursor-pointer ${isSelected ? 'border-accent-purple bg-accent-purple/5' : 'border-gray-200 hover:border-gray-300'} ${hasVoted ? 'cursor-default' : ''}`}
                    onClick={() => !hasVoted && pollData.isActive && setSelectedOption(index)}>
                    <div className="absolute inset-0 bg-accent-purple/10 transition-all duration-500" style={{ width: `${percentage}%` }} />
                    <div className="relative p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 transition-all ${isSelected ? 'border-accent-purple bg-accent-purple' : 'border-gray-300'}`}></div>
                        <span className="font-medium text-charcoal">{option}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-charcoal">{votes} votes</div>
                        <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {!hasVoted && pollData.isActive && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 pt-6 border-t border-gray-200">
                <Button onClick={handleVote} disabled={selectedOption === null || isVoting} className="w-full">
                  {isVoting ? 'Casting Vote...' : 'Cast Vote'}
                </Button>
              </motion.div>
            )}

            {hasVoted && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 pt-6 border-t border-gray-200 text-center">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full inline-block font-medium">
                  ✓ Vote recorded successfully
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <Button variant="outline" onClick={() => navigate(`/community/${communityName}`)}>
            ← Back to Community
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Poll;
