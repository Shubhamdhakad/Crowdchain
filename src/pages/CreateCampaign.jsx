import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { Plus, Minus, Loader, AlertTriangle, CheckCircle } from 'lucide-react';
import IpfsUploader from '../components/utils/IpfsUploder';

const CreateCampaign = () => {
  const { contract } = useWeb3();
  const navigate = useNavigate();
  const[cid,setCid]=useState("");
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalEth, setGoalEth] = useState('');
  const [projectDocument, setProjectDocument] = useState('');
  const [milestones, setMilestones] = useState([{ amount: '', percentage: '' }]);
  
  // Transaction state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newCampaignId, setNewCampaignId] = useState(null);
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});
  
  // Add a milestone
  const addMilestone = () => {
    setMilestones([...milestones, { amount: '', percentage: '' }]);
  };
  
  // Remove a milestone
  const removeMilestone = (index) => {
    if (milestones.length > 1) {
      const updatedMilestones = milestones.filter((_, i) => i !== index);
      setMilestones(updatedMilestones);
      updateMilestonePercentages(updatedMilestones);
    }
  };
  
  // Update milestone amount based on percentage
  const handleMilestonePercentageChange = (index, value) => {
    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
      const updatedMilestones = [...milestones];
      updatedMilestones[index].percentage = value;
      
      if (value !== '' && goalEth !== '') {
        const goalWei = ethers.utils.parseEther(goalEth);
        const amount = goalWei.mul(ethers.BigNumber.from(Math.floor(parseFloat(value) * 100)))
                           .div(ethers.BigNumber.from(10000));
        updatedMilestones[index].amount = ethers.utils.formatEther(amount);
      } else {
        updatedMilestones[index].amount = '';
      }
      
      setMilestones(updatedMilestones);
    }
  };
  
  // Handle goal change and update all milestone amounts
  const handleGoalChange = (value) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setGoalEth(value);
      
      if (value !== '') {
        const updatedMilestones = [...milestones];
        updatedMilestones.forEach((milestone, index) => {
          if (milestone.percentage !== '') {
            const goalWei = ethers.utils.parseEther(value);
            const amount = goalWei.mul(ethers.BigNumber.from(Math.floor(parseFloat(milestone.percentage) * 100)))
                               .div(ethers.BigNumber.from(10000));
            updatedMilestones[index].amount = ethers.utils.formatEther(amount);
          }
        });
        setMilestones(updatedMilestones);
      }
    }
  };
  
  // Update all milestone percentages to ensure total is 100%
  const updateMilestonePercentages = (updatedMilestones = milestones) => {
    const equalPercentage = (100 / updatedMilestones.length).toFixed(2);
    const newMilestones = updatedMilestones.map(milestone => ({
      ...milestone,
      percentage: equalPercentage
    }));
    
    if (goalEth !== '') {
      newMilestones.forEach((milestone, index) => {
        const goalWei = ethers.utils.parseEther(goalEth);
        const amount = goalWei.mul(ethers.BigNumber.from(Math.floor(parseFloat(equalPercentage) * 100)))
                           .div(ethers.BigNumber.from(10000));
        newMilestones[index].amount = ethers.utils.formatEther(amount);
      });
    }
    
    setMilestones(newMilestones);
  };
  
  // Calculate total percentage
  const totalPercentage = milestones.reduce((sum, milestone) => {
    return sum + (milestone.percentage ? parseFloat(milestone.percentage) : 0);
  }, 0);
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (!goalEth || parseFloat(goalEth) <= 0) errors.goalEth = 'Valid goal amount is required';
    //  if (!projectDocument.trim()) errors.projectDocument = 'Project document link is required';
    
    if (Math.abs(totalPercentage - 100) > 0.1) {
      errors.milestones = 'Milestone percentages must sum to 100%';
    }
    
    milestones.forEach((milestone, index) => {
      if (!milestone.percentage || parseFloat(milestone.percentage) <= 0) {
        errors[`milestone_${index}`] = 'Valid percentage is required';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Convert goal to wei
      const goalWei = ethers.utils.parseEther(goalEth);
      
      // Convert milestone amounts to wei
      const milestoneAmounts = milestones.map(milestone => 
        ethers.utils.parseEther(milestone.amount)
      );
      
      // Create campaign transaction
      const tx = await contract.createCampaign(
        title,
        description,
        goalWei,
        milestoneAmounts,
        projectDocument
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Find the CampaignCreated event to get the campaign ID
      const event = receipt.events?.find(event => event.event === 'CampaignCreated');
      const campaignId = event?.args?.campaignId?.toNumber();
      
      setSuccess(true);
      setNewCampaignId(campaignId);
      
      // Reset form
      setTitle('');
      setDescription('');
      setGoalEth('');
      setProjectDocument('');
      setMilestones([{ amount: '', percentage: '' }]);
      
    } catch (error) {
      console.error('Error creating campaign:', error);
      setError(error.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create a New Campaign</h1>
      
      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <CheckCircle size={24} className="text-green-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-green-800 mb-2">Campaign Created Successfully!</h3>
              <p className="text-green-700 mb-4">
                Your campaign has been created and is now live on the blockchain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(`/campaigns/${newCampaignId}`)}
                  className="btn btn-primary"
                >
                  View Your Campaign
                </button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setNewCampaignId(null);
                  }}
                  className="btn btn-outline"
                >
                  Create Another Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Title */}
          <div className="mb-6">
            <label className="label" htmlFor="title">
              Campaign Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a catchy title for your campaign"
              className={`input w-full ${formErrors.title ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
            
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <label className="label" htmlFor="description">
              Campaign Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project, goals, and how you'll use the funds"
              rows={5}
              className={`input w-full ${formErrors.description ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
            
          </div>
          
          {/* Funding Goal */}
          <div className="mb-6">
            <label className="label" htmlFor="goal">
              Funding Goal (ETH) *
            </label>
            <div className="relative">
              <input
                id="goal"
                type="text"
                value={goalEth}
                onChange={(e) => handleGoalChange(e.target.value)}
                placeholder="1.0"
                className={`input w-full pr-12 ${formErrors.goalEth ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500">ETH</span>
              </div>
            </div>
            {formErrors.goalEth && <p className="text-red-500 text-sm mt-1">{formErrors.goalEth}</p>}
            
          </div>
          
          {/* Project Document */}

          <div className="mb-6">
            <label className="label" htmlFor="projectDocument">
              Project Document (IPFS Hash) *
            </label>
            <div className="flex flex-col">
              <IpfsUploader setCid={setCid}/>
              <input
                id="projectDocument"
                type="text"
                value={cid}
                onChange={(e) => setProjectDocument(e.target.value)}
                placeholder="ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
                // className={`input w-full ${formErrors.projectDocument ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
                readOnly
              />
              {formErrors.projectDocument && <p className="text-red-500 text-sm mt-1">{formErrors.projectDocument}</p>}
              
              {/* <p className="text-sm text-gray-500 mt-2">
                Upload your project documentation or images to IPFS and paste the hash here.
                <a 
                  href="https://nft.storage/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary ml-1 hover:underline"
                >
                  Use NFT.Storage
                </a>
              </p> */}
            </div>
          </div>
          
          {/* Milestones */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="label">Milestones *</label>
              <div className="flex items-center text-sm">
                <span className={totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}>
                  Total: {totalPercentage.toFixed(2)}%
                </span>
                <span className="mx-2 text-gray-400">|</span>
                <button
                  type="button"
                  onClick={() => updateMilestonePercentages()}
                  className="text-primary hover:text-primary-dark"
                >
                  Distribute Evenly
                </button>
              </div>
            </div>
            
            {formErrors.milestones && (
              <p className="text-red-500 text-sm mb-2">{formErrors.milestones}</p>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-12 gap-4 font-medium text-sm text-gray-500 mb-2 px-1">
                <div className="col-span-1"></div>
                <div className="col-span-5">Milestone</div>
                <div className="col-span-3">Percentage</div>
                <div className="col-span-3">Amount (ETH)</div>
              </div>
              
              {milestones.map((milestone, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 mb-3">
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      disabled={milestones.length <= 1 || isSubmitting}
                      className={`p-1 rounded-full ${
                        milestones.length <= 1 ? 'text-gray-300' : 'text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                  <div className="col-span-5 flex items-center">
                    <span className="font-medium">Milestone {index + 1}</span>
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={milestone.percentage}
                        onChange={(e) => handleMilestonePercentageChange(index, e.target.value)}
                        placeholder="25"
                        className={`input w-full pr-8 ${formErrors[`milestone_${index}`] ? 'border-red-500' : ''}`}
                        disabled={isSubmitting}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={milestone.amount}
                        readOnly
                        className="input w-full pr-12 bg-gray-100"
                        placeholder="0"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500">ETH</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-3">
                <button
                  type="button"
                  onClick={addMilestone}
                  disabled={isSubmitting}
                  className="btn btn-outline w-full flex items-center justify-center py-2"
                >
                  <Plus size={16} className="mr-1" />
                  <span>Add Milestone</span>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Break down your funding into milestones. The first milestone is released immediately when funding goal is reached. Subsequent milestones require approval from backers.
            </p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 rounded-md flex items-start">
              <AlertTriangle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  <span>Creating Campaign...</span>
                </>
              ) : (
                <span>Create Campaign</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateCampaign;