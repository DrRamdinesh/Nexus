import { Project, Tool, ToolConfiguration, ProjectStatus, Task, Defect, TaskStatus, TaskPriority, DefectSeverity } from '../types';
import { getJiraProjects, getJiraProjectDetails } from './jiraService';

// Simulate a database of projects for different tools
const SIMULATED_PROJECTS_DB: Record<Tool, any[]> = {
    [Tool.Jira]: [], // This will now be fetched from the jiraService
    [Tool.OpenProject]: [
        { identifier: 'alpha-one', name: 'Project Alpha One' },
        { identifier: 'beta-two', name: 'Project Beta Two' },
    ],
    [Tool.Trello]: [
        { id: 'trello1', name: 'Q4 Marketing Campaign Board' },
        { id: 'trello2', name: 'Website Redesign 2024' },
    ],
    [Tool.Rally]: [
        { FormattedID: 'P1', Name: 'Enterprise Data Warehouse Initiative' },
    ],
    [Tool.ServiceNow]: [],
    [Tool.VersionOne]: [],
};

// Simulate tasks and defects associated with projects from various tools
const SIMULATED_TASKS_DB: Record<string, any[]> = {
    'JIRA-10001': [ // NEX
        // FIX: Added 'created' property to simulated tasks.
        { id: 'NEX-T1', summary: 'Setup CI/CD pipeline', status: 'In Progress', priority: 'High', assignee: 'Alice', created: '2024-07-20T10:00:00.000-0400' },
        { id: 'NEX-T2', summary: 'Develop authentication module', status: 'To Do', priority: 'High', assignee: 'Bob', created: '2024-07-22T11:00:00.000-0400' },
        { id: 'NEX-T3', summary: 'Design database schema', status: 'Done', priority: 'Medium', assignee: 'Alice', created: '2024-07-24T12:00:00.000-0400' },
    ],
    'JIRA-10002': [ // AERO
        { id: 'AERO-T1', summary: 'Integrate with flight control API', status: 'To Do', priority: 'High', assignee: 'Charlie', created: '2024-07-25T13:00:00.000-0400' },
    ],
    'OP-alpha-one': [
        { subject: 'Initial requirement gathering', status: 'In progress', priority: 'High', created: '2024-07-20T14:00:00.000-0400' },
        { subject: 'Create user stories', status: 'New', priority: 'Normal', created: '2024-07-22T15:00:00.000-0400' },
    ],
    'TR-trello1': [
        { name: 'Draft ad copy', due: new Date(Date.now() + 3 * 24*60*60*1000).toISOString(), labels: [{name: 'High'}], created: '2024-07-20T16:00:00.000-0400' },
        { name: 'Book social media posts', due: null, labels: [], created: '2024-07-22T17:00:00.000-0400' },
    ]
};

const SIMULATED_DEFECTS_DB: Record<string, any[]> = {
    'JIRA-10001': [ // NEX
        { id: '40001', key: 'NEX-1', summary: 'Database connection pool exhaustion', status: 'To Do', priority: 'Highest', created: '2024-07-28T09:00:00.000-0400' },
        { id: '40002', key: 'NEX-2', summary: 'Incorrect tax calculation for EU customers', status: 'In Review', priority: 'High', created: '2024-07-26T18:00:00.000-0400' },
    ],
    'JIRA-10003': [ // SOL
        { id: '50001', key: 'SOL-1', summary: 'App crashes on launch on Android 12', status: 'Done', priority: 'Medium', created: '2024-07-15T12:00:00.000-0400' },
    ],
    'OP-alpha-one': [
        { subject: 'UI alignment issue on Firefox', priority: 'High', type: 'Bug' },
    ]
};


// Transformation functions to map API responses to our Project type
const transformJiraProject = (p: any, index: number): Project => ({
    id: `JIRA-${p.id}`,
    name: p.name,
    jiraKey: p.key,
    tool: Tool.Jira,
    vendorId: ['VENDOR-A', 'VENDOR-B', 'VENDOR-C'][index % 3],
    status: [ProjectStatus.Green, ProjectStatus.Amber, ProjectStatus.Red][index % 3],
    progress: Math.floor(Math.random() * 51) + 25,
});

const transformOpenProjectProject = (p: any, index: number): Project => ({
    id: `OP-${p.identifier}`,
    name: p.name,
    tool: Tool.OpenProject,
    vendorId: ['VENDOR-A', 'VENDOR-B'][index % 2],
    status: [ProjectStatus.Green, ProjectStatus.Amber][index % 2],
    progress: Math.floor(Math.random() * 61) + 20,
});

const transformTrelloProject = (p: any, index: number): Project => ({
    id: `TR-${p.id}`,
    name: p.name,
    tool: Tool.Trello,
    vendorId: ['VENDOR-C', 'VENDOR-A'][index % 2],
    status: [ProjectStatus.Amber, ProjectStatus.Green][index % 2],
    progress: Math.floor(Math.random() * 71) + 15,
});

