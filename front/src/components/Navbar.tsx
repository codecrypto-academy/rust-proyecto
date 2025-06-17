import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { connected } = useWallet();

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b border-gray-200 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <motion.h1 
            className="text-2xl font-bold text-charcoal"
            whileHover={{ scale: 1.02 }}
          >
            Community Hub
          </motion.h1>
          
          {connected && (
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-accent-purple transition-colors">
                Home
              </Link>
              <Link to="/admin" className="text-gray-600 hover:text-accent-purple transition-colors">
                Admin
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <WalletMultiButton className="btn-pill bg-accent-purple text-white hover:bg-purple-600" />
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
