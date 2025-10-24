import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './Header';
import { ImmediateAttentionWidget } from './ImmediateAttentionWidget';
import { TaskWidget } from './TaskWidget';
import { ReminderBoardWidget } from './ReminderBoardWidget';
import { CalendarWidget } from './CalendarWidget';
import { ReportGenerationWidget } from './ReportGenerationWidget';
import { ChatWidget } from './ChatWidget';
import { ProactiveSuggestionsWidget } from './ProactiveSuggestionsWidget';
import { ScheduledReportsWidget } from './ScheduledReportsWidget';
import { UtilityBar } from './utility-bar';
import { MOCK_PROJECTS, MOCK_DEFECTS, MOCK_TASKS, MOCK_REMINDERS, MOCK_EVENTS, MOCK_TOOL_CONFIGURATIONS, MOCK_VENDORS, MOCK_TEAM_MEMBERS } from '../constants';
import type { Project, Defect, Task, Reminder, CalendarEvent, ToolConfiguration, ScheduledReport, SuggestionAction, Vendor, UserProfile, TeamMember, Alert, AlertConfiguration } from '../types';
import { DefectSeverity, TaskPriority, TaskStatus } from '../types';
import { loadToolConfigurations, saveToolConfigurations, loadUserProfile, saveUserProfile, loadAlertConfiguration, saveAlertConfiguration } from '../services/storageService';
import { ProjectView } from './ProjectView';
import { ProjectStatusWidget } from './ProjectStatusWidget';
import { NewTaskModal } from './NewTaskModal';

interface DashboardProps {
    username: string;
    onLogout: () => void;
}

const DEFAULT_ALERT_CONFIG: AlertConfiguration = {
    defectSeverities: [DefectSeverity.Critical],
    taskPriorities: [TaskPriority.High],
};

