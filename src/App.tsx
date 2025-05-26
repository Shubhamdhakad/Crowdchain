import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useWeb3 } from './context/Web3Context';

// Layout and pages
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetails from './pages/CampaignDetails';
import CreateCampaign from './pages/CreateCampaign';
import Dashboard from './pages/Dashboard';
import ConnectWallet from './components/ConnectWallet';

function App() {
  const { isConnected } = useWeb3();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {!isConnected ? (
          <ConnectWallet />
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetails />} />
            <Route path="/create" element={<CreateCampaign />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;