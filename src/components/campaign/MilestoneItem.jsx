import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Check, X, ExternalLink, Clock, ThumbsUp, ThumbsDown, FileCheck } from 'lucide-react';
import { useWeb3 } from '../../context/Web3Context';
import IpfsUploader from '../utils/IpfsUploder';

const MilestoneItem = ({ campaignId, milestone, index, isCreator, campaign, onUpdateCampaign }) => {
  const { contract, account } = useWeb3();
  const [proofHash, setProofHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txError, setTxError] = useState('');

  const { amount, isReleased, proofIPFSHash } = milestone;
  const formattedAmount = ethers.utils.formatEther(amount.toString());
  
  const isFirstMilestone = index === 0;
  const canClaimMilestone = isCreator && !isReleased && 
    (isFirstMilestone || (index > 0 && campaign.milestones[index-1].isReleased));

  // Check if there's an active vote for this milestone
  const hasProofSubmitted = proofIPFSHash && proofIPFSHash.length > 0;
  
  // Submit milestone proof
  const submitMilestoneProof = async () => {
    if ((!isFirstMilestone)&&(!proofHash || proofHash.length === 0)) {
      setTxError('Please enter a valid IPFS hash');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setTxError('');
      
      const tx = await contract.claimMilestone(campaignId, index, proofHash);
      await tx.wait();
      
      // Update the component state to reflect the change
      setProofHash('');
      onUpdateCampaign();
      
    } catch (error) {
      console.error('Error submitting milestone proof:', error);
      setTxError(error.message || 'Failed to submit proof');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Vote on milestone
  const voteMilestone = async (approve) => {
    try {
      setIsVoting(true);
      setTxError('');
      
      const tx = await contract.voteOnMilestone(campaignId, index, approve);
      await tx.wait();
      
      // Update campaign data
      onUpdateCampaign();
      
    } catch (error) {
      console.error('Error voting on milestone:', error);
      setTxError(error.message || 'Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };
  
  // Finalize milestone (only after voting period)
  const finalizeMilestone = async () => {
    try {
      setIsLoading(true);
      setTxError('');
      
      const tx = await contract.finalizeMilestone(campaignId, index);
      await tx.wait();
      
      // Update campaign data
      onUpdateCampaign();
      
    } catch (error) {
      console.error('Error finalizing milestone:', error);
      setTxError(error.message || 'Failed to finalize milestone');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${isReleased ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center">
            <span className="font-semibold text-lg">Milestone {index + 1}</span>
            {isReleased && (
              <span className="ml-2 flex items-center text-green-600 text-sm">
                <Check size={16} className="mr-1" /> Released
              </span>
            )}
          </div>
          <div className="text-xl font-bold">{formattedAmount} ETH</div>
        </div>
        <div className="flex items-center">
          {index === 0 && !isReleased && (
            <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              Initial Release
            </div>
          )}
        </div>
      </div>
      
      {/* Proof section */}
      {proofIPFSHash && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Proof of Completion:</span>
            <a 
              href={`https://ipfs.io/ipfs/${proofIPFSHash.replace('ipfs://', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary flex items-center text-sm"
            >
              View Proof <ExternalLink size={14} className="ml-1" />
            </a>
          </div>
        </div>
      )}
      
      {/* Submit proof section - shown to creator only */}
      {canClaimMilestone && !isFirstMilestone && !hasProofSubmitted && (
        //   <div className="mb-4">
        //     <div className="flex flex-col">
        //       <label className="label">
        //         Submit Proof (IPFS Hash):
        //       </label>
        //       <div className="flex">
        <div>
          <div>
        <IpfsUploader setCid={setProofHash}/>
              <input
                type="text"
                placeholder="ipfs://Qm..."
                value={proofHash}
                onChange={(e) => setProofHash(e.target.value)}
                className="input flex-grow mr-2"
                disabled={isSubmitting}
                readOnly
              />

              <button
                onClick={submitMilestoneProof}
                disabled={isSubmitting}
                className="btn btn-primary"
                >
               {isSubmitting ? 'Submitting...' : 'Submit'}
             </button>
              
         </div>
          {txError && <p className="text-sm text-red-500 mt-1">{txError}</p>}
            
         </div>
      //   </div>
      )
      }
      
      {/* First milestone auto-release for creator */}
      {isCreator && isFirstMilestone && !isReleased && (
        <div className="mb-4">
          <button
            onClick={() => submitMilestoneProof('')}
            disabled={isSubmitting}
            className="btn btn-primary w-full"
          >
            {isSubmitting ? 'Processing...' : 'Release Initial Milestone'}
          </button>
          {txError && <p className="text-sm text-red-500 mt-1">{txError}</p>}
          
        </div>
      )}
      
      {/* Voting section - shown to contributors only if there's an active vote */}
      {!isCreator && hasProofSubmitted && !isReleased && (
        <div className="mb-4">
          <div className="flex flex-col">
            <span className="label">Vote on this milestone:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => voteMilestone(true)}
                disabled={isVoting}
                className="btn btn-success flex-1"
              >
                <ThumbsUp size={16} />
                <span>Approve</span>
              </button>
              <button
                onClick={() => voteMilestone(false)}
                disabled={isVoting}
                className="btn btn-error flex-1"
              >
                <ThumbsDown size={16} />
                <span>Reject</span>
              </button>
            </div>
            {txError && <p className="text-sm text-red-500 mt-1">{txError}</p>}
            
          </div>
        </div>
      )}
      
      {/* Finalize section - shown after voting period ends */}
      {!isReleased && hasProofSubmitted && (
        <div className="mt-4">
          <button
            onClick={finalizeMilestone}
            disabled={isLoading}
            className="btn btn-secondary w-full"
          >
            {isLoading ? 'Processing...' : 'Finalize Milestone After Voting Period'}
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            <Clock size={12} className="inline mr-1" />
            Voting period is 3 days after proof submission
          </p>
          {txError && <p className="text-sm text-red-500 mt-1">{txError}</p>}
          
        </div>
      )}
    </div>
  );
};

export default MilestoneItem;