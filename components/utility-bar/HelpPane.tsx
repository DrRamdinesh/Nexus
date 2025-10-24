import React from 'react';

const HelpSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">{title}</h3>
        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {children}
        </div>
    </div>
);

export const HelpPane: React.FC = () => {
    return (
        <div className="p-4">
            <HelpSection title="Welcome to Nexus">
                <p>
                    Nexus is your AI-powered command center for project management. It's designed to give you a unified view of all your projects, tasks, and defects, with intelligent assistance to help you stay on track.
                </p>
            </HelpSection>

            <HelpSection title="Dashboard Widgets">
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Project Summary:</strong> Get a quick overview of your projects. Hover over the cards to see which projects fall into each category and click to navigate directly to their detailed view.</li>
                    <li><strong>Immediate Attention:</strong> This widget highlights critical and high-severity defects that need your focus. You can triage them or schedule meetings directly.</li>
                    <li><strong>Task Management:</strong> View and manage all your tasks. Use the filters to narrow down your view. Click directly on a task's title, due date, or priority to edit it inline.</li>
                    <li><strong>AI Assistant:</strong> Interact with PMAssist, your AI helper. Ask questions in natural language about your projects, or use the predefined prompts to get started.</li>
                    <li><strong>Reminder Board & Calendar:</strong> Keep track of your personal reminders and weekly schedule.</li>
                    <li><strong>AI Report Generator:</strong> Create detailed or brief reports for specific projects or vendors, powered by AI analysis.</li>
                    <li><strong>AI Proactive Insights:</strong> Let the AI analyze your project data to find potential risks and suggest actionable improvements.</li>
                </ul>
            </HelpSection>

            <HelpSection title="Using the Utility Bar">
                <p>The sidebar on the left is your main navigation hub. Clicking an icon opens a detailed pane:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                    <li><strong>Projects:</strong> View a filterable list of all your projects. Click any project to open its detailed view in the main dashboard.</li>
                    <li><strong>Defect Analysis:</strong> An AI-powered tool to analyze defect trends, perform root cause analysis (RCA), and get improvement suggestions.</li>
                    <li><strong>Teams:</strong> See a directory of all team members, automatically compiled from task and defect assignments. Filter by project to see who's working on what.</li>
                    <li><strong>Settings:</strong> Configure connections to your external tools like JIRA. Test connections and fetch projects from integrated platforms.</li>
                    <li><strong>User Profile:</strong> Update your personal information and profile picture.</li>
                </ul>
            </HelpSection>
            
            <HelpSection title="Contact & Support">
                <p>For technical support, business inquiries, or feature suggestions, please feel free to reach out to our team.</p>
                <div className="mt-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-md border border-slate-200 dark:border-slate-700 space-y-2">
                    <p><strong>Email:</strong> <a href="mailto:info@botifyx.in" className="text-indigo-600 hover:underline dark:text-indigo-400">info@botifyx.in</a></p>
                    <p><strong>Phone:</strong> <a href="tel:+919566443876" className="text-indigo-600 hover:underline dark:text-indigo-400">+91 95664 43876</a></p>
                    <p><strong>Website:</strong> <a href="https://www.botifyx.in" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">www.botifyx.in</a></p>
                    <p><strong>Address:</strong> Bangalore, Karnataka, India</p>
                </div>
            </HelpSection>
        </div>
    );
};