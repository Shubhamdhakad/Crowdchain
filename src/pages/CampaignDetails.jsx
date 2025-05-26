import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import MilestoneItem from '../components/campaign/MilestoneItem';
import FundingSection from '../components/campaign/FundingSection';
import { ArrowLeft, User, Calendar, ExternalLink, Loader, AlertTriangle } from 'lucide-react';

const CampaignDetails = () => {
  const { id } = useParams();
  const { contract, account } = useWeb3();
  const [campaign, setCampaign] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch campaign and milestone data
  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const campaignId = parseInt(id);
      const campaignData = await contract.getCampaign(campaignId);
      
      // Transform the returned data into a structured object
      const campaignObj = {
        id: campaignId,
        creator: campaignData.creator,
        title: campaignData.title,
        description: campaignData.description,
        goal: campaignData.goal,
        amountRaised: campaignData.amountRaised,
        completed: campaignData.completed,
        projectDocument: campaignData.projectDocument,
        milestoneCount: campaignData.milestoneCount.toNumber()
      };
      
      // Fetch all milestones for this campaign
      const milestonesArray = [];
      for (let i = 0; i < campaignObj.milestoneCount; i++) {
        const milestoneData = await contract.getMilestone(campaignId, i);
        milestonesArray.push({
          amount: milestoneData.amount,
          isReleased: milestoneData.isReleased,
          proofIPFSHash: milestoneData.proofIPFSHash
        });
      }
      
      setCampaign(campaignObj);
      setMilestones(milestonesArray);
      
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      setError('Failed to load campaign details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (contract && id) {
      fetchCampaignData();
    }
  }, [contract, id]);
  
  // Check if current user is the campaign creator
  const isCreator = campaign && account && campaign.creator.toLowerCase() === account.toLowerCase();
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size={40} className="animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 p-6 rounded-lg flex items-start">
          <AlertTriangle size={24} className="text-red-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Campaign</h3>
            <p className="text-red-700">{error}</p>
            <Link to="/campaigns" className="mt-4 inline-flex items-center text-red-700 hover:text-red-800">
              <ArrowLeft size={16} className="mr-1" /> Back to campaigns
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-700 mb-2">Campaign not found</h3>
          <p className="text-gray-500 mb-6">
            The campaign you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/campaigns" className="btn btn-primary">
            <ArrowLeft size={16} className="mr-1" /> Back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back navigation */}
      <div className="mb-6">
        <Link to="/campaigns" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} className="mr-1" /> Back to campaigns
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - 2/3 width on desktop */}
        <div className="lg:col-span-2">
          {/* Campaign header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="flex items-center mr-4">
                    <User size={16} className="mr-1" />
                    <span>Created by {formatAddress(campaign.creator)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    <span>Campaign #{campaign.id}</span>
                  </div>
                </div>
              </div>
              
              {isCreator && (
                <div className="mt-4 md:mt-0">
                  <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
                    You are the creator
                  </span>
                </div>
              )}
            </div>
            
            {/* Project document/image */}
            {campaign.projectDocument && (
              <div className="mb-6 overflow-hidden rounded-lg">
                <img 
                  src={`https://ipfs.io/ipfs/${campaign.projectDocument.replace('ipfs://', '')}`}
                  alt={campaign.title}
                  onError={(e) => {e.target.src = 'https://images.pexels.com/photos/7821486/pexels-photo-7821486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}}
                  className="w-full max-h-80 object-cover object-center"
                />
              </div>
            )}
            
            {/* Campaign description */}
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-3">About This Project</h3>
              <p className="whitespace-pre-line">{campaign.description}</p>
            </div>
            
            {/* External links */}
            {campaign.projectDocument && (
              <div className="mt-6 flex">
                <a 
                  href={`https://ipfs.io/ipfs/${campaign.projectDocument.replace('ipfs://', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-primary-dark"
                >
                  <ExternalLink size={16} className="mr-1" />
                  View Full Project Document
                </a>
              </div>
            )}
          </div>
          
          {/* Milestones section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Milestones</h2>
            <p className="text-gray-600 mb-6">
              This campaign has {campaign.milestoneCount} milestones. Funds are released as each milestone is completed and approved.
            </p>
            
            {milestones.map((milestone, index) => (
              <MilestoneItem
                key={index}
                campaignId={campaign.id}
                milestone={milestone}
                index={index}
                isCreator={isCreator}
                campaign={{ milestones }}
                onUpdateCampaign={fetchCampaignData}
              />
            ))}
          </div>
        </div>
        
        {/* Sidebar - 1/3 width on desktop */}
        <div className="lg:col-span-1">
          <FundingSection
            campaign={campaign}
            campaignId={campaign.id}
            onUpdateCampaign={fetchCampaignData}
          />
          
          {/* Creator info */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">About the Creator</h3>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-full flex items-center justify-center text-white">
                <User size={20} />
              </div>
              <div className="ml-3">
                <div className="font-medium">{formatAddress(campaign.creator)}</div>
                <div className="text-sm text-gray-500">Ethereum Address</div>
              </div>
            </div>
            <a 
              href={`https://sepolia.etherscan.io/address/${campaign.creator}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline w-full"
            >
              <ExternalLink size={16} />
              <span>View on Etherscan</span>
            </a>
          </div>
          
          {/* Contract info */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Contract Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Contract Address:</span>
                <span className="font-mono">{formatAddress('0x25916e2d9bc51668144c43075dac0b181c88219e')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Network:</span>
                <span>Sepolia Testnet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Campaign ID:</span>
                <span>{campaign.id}</span>
              </div>
            </div>
            <a 
              href={`https://sepolia.etherscan.io/address/0x25916e2d9bc51668144c43075dac0b181c88219e`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline w-full mt-4"
            >
              <ExternalLink size={16} />
              <span>View Contract on Etherscan</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;