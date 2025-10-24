import React from 'react';
import { MainNavigation } from './main-navigation';
import { AncillaryNavigation } from './ancillary-navigation';
import { NavigationPane } from './navigation-pane';
import type { Project, Task, Defect, ToolConfiguration, Vendor, UserProfile, TeamMember, Alert, AlertConfiguration } from '../../types';

interface UtilityBarProps {
    activePane: string | null;
    setActivePane: (pane: string | null) => void;
    onLogout: () => void;
    username: string;
    userProfile: UserProfile | null;
    onUpdateProfile: (profile: UserProfile) => void;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    vendors: Vendor[];
    tasks: Task[];
    defects: Defect[];
    teamMembers: TeamMember[];
    toolConfigs: ToolConfiguration[];
    setToolConfigs: React.Dispatch<React.SetStateAction<ToolConfiguration[]>>;
    setProjectForDetailView: (project: Project | null) => void;
    alerts: Alert[];
    setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
    alertConfig: AlertConfiguration;
    setAlertConfig: React.Dispatch<React.SetStateAction<AlertConfiguration>>;
    onAlertClick: (alert: Alert) => void;
    onItemClick: (itemType: 'Task' | 'Defect', itemId: string) => void;
}

export const UtilityBar: React.FC<UtilityBarProps> = ({ 
    activePane, 
    setActivePane, 
    onLogout, 
    username,
    userProfile,
    onUpdateProfile, 
    projects, 
    setProjects,
    vendors,
    tasks, 
    defects, 
    teamMembers,
    toolConfigs, 
    setToolConfigs,
    setProjectForDetailView,
    alerts,
    setAlerts,
    alertConfig,
    setAlertConfig,
    onAlertClick,
    onItemClick
}) => {
    const unreadAlertsCount = alerts.filter(a => !a.read).length;
    
    return (
        <div className="fixed top-0 left-0 h-full flex z-30">
            <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col justify-between py-5">
                <MainNavigation activePane={activePane} setActivePane={setActivePane} unreadAlertsCount={unreadAlertsCount} />
                <AncillaryNavigation 
                    onLogout={onLogout} 
                    username={username}
                    userProfile={userProfile}
                    activePane={activePane}
                    setActivePane={setActivePane}
                />
            </div>
            <NavigationPane 
                activePane={activePane} 
                onClose={() => setActivePane(null)}
                projects={projects}
                setProjects={setProjects}
                vendors={vendors}
                tasks={tasks}
                defects={defects}
                teamMembers={teamMembers}
                toolConfigs={toolConfigs}
                setToolConfigs={setToolConfigs}
                setProjectForDetailView={setProjectForDetailView}
                userProfile={userProfile}
                onUpdateProfile={onUpdateProfile}
                alerts={alerts}
                setAlerts={setAlerts}
                alertConfig={alertConfig}
                setAlertConfig={setAlertConfig}
                onAlertClick={onAlertClick}
                onItemClick={onItemClick}
            />
        </div>
    );
};