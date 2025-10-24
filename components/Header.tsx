import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NexusLogo, LogoutIcon, MagnifyingGlassIcon, ClockIcon } from '../constants';
import type { Project, Task, Defect, UserProfile } from '../types';

interface HeaderProps {
    username: string;
    userProfile: UserProfile | null;
    onLogout: () => void;
    projects: Project[];
    tasks: Task[];
    defects: Defect[];
    onSearchResultClick: (type: 'Project' | 'Task' | 'Defect', id: string) => void;
}

type SearchResult = 
    | { type: 'Project'; item: Project }
    | { type: 'Task'; item: Task }
    | { type: 'Defect'; item: Defect };

export const Header: React.FC<HeaderProps> = ({ username, userProfile, onLogout, projects, tasks, defects, onSearchResultClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Update the clock every minute
    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentDate(new Date());
        }, 60000);
        return () => clearInterval(timerId);
    }, []);

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setResults([]);
            return;
        }

        const handler = setTimeout(() => {
            const lowercasedQuery = searchQuery.toLowerCase();
            
            const filteredProjects = projects
                .filter(p => p.name.toLowerCase().includes(lowercasedQuery))
                .map(item => ({ type: 'Project', item } as SearchResult));

            const filteredTasks = tasks
                .filter(t => 
                    t.title.toLowerCase().includes(lowercasedQuery) ||
                    t.project.toLowerCase().includes(lowercasedQuery)
                )
                .map(item => ({ type: 'Task', item } as SearchResult));

            const filteredDefects = defects
                .filter(d => 
                    d.title.toLowerCase().includes(lowercasedQuery) ||
                    d.project.toLowerCase().includes(lowercasedQuery)
                )
                .map(item => ({ type: 'Defect', item } as SearchResult));

            setResults([...filteredProjects, ...filteredTasks, ...filteredDefects]);
        }, 300); // 300ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery, projects, tasks, defects]);
    
    // FIX: Replaced `{} as Record<...>` with a generic on `reduce` for better type inference, resolving the 'unknown' type for `items`.
    const resultCategories = useMemo(() => {
        return results.reduce<Record<string, SearchResult[]>>((acc, result) => {
            (acc[result.type] = acc[result.type] || []).push(result);
            return acc;
        }, {});
    }, [results]);
    
    const categoryConfig = {
        Project: { title: 'Projects', color: 'bg-blue-500' },
        Task: { title: 'Tasks', color: 'bg-green-500' },
        Defect: { title: 'Defects', color: 'bg-red-500' },
    };

    const handleResultClick = (result: SearchResult) => {
        onSearchResultClick(result.type, result.item.id);
        setIsFocused(false);
        setSearchQuery('');
    };
    
    const displayName = userProfile?.fullName || username;

    const formattedDateTime = useMemo(() => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short',
        }).format(currentDate);
    }, [currentDate]);

    return (
        <header className="bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-700">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                             <NexusLogo className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Nexus</h1>
                    </div>
                    
                    {/* Global Search */}
                    <div className="flex-1 flex justify-center px-8">
                        <div ref={searchContainerRef} className="relative w-full max-w-lg">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search projects, tasks, defects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                className="w-full bg-slate-100 border border-slate-300 rounded-full py-2 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                                aria-label="Global search"
                            />
                             {isFocused && searchQuery && (
                                <div className="absolute mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-96 overflow-y-auto dark:bg-slate-800 dark:border-slate-700 z-50">
                                   {results.length > 0 ? (
                                        <div className="py-2">
                                            {Object.entries(resultCategories).map(([category, items]) => (
                                                <div key={category}>
                                                    <h3 className="text-xs font-semibold text-slate-400 uppercase px-4 py-2">{categoryConfig[category as keyof typeof categoryConfig].title}</h3>
                                                    <ul>
                                                        {items.map((result) => (
                                                            <li key={`${result.type}-${result.item.id}`} 
                                                                onClick={() => handleResultClick(result)}
                                                                className="px-4 py-2 hover:bg-slate-100 cursor-pointer dark:hover:bg-slate-700"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                     <span className={`w-2 h-2 rounded-full flex-shrink-0 ${categoryConfig[result.type as keyof typeof categoryConfig].color}`}></span>
                                                                    <p className="text-sm text-slate-700 truncate flex-1 dark:text-slate-300">
                                                                        {result.type === 'Project' ? result.item.name : result.item.title}
                                                                        {(result.type === 'Task' || result.type === 'Defect') && (
                                                                            <span className="text-xs text-slate-500 ml-2 dark:text-slate-400">in {result.item.project}</span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                                            No results found for "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden lg:flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400" title={currentDate.toString()}>
                            <ClockIcon className="w-5 h-5" />
                            <span>{formattedDateTime}</span>
                        </div>
                        <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                            Welcome, <span className="font-semibold">{displayName}</span>
                        </div>
                        <button 
                            onClick={onLogout}
                            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                            aria-label="Logout"
                        >
                            <LogoutIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};