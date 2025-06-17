import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import Button from './Button';

interface PollCardProps {
  id: string; // poll PDA as base58 string
  communityName: string; // required for URL construction
  question: string;
  options: string[];
  endTime: Date;
  isActive: boolean;
}

const PollCard: React.FC<PollCardProps> = ({
  id,
  communityName,
  question,
  options,
  endTime,
  isActive,
}) => {
  const navigate = useNavigate();

  const timeLeft = endTime.getTime() - new Date().getTime();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const handleView = () => {
    navigate(`/poll/${communityName}/${id}`);
  };

  return (
    <Card className={`${!isActive ? 'opacity-60' : ''}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-charcoal line-clamp-2">
            {question}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {isActive ? 'Active' : 'Closed'}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Options:</p>
          <ul className="text-sm text-gray-800 space-y-1">
            {options.slice(0, 3).map((option, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-purple rounded-full"></div>
                <span>{option}</span>
              </li>
            ))}
            {options.length > 3 && (
              <li className="text-gray-500">+{options.length - 3} more options</li>
            )}
          </ul>
        </div>

        {isActive && (
          <div className="bg-gray-light rounded-lg p-3">
            <p className="text-sm text-gray-600">
              Time remaining: {hoursLeft}h {minutesLeft}m
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <Button variant="outline" size="sm" onClick={handleView} className="flex-1">
            View Details
          </Button>
          {isActive && (
            <Button size="sm" onClick={handleView} className="flex-1">
              Vote Now
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PollCard;
