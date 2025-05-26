import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useWeb3 } from '../../context/Web3Context';

const FundingSection = ({ campaign, campaignId, onUpdateCampaign }) => {
  const { contract } = useWeb3();
  const [fundAmount, setFundAmount] = useState('');
  const [isFunding, setIsFunding] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { goal, amountRaised } = campaign;
  
  // Calculate funding percentage
  const fundingPercentage = goal > 0 ? (amountRaised / goal) * 100 : 0;
  const formattedPercentage = Math.min(fundingPercentage, 100).toFixed(0);
  
  // Format amounts in ETH
  const formattedGoal = ethers.utils.formatEther(goal.toString());
  const formattedRaised = ethers.utils.formatEther(amountRaised.toString());
  
  // Handle input change with validation
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and a single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFundAmount(value);
      setError('');
    }
  };
  
  // Fund the campaign
  const fundCampaign = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    try {
      setIsFunding(true);
      setError('');
      setSuccessMsg('');
      
      const amountWei = ethers.utils.parseEther(fundAmount);
      const tx = await contract.fund(campaignId, { value: amountWei });
      await tx.wait();
      
      setSuccessMsg(`Successfully contributed ${fundAmount} ETH!`);
      setFundAmount('');
      onUpdateCampaign();
      
    } catch (error) {
      console.error('Error funding campaign:', error);
      setError(error.message || 'Failed to fund campaign');
    } finally {
      setIsFunding(false);
    }
  };
  
  // Request refund if campaign goal not reached
  const requestRefund = async () => {
    try {
      setIsFunding(true);
      setError('');
      setSuccessMsg('');
      
      const tx = await contract.refund(campaignId);
      await tx.wait();
      
      setSuccessMsg('Refund processed successfully!');
      onUpdateCampaign();
      
    } catch (error) {
      console.error('Error requesting refund:', error);
      setError(error.message || 'Failed to request refund');
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Support This Campaign</h3>
      
      {/* Funding progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{formattedRaised} ETH raised</span>
          <span className="text-gray-500">of {formattedGoal} ETH goal</span>
        </div>
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${formattedPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-500">{formattedPercentage}% complete</span>
        </div>
      </div>
      
      {/* Funding input */}
      <div className="mb-4">
        <label className="label" htmlFor="fund-amount">
          Contribution Amount (ETH)
        </label>
        <div className="relative">
          <input
            id="fund-amount"
            type="text"
            value={fundAmount}
            onChange={handleAmountChange}
            placeholder="0.1"
            className="input w-full pr-12"
            disabled={isFunding}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-500">ETH</span>
          </div>
        </div>
      </div>
      
      {/* Success/Error messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
          <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
          {successMsg}
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={fundCampaign}
          disabled={isFunding}
          className="btn btn-primary"
        >
          <CreditCard size={18} />
          <span>{isFunding ? 'Processing...' : 'Fund This Campaign'}</span>
        </button>
        
        {amountRaised < goal && (
          <button
            onClick={requestRefund}
            disabled={isFunding}
            className="btn btn-outline"
          >
            Request Refund
          </button>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-4">
        All transactions are secured by Ethereum blockchain. Funds will be released according to the milestone schedule.
      </p>
    </div>
  );
};

export default FundingSection;