import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import type { ChatMessage, Task, AITaskSuggestion, Defect } from '../types';
import { TaskStatus } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { SendIcon, UserIcon, AiIcon, PencilIcon, CheckCircleIcon } from '../constants';

interface ChatWidgetProps {
    dataContext: object;
    onSaveTask: (task: Omit<Task, 'id'>) => void;
    onEditTask: (taskData: Partial<Task>) => void;
}

const PredefinedQueryButton: React.FC<{query: string, onQuery: (q: string) => void}> = ({ query, onQuery }) => (
    <button
        onClick={() => onQuery(query)}
        className="text-left w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 p-2 rounded-md text-sm transition-colors text-slate-700 dark:text-slate-300"
    >
        {query}
    </button>
);

export const ChatWidget: React.FC<ChatWidgetProps> = ({ dataContext, onSaveTask, onEditTask }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [suggestionStates, setSuggestionStates] = useState<Map<string, 'created' | 'dismissed'>>(new Map());

    useLayoutEffect(() => {
        // scrollIntoView is called after the DOM is updated but before the browser paints.
        // This ensures that we scroll to the newly rendered message correctly.
        // 'auto' behavior is instant, which is more reliable for chat UIs than 'smooth'.
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }, [messages]);

    useEffect(() => {
        setMessages([
            {
                id: 'init',
                sender: 'ai',
                text: "Hello! I'm Nexa. How can I help you manage your projects today?",
                timestamp: new Date().toLocaleTimeString()
            }
        ]);
    }, []);

    const handleSendMessage = async (query?: string) => {
        const userMessageText = query || input;
        if (!userMessageText.trim()) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: userMessageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const taskRegex = /\b(TASK-\d+)\b/i;
            const defectRegex = /\b(DEF-\d+)\b/i;

            const taskMatch = userMessageText.match(taskRegex);
            const defectMatch = userMessageText.match(defectRegex);

            // Create a mutable copy of the context to potentially augment it
            const contextualDataContext = { ...dataContext };

            if (taskMatch) {
                const taskId = taskMatch[1].toUpperCase();
                // The dataContext prop has a 'tasks' array. We need to cast it to access it.
                const allTasks = (dataContext as any).tasks as Task[];
                const referencedTask = allTasks.find((t: Task) => t.id.toUpperCase() === taskId);
                if (referencedTask) {
                    // Add the specific task to the context for the AI.
                    (contextualDataContext as any).referencedItem = { type: 'Task', details: referencedTask };
                }
            } else if (defectMatch) {
                const defectId = defectMatch[1].toUpperCase();
                // The dataContext prop has a 'defects' array.
                const allDefects = (dataContext as any).defects as Defect[];
                const referencedDefect = allDefects.find((d: Defect) => d.id.toUpperCase() === defectId);
                if (referencedDefect) {
                    // Add the specific defect to the context for the AI.
                    (contextualDataContext as any).referencedItem = { type: 'Defect', details: referencedDefect };
                }
            }

            const aiResponseText = await generateChatResponse(userMessageText, contextualDataContext);
            
            const actionRegex = /\[ACTION:CREATE_TASK\]({.*})/s;
            const match = aiResponseText.match(actionRegex);

            let taskSuggestion: AITaskSuggestion | undefined;
            let cleanText = aiResponseText;

            if (match && match[1]) {
                try {
                    taskSuggestion = JSON.parse(match[1]);
                    cleanText = aiResponseText.replace(actionRegex, '').trim();
                } catch (e) {
                    console.error("Failed to parse task suggestion JSON:", e);
                    taskSuggestion = undefined;
                    cleanText = aiResponseText;
                }
            }
            
            const aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: cleanText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                taskSuggestion,
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: `err-${Date.now()}`,
                sender: 'ai',
                text: 'Sorry, I ran into an issue. Please try again.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCreateSuggestion = (msgId: string, suggestion: AITaskSuggestion) => {
        const newTaskData: Omit<Task, 'id'> = {
            ...suggestion,
            status: TaskStatus.Upcoming,
            creationDate: new Date().toISOString().split('T')[0],
        };
        onSaveTask(newTaskData);
        setSuggestionStates(prev => new Map(prev).set(msgId, 'created'));
    };

    const handleEditSuggestion = (suggestion: AITaskSuggestion) => {
        onEditTask(suggestion);
    };

    const handleDismissSuggestion = (msgId: string) => {
        setSuggestionStates(prev => new Map(prev).set(msgId, 'dismissed'));
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col h-full shadow-lg">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Nexa</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
                {messages.map((msg) => {
                    const suggestionState = suggestionStates.get(msg.id);
                    const showSuggestion = msg.sender === 'ai' && msg.taskSuggestion && !suggestionState;
                    const suggestionCreated = suggestionState === 'created';
                    
                    return (
                         <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            {msg.text.trim() && (
                                <div className={`flex items-start gap-3 w-full ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                    {msg.sender === 'ai' && <div className="w-8 h-8 flex-shrink-0 rounded-full bg-indigo-500 flex items-center justify-center"><AiIcon className="w-5 h-5 text-white" /></div>}
                                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded-bl-none'}`}>
                                        <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
                                        <span className="text-xs text-slate-400 dark:text-slate-400 mt-1 block text-right">{msg.timestamp}</span>
                                    </div>
                                    {msg.sender === 'user' && <div className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center"><UserIcon className="w-5 h-5 text-slate-600 dark:text-white" /></div>}
                                </div>
                            )}

                             {showSuggestion && msg.taskSuggestion && (
                                <div className="pl-11 mt-2 w-full max-w-md animate-fade-in-up">
                                    <div className="bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 p-3 rounded-lg">
                                        <h4 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">AI Task Suggestion</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1 mb-2">"{msg.taskSuggestion.reasoning}"</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{msg.taskSuggestion.title}</p>
                                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 space-x-2 flex flex-wrap gap-y-1">
                                            <span><strong>Project:</strong> {msg.taskSuggestion.project}</span>
                                            <span className="text-slate-300 dark:text-slate-600">|</span>
                                            <span><strong>Priority:</strong> {msg.taskSuggestion.priority}</span>
                                             <span className="text-slate-300 dark:text-slate-600">|</span>
                                            <span><strong>Due:</strong> {msg.taskSuggestion.dueDate}</span>
                                        </div>
                                        <div className="flex justify-end space-x-2 mt-3">
                                            <button onClick={() => handleDismissSuggestion(msg.id)} className="text-xs font-semibold px-2.5 py-1 rounded-md transition-colors bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200">Dismiss</button>
                                            <button onClick={() => handleEditSuggestion(msg.taskSuggestion!)} className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200"><PencilIcon className="w-3 h-3"/><span>Edit</span></button>
                                            <button onClick={() => handleCreateSuggestion(msg.id, msg.taskSuggestion!)} className="text-xs font-semibold px-2.5 py-1 rounded-md transition-colors bg-indigo-600 hover:bg-indigo-700 text-white">Create Task</button>
                                        </div>
                                    </div>
                                </div>
                             )}
                              {suggestionCreated && (
                                <div className="pl-11 mt-2 text-sm text-green-600 dark:text-green-400 font-semibold flex items-center space-x-2 animate-fade-in-up">
                                    <CheckCircleIcon className="w-5 h-5"/>
                                    <span>Task created successfully!</span>
                                </div>
                             )}
                        </div>
                    );
                })}
                {isLoading && (
                     <div className="flex items-start gap-3">
                         <div className="w-8 h-8 flex-shrink-0 rounded-full bg-indigo-500 flex items-center justify-center"><AiIcon className="w-5 h-5 text-white" /></div>
                         <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
                             <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                             </div>
                         </div>
                     </div>
                )}
                {messages.length <= 1 && !isLoading && (
                    <div className="space-y-2">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Try one of these:</p>
                        <PredefinedQueryButton query="Summarize the status of all projects." onQuery={handleSendMessage} />
                        <PredefinedQueryButton query="Which defects require immediate attention?" onQuery={handleSendMessage} />
                        <PredefinedQueryButton query="What are my high-priority pending tasks?" onQuery={handleSendMessage} />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Nexa..."
                            className="w-full bg-slate-100 border border-slate-300 rounded-full py-2 pl-4 pr-12 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                            disabled={isLoading}
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:bg-slate-500" disabled={isLoading || !input.trim()}>
                            <SendIcon className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};