import React from 'react';
import { ProjectStatus, TaskStatus, TaskPriority, DefectSeverity, Tool, ConnectionStatus } from './types';
import type { Project, Task, Defect, Reminder, CalendarEvent, ToolConfiguration, Vendor, TeamMember } from './types';

// Mock Data
export const MOCK_VENDORS: Vendor[] = [
    { id: 'VENDOR-A', name: 'Vendor A', contactPerson: 'Alice Smith', contactEmail: 'alice.s@vendor-a.com' },
    { id: 'VENDOR-B', name: 'Vendor B', contactPerson: 'Bob Johnson', contactEmail: 'bob.j@vendor-b.com' },
    { id: 'VENDOR-C', name: 'Vendor C', contactPerson: 'Carol White', contactEmail: 'carol.w@vendor-c.com' },
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
    { id: 'Alice', fullName: 'Alice Smith', jobTitle: 'Lead Developer' },
    { id: 'Bob', fullName: 'Bob Johnson', jobTitle: 'Backend Engineer' },
    { id: 'Charlie', fullName: 'Charlie Brown', jobTitle: 'QA Engineer' },
    { id: 'Dana', fullName: 'Dana White', jobTitle: 'UI/UX Designer' },
];


export const MOCK_PROJECTS: Project[] = [
    { id: 'PROJ-001', name: 'Phoenix Launch', status: ProjectStatus.Green, vendorId: 'VENDOR-A', tool: Tool.Jira, progress: 85, jiraKey: 'PHX' },
    { id: 'PROJ-002', name: 'Titan Migration', status: ProjectStatus.Amber, vendorId: 'VENDOR-B', tool: Tool.ServiceNow, progress: 45 },
    { id: 'PROJ-003', name: 'Orion Platform', status: ProjectStatus.Red, vendorId: 'VENDOR-C', tool: Tool.Trello, progress: 20 },
    { id: 'PROJ-004', name: 'Galaxy Expansion', status: ProjectStatus.Green, vendorId: 'VENDOR-A', tool: Tool.Jira, progress: 95, jiraKey: 'GAL' },
];

export const MOCK_TASKS: Task[] = [
    // FIX: Added creationDate to all mock tasks.
    { id: 'TASK-100', title: 'Initial Project Scoping', dueDate: 'Complete', priority: TaskPriority.High, status: TaskStatus.Completed, project: 'Phoenix Launch', assignedTo: 'Alice', creationDate: '2024-07-01' },
    { id: 'TASK-101', title: 'Finalize Q3 budget', dueDate: '2024-08-15', priority: TaskPriority.High, status: TaskStatus.Upcoming, project: 'Phoenix Launch', dependsOn: ['TASK-100'], assignedTo: 'Alice', creationDate: '2024-07-10' },
    { id: 'TASK-102', title: 'Review Titan API specs', dueDate: '2024-08-20', priority: TaskPriority.Medium, status: TaskStatus.Upcoming, project: 'Titan Migration', dependsOn: ['TASK-101'], assignedTo: 'Bob', creationDate: '2024-07-12' },
    { id: 'TASK-103', title: 'Submit weekly status report', dueDate: '2024-07-28', priority: TaskPriority.High, status: TaskStatus.Pending, project: 'All Projects', assignedTo: 'Charlie', creationDate: '2024-07-21' },
    { id: 'TASK-104', title: 'Onboard new developer', dueDate: '2024-08-30', priority: TaskPriority.Low, status: TaskStatus.Upcoming, project: 'Orion Platform', creationDate: '2024-07-23' },
    { id: 'TASK-105', title: 'Approve vendor invoice', dueDate: '2024-07-25', priority: TaskPriority.Medium, status: TaskStatus.Pending, project: 'Galaxy Expansion', dependsOn: ['TASK-103'], assignedTo: 'Dana', creationDate: '2024-07-24' },
];

export const MOCK_DEFECTS: Defect[] = [
    { id: 'DEF-501', title: 'Production login failure', severity: DefectSeverity.Critical, project: 'Orion Platform', creationDate: '2024-07-20', triageCall: 'Today @ 2 PM', assignedTo: 'Bob' },
    { id: 'DEF-502', title: 'API timeout issue', severity: DefectSeverity.Critical, project: 'Titan Migration', creationDate: '2024-07-15', triageCall: 'Tomorrow @ 10 AM', assignedTo: 'Bob' },
    { id: 'DEF-503', title: 'UI glitch on dashboard', severity: DefectSeverity.High, project: 'Phoenix Launch', creationDate: '2024-07-22', assignedTo: 'Dana' },
    { id: 'DEF-504', title: 'Incorrect data export', severity: DefectSeverity.Medium, project: 'Galaxy Expansion', creationDate: '2024-06-30', assignedTo: 'Charlie' },
    { id: 'DEF-505', title: 'Mobile layout breaks on scroll', severity: DefectSeverity.High, project: 'Orion Platform', creationDate: '2024-07-25', assignedTo: 'Dana' },
    { id: 'DEF-506', title: 'Payment gateway connection error', severity: DefectSeverity.Critical, project: 'Phoenix Launch', creationDate: '2024-07-28', assignedTo: 'Alice' },
];