export const Dashboard: React.FC<DashboardProps> = ({ username, onLogout }) => {
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
    const [defects, setDefects] = useState<Defect[]>(MOCK_DEFECTS);
    const [vendors] = useState<Vendor[]>(MOCK_VENDORS);
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
    const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);
    const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
    const [teamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
    const [toolConfigs, setToolConfigs] = useState<ToolConfiguration[]>(() => {
        return loadToolConfigurations() || MOCK_TOOL_CONFIGURATIONS;
    });
    const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
    const [activePane, setActivePane] = useState<string | null>(null);
    const [projectForDetailView, setProjectForDetailView] = useState<Project | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(() => loadUserProfile(username));

    const [isAddingTask, setIsAddingTask] = useState(false);
    const [prefilledTask, setPrefilledTask] = useState<Partial<Task> | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const [highlightedItem, setHighlightedItem] = useState<{ type: string; id: string } | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [alertConfig, setAlertConfig] = useState<AlertConfiguration>(() => loadAlertConfiguration() || DEFAULT_ALERT_CONFIG);
    
    useEffect(() => {
        saveAlertConfiguration(alertConfig);
    }, [alertConfig]);

    const handleDataRefresh = useCallback(async () => {
        console.log('Refreshing data and generating alerts based on config:', alertConfig);
        return new Promise(resolve => {
            setTimeout(() => {
                let newAlert: Alert | null = null;
                
                if (Math.random() > 0.5) {
                    const newDefect: Defect = {
                        id: `DEF-CRIT-${Date.now()}`,
                        title: `[NEW] Live Site Login API failing at ${new Date().toLocaleTimeString()}`,
                        severity: DefectSeverity.Critical,
                        project: 'Phoenix Launch',
                        creationDate: new Date().toISOString().split('T')[0],
                        triageCall: 'Triage immediately',
                        assignedTo: 'Alice'
                    };
                    if (alertConfig.defectSeverities.includes(newDefect.severity)) {
                        setDefects(prev => [newDefect, ...prev]);
                        newAlert = {
                            id: `alert-def-${newDefect.id}`,
                            type: 'New Critical Defect',
                            itemId: newDefect.id,
                            itemType: 'Defect',
                            title: newDefect.title,
                            project: newDefect.project,
                            timestamp: new Date(),
                            read: false,
                        };
                    }
                } else {
                     const newTask: Task = {
                        id: `TASK-HIGH-${Date.now()}`,
                        title: `[NEW] Urgent review for Q3 financials`,
                        dueDate: new Date().toISOString().split('T')[0],
                        priority: TaskPriority.High,
                        status: TaskStatus.Pending,
                        project: 'Galaxy Expansion',
                        assignedTo: username,
                        // FIX: Added creationDate to new task.
                        creationDate: new Date().toISOString().split('T')[0],
                    };
                    if (alertConfig.taskPriorities.includes(newTask.priority)) {
                        setTasks(prev => [newTask, ...prev]);
                        newAlert = {
                            id: `alert-task-${newTask.id}`,
                            type: 'New High-Priority Task',
                            itemId: newTask.id,
                            itemType: 'Task',
                            title: newTask.title,
                            project: newTask.project,
                            timestamp: new Date(),
                            read: false,
                        };
                    }
                }
                
                if (newAlert) {
                    const finalAlert = newAlert;
                    setAlerts(prev => {
                        if (prev.find(a => a.itemId === finalAlert.itemId)) return prev;
                        return [finalAlert, ...prev].slice(0, 20);
                    });
                }
    
                setLastRefreshed(new Date());
                console.log('Data refreshed.');
                resolve(true);
            }, 2000); 
        });
    }, [username, alertConfig]);

    useEffect(() => {
        handleDataRefresh(); 
        const intervalId = setInterval(handleDataRefresh, 15 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, [handleDataRefresh]);

    useEffect(() => {
        if (activePane === 'alerts') {
            const timer = setTimeout(() => {
                setAlerts(prev => prev.map(a => ({ ...a, read: true })));
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [activePane]);

    useEffect(() => {
        saveToolConfigurations(toolConfigs);
    }, [toolConfigs]);
    
    const chatDataContext = useMemo(() => {
        return {
            selectedProject: projectForDetailView,
            projects, 
            tasks: projectForDetailView 
                ? tasks.filter(t => t.project === projectForDetailView.name || t.project === 'All Projects') 
                : tasks,
            defects: projectForDetailView 
                ? defects.filter(d => d.project === projectForDetailView.name || d.project === 'All Projects') 
                : defects,
            reminders,
            events,
        };
    }, [projectForDetailView, projects, tasks, defects, reminders, events]);

    const handleSearchResultClick = (type: 'Project' | 'Task' | 'Defect', id: string) => {
        if (type === 'Project') {
            const project = projects.find(p => p.id === id);
            if (project) {
                setProjectForDetailView(project);
            }
        } else {
            if (projectForDetailView) {
                setProjectForDetailView(null);
            }
            setHighlightedItem({ type, id });

            setTimeout(() => {
                setHighlightedItem(null);
            }, 3000);
        }
    };
    
    const handleAlertClick = (alert: Alert) => {
        handleSearchResultClick(alert.itemType, alert.itemId);
        setActivePane(null); // Close the pane after clicking
    };

    const handleTeamItemClick = (type: 'Task' | 'Defect', id: string) => {
        // Close project view if open
        if (projectForDetailView) {
            setProjectForDetailView(null);
        }
        // Close the utility pane
        setActivePane(null);
        
        // Set the item to be highlighted
        setHighlightedItem({ type, id });

        // Clear the highlight after a few seconds
        setTimeout(() => {
            setHighlightedItem(null);
        }, 3000);
    };

    const handleAddEvent = (newEventData: Omit<CalendarEvent, 'id'>) => {
        const newEvent: CalendarEvent = {
            ...newEventData,
            id: `EVT-${Date.now()}`,
        };
        setEvents(prevEvents => [...prevEvents, newEvent]);
    };
    
    const handleScheduleReport = (scheduleData: Omit<ScheduledReport, 'id'>) => {
        const newSchedule: ScheduledReport = {
            ...scheduleData,
            id: `SCH-${Date.now()}`,
        };
        setScheduledReports(prev => [...prev, newSchedule]);
    };

    const handleDeleteSchedule = (scheduleId: string) => {
        setScheduledReports(prev => prev.filter(s => s.id !== scheduleId));
    };

    const handleTakeSuggestionAction = (action: SuggestionAction) => {
        console.log('Acting on suggestion:', action);
        switch (action.type) {
            case 'schedule_meeting':
                if (action.details.title) {
                    const newEvent: Omit<CalendarEvent, 'id'> = {
                        title: action.details.title,
                        start: new Date(),
                        end: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour from now
                    };
                    handleAddEvent(newEvent);
                }
                break;
            case 'review_task':
                if (action.details.taskId) {
                    const task = tasks.find(t => t.id === action.details.taskId);
                    if (task?.project) {
                        const project = projects.find(p => p.name === task.project);
                        if (project) {
                            setProjectForDetailView(project);
                        }
                    }
                }
                break;
            case 'none':
            default:
                console.log('Acknowledged suggestion.');
                break;
        }
    };
    
    const handleUpdateProfile = (updatedProfile: UserProfile) => {
        setUserProfile(updatedProfile);
        saveUserProfile(updatedProfile);
    };
    
    const handleSaveNewTask = (newTaskData: Omit<Task, 'id'>) => {
        const newTask: Task = {
            ...newTaskData,
            id: `TASK-${Date.now()}`,
        };
        setTasks(prevTasks => [...prevTasks, newTask]);
        setIsAddingTask(false);
        setPrefilledTask(null);
    };

    const handleEditTaskSuggestion = (taskData: Partial<Task>) => {
        setPrefilledTask(taskData);
        setIsAddingTask(true);
    };
    
    const projectNamesForModal = useMemo(() => {
        const uniqueProjects = new Set(tasks.map(t => t.project).filter(p => p !== 'All Projects'));
        projects.forEach(p => uniqueProjects.add(p.name));
        return Array.from(uniqueProjects);
    }, [tasks, projects]);


    return (
        <div className="h-screen font-sans">
            <NewTaskModal
                isOpen={isAddingTask}
                onClose={() => {
                    setIsAddingTask(false);
                    setPrefilledTask(null);
                }}
                onSave={handleSaveNewTask}
                projectNames={projectNamesForModal}
                allTasks={tasks}
                initialData={prefilledTask}
            />
            <div className="flex h-full">
                <UtilityBar 
                    activePane={activePane} 
                    setActivePane={setActivePane} 
                    onLogout={onLogout}
                    username={username}
                    userProfile={userProfile}
                    onUpdateProfile={handleUpdateProfile}
                    projects={projects}
                    setProjects={setProjects}
                    vendors={vendors}
                    tasks={tasks}
                    defects={defects}
                    teamMembers={teamMembers}
                    toolConfigs={toolConfigs}
                    setToolConfigs={setToolConfigs}
                    setProjectForDetailView={setProjectForDetailView}
                    alerts={alerts}
                    setAlerts={setAlerts}
                    alertConfig={alertConfig}
                    setAlertConfig={setAlertConfig}
                    onAlertClick={handleAlertClick}
                    onItemClick={handleTeamItemClick}
                />
                <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${activePane ? 'pl-20 md:pl-96' : 'pl-20'}`}>
                    <Header 
                        username={username}
                        userProfile={userProfile}
                        onLogout={onLogout}
                        projects={projects}
                        tasks={tasks}
                        defects={defects}
                        onSearchResultClick={handleSearchResultClick}
                    />
                    <main className="flex-1 overflow-y-auto">
                        <div className="p-4 sm:p-6 lg:p-8">
                             {projectForDetailView ? (
                                <ProjectView 
                                    project={projectForDetailView}
                                    vendors={vendors}
                                    tasks={tasks}
                                    defects={defects}
                                    onBack={() => setProjectForDetailView(null)}
                                    toolConfigs={toolConfigs}
                                    setProjects={setProjects}
                                    setTasks={setTasks}
                                    setDefects={setDefects}
                                />
                             ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:items-start">
                                    {/* Main Content Column */}
                                    <div className="lg:col-span-2 xl:col-span-3">
                                        <ProjectStatusWidget projects={projects} onViewProject={setProjectForDetailView} />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                            {/* Left column */}
                                            <div className="flex flex-col gap-6">
                                                <ImmediateAttentionWidget 
                                                    defects={defects} 
                                                    setDefects={setDefects}
                                                    projects={projects}
                                                    onAddEvent={handleAddEvent}
                                                    toolConfigs={toolConfigs} 
                                                    lastRefreshed={lastRefreshed}
                                                    onRefresh={handleDataRefresh}
                                                    highlightedItemId={highlightedItem?.type === 'Defect' ? highlightedItem.id : null}
                                                />
                                                <TaskWidget 
                                                    title="Task Management" 
                                                    allTasks={tasks} 
                                                    setTasks={setTasks}
                                                    onAddTask={() => setIsAddingTask(true)}
                                                    highlightedItemId={highlightedItem?.type === 'Task' ? highlightedItem.id : null}
                                                />
                                                 <ProactiveSuggestionsWidget tasks={tasks} projects={projects} onTakeAction={handleTakeSuggestionAction} />
                                            </div>

                                            {/* Right column */}
                                            <div className="flex flex-col gap-6">
                                                <ReminderBoardWidget reminders={reminders} setReminders={setReminders} />
                                                <CalendarWidget events={events} onAddEvent={handleAddEvent} />
                                                <div className="space-y-6">
                                                    <ReportGenerationWidget 
                                                        dataContext={{ projects, tasks, defects, vendors }} 
                                                        onScheduleReport={handleScheduleReport} 
                                                    />
                                                    <ScheduledReportsWidget schedules={scheduledReports} onDeleteSchedule={handleDeleteSchedule} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chat Column */}
                                    <div className="lg:col-span-1 xl:col-span-1">
                                      <div className="lg:sticky lg:top-8 h-[calc(100vh-8rem)]">
                                        <ChatWidget 
                                            dataContext={chatDataContext} 
                                            onSaveTask={handleSaveNewTask}
                                            onEditTask={handleEditTaskSuggestion}
                                        />
                                      </div>
                                    </div>
                                </div>
                             )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};