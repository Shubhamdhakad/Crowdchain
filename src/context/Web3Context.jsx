import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CrowdfundingABI } from '../contracts/CrowdfundingABI';

const Web3Context = createContext(null);

const CONTRACT_ADDRESS = '0xb9b4ea25a019609b9b2ee479b40b2523773dc162';
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in decimal

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [networkName, setNetworkName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('No Ethereum wallet found. Please install MetaMask.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAccount(account);

      // Get provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const signer = provider.getSigner();
      setSigner(signer);

      // Get network information
      const network = await provider.getNetwork();
      setChainId(network.chainId.toString());
      setNetworkName(network.name);

      // Check if we're on Sepolia
      if (network.chainId.toString() !== parseInt(SEPOLIA_CHAIN_ID, 16).toString()) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: 'Sepolia Testnet',
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Initialize contract
      const crowdfundingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CrowdfundingABI,
        signer
      );
      setContract(crowdfundingContract);
      setIsConnected(true);
      setLoading(false);

    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setIsConnected(false);
    setChainId(null);
    setNetworkName('');
  };

  useEffect(() => {
    // Handle account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
      }
    };

    // Handle chain changes
    const handleChainChanged = (chainId) => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            connectWallet();
          }
        })
        .catch(console.error);

      // Cleanup
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [account]);

  const value = {
    account,
    provider,
    signer,
    contract,
    isConnected,
    chainId,
    networkName,
    loading,
    error,
    connectWallet,
    disconnectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}