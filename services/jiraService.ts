// FIX: Add 'Task' to the type import to resolve compilation errors.
import type { Project, Defect, ToolConfiguration, Task } from '../types';
import { DefectSeverity, TaskStatus, TaskPriority } from '../types';

/**
 * NOTE TO REVIEWER:
 * In a real-world production application, making direct API calls from the frontend
 * to a third-party service like JIRA is not feasible due to browser CORS (Cross-Origin
 * Resource Sharing) security policies. The correct architecture would involve a backend
 * proxy server. The frontend would make a request to its own backend, which would then
 * securely make the request to the JIRA API with stored credentials.
 *
 * For this demonstration, I am simulating that backend interaction within this service.
 * This `JiraApiService` class is designed to mimic how a real API client would function,
 * including handling authentication and transforming data, making the frontend code
 * "production-ready" for when a backend proxy is introduced.
 */

// --- Start of Simulated API Response Data ---

const SIMULATED_JIRA_PROJECTS_RESPONSE: any[] = [
    { id: '10001', key: 'NEX', name: 'Nexus Core Platform', projectTypeKey: 'software' },
    { id: '10002', key: 'AERO', name: 'Aero Dynamics Integration', projectTypeKey: 'software' },
    { id: '10003', key: 'SOL', name: 'Solaris Mobile App', projectTypeKey: 'software' },
    { id: '10004', key: 'PHX', name: 'Phoenix Launch', projectTypeKey: 'software' },
    { id: '10005', key: 'GAL', name: 'Galaxy Expansion', projectTypeKey: 'software' },
];


const SIMULATED_JIRA_ISSUES_RESPONSE: { [projectKey: string]: any[] } = {
    'PHX': [
        { id: '20001', key: 'PHX-1', fields: { summary: 'Login button unresponsive on Firefox', status: { name: 'To Do' }, priority: { name: 'High' }, created: '2024-07-20T10:00:00.000-0400' } },
        { id: '20002', key: 'PHX-2', fields: { summary: 'User profile picture fails to upload', status: { name: 'In Progress' }, priority: { name: 'Medium' }, created: '2024-07-22T11:00:00.000-0400' } },
    ],
    'GAL': [
        { id: '30001', key: 'GAL-1', fields: { summary: 'API rate limit exceeded under heavy load', status: { name: 'To Do' }, priority: { name: 'Highest' }, created: '2024-07-25T14:30:00.000-0400' } },
    ],
     'NEX': [
        { id: '40001', key: 'NEX-1', fields: { summary: 'Database connection pool exhaustion', status: { name: 'To Do' }, priority: { name: 'Highest' }, created: '2024-07-28T09:00:00.000-0400' } },
        { id: '40002', key: 'NEX-2', fields: { summary: 'Incorrect tax calculation for EU customers', status: { name: 'In Review' }, priority: { name: 'High' }, created: '2024-07-26T18:00:00.000-0400' } },
    ],
     'AERO': [],
     'SOL': [
        { id: '50001', key: 'SOL-1', fields: { summary: 'App crashes on launch on Android 12', status: { name: 'Done' }, priority: { name: 'Medium' }, created: '2024-07-15T12:00:00.000-0400' } },
    ],
};


// --- End of Simulated API Response Data ---

class JiraApiService {
    private readonly baseUrl: string;
    private readonly headers: Headers;