const transformRallyProject = (p: any, index: number): Project => ({
    id: `RA-${p.FormattedID}`,
    name: p.Name,
    tool: Tool.Rally,
    vendorId: ['VENDOR-B', 'VENDOR-C'][index % 2],
    status: [ProjectStatus.Red, ProjectStatus.Green][index % 2],
    progress: Math.floor(Math.random() * 41) + 10,
});

// Task Transformers
const transformJiraTask = (issue: any, project: Project): Task => ({
    id: `JIRA-TASK-${issue.id}`,
    title: issue.summary,
    project: project.name,
    status: { 'To Do': TaskStatus.Upcoming, 'In Progress': TaskStatus.Pending, 'Done': TaskStatus.Completed }[issue.status] || TaskStatus.Upcoming,
    priority: { 'High': TaskPriority.High, 'Highest': TaskPriority.High, 'Medium': TaskPriority.Medium, 'Low': TaskPriority.Low, 'Lowest': TaskPriority.Low }[issue.priority] || TaskPriority.Medium,
    dueDate: 'TBD',
    creationDate: new Date(issue.created).toISOString().split('T')[0],
    assignedTo: issue.assignee,
});

// Defect Transformers
const transformJiraDefect = (issue: any, project: Project): Defect => ({
    id: `JIRA-DEFECT-${issue.id}`,
    title: issue.summary,
    project: project.name,
    severity: { 'High': DefectSeverity.High, 'Highest': DefectSeverity.Critical, 'Medium': DefectSeverity.Medium, 'Low': DefectSeverity.Low, 'Lowest': DefectSeverity.Low }[issue.priority] || DefectSeverity.Medium,
    creationDate: new Date(issue.created).toISOString().split('T')[0],
});


export const fetchProjectsFromTool = async (config: ToolConfiguration): Promise<Project[]> => {
    // Simulate network delay
    await new Promise(res => setTimeout(res, 1000));
    
    switch (config.tool) {
        case Tool.Jira:
            // For Jira, we make a "real" (simulated) API call
            try {
                const jiraProjects = await getJiraProjects(config);
                return jiraProjects.map(transformJiraProject);
            } catch (error) {
                console.error("Jira project fetch failed:", error);
                throw error;
            }
            
        case Tool.OpenProject:
            return SIMULATED_PROJECTS_DB[Tool.OpenProject].map(transformOpenProjectProject);

        case Tool.Trello:
            if (config.apiKey !== 'VALID_TRELLO_KEY') throw new Error("Invalid Trello API Key.");
            return SIMULATED_PROJECTS_DB[Tool.Trello].map(transformTrelloProject);
            
        case Tool.Rally:
             if (config.password !== 'VALID_PASSWORD') throw new Error("Invalid Rally Password.");
            return SIMULATED_PROJECTS_DB[Tool.Rally].map(transformRallyProject);

        default:
            console.warn(`Project fetching not implemented for ${config.tool}`);
            return [];
    }
};

export const getProjectDetails = async (
    project: Project, 
    config: ToolConfiguration
): Promise<{ updatedProject: Project, tasks: Task[], defects: Defect[] }> => {
    // Simulate network delay for fetching details
    await new Promise(res => setTimeout(res, 1200));

    let tasks: Task[] = [];
    let defects: Defect[] = [];

    switch (project.tool) {
        case Tool.Jira:
            if (project.jiraKey) {
                try {
                    const jiraIssues = await getJiraProjectDetails(project.jiraKey, config);
                    tasks = jiraIssues.tasks;
                    defects = jiraIssues.defects;
                } catch (error) {
                    console.error(`Failed to get JIRA details for ${project.jiraKey}`, error);
                    throw error;
                }
            }
            break;

        default:
            // For other tools, pull from the simulated DB
            tasks = (SIMULATED_TASKS_DB[project.id] || []).map(t => transformGenericTask(t, project));
            defects = (SIMULATED_DEFECTS_DB[project.id] || []).map(d => transformGenericDefect(d, project));
            break;
    }
    
    // Simulate a small change in project progress/status upon refresh
    const updatedProject = {
        ...project,
        progress: Math.min(100, project.progress + Math.floor(Math.random() * 5)),
    };
    
    return { updatedProject, tasks, defects };
};


// Generic transformers for other simulated tools
const transformGenericTask = (data: any, project: Project): Task => ({
    id: `${project.tool.substring(0,2).toUpperCase()}-TASK-${Math.random()}`,
    title: data.summary || data.subject || data.name,
    project: project.name,
    status: TaskStatus.Upcoming,
    priority: TaskPriority.Medium,
    dueDate: 'TBD',
    // FIX: Added creationDate using simulated data or a default.
    creationDate: data.created ? new Date(data.created).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
});

const transformGenericDefect = (data: any, project: Project): Defect => ({
    id: `${project.tool.substring(0,2).toUpperCase()}-DEFECT-${Math.random()}`,
    title: data.summary || data.subject || data.name,
    project: project.name,
    severity: DefectSeverity.Medium,
    creationDate: new Date().toISOString().split('T')[0],
});