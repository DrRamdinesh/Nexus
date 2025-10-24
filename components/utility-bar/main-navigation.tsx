import React from 'react';
// FIX: Import NexusLogo from constants file instead of local icons file.
import { DashboardIcon, SearchIcon, ProjectsIcon, TeamsIcon, BugIcon, BellIcon, ChartBarIcon } from './icons';
import { NexusLogo } from '../../constants';

interface MainNavigationProps {
    activePane: string | null;
    setActivePane: (pane: string | null) => void;
    unreadAlertsCount: number;
}

const NavButton: React.FC<{
    paneName: string;
    label: string;
    Icon: React.FC<{ className?: string }>;
    isActive: boolean;
    onClick: () => void;
}> = ({ paneName, label, Icon, isActive, onClick }) => (
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

export const MainNavigation: React.FC<MainNavigationProps> = ({ activePane, setActivePane, unreadAlertsCount }) => {
    
    const handleNavClick = (paneName: string) => {
        if (paneName === 'dashboard') {
            // The dashboard button should always close any open pane.
            setActivePane(null);
            return;
        }
        // For other buttons, toggle the pane.
        setActivePane(activePane === paneName ? null : paneName);
    };
    
    const navItems = [
        { name: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
        { name: 'search', label: 'Search', icon: SearchIcon },
        { name: 'alerts', label: 'Notifications', icon: BellIcon },
        { name: 'projects', label: 'Projects', icon: ProjectsIcon },
        { name: 'defects-analysis', label: 'Defect Analysis', icon: BugIcon },
        { name: 'reports-dashboard', label: 'Reports', icon: ChartBarIcon },
        { name: 'teams', label: 'Teams', icon: TeamsIcon },
    ];
    
    return (
        <div className="flex flex-col items-center">
             <div className="bg-indigo-600 p-3 rounded-xl mb-6">
                <NexusLogo className="w-7 h-7 text-white" />
            </div>
            <nav className="flex flex-col items-center space-y-3">
                {navItems.map(item => (
                    <div key={item.name} className="relative">
                        <NavButton
                            paneName={item.name}
                            label={item.label}
                            Icon={item.icon}
                            isActive={item.name === 'dashboard' ? activePane === null : activePane === item.name}
                            onClick={() => handleNavClick(item.name)}
                        />
                         {item.name === 'alerts' && unreadAlertsCount > 0 && (
                            <span className="absolute top-2 right-2 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-slate-900" title={`${unreadAlertsCount} unread notifications`}>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            </span>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
};