const today = new Date();

export const MOCK_REMINDERS: Reminder[] = [
    { id: 'REM-01', text: 'Follow up with Vendor B on Titan progress', time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0) },
    { id: 'REM-02', text: 'Prepare for steering committee meeting', time: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 30) },
    { id: 'REM-03', text: 'Sign off on Orion Platform change request', time: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 11, 0) },
];


export const MOCK_EVENTS: CalendarEvent[] = [
    { id: 'EVT-01', title: 'Orion Defect Triage', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15), invitees: ['dev-lead@example.com', 'qa-eng@example.com'] },
    { id: 'EVT-02', title: 'Steering Committee Prep', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17) },
    { id: 'EVT-03', title: 'Titan API Review', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 30), invitees: ['vendor-b-poc@example.com', 'architect@example.com'] },
    { id: 'EVT-04', title: '1-on-1 with Lead Dev', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 9), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 9, 30) },
];

export const MOCK_TOOL_CONFIGURATIONS: ToolConfiguration[] = [
    { id: 'TOOL-CFG-1', tool: Tool.Jira, username: 'ramdineshboopalan@botifyx.in', apiKey: 'ATATT3xFfGF0bFtMUvkImfIpLXr60OiOttAyfOTghcZxBbY5LhcIxCwuT_FVFgEFFfzUJAGo9tPFKHFMDQxEKXnQfBiHroRti-B7Tql1kpuztHLgk7k_wLb0pxrLIbdBuBFFzC_o4-1kE_tPB22HxhTHs90ybx-4kCxmp6ZcED9BKtJAgP-Ufco=D2FE5807', url: 'https://botifyx-india.atlassian.net', status: ConnectionStatus.Connected },
    { id: 'TOOL-CFG-2', tool: Tool.Trello, username: 'pm_trello', apiKey: 'TRELLO_API_KEY_SECRET', url: 'https://api.trello.com', status: ConnectionStatus.Disconnected },
    { id: 'TOOL-CFG-3', tool: Tool.OpenProject, username: 'admin', password: 'OPENPROJECT_PASSWORD_SECRET', url: 'https://openproject.my-co.com', status: ConnectionStatus.Pending },
     { id: 'TOOL-CFG-4', tool: Tool.Rally, username: 'rally_user', password: 'RALLY_PASSWORD_SECRET', url: 'https://rally1.rallydev.com', status: ConnectionStatus.Pending },
];


// Icons
interface IconProps {
  className?: string;
}

export const PlusIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.41-1.412a6.998 6.998 0 00-12.262 0zM17 15.5a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const CalendarPlusIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 4.5a.75.75 0 01.75.75v2.5h2.5a.75.75 0 010 1.5h-2.5v2.5a.75.75 0 01-1.5 0v-2.5h-2.5a.75.75 0 010-1.5h2.5v-2.5a.75.75 0 01.75-.75z" />
      <path fillRule="evenodd" d="M2 5.5a3 3 0 013-3h10a3 3 0 013 3V15a3 3 0 01-3-3H5a3 3 0 01-3-3V5.5zm1.5 0a1.5 1.5 0 011.5-1.5h10a1.5 1.5 0 011.5 1.5V6h-13V5.5z" clipRule="evenodd" />
    </svg>
);

export const NexusLogo: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V5.25A2.25 2.25 0 0 0 18 3H6A2.25 2.25 0 0 0 3.75 3zM3.75 14.25V18a2.25 2.25 0 0 0 2.25 2.25h12A2.25 2.25 0 0 0 20.25 18v-3.75m-16.5 0h16.5" />
    </svg>
);


export const SendIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

export const AtSymbolIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.39 6.39a.75.75 0 011.06 0l.707.707a.75.75 0 01-1.06 1.06L6.39 7.45a.75.75 0 010-1.06zm-1.062 3.11a.75.75 0 010 1.061l-.707.707a.75.75 0 01-1.06-1.06l.707-.707a.75.75 0 011.06 0zM10 5.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0V6A.75.75 0 0110 5.25zm-2.25 2.5a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H8.5a.75.75 0 01-.75-.75zM10 10a.75.75 0 00-1.5 0v.01a.75.75 0 001.5 0V10zm2.25 2.5a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H12.5a.75.75 0 01-.75-.75zm-3.11-5.118a.75.75 0 011.06 0l.707.707a.75.75 0 01-1.06 1.06l-.707-.707a.75.75 0 010-1.06zM13.61 6.39a.75.75 0 011.06 0l.707.707a.75.75 0 01-1.06 1.06l-.707-.707a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