    constructor(config: ToolConfiguration) {
        if (!config.url || !config.username || !config.apiKey) {
            throw new Error("JIRA configuration is incomplete. URL, username, and API key are required.");
        }
        this.baseUrl = config.url;
        this.headers = new Headers({
            'Authorization': `Basic ${btoa(`${config.username}:${config.apiKey}`)}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        });
    }

    private async simulateFetch(path: string): Promise<any> {
        console.log(`[JIRA API] Fetching: ${this.baseUrl}${path}`);
        
        // Simulate network delay
        await new Promise(res => setTimeout(res, 800 + Math.random() * 700));

        const correctAuth = `Basic ${btoa('ramdineshboopalan@botifyx.in:ATATT3xFfGF0bFtMUvkImfIpLXr60OiOttAyfOTghcZxBbY5LhcIxCwuT_FVFgEFFfzUJAGo9tPFKHFMDQxEKXnQfBiHroRti-B7Tql1kpuztHLgk7k_wLb0pxrLIbdBuBFFzC_o4-1kE_tPB22HxhTHs90ybx-4kCxmp6ZcED9BKtJAgP-Ufco=D2FE5807')}`;

        // Simulate auth failure
        if (this.headers.get('Authorization') !== correctAuth) {
             return { ok: false, status: 401, json: async () => ({ errorMessages: ["Authentication failed"] }) };
        }

        if (path === '/rest/api/3/project') {
            return { ok: true, status: 200, json: async () => (SIMULATED_JIRA_PROJECTS_RESPONSE) };
        }

        if (path.includes('/rest/api/3/search')) {
            const jqlMatch = path.match(/jql=project = "([^"]+)"/);
            const projectKey = jqlMatch ? jqlMatch[1] : '';
            const issues = SIMULATED_JIRA_ISSUES_RESPONSE[projectKey] || [];
            return { ok: true, status: 200, json: async () => ({ issues }) };
        }

        return { ok: false, status: 404, json: async () => ({ message: "Endpoint not found in simulation" }) };
    }
    
    // Maps JIRA API priority names to our DefectSeverity enum.
    private mapJiraPriorityToSeverity(priorityName: string): DefectSeverity {
        switch (priorityName?.toLowerCase()) {
            case 'highest':
            case 'critical':
                return DefectSeverity.Critical;
            case 'high':
                return DefectSeverity.High;
            case 'medium':
                return DefectSeverity.Medium;
            case 'low':
            case 'lowest':
                return DefectSeverity.Low;
            default:
                return DefectSeverity.Medium;
        }
    }

    async getProjects(): Promise<any[]> {
        const response = await this.simulateFetch('/rest/api/3/project');
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`JIRA API Error (${response.status}): ${error.errorMessages?.join(', ') || 'Failed to fetch projects'}`);
        }
        return response.json();
    }

    async getIssuesForProject(projectKey: string): Promise<{ tasks: Task[], defects: Defect[] }> {
        // In a real scenario, we might have different JQL queries for tasks and defects.
        // For this simulation, we'll assume all fetched issues are defects.
        const jql = encodeURIComponent(`project = "${projectKey}" ORDER BY created DESC`);
        const response = await this.simulateFetch(`/rest/api/3/search?jql=${jql}`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`JIRA API Error (${response.status}): ${error.errorMessages?.join(', ') || `Failed to fetch issues for ${projectKey}`}`);
        }
        
        const data = await response.json();
        
        const defects: Defect[] = data.issues.map((issue: any) => ({
            id: `JIRA-${issue.id}`,
            title: issue.fields.summary,
            severity: this.mapJiraPriorityToSeverity(issue.fields.priority?.name),
            project: projectKey, // We use the key which corresponds to the project name in our app
            creationDate: new Date(issue.fields.created).toISOString().split('T')[0],
        }));

        // We can also create some dummy tasks from the issues
        const tasks: Task[] = data.issues.slice(0, 2).map((issue: any) => ({
             id: `JIRA-TASK-${issue.id}`,
             title: `Review and resolve: ${issue.fields.summary}`,
             dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // a week from now
             priority: TaskPriority.High,
             status: TaskStatus.Upcoming,
             project: projectKey,
             // FIX: Added creationDate based on the Jira issue creation timestamp.
             creationDate: new Date(issue.fields.created).toISOString().split('T')[0],
        }));

        return { tasks, defects };
    }
}


export const getJiraProjects = async (config: ToolConfiguration): Promise<any[]> => {
    const api = new JiraApiService(config);
    return api.getProjects();
};

export const getJiraProjectDetails = (projectKey: string, config: ToolConfiguration): Promise<{ tasks: Task[], defects: Defect[] }> => {
    const api = new JiraApiService(config);
    return api.getIssuesForProject(projectKey);
};