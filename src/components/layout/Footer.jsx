import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">CrowdChain</h3>
            <p className="text-gray-600 mb-4">
              A decentralized crowdfunding platform built on the Ethereum blockchain.
              Fund innovative projects with milestone-based accountability.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-cyan-500">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-500">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-500">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-600 hover:text-primary">Home</a>
              </li>
              <li>
                <a href="/campaigns" className="text-gray-600 hover:text-primary">Explore Campaigns</a>
              </li>
              <li>
                <a href="/create" className="text-gray-600 hover:text-primary">Create Campaign</a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-600 hover:text-primary">My Dashboard</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">How It Works</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">FAQs</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            &copy; {new Date().getFullYear()} CrowdChain. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;