export const LockClosedIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);


export const AiIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 3.999c1.442 0 2.853.224 4.196.657 1.343.434 2.583 1.134 3.633 2.091a13.413 13.413 0 012.092 3.633c.433 1.343.656 2.754.656 4.196s-.223 2.853-.656 4.196a13.413 13.413 0 01-2.092 3.633c-1.05 1.028-2.29 1.657-3.633 2.091-1.343.434-2.754.657-4.196.657s-2.853-.224-4.196-.657a13.413 13.413 0 01-3.633-2.091 13.413 13.413 0 01-2.091-3.633c-.434-1.343-.657-2.754-.657-4.196s.223-2.853.657-4.196a13.413 13.413 0 012.091-3.633c1.05-1.028 2.29-1.657 3.633-2.091C10.647 4.222 12.058 4 13.5 4zm-7.653 14.61a.75.75 0 00.926-.22L8.25 16.5h3.75a.75.75 0 000-1.5H8.25l-1.478-1.89a.75.75 0 00-1.147.832l2.023 2.609a.75.75 0 00.573.299h4.499a.75.75 0 000-1.5H9.75a.75.75 0 00-.75.75v.75a.75.75 0 00.75.75h.75a.75.75 0 000-1.5H9a.75.75 0 00-.652 1.148l.926 1.186a.75.75 0 00.574.298h.95a.75.75 0 000-1.5h-.95a.75.75 0 00-.574-.298l-.926-1.186A2.25 2.25 0 019 15.75h.75a2.25 2.25 0 012.25 2.25v.75a2.25 2.25 0 01-2.25 2.25h-4.5a.75.75 0 00-.653.39L4.22 23.47a.75.75 0 00.832 1.147l2.608-2.023a.75.75 0 00.299-.574v-1.498a.75.75 0 00-1.5 0v.75a.75.75 0 00.22.53l-1.39 1.077a.75.75 0 00.832 1.147l1.076-1.39a.75.75 0 00.531-.22h1.498a.75.75 0 00.574-.299l2.023-2.608a.75.75 0 10-1.147-.832L15 17.25h.75a.75.75 0 000-1.5H15a.75.75 0 00-.75.75v.75a.75.75 0 00.75.75h.75a.75.75 0 000-1.5h-.75a.75.75 0 00-.574.298l-.926 1.186a.75.75 0 101.148.832l.926-1.186a.75.75 0 00-.574-.298H12a.75.75 0 000 1.5h.75a2.25 2.25 0 012.25 2.25v.75a2.25 2.25 0 01-2.25 2.25H9.352a.75.75 0 00-.574.298L6.75 25.5h3.75a.75.75 0 000-1.5H6.75l1.478-1.89a.75.75 0 00-1.147-.832l-2.023 2.609a.75.75 0 00-.573.299H.75a.75.75 0 000 1.5h4.499a.75.75 0 00.574-.298l2.023-2.609a.75.75 0 00-1.147-.832L5.22 20.86a.75.75 0 00-.57-.22H3.152a.75.75 0 00-.652 1.148l.926 1.186a.75.75 0 00.574.298h.95a.75.75 0 000-1.5h-.95a.75.75 0 00-.574-.298L3.35 20.28a2.25 2.25 0 011.957-3.398h.75a2.25 2.25 0 012.25 2.25v.75a2.25 2.25 0 01-2.25 2.25H4.5a.75.75 0 00-.653.39L2.57 24.38a.75.75 0 00.832 1.147l2.608-2.023A.75.75 0 006.31 23.25v-1.5a.75.75 0 00-1.5 0v.75c0 .248.114.48.299.653l-1.39 1.077a.75.75 0 00.832 1.147l1.076-1.39a.75.75 0 00.531-.22h1.5a.75.75 0 00.574-.298l2.023-2.609a.75.75 0 10-1.147-.832L11.25 21h.75a.75.75 0 000-1.5h-1.5a.75.75 0 00-.574.298L8.74 21.186a.75.75 0 101.148.832L10.814 20.83a.75.75 0 00-.574-.298h-1.5a2.25 2.25 0 01-2.25-2.25v-.75A2.25 2.25 0 018.74 15h4.5a.75.75 0 00.653-.39l1.277-1.916a.75.75 0 00-.832-1.147L12.31 13.5H12a.75.75 0 00-.574.298l-1.186.926a.75.75 0 00.832 1.147l1.186-.926A.75.75 0 0012.852 15H15a.75.75 0 00.652-1.148l-.926-1.186a.75.75 0 00-.574-.298h-.95a.75.75 0 000 1.5h.95c.248 0 .48.114.652.298l.926 1.186a2.25 2.25 0 01-1.957 3.398h-.75a2.25 2.25 0 01-2.25-2.25v-.75a2.25 2.25 0 012.25-2.25h4.5c.287 0 .564.08.811.22l2.37-2.37A.75.75 0 0021.75 9H18a.75.75 0 000 1.5h2.25l-1.89 1.478a.75.75 0 10.832 1.147l2.609-2.023a.75.75 0 00.299-.574v-1.5a.75.75 0 00-1.5 0v.75a.75.75 0 00.22.53l-1.39 1.077a.75.75 0 10.832 1.147l1.076-1.39a.75.75 0 00.531-.22H21a.75.75 0 00.574-.298l.926-1.186a.75.75 0 00-.832-1.147L20.48 10.5h.75a.75.75 0 000-1.5h-1.5a.75.75 0 00-.574.298l-.926 1.186a.75.75 0 101.148.832l.926-1.186a.75.75 0 00-.574-.298H19.5a2.25 2.25 0 01-2.25-2.25v-.75a2.25 2.25 0 012.25-2.25h1.5a.75.75 0 00.653-.39l1.277-1.916a.75.75 0 00-.832-1.147L19.31 3H18a.75.75 0 00-.574.298L16.24 4.22a.75.75 0 101.148.832l1.186-.926A.75.75 0 0019.148 3H21a.75.75 0 00.652-1.148l-.926-1.186a.75.75 0 00-.574-.298h-.95a.75.75 0 000-1.5h.95c.248 0 .48.114.652.298l.926 1.186A2.25 2.25 0 0119.75 3h.75A2.25 2.25 0 0122.75.75V0a2.25 2.25 0 01-2.25 2.25h-4.5a.75.75 0 00-.653.39L14.07.524a.75.75 0 00.832 1.147l2.608-2.023A.75.75 0 0017.81.75V-1.5a.75.75 0 00-1.5 0V-.75a.75.75 0 00.22.53l-1.39 1.077a.75.75 0 10.832 1.147l1.076-1.39a.75.75 0 00.531-.22H19.5a.75.75 0 00.574-.298l.926-1.186a.75.75 0 10-1.147-.832L18.664.02a.75.75 0 00-.516-.168z" />
    </svg>
);

