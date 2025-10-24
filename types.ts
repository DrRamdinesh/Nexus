

export interface TeamMember {
    id: string;
    fullName: string;
    jobTitle: string;
    avatar?: string;
}

export interface UserProfile {
    username: string;
    fullName?: string;
    jobTitle?: string;
    bio?: string;
    avatar?: string; // base64 string
}

export interface Vendor {
    id: string;
    name: string;
    contactPerson: string;
    contactEmail: string;
}

export enum ProjectStatus {
    Green = 'Green',
    Amber = 'Amber',
    Red = 'Red',
}

export enum TaskStatus {
    Pending = 'Pending',
    Upcoming = 'Upcoming',
    Completed = 'Completed',
}

export enum TaskPriority {
    High = 'High',
    Medium = 'Medium',
    Low = 'Low',
}

export enum DefectSeverity {
    Critical = 'Critical',
    High = 'High',
    Medium = 'Medium',
    Low = 'Low',
}

export enum Tool {
    Jira = 'Jira',
    ServiceNow = 'ServiceNow',
    Trello = 'Trello',
    OpenProject = 'OpenProject',
    VersionOne = 'VersionOne',
    Rally = 'Rally',
}

export enum ConnectionStatus {
    Connected = 'Connected',
    Disconnected = 'Disconnected',
    Pending = 'Pending',
}

export interface Project {
    id: string;
    name: string;
    status: ProjectStatus;
    vendorId: string;
    tool: Tool;
    progress: number;
    jiraKey?: string; // For making specific API calls
}

export interface Task {
    id: string;
    title: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    project: string;
    // FIX: Added creationDate to Task interface.
    creationDate: string;
    dependsOn?: string[];
    assignedTo?: string;
}

export interface Defect {
    id: string;
    title: string;
    severity: DefectSeverity;
    project: string;
    creationDate: string;
    triageCall?: string;
    assignedTo?: string;
}

export interface Reminder {
    id: string;
    text: string;
    time: Date;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    invitees?: string[];
}

export interface AITaskSuggestion {
  title: string;
  project: string;
  priority: TaskPriority;
  dueDate: string; // "YYYY-MM-DD" or "TBD"
  assignedTo?: string;
  reasoning: string;
}

export interface ChatMessage {
    id:string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
    taskSuggestion?: AITaskSuggestion;
}

export interface ToolConfiguration {
    id: string;
    tool: Tool;
    username: string;
    password?: string;
    apiKey?: string;
    url: string;
    status: ConnectionStatus;
}

export interface ScheduledReport {
    id: string;
    name: string;
    reportDetailLevel: 'Brief' | 'Detailed';
    targetType: 'Project' | 'Vendor';
    targetName: string;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'One-time';
    time: string; // e.g., "09:00"
    dayOfWeek?: number; // 0 for Sunday, 1 for Monday...
    dayOfMonth?: number; // 1-31
    date?: string; // YYYY-MM-DD for one-time
    recipients: string[];
}

export interface SuggestionAction {
  type: 'schedule_meeting' | 'review_task' | 'none';
  details: {
    title?: string;
    project?: string;
    taskId?: string;
  };
}

export interface ProactiveSuggestion {
  id: string;
  suggestion: string;
  reasoning: string;
  action: SuggestionAction;
}

export interface AlertConfiguration {
    defectSeverities: DefectSeverity[];
    taskPriorities: TaskPriority[];
}

export interface Alert {
    id: string;
    type: 'New Critical Defect' | 'New High-Priority Task' | 'Task Assigned to You';
    itemId: string; // id of the defect or task
    itemType: 'Defect' | 'Task';
    title: string;
    project: string;
    timestamp: Date;
    read: boolean;
}