import { Link, NavLink, useNavigate } from 'react-router-dom';
import {  Sun, Moon, ChevronDown, User } from 'lucide-react';
import { Image } from '../common/image';
import { useTheme } from '../../context/ThemeContext';
import { menuItems } from './menuItems';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '../common/Loader';
interface DropdownProps {
  items: Array<{
    title: string;
    href: string;
    description?: string;
    image?: string;
  }>;
  type: 'services' | 'products';
}

const Dropdown = ({ items, type }: DropdownProps) => (
  <div
    className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 ${
      type === 'products' ? 'w-[800px]' : 'w-64'
    } rounded-lg bg-white dark:bg-black/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-2xl transition-all duration-200 ease-out opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible`}
  >
    <div className={`p-4 ${type === 'products' ? 'grid grid-cols-1 gap-2' : 'space-y-3'}`}>
      {items.map((item) => (
        <Link
          key={item.title}
          to={item.href}
          className={`block text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-150 ${
            type === 'products' ? 'p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5' : ''
          }`}
        >
          {item.image && type === 'products' && (
            <div className="relative h-[160px] mb-4 rounded-lg overflow-hidden bg-gray-200 dark:bg-black/50">
              <Image src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className={`font-medium ${type === 'products' ? 'text-lg' : 'text-sm'}`}>
            {item.title}
          </div>
          {item.description && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</div>
          )}
        </Link>
      ))}
    </div>
  </div>
);


const NavItem = ({
  to,
  label,
  items,
  type,
}: {
  to: string;
  label: string;
  items?: Array<{ title: string; href: string; description?: string; image?: string }>;
  type?: 'services' | 'products';
}) => (
  <div className="relative group">
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-150 ease-in-out ${
          isActive ? 'text-black dark:text-white' : ''
        }`
      }
    >
      {label}
      {items && <ChevronDown className="ml-1 h-2   w-2 opacity-50 group-hover:opacity-100" />}
    </NavLink>
    {items && type && <Dropdown items={items} type={type} />}
  </div>
);


export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { logout, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setDropdownVisible(false);
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full">
      {/* Gradient background */}
      <div className="h-7 w-full bg-gradient-to-r from-purple-500/70 via-pink-400/70 to-purple-500/70 dark:bg-gradient-to-r dark:from-black/50 dark:via-stone-800 dark:to-black/50 flex items-center justify-center">
        <span className="font-mono font-bold text-zinc-800 dark:text-white font-mono">INTRODUCING SMART TRIP PLANNER -</span>
        <p className="w-1"> </p>
        <span className="font-thin text-black dark:text-white font-mono"> A Perfect Trip Planner for Your Next Trip</span>
      </div>

      {/* Main header */}
      <header className="bg-white/95 dark:bg-black relative z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section - Logo or brand */}
            <div className="w-32">
                {isAuthenticated ? <Link to="/landing-page" className="text-xl font-bold text-black dark:text-white">
                TripPlanner
              </Link> : <Link to="/" className="text-xl font-bold text-black dark:text-white">
                TripPlanner
              </Link> }

            </div>

            {/* Center navigation */}
            <nav className="flex space-x-8">
              <NavItem to="/services" label="Services" items={menuItems.services} type="services" />
              <NavItem to="/products" label="Products" items={menuItems.products} type="products" />
              <NavItem to="/about-us" label="About" />
            </nav>

            {/* Right section - theme toggle and auth */}
            <div className="flex items-center space-x-4 w-32 relative">
              <button
                className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-150 ease-in-out"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>


              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-150 ease-in-out"
                    onClick={() => setDropdownVisible(!dropdownVisible)}
                  >
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {dropdownVisible && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-medium text-sm text-black dark:text-white">{user?.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownVisible(false)}
                      >
                        Profile
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/authentication"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <hr/>
    </div>
  );
};