export const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const LightbulbIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10 2a.75.75 0 01.75.75v1.25a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM5.05 3.96a.75.75 0 011.06 0l.707.707a.75.75 0 01-1.06 1.06l-.707-.707a.75.75 0 010-1.06zm9.9 0a.75.75 0 011.06 0l.707.707a.75.75 0 11-1.06 1.06l-.707-.707a.75.75 0 010-1.06zM3 10a.75.75 0 01.75-.75h1.25a.75.75 0 010 1.5H3.75A.75.75 0 013 10zm13.25 0a.75.75 0 01.75-.75h1.25a.75.75 0 010 1.5h-1.25a.75.75 0 01-.75-.75zM10 4a6 6 0 00-6 6c0 1.913.91 3.65 2.343 4.717.203.158.463.283.74.364V18a.75.75 0 00.75.75h3.834a.75.75 0 00.75-.75v-2.919a5.05 5.05 0 00.74-.364C15.09 13.65 16 11.913 16 10a6 6 0 00-6-6zM8.5 13.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
    </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2A.75.75 0 0010.75 3.5h-5.5A.75.75 0 004.5 4.25v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.75a.75.75 0 000 1.5h9.5a.75.75 0 00.75-.75z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M15.28 6.22a.75.75 0 00-1.06 1.06l2.72 2.72-2.72 2.72a.75.75 0 101.06 1.06l3.25-3.25a.75.75 0 000-1.06l-3.25-3.25z" clipRule="evenodd" />
    </svg>
);

export const MagnifyingGlassIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
    </svg>
);

export const ArrowTopRightOnSquareIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17H4.25A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M6.194 6.194a.75.75 0 011.06 0l5.5 5.5a.75.75 0 11-1.06 1.06l-5.5-5.5a.75.75 0 010-1.06z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12.75 5a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V6.56l-1.06-1.061A.75.75 0 0112.75 5z" clipRule="evenodd" />
    </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
    </svg>
);

export const PencilIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
    </svg>
);


export const SunIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10 3a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 3zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM5.05 5.05a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm9.9 9.9a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM3 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 013 10zm13.25 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM5.05 14.95a.75.75 0 010-1.06l1.06-1.06a.75.75 0 011.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0zm9.9-9.9a.75.75 0 010-1.06l1.06-1.06a.75.75 0 011.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0zM10 7a3 3 0 100 6 3 3 0 000-6z" />
    </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);