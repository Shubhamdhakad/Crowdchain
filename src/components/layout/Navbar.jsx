import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { Menu, X, Wallet, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Campaigns', path: '/campaigns' },
    { name: 'Create Campaign', path: '/create' },
    { name: 'My Dashboard', path: '/dashboard' },
  ];

  const isActivePath = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold gradient-text">
                CrowdChain
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    isActivePath(link.path)
                      ? 'border-primary text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Wallet connection */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isConnected ? (
              <div className="flex items-center">
                <div className="text-sm text-gray-500 mr-2">
                  {formatAddress(account)}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn btn-outline text-sm"
                >
                  <LogOut size={16} />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn btn-primary text-sm"
              >
                <Wallet size={16} />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={closeMenu}
              className={`${
                isActivePath(link.path)
                  ? 'bg-primary-light bg-opacity-10 border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4">
            {isConnected ? (
              <div className="w-full flex flex-col">
                <div className="text-base font-medium text-gray-800 mb-2">
                  {formatAddress(account)}
                </div>
                <button
                  onClick={() => {
                    disconnectWallet();
                    closeMenu();
                  }}
                  className="btn btn-outline w-full text-sm"
                >
                  <LogOut size={16} />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  connectWallet();
                  closeMenu();
                }}
                className="btn btn-primary w-full text-sm"
              >
                <Wallet size={16} />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;