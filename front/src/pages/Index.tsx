import { useEffect, useState } from 'react';
import { useCommunity } from '@/hooks/useCommunity';
import { motion } from 'framer-motion';
import { useWalletExt } from '@/hooks/useAnchorWalletAdapter';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';


const Index = () => {
  const { connected } = useWalletExt();

  const [inputName, setInputName] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  const navigate = useNavigate();

  const {
    community,
    membershipStatus,
    isLoading,
    error,
    actions,
  } = useCommunity(selectedCommunity || '');

  useEffect(() => {
    if (community) {
      console.log(' Live community data from Solana:', community);
    }
    if (error) {
      console.error('⚠️ Error loading community:', error);
    }
  }, [community, error]);

  const handleJoin = () => {
    if (!inputName.trim()) return;
    setSelectedCommunity(inputName.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-charcoal mb-6">
            Decentralized Community Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect your wallet to join communities, create polls, and participate in decentralized governance.
            Built on Solana for fast, secure, and transparent decision-making.
          </p>

          {!connected ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-accent-purple/10 border border-accent-purple/20 rounded-2xl p-8 max-w-md mx-auto"
            >
              <h3 className="text-lg font-semibold text-charcoal mb-3">Get Started</h3>
              <p className="text-gray-600 mb-4">
                Connect your Solana wallet to access community features
              </p>
              <div className="w-8 h-8 bg-accent-purple rounded-full mx-auto animate-pulse"></div>
            </motion.div>
          ) : !selectedCommunity ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg"
            >
              <h3 className="text-xl font-semibold text-charcoal mb-4">
                Enter Community Name
              </h3>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. main-2"
              />
              <Button onClick={handleJoin} className="w-full">
                Join Community
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg"
            >
              {isLoading ? (
                <p className="text-gray-600 text-center">Loading community...</p>
              ) : error ? (
                <>
                  <p className="text-red-500 text-center mb-4">{error}</p>
                  <Button variant="outline" onClick={() => setSelectedCommunity(null)}>
                    Try Another Name
                  </Button>
                </>
              ) : community ? (
                <>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">
                    {community.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{community.description}</p>
                  {membershipStatus?.isMember ? (
                    membershipStatus.isApproved ? (
                      <>
                        <p className="text-green-600 font-semibold text-center mb-4">
                          You are a verified community member.
                        </p>
                        <Button
                          className="w-full"
                          onClick={() => {
                            if (selectedCommunity) {
                              navigate(`/community/${selectedCommunity}`);
                            }
                          }}
                        >
                          Go to Community
                        </Button>
                      </>
                    ) : (
                      <p className="text-yellow-600 font-medium text-center">
                        Your membership is under review. Please check back later.
                      </p>
                    )
                  ) : (
                    <Button onClick={actions.joinCommunity} className="w-full">
                      Request to Join
                    </Button>
                  )}
                </>
              ) : null}
            </motion.div>
          )}
        </motion.div>

        {/* Features Section */}
        {connected && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-charcoal text-center mb-12">
              Community Features
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-accent-purple rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal mb-3">
                    Join Communities
                  </h3>
                  <p className="text-gray-600">
                    Connect with like-minded individuals and participate in decentralized communities
                  </p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-accent-purple rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal mb-3">
                    Create Polls
                  </h3>
                  <p className="text-gray-600">
                    Propose ideas and create polls for community members to vote on important decisions
                  </p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-accent-purple rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal mb-3">
                    Vote & Govern
                  </h3>
                  <p className="text-gray-600">
                    Cast your vote on community proposals and help shape the future of the community
                  </p>
                </div>
              </Card>
            </div>
          </motion.section>
        )}

      </main>
    </div>
  );
};

export default Index;
