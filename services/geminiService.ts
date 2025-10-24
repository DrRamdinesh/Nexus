import { GoogleGenAI, Type } from "@google/genai";
import type { Task, Project, ProactiveSuggestion, Defect } from '../types';

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}

// FIX: Initialize GoogleGenAI with a named apiKey parameter.
const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = 'gemini-2.5-flash';

export const generateChatResponse = async (userPrompt: string, dataContext: object): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key is not configured.";
  }

  const systemInstruction = `You are a world-class AI assistant for a Project Manager. Your name is 'Nexa'. 
  Your role is to provide concise, accurate, and actionable information based *only* on the data provided in the context.
  Analyze the user's request and the provided JSON data to answer questions about project status, defects, tasks, and schedule.
  Be helpful and proactive. If a project is in trouble, highlight it. If a critical task is overdue, mention it.
  Keep your responses clear and well-formatted. Use markdown for lists and emphasis where appropriate.
  
  **IMPORTANT PROACTIVE TASK:** After responding to the user's query, you MUST check the 'defects' array in the context. If you find any defect with "severity": "Critical", proactively suggest a next step. For example: "I also noticed a critical defect '[defect title]' for project '[project name]'. Would you like to schedule a triage call?"
  
  **TASK CREATION ACTION:** If your response suggests that a new task should be created based on the conversation, you MUST append a special token with a JSON payload at the very end of your response. The format MUST be \`[ACTION:CREATE_TASK]{"title": "...", "project": "...", "priority": "Medium", "dueDate": "YYYY-MM-DD", "assignedTo": "...", "reasoning": "..."}\`.
  - Fill in the fields as best as you can from the conversation. 
  - For 'priority', choose from "High", "Medium", or "Low".
  - Use "TBD" for 'dueDate' if it is not specified.
  - Omit 'assignedTo' if not mentioned.
  - The 'reasoning' should be a brief explanation for why the task is needed.
  - Do NOT include this token if you are not certain a task should be created.
  
  Do not invent any information not present in the context.`;

  const prompt = `
    CONTEXT:
    \`\`\`json
    ${JSON.stringify(dataContext, null, 2)}
    \`\`\`

    USER'S REQUEST: "${userPrompt}"

    Based on the context above, please provide a response.
  `;

  try {
    // FIX: Use the recommended ai.models.generateContent method.
    const response = await ai.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.5,
            topP: 0.95,
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `I'm sorry, I encountered an error: ${error.message}`;
    }
    return "I'm sorry, I encountered an unknown error while processing your request.";
  }
};


export const generateProjectReport = async (reportContext: object, reportDetailLevel: 'Brief' | 'Detailed'): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key is not configured.";
  }
  
  const systemInstruction = `You are a senior project management analyst AI. Your task is to generate a comprehensive, actionable report based on the provided project data. Focus on clarity, insight, and concrete recommendations. Structure your output using Markdown for readability. Use headings, bullet points, and bold text to organize the information.`;

  let specificInstructions = '';
  if (reportDetailLevel === 'Brief') {
      specificInstructions = `
      ### 1. High-Level Summary
      Provide a brief, executive-level summary (2-3 sentences) of the current status of the selected scope (project/vendor). Focus only on the most critical information.

      ### 2. Key Blockers
      - List ONLY 'Critical' severity defects that are currently blocking progress.
      - Mention any overdue high-priority tasks that are dependencies for other work.
      `;
  } else { // Detailed
      specificInstructions = `
      ### 1. High-Level Summary
      Provide a brief, executive-level summary of the current status of the selected scope (project/vendor).

      ### 2. Path to Completion & AI Insights
      - Analyze the project's progress and remaining tasks.
      - Identify key risks or opportunities that could impact successful completion.
      - Provide actionable insights or recommendations to keep the project on track.

      ### 3. Dependency Analysis
      - Identify any critical task dependencies, especially where an incomplete task is blocking others.
      - Highlight potential bottlenecks in the workflow.

      ### 4. Blocking Defects & Resolution Suggestions
      - List any 'Critical' or 'High' severity defects.
      - For each defect, provide a concise, actionable suggestion for resolution (e.g., "Schedule an immediate triage call with the dev lead," "Escalate to the vendor support channel," "Allocate an engineer to investigate the API timeout.").
      `;
  }

  const prompt = `
    CONTEXT DATA:
    \`\`\`json
    ${JSON.stringify(reportContext, null, 2)}
    \`\`\`

    Based on the context data above, please generate a ${reportDetailLevel} report with the following sections:
    ${specificInstructions}
  `;

  try {
    // FIX: Use the recommended ai.models.generateContent method.
    const response = await ai.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.6,
            topP: 0.95,
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for report:", error);
     if (error instanceof Error) {
        return `Error generating report: ${error.message}`;
    }
    return "An unknown error occurred while generating the report.";
  }
};

