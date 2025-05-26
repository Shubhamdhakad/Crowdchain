import React from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { Clock, Users, Milestone } from 'lucide-react';

const CampaignCard = ({ campaign }) => {
  const { id, title, description, goal, amountRaised, creator, projectDocument, milestoneCount } = campaign;
  
  // Calculate funding percentage
  const fundingPercentage = goal > 0 ? (amountRaised / goal) * 100 : 0;
  const formattedPercentage = Math.min(fundingPercentage, 100).toFixed(0);
  
  // Format amounts in ETH
  const formattedGoal = ethers.utils.formatEther(goal.toString());
  const formattedRaised = ethers.utils.formatEther(amountRaised.toString());
  
  // Truncate description
  const truncatedDescription = description.length > 100 
    ? `${description.substring(0, 100)}...` 
    : description;
  
  // Format creator address
  const formattedCreator = `${creator.substring(0, 6)}...${creator.substring(creator.length - 4)}`;
 console.log(projectDocument);
  return (
    <div className="card hover:shadow-xl">
      {projectDocument && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img 
            src={`https://ipfs.io/ipfs/${projectDocument}`} 
            alt={title}
            onError={(e) => {e.target.src = 'https://images.pexels.com/photos/7821486/pexels-photo-7821486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center mb-2">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-cyan-100 text-cyan-800">
            ID: {id}
          </span>
          <span className="ml-2 text-xs text-gray-500">by {formattedCreator}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{title}</h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{truncatedDescription}</p>
        
        {/* Funding progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">{formattedRaised} ETH raised</span>
            <span className="text-gray-500">of {formattedGoal} ETH</span>
          </div>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${formattedPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">{formattedPercentage}% funded</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Milestone size={16} className="mr-1" />
            <span>{milestoneCount} milestones</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            <span>Ongoing</span>
          </div>
        </div>
        
        <Link 
          to={`/campaigns/${id}`} 
          className="btn btn-primary w-full"
        >
          View Campaign
        </Link>
      </div>
    </div>
  );
};

export default CampaignCard;