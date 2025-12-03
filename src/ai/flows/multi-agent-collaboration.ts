'use server';

/**
 * @fileOverview Implements a multi-agent collaboration flow to answer complex business questions.
 *
 * - multiAgentCollaboration - A function that orchestrates intent, data, and insight agents.
 * - MultiAgentCollaborationInput - The input type for the multiAgentCollaboration function.
 * - MultiAgentCollaborationOutput - The return type for the multiAgentCollaboration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MultiAgentCollaborationInputSchema = z.string().describe('The user question about the business.');
export type MultiAgentCollaborationInput = z.infer<typeof MultiAgentCollaborationInputSchema>;

const MultiAgentCollaborationOutputSchema = z.object({
  summary: z.string().describe('A concise text summary of the answer.'),
  visualizationData: z.string().optional().describe('Data for visualization (e.g., JSON for a chart).'),
  proactiveSuggestion: z.string().optional().describe('A proactive suggestion based on the analysis.'),
  emailDraftSuggestion: z.string().optional().describe('Offer to draft an email based on the proactive suggestions.'),
});
export type MultiAgentCollaborationOutput = z.infer<typeof MultiAgentCollaborationOutputSchema>;

export async function multiAgentCollaboration(input: MultiAgentCollaborationInput): Promise<MultiAgentCollaborationOutput> {
  return multiAgentCollaborationFlow(input);
}

const createTicketTool = ai.defineTool(
  {
    name: 'create_ticket',
    description: 'Creates a Jira ticket for the web development team.',
    inputSchema: z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(['High', 'Medium', 'Low']),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      ticketId: z.string(),
    }),
  },
  async ({ title, description, priority }) => {
    console.log(`Creating Jira ticket: ${title}, ${description}, ${priority}`);
    return { success: true, ticketId: `EN-${Math.floor(Math.random() * 9000) + 1000}` };
  }
);

const forecastRevenueTool = ai.defineTool(
  {
    name: 'forecast_revenue',
    description: 'Forecasts revenue based on maison, category, and budget changes.',
    inputSchema: z.object({
      maison: z.string(),
      category: z.string(),
      budget_change: z.number().describe('Percentage change in budget'),
    }),
    outputSchema: z.object({
      estimated_revenue_range: z.tuple([z.number(), z.number()]),
      confidence_score: z.number(),
    }),
  },
  async ({ budget_change }) => {
    // Simulate a predictive model
    const baseRevenue = 28000000; 
    const impactFactor = 0.10 + (budget_change / 100);
    const lowerBound = baseRevenue * (1 + impactFactor * 0.8);
    const upperBound = baseRevenue * (1 + impactFactor * 1.2);
    return {
      estimated_revenue_range: [lowerBound, upperBound],
      confidence_score: 0.85,
    };
  }
);


const IntentSchema = z.object({
  metrics: z.string().describe('The key metrics the user is asking about.'),
  category: z.string().describe('The product category the user is asking about.'),
  location: z.string().describe('The geographical location the user is asking about.'),
  timePeriod: z.string().describe('The time period the user is asking about.'),
  unstructuredQuery: z.boolean().describe('Is the query about unstructured data like customer feedback?'),
  simulationQuery: z.boolean().describe('Is the query a what-if simulation?'),
});

const intentAgentPrompt = ai.definePrompt({
  name: 'intentAgentPrompt',
  input: {schema: z.string()},
  output: {schema: IntentSchema},
  prompt: `You are an intent extraction agent. Your job is to extract the intent from the user question.

  Question: {{{input}}}

  Analyze the question and determine if it's about:
  1. Standard business metrics (sales, performance).
  2. Unstructured data (customer perception, reviews, social media).
  3. A "what-if" simulation or forecast.

  Output the metrics, category, location and time period the user is asking about. Set unstructuredQuery or simulationQuery to true if applicable.`,
  tools: [createTicketTool, forecastRevenueTool],
});

const DataSchema = z.object({
  salesData: z.string().optional().describe('Sales data relevant to the user question.'),
  planData: z.string().optional().describe('Business plan data relevant to the user question.'),
  customerFeedback: z.string().optional().describe('Customer feedback data.'),
  websitePerformance: z.string().optional().describe('Website performance data.'),
});

const dataAgentPrompt = ai.definePrompt({
  name: 'dataAgentPrompt',
  input: {schema: IntentSchema},
  output: {schema: DataSchema},
  prompt: `You are a data retrieval agent. Your job is to retrieve the relevant data based on the user's intent.

  Intent: {{{input}}}

  Based on the intent, retrieve the necessary data. If it's a standard query, get sales and plan data. If it's about customer perception, get customer feedback. If it's a performance issue, you might need sales and website performance data.`,
});

const InsightSchema = z.object({
  summary: z.string().describe('A concise text summary of the answer.'),
  visualizationData: z.string().optional().describe('Data for visualization (e.g., JSON for a chart).'),
  proactiveSuggestion: z.string().optional().describe('A proactive suggestion based on the analysis.'),
  emailDraftSuggestion: z.string().optional().describe('Offer to draft an email based on the proactive suggestions.'),
});

const insightAgentPrompt = ai.definePrompt({
  name: 'insightAgentPrompt',
  input: {schema: z.object({
    intent: IntentSchema,
    data: DataSchema,
    userInput: z.string(),
  })},
  output: {schema: InsightSchema},
  prompt: `You are an insight synthesis agent. Your job is to synthesize insights from the data and answer the user question.

  User Input: {{{userInput}}}
  Intent: {{{intent}}}
  Data: {{{data}}}
  
  Available Tools: create_ticket, forecast_revenue

  - If the intent is a "what-if" simulation, use the forecast_revenue tool.
  - If you detect a critical issue that needs immediate action (like a sudden drop in conversion), use the create_ticket tool to automatically create a high priority ticket.

  Provide a concise text summary, data for visualization, and a proactive suggestion if applicable.`,
  tools: [createTicketTool, forecastRevenueTool],
});

const multiAgentCollaborationFlow = ai.defineFlow(
  {
    name: 'multiAgentCollaborationFlow',
    inputSchema: MultiAgentCollaborationInputSchema,
    outputSchema: MultiAgentCollaborationOutputSchema,
  },
  async input => {
    const intentResult = await intentAgentPrompt(input);
    const intent = intentResult.output!;

    if (intent.simulationQuery) {
       const forecast = await forecastRevenueTool({maison: "the brand", category: "Watches", budget_change: 15});
       const summary = `Based on historical campaign ROI and our market elasticity model, a 15% increase in the marketing budget for the Watches category in North America is projected to generate an additional **$${(forecast.estimated_revenue_range[0]/1000000).toFixed(1)}M to $${(forecast.estimated_revenue_range[1]/1000000).toFixed(1)}M in revenue**. The model gives this forecast an ${forecast.confidence_score * 100}% confidence score.`;
       return { summary };
    }
    
    const dataInput = {
      metrics: intent.metrics,
      category: intent.category,
      location: intent.location,
      timePeriod: intent.timePeriod,
      unstructuredQuery: intent.unstructuredQuery,
      simulationQuery: intent.simulationQuery,
    };
    const data = await dataAgentPrompt(dataInput);

    const insightInput = {
      intent: intent,
      data: data.output!,
      userInput: input,
    };

    const insight = await insightAgentPrompt(insightInput);

    // This is a mocked response for the demo flow.
    // In a real scenario, the tool would be called by the LLM based on the prompt.
    if (insight.output?.proactiveSuggestion?.includes("conversion rate")) {
        await createTicketTool({
            title: "Critical Conversion Drop on 'Lunettes Oeil de Chat' page",
            description: "A 40% drop in conversion rate for the 'Lunettes Oeil de Chat' category page has been detected, correlating with a 300% spike in page load time.",
            priority: 'High'
        });
    }

    return {
      summary: insight.output!.summary,
      visualizationData: insight.output!.visualizationData,
      proactiveSuggestion: insight.output!.proactiveSuggestion,
      emailDraftSuggestion: insight.output!.emailDraftSuggestion,
    };
  }
);
