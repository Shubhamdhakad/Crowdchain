import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import CampaignCard from '../components/campaign/CampaignCard';
import { Search, Filter, Loader } from 'lucide-react';

const CampaignsPage = () => {
  const { contract } = useWeb3();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

  // Fetch all campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError('');
        
        const campaignCount = await contract.campaignCount();
        const campaignsArray = [];
        
        for (let i = 0; i < campaignCount; i++) {
          const campaignData = await contract.getCampaign(i);
          
          // Transform the returned data into a structured object
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
          
          campaignsArray.push(campaign);
        }
        
        setCampaigns(campaignsArray);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setError('Failed to load campaigns. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (contract) {
      fetchCampaigns();
    }
  }, [contract]);
  
  // Filter and sort campaigns
  const filteredCampaigns = campaigns
    .filter(campaign => {
      // Apply search filter
      if (searchTerm) {
        return campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
               campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .filter(campaign => {
      // Apply category filter
      if (filterBy === 'all') return true;
      if (filterBy === 'completed') return campaign.completed;
      if (filterBy === 'active') return !campaign.completed;
      if (filterBy === 'funded') return campaign.amountRaised >= campaign.goal;
      if (filterBy === 'notFunded') return campaign.amountRaised < campaign.goal;
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'oldest') return a.id - b.id;
      if (sortBy === 'mostFunded') return b.amountRaised - a.amountRaised;
      if (sortBy === 'leastFunded') return a.amountRaised - b.amountRaised;
      if (sortBy === 'goalHighest') return b.goal - a.goal;
      if (sortBy === 'goalLowest') return a.goal - b.goal;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Campaigns</h1>
        <p className="text-lg text-gray-600">
          Discover innovative projects seeking funding on the Ethereum blockchain.
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 md:flex-none">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input w-full md:w-44"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="mostFunded">Most Funded</option>
                <option value="leastFunded">Least Funded</option>
                <option value="goalHighest">Highest Goal</option>
                <option value="goalLowest">Lowest Goal</option>
              </select>
            </div>
            
            <div className="flex-1 md:flex-none">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="input w-full md:w-44"
              >
                <option value="all">All Campaigns</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="funded">Fully Funded</option>
                <option value="notFunded">Not Fully Funded</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Campaigns grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader size={40} className="animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <Filter size={40} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No campaigns found</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `No results for "${searchTerm}". Try a different search term.` 
              : 'No campaigns match the selected filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;