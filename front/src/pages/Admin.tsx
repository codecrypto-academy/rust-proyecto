import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { communityService } from '@/lib/communityService';
import { Member } from '@/services/types';
import { useToast } from '@/hooks/use-toast';
import { useWalletExt } from '@/hooks/useAnchorWalletAdapter';
import { PublicKey } from '@solana/web3.js';

const Admin = () => {
    const { connected, publicKey, anchorWallet } = useWalletExt();
    const { toast } = useToast();

    const [communityName, setCommunityName] = useState('');
    const [communityDescription, setCommunityDescription] = useState('');
    const [communityNameManage, setCommunityNameManage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [stats, _setStats] = useState({
        activeCommunities: 0,
        totalMembers: 0,
        activePolls: 0,
        totalVotes: 0,
    });

    // Fetch pending members when component mounts
    // useEffect(() => {
    //     if (connected && communityNameManage) {
    //         fetchPendingMembers();
    //     }
    // }, [connected, communityNameManage]);

    const fetchPendingMembers = async () => {
        if (!communityNameManage.trim()) return;

        setIsLoadingMembers(true);
        try {
            const members = await communityService.fetchPendingMembers(communityNameManage, anchorWallet);
            setPendingMembers(members);
        } catch (error) {
            console.error('Error fetching pending members:', error);
            toast({
                title: "Error",
                description: "Failed to fetch pending members",
                variant: "destructive"
            });
        } finally {
            setIsLoadingMembers(false);
        }
    };

    const handleInitializeCommunity = async () => {
        if (!connected || !publicKey) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet to continue",
                variant: "destructive"
            });
            return;
        }

        if (!communityName.trim() || !communityDescription.trim()) {
            toast({
                title: "Missing information",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            await communityService.initializeCommunity(
                communityName,
                communityDescription,
                anchorWallet
            );

            toast({
                title: "Community initialized!",
                description: `${communityName} has been successfully created`,
            });

            setCommunityName('');
            setCommunityDescription('');
        } catch (error) {
            console.error('Error initializing community:', error);
            toast({
                title: "Error",
                description: "Failed to initialize community. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveMember = async (memberAddress: PublicKey) => {
        if (!communityNameManage.trim()) {
            toast({
                title: "Error",
                description: "Please specify a community name first",
                variant: "destructive"
            });
            return;
        }

        try {
            await communityService.approveMembership(
                communityNameManage,
                memberAddress,
                anchorWallet
            );

            toast({
                title: "Member approved!",
                description: `Member ${memberAddress.toString().slice(0, 8)}... has been approved`,
            });

            // Refresh pending members list
            fetchPendingMembers();
        } catch (error) {
            console.error('Error approving member:', error);
            toast({
                title: "Error",
                description: "Failed to approve member",
                variant: "destructive"
            });
        }
    };

    const handleRejectMember = async (memberAddress: PublicKey) => {
        // For now, just remove from the list (in a real implementation, you might want to add a reject function)
        setPendingMembers(prev => prev.filter(member => member.address !== memberAddress));
        toast({
            title: "Member rejected",
            description: `Member ${memberAddress.toString().slice(0, 8)}... has been rejected`,
        });
    };

    if (!connected) {
        return (
           <div className="min-h-screen bg-gray-50">
             <div className="flex items-center justify-center min-h-[80vh]">
               <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-lg">
                 <h2 className="text-2xl font-bold text-gray-800 mb-4">
                   Admin Access Required
                 </h2>
                 <p className="text-gray-600 mb-6">
                   Please connect your wallet to access the admin dashboard
                 </p>
                 <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto animate-pulse"></div>
               </div>
             </div>
           </div>
         );
    }

    return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage communities, approve memberships, and oversee governance
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Initialize Community */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Initialize New Community
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    placeholder="Enter community name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Community Description *
                  </label>
                  <textarea
                    value={communityDescription}
                    onChange={(e) => setCommunityDescription(e.target.value)}
                    placeholder="Enter community description"
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                
                <button
                  onClick={handleInitializeCommunity}
                  disabled={isLoading}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? 'Initializing...' : 'Initialize Community'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Pending Members */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >

                     <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                              Community Name to Manage
                            </label>
                            <div className="flex items-center space-x-4">
                             <input
                               type="text"
                               value={communityNameManage}
                               onChange={(e) => setCommunityNameManage(e.target.value)}
                               placeholder="Enter community name (e.g. main-2)"
                               className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                             />
                             <button
                               onClick={fetchPendingMembers}
                               disabled={!communityNameManage || isLoadingMembers}
                                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all"
                              >
                                {isLoadingMembers ? 'Load' : 'Load'}
                             </button>
                            </div>
                            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Pending Members
                </h2>
                {/*communityNameManage && (
                  <button
                    onClick={fetchPendingMembers}
                    disabled={isLoadingMembers}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    {isLoadingMembers ? 'Refresh' : 'Refresh'}
                  </button>
                )*/}
              </div>
              
              {!communityNameManage ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  </div>
                  <p className="text-gray-600">Please specify a community name to view pending members</p>
                </div>
              ) : pendingMembers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  </div>
                  <p className="text-gray-600">No pending membership requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingMembers.map((member, index) => (
                    <motion.div
                      key={member.address.toString()}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="font-mono text-sm text-gray-800">
                          {member.address.toString().slice(0, 8)}...{member.address.toString().slice(-8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested: {member.joinedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRejectMember(member.address)}
                          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveMember(member.address)}
                          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-3xl font-bold text-purple-600 mb-2">{stats.activeCommunities}</h3>
              <p className="text-gray-600">Active Communities</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-3xl font-bold text-purple-600 mb-2">{stats.totalMembers}</h3>
              <p className="text-gray-600">Total Members</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-3xl font-bold text-purple-600 mb-2">{stats.activePolls}</h3>
              <p className="text-gray-600">Active Polls</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <h3 className="text-3xl font-bold text-purple-600 mb-2">{stats.totalVotes}</h3>
              <p className="text-gray-600">Total Votes Cast</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
