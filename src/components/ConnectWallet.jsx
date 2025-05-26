import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Wallet, AlertTriangle, Loader } from 'lucide-react';

const ConnectWallet = () => {
  const { connectWallet, loading, error } = useWeb3();

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full mx-auto text-center bg-white rounded-xl shadow-md p-8">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full mb-4">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h1>
          <p className="text-gray-600">
            To access CrowdChain, you need to connect your Ethereum wallet. 
            We support MetaMask and other Web3 providers.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center mb-6">
            <Loader size={24} className="animate-spin text-primary mb-2" />
            <p className="text-gray-600">Connecting wallet...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <AlertTriangle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error connecting wallet</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : null}

        <button
          onClick={connectWallet}
          disabled={loading}
          className="btn btn-primary w-full py-3"
        >
          {loading ? (
            <>
              <Loader size={20} className="animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet size={20} />
              <span>Connect Wallet</span>
            </>
          )}
        </button>

        <div className="mt-6 text-gray-500 text-xs">
          <p>
            By connecting your wallet, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;