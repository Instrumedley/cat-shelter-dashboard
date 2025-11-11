import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, User, Settings } from 'lucide-react';
import LoginModal from './LoginModal';

interface HeaderProps {
  onLoginClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { user, logout, login } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  const isStaffOrAdmin = user && (user.role === 'super_admin' || user.role === 'clinic_staff');

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    await login(username, password);
    setIsLoginModalOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-xl font-bold text-primary-600">
                Cat Shelter Dashboard
              </Link>
              {isStaffOrAdmin && (
                <Link
                  to="/back-office"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Back Office</span>
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.username} ({user.role.replace('_', ' ')})
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="flex items-center space-x-2 btn-primary"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      {!onLoginClick && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />
      )}
    </>
  );
};

export default Header;

