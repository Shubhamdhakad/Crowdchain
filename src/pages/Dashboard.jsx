import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import CampaignCard from '../components/campaign/CampaignCard';
import { User, PlusCircle, Wallet, Clock, Loader, LineChart } from 'lucide-react';

const Dashboard = () => {
  const { contract, account } = useWeb3();
  const [createdCampaigns, setCreatedCampaigns] = useState([]);
  const [contributedCampaigns, setContributedCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('created');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalCreated: 0,
    totalFunded: '0',
    totalRaised: '0',
  });
  
  // Fetch user campaigns
  useEffect(() => {
    const fetchUserCampaigns = async () => {
      if (!contract || !account) return;
      
      try {
        setLoading(true);
        setError('');
        
        const campaignCount = await contract.campaignCount();
        const created = [];
        const contributed = [];
        let totalFunded = ethers.BigNumber.from(0);
        let totalRaised = ethers.BigNumber.from(0);
        
        // Loop through all campaigns
        for (let i = 0; i < campaignCount; i++) {
          const campaignData = await contract.getCampaign(i);
          
          // Format campaign data
          const campaign = {
            id: i,
            creator: campaignData.creator,
            title: campaignData.title,
            description: campaignData.description,
            goal: campaignData.goal,
            amountRaised: campaignData.amountRaised,
            completed: campaignData.completed,
            projectDocument: campaignData.projectDocument,
            milestoneCount: campaignData.milestoneCount.toNumber()
          };
          
          // Check if user is the creator
          if (campaign.creator.toLowerCase() === account.toLowerCase()) {
            created.push(campaign);
            totalRaised = totalRaised.add(campaign.amountRaised);
          }
          
          // Check if user has contributed (simplified - would need contract method)
          // For now, we'll just show some campaigns as contributed to demonstrate the UI
          if (i % 3 === 1 && campaign.creator.toLowerCase() !== account.toLowerCase()) {
            contributed.push(campaign);
            totalFunded = totalFunded.add(ethers.utils.parseEther('0.1')); // Mock contribution
          }
        }
        
        setCreatedCampaigns(created);
        setContributedCampaigns(contributed);
        setStats({
          totalCreated: created.length,
          totalFunded: ethers.utils.formatEther(totalFunded),
          totalRaised: ethers.utils.formatEther(totalRaised),
        });
        
      } catch (error) {
        console.error('Error fetching user campaigns:', error);
        setError('Failed to load campaigns. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserCampaigns();
  }, [contract, account]);
  
  // Render campaigns list based on active tab
  const renderCampaigns = () => {
    const campaigns = activeTab === 'created' ? createdCampaigns : contributedCampaigns;
    
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader size={40} className="animate-spin text-primary" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      );
    }
    
    if (campaigns.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          {activeTab === 'created' ? (
            <>
              <PlusCircle size={40} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No campaigns created yet</h3>
              <p className="text-gray-500 mb-6">Start your first campaign and bring your ideas to life.</p>
              <Link to="/create" className="btn btn-primary">
                Create Campaign
              </Link>
            </>
          ) : (
            <>
              <Wallet size={40} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No contributions yet</h3>
              <p className="text-gray-500 mb-6">Browse campaigns and support projects you believe in.</p>
              <Link to="/campaigns" className="btn btn-primary">
                Explore Campaigns
              </Link>
            </>
          )}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User header */}
      <div className="bg-gradient-to-r from-cyan-500 to-violet-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-violet-600">
              <User size={24} />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-white text-opacity-90">{account}</p>
            </div>
          </div>
          <Link to="/create" className="btn bg-white text-primary hover:bg-gray-100">
            <PlusCircle size={18} className="mr-1" />
            <span>Create Campaign</span>
          </Link>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Campaigns Created</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalCreated}</h3>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600">
              <PlusCircle size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Funded</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalFunded} ETH</h3>
            </div>
            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
              <Wallet size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Raised</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalRaised} ETH</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
              <LineChart size={24} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('created')}
              className={`py-4 px-6 flex items-center text-sm font-medium ${
                activeTab === 'created'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <PlusCircle size={16} className="mr-2" />
              <span>Created Campaigns</span>
            </button>
            <button
              onClick={() => setActiveTab('contributed')}
              className={`py-4 px-6 flex items-center text-sm font-medium ${
                activeTab === 'contributed'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Wallet size={16} className="mr-2" />
              <span>Contributed Campaigns</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {renderCampaigns()}
        </div>
      </div>
      
      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader size={30} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="border-l-2 border-gray-200 pl-4 space-y-6">
              <div className="relative">
                <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-cyan-500"></div>
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="font-medium">Created a new campaign</p>
                    <p className="text-sm text-gray-500">Campaign #12 - Web3 Development Course</p>
                  </div>
                  <div className="text-right flex items-center text-sm text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>2 days ago</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-violet-500"></div>
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="font-medium">Contributed to a campaign</p>
                    <p className="text-sm text-gray-500">0.5 ETH to Campaign #8 - Decentralized Marketplace</p>
                  </div>
                  <div className="text-right flex items-center text-sm text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>5 days ago</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-amber-500"></div>
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="font-medium">Milestone completed</p>
                    <p className="text-sm text-gray-500">Campaign #5 - Milestone 2 approved by backers</p>
                  </div>
                  <div className="text-right flex items-center text-sm text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>1 week ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;