export const generateProactiveSuggestions = async (tasks: Task[], projects: Project[]): Promise<ProactiveSuggestion[]> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const systemInstruction = `You are a proactive project management strategist AI. Your goal is to analyze task and project data to identify risks and opportunities. Return your findings as a JSON array of actionable suggestion objects.`;

  const prompt = `
    CONTEXT DATA:
    \`\`\`json
    {
      "projects": ${JSON.stringify(projects, null, 2)},
      "tasks": ${JSON.stringify(tasks, null, 2)}
    }
    \`\`\`

    Based on the provided data, generate a JSON array of 3-4 proactive suggestions. Each object in the array must conform to the provided JSON schema.
    
    For each suggestion, provide:
    1.  'suggestion': A concise title for the suggestion.
    2.  'reasoning': A brief explanation for why this suggestion is important, based on the data.
    3.  'action': An object describing a concrete next step.
        - 'type': Can be 'schedule_meeting', 'review_task', or 'none'.
        - 'details': An object with relevant information. For 'schedule_meeting', include a 'title'. For 'review_task', include the 'taskId' of the relevant task.
    
    Example for a meeting suggestion: "action": { "type": "schedule_meeting", "details": { "title": "Triage for Project Orion" } }
    Example for a task review: "action": { "type": "review_task", "details": { "taskId": "TASK-103" } }
  `;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        suggestion: { type: Type.STRING },
        reasoning: { type: Type.STRING },
        action: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['schedule_meeting', 'review_task', 'none'] },
            details: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                project: { type: Type.STRING },
                taskId: { type: Type.STRING },
              },
            },
          },
          required: ['type'],
        },
      },
      required: ['suggestion', 'reasoning', 'action'],
    },
  };

   try {
    const response = await ai.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            topP: 0.95,
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });

    const jsonString = response.text;
    const suggestions: Omit<ProactiveSuggestion, 'id'>[] = JSON.parse(jsonString);

    return suggestions.map(s => ({ ...s, id: `sugg-${Math.random()}`}));

  } catch (error) {
    console.error("Error calling Gemini API for suggestions:", error);
    if (error instanceof Error) {
        throw new Error(`Error generating suggestions: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating suggestions.");
  }
};


export const generateProjectAnalysis = async (projectContext: object): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key is not configured.";
  }
  
  const systemInstruction = `You are a senior project analyst AI. Your task is to provide a concise, insightful analysis of a single project based on the provided data. Your analysis should be actionable and easy to understand for a project manager. Structure your output using Markdown.`;

  const prompt = `
    CONTEXT DATA for a single project:
    \`\`\`json
    ${JSON.stringify(projectContext, null, 2)}
    \`\`\`

    Based on the context data above, please provide a project analysis with the following structure:

    ### Key Observations
    - One bullet point highlighting the project's main strength or positive trend.
    - One bullet point highlighting the most significant risk or concern.

    ### Actionable Recommendations
    - Provide 1-2 clear, concrete, and actionable recommendations to mitigate risks or capitalize on strengths.
    
    Keep the entire analysis concise (under 150 words).
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.6,
            topP: 0.95,
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for project analysis:", error);
     if (error instanceof Error) {
        return `Error generating analysis: ${error.message}`;
    }
    return "An unknown error occurred while generating the analysis.";
  }
};

export const generateDefectTriageSuggestions = async (defect: Defect): Promise<string> => {
    if (!API_KEY) {
        return "Error: Gemini API key is not configured.";
    }

    const systemInstruction = `You are an expert QA and Engineering Lead AI. Your goal is to provide a concise, actionable analysis for a given defect. Structure your output in Markdown with clear headings for "Potential Root Causes" and "Recommended Triage Steps".`;
    
    const prompt = `
        CONTEXT DATA for a single defect:
        \`\`\`json
        ${JSON.stringify(defect, null, 2)}
        \`\`\`

        Based on the defect data, please provide:

        ### Potential Root Causes
        - Suggest 2-3 likely technical root causes for this defect. Frame them as investigative questions for the team. For example: "Could a recent backend deployment have introduced a regression?" or "Is there a race condition in the data processing logic?".

        ### Recommended Triage Steps
        - List 2-3 immediate, concrete actions the project manager or team should take to diagnose and address the issue. For example: "1. Review server logs for the 'Orion Platform' around the time of the failure for any 5xx errors." or "2. Assign the defect to the on-call backend engineer for initial investigation."
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.6,
                topP: 0.95,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for defect triage suggestions:", error);
        if (error instanceof Error) {
            return `Error generating suggestions: ${error.message}`;
        }
        return "An unknown error occurred while generating suggestions.";
    }
};

export const generateDefectAnalysis = async (
    context: { defects: Defect[], projects: Project[] },
    analysisType: 'trend' | 'rca' | 'aging' | 'improvement',
    selectedDefect?: Defect
): Promise<string> => {
    if (!API_KEY) {
        return "Error: Gemini API key is not configured.";
    }

    const systemInstruction = `You are an expert QA and Engineering Lead AI named 'Nexa'. Your goal is to analyze defect data to find root causes, identify trends, and suggest process improvements. Provide clear, concise, and actionable insights in Markdown format. Use headings, bullet points, and bold text for clarity.`;

    let prompt = `
        CONTEXT DATA:
        \`\`\`json
        ${JSON.stringify(context, null, 2)}
        \`\`\`
    `;

    switch (analysisType) {
        case 'trend':
            prompt += `
                Based on all the defects in the context, generate a **Defect Trend Analysis**.
                - Identify which project has the most critical defects.
                - Point out any recurring themes or types of defects (e.g., API issues, UI glitches).
                - Summarize the overall defect health.
            `;
            break;

        case 'rca':
            if (!selectedDefect) throw new Error("A defect must be selected for Root Cause Analysis.");
            prompt += `
                A specific defect has been selected for **Root Cause Analysis (RCA)**:
                \`\`\`json
                ${JSON.stringify(selectedDefect, null, 2)}
                \`\`\`
                Based on the defect's title and project, suggest 3 **potential root causes**. Frame them as investigative questions for the team. For example: "Is there insufficient unit testing coverage for the authentication module?" or "Could a recent library update have introduced a breaking change?".
            `;
            break;
            
        case 'aging':
             prompt += `
                Analyze the provided defects and their 'creationDate' to generate a **Defect Aging Report**. Assume today's date is roughly late July 2024.
                - Identify the oldest open critical or high severity defect.
                - Provide a brief summary of how long defects have been open on average.
                - Highlight any potential risks associated with long-standing defects.
            `;
            break;

        case 'improvement':
            prompt += `
                Based on the entire list of defects, generate **AI-Powered Improvement Insights**.
                - Provide 2-3 concrete, actionable recommendations for the engineering/QA team to reduce similar defects in the future.
                - For each recommendation, provide a brief "Why" to explain the reasoning. Example: "Recommendation: Implement automated regression tests for the payment workflow. Why: This would catch critical payment failures before they reach production."
            `;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.6,
                topP: 0.95,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for defect analysis:", error);
        if (error instanceof Error) {
            return `Error generating analysis: ${error.message}`;
        }
        return "An unknown error occurred while generating the analysis.";
    }
};