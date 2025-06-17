import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField from '../components/FormField';
import PollCard from '../components/PollCard';
import { useToast } from '@/hooks/use-toast';
import { useCommunity } from '@/hooks/useCommunity';

const Community = () => {
  const { id: communityName } = useParams();
  const { toast } = useToast();
  const [showNewPollForm, setShowNewPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollEndTime, setPollEndTime] = useState('');

  const {
    community,
    polls,
    membershipStatus,
    isLoading,
    error,
    actions,
  } = useCommunity(communityName || '');

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim() || pollOptions.some(opt => !opt.trim()) || !pollEndTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (pollOptions.length > 4) {
      toast({
        title: "Too many options",
        description: "Polls can have a maximum of 4 options",
        variant: "destructive"
      });
      return;
    }

    try {
      await actions.createPoll(pollQuestion, pollOptions, new Date(pollEndTime));
      toast({
        title: "Poll created!",
        description: "Your poll is now live for community voting",
      });
      setPollQuestion('');
      setPollOptions(['', '']);
      setPollEndTime('');
      setShowNewPollForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create poll. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  if (!communityName || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="text-center max-w-md">
            <p className="text-gray-600">Loading community...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="text-center max-w-md">
            <p className="text-red-500 mb-4">{error || 'Community not found'}</p>
          </Card>
        </div>
      </div>
    );
  }

  const canCreatePoll = membershipStatus?.isMember && membershipStatus?.isApproved;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Community Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h1 className="text-3xl font-bold text-charcoal mb-2">
                  {community.name}
                </h1>
                <p className="text-gray-600 mb-4">{community.description}</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p><strong>Admin:</strong> {community.admin.toBase58().slice(0, 8)}...</p>
                  <p><strong>Members:</strong> {community.memberCount}</p>
                  <p><strong>Total Polls:</strong> {community.totalPolls}</p>
                </div>
              </div>
              {canCreatePoll && (
                <div className="text-end">
                  <Button variant="outline" onClick={() => setShowNewPollForm(!showNewPollForm)}>
                    {showNewPollForm ? 'Cancel' : 'Create New Poll'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* New Poll Form */}
        {showNewPollForm && canCreatePoll && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card>
              <h2 className="text-2xl font-semibold text-charcoal mb-6">
                Create New Poll
              </h2>
              <div className="space-y-6">
                <FormField
                  label="Poll Question"
                  value={pollQuestion}
                  onChange={setPollQuestion}
                  placeholder="What would you like to ask the community?"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Poll Options *
                  </label>
                  <div className="space-y-3">
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <FormField
                          label={`Option ${index + 1}`}
                          value={option}
                          onChange={(value) => updatePollOption(index, value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1"
                        />
                        {pollOptions.length > 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePollOption(index)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPollOption}
                    className="mt-3"
                    disabled={pollOptions.length >= 4}
                  >
                    Add Option
                  </Button>
                </div>

                <FormField
                  label="End Time"
                  type="datetime-local"
                  value={pollEndTime}
                  onChange={setPollEndTime}
                  required
                />

                <div className="flex space-x-3">
                  <Button onClick={handleCreatePoll} className="flex-1">
                    Create Poll
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewPollForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Community Polls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-charcoal mb-6">
            Community Polls
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll, index) => (
              <motion.div
                key={poll.id.toBase58?.() || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
              <PollCard
                id={poll.id.toBase58()}
                communityName={community.name}
                question={poll.question}
                options={poll.options}
                endTime={poll.endTime}
                isActive={poll.isActive}
              />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Community;
