import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Landmark, Shield, ArrowRight, BarChart3, CheckCircle2 } from 'lucide-react';
// import { contract } from '../context/Web3Context';
import { useState } from 'react';
const HomePage = () => {
  // const[contract,account]=useWeb3();
//   const[fund,updateFund]=useState(0);
//   const[campaignCount,setCampaignCount]=useState(0);
//   const [successrate,updatesuccessrate]=useState(0);
// useEffect(()=>{
// const fundcalculator(()=>{

// })
// },[])
 
  return (
    <div className="bg-white">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-cyan-500 to-violet-600 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Fund Innovative Projects with Blockchain Security
              </h1>
              <p className="mt-4 text-xl text-white text-opacity-90">
                CrowdChain brings trust to crowdfunding with milestone-based funding 
                and decentralized governance.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/campaigns" className="btn bg-white text-primary hover:bg-gray-100">
                  Explore Campaigns
                </Link>
                <Link to="/create" className="btn bg-primary-dark text-white border border-white border-opacity-30 hover:bg-primary">
                  Start a Campaign
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.pexels.com/photos/7567444/pexels-photo-7567444.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Crowdfunding" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose CrowdChain?</h2>
            <p className="mt-4 text-xl text-gray-600">
              A new paradigm for funding projects with transparency and accountability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
                <Zap size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Milestone-Based Funding</h3>
              <p className="text-gray-600">
                Funds are released in stages as creators complete milestones, ensuring accountability and reducing risk.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                <Landmark size={24} className="text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Decentralized Governance</h3>
              <p className="text-gray-600">
                Backers vote on milestone completion, creating a fair and transparent decision-making process.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Shield size={24} className="text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Blockchain Security</h3>
              <p className="text-gray-600">
                Smart contracts ensure that funds are handled securely and transparently without intermediaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600">
              A simple process to create, fund, and complete projects
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all h-full">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">1</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-2">Create a Campaign</h3>
                <p className="text-gray-600">
                  Define your project, funding goal, and milestone breakdown.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2">
                <ArrowRight size={24} className="text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all h-full">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-2">Get Funded</h3>
                <p className="text-gray-600">
                  Backers contribute ETH to your campaign if they believe in your vision.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2">
                <ArrowRight size={24} className="text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all h-full">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">3</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-2">Complete Milestones</h3>
                <p className="text-gray-600">
                  Submit proof of work completion for each milestone to unlock funds.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2">
                <ArrowRight size={24} className="text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all h-full">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">4</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-2">Backer Governance</h3>
                <p className="text-gray-600">
                  Backers vote to approve milestones, ensuring accountability throughout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-8 rounded-xl shadow-md text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Total Funded</h3>
                <BarChart3 size={24} />
              </div>
              <p className="text-4xl font-bold">Ξ 320.5</p>
              <p className="mt-2 text-cyan-100">across all campaigns</p>
            </div>

            <div className="bg-gradient-to-br from-violet-500 to-violet-600 p-8 rounded-xl shadow-md text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Active Campaigns</h3>
                <Zap size={24} />
              </div>
              <p className="text-4xl font-bold">120+</p>
              <p className="mt-2 text-violet-100">innovative projects</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-8 rounded-xl shadow-md text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Success Rate</h3>
                <CheckCircle2 size={24} />
              </div>
              <p className="text-4xl font-bold">89%</p>
              <p className="mt-2 text-amber-100">milestone completion</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Launch Your Project?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our growing community of innovators and backers in the future of crowdfunding.
          </p>
          <Link to="/create" className="btn bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-lg px-8 py-3 hover:opacity-90">
            Start Your Campaign
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;