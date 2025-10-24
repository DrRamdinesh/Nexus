import React from 'react';
import { HelpIcon, SettingsIcon } from './icons';
import { LogoutIcon, UserIcon, SunIcon, MoonIcon } from '../../constants';
import { useTheme } from '../ThemeContext';
import { UserProfile } from '../../types';

interface AncillaryNavigationProps {
    onLogout: () => void;
    username: string;
    userProfile: UserProfile | null;
    activePane: string | null;
    setActivePane: (pane: string | null) => void;
}

const NavButton: React.FC<{
    label: string;
    Icon: React.FC<{ className?: string }>;
    onClick?: () => void;
    isActive?: boolean;
}> = ({ label, Icon, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors duration-200 ease-in-out group relative ${
            isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
        aria-label={label}
        aria-pressed={isActive}
    >
        <Icon className="w-6 h-6" />
        <span className="absolute left-16 w-max bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {label}
        </span>
    </button>
);

const ThemeToggleButton: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const label = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    return (
        <NavButton
            label={label}
            Icon={theme === 'light' ? MoonIcon : SunIcon}
            onClick={toggleTheme}
        />
    );
};

export const AncillaryNavigation: React.FC<AncillaryNavigationProps> = ({ onLogout, username, userProfile, activePane, setActivePane }) => {
    const handleNavClick = (paneName: string) => {
        setActivePane(activePane === paneName ? null : paneName);
    };
    
    return (
        <div className="flex flex-col items-center space-y-3">
            <ThemeToggleButton />
            <NavButton 
                label="Help" 
                Icon={HelpIcon} 
                onClick={() => handleNavClick('help')}
                isActive={activePane === 'help'}
            />
            <NavButton 
                label="Settings" 
                Icon={SettingsIcon} 
                onClick={() => handleNavClick('settings')}
                isActive={activePane === 'settings'}
            />
            <button
                onClick={() => handleNavClick('profile')}
                className="w-12 h-12 flex items-center justify-center group relative cursor-pointer"
                aria-label="Open User Profile"
            >
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ring-2 ${activePane === 'profile' ? 'ring-indigo-500' : 'ring-slate-700 group-hover:ring-indigo-500'}`}>
                    {userProfile?.avatar ? (
                        <img src={userProfile.avatar} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <UserIcon className="w-6 h-6 text-white" />
                    )}
                 </div>
                 <span className="absolute left-16 w-max bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {userProfile?.fullName || username}
                </span>
            </button>
             <button
                onClick={onLogout}
                className="w-12 h-12 flex items-center justify-center rounded-lg transition-colors duration-200 ease-in-out text-slate-400 hover:bg-red-500/20 hover:text-red-400 group relative"
                aria-label="Logout"
            >
                <LogoutIcon className="w-6 h-6" />
                 <span className="absolute left-16 w-max bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Logout
                </span>
            </button>
        </div>
    );
};
