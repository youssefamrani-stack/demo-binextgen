'use server';

/**
 * @fileOverview This file defines a Genkit flow for Conversational BI, allowing users to ask business questions in natural language and receive insightful answers.
 *
 * - conversationalBiFlow - The main flow function that processes user queries and returns responses.
 * - ConversationalBiInput - The input type for the conversationalBiFlow function.
 * - ConversationalBiOutput - The output type for the conversationalBiFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConversationalBiInputSchema = z.object({
  query: z.string().describe('The user query in natural language.'),
});
export type ConversationalBiInput = z.infer<typeof ConversationalBiInputSchema>;

const ConversationalBiOutputSchema = z.object({
  response: z.string().describe('The response to the user query.'),
  visualization: z.string().optional().describe('Optional visualization data (e.g., chart data).'),
  proactiveSuggestion: z.string().optional().describe('A proactive suggestion based on the analysis.'),
  emailDraftOption: z.boolean().optional().describe('Whether to offer an email draft based on the suggestion.'),
});
export type ConversationalBiOutput = z.infer<typeof ConversationalBiOutputSchema>;

export async function conversationalBi(input: ConversationalBiInput): Promise<ConversationalBiOutput> {
  return conversationalBiFlow(input);
}

const conversationalBiPrompt = ai.definePrompt({
  name: 'conversationalBiPrompt',
  input: {schema: ConversationalBiInputSchema},
  output: {schema: ConversationalBiOutputSchema},
  prompt: `You are an AI assistant designed to answer business questions based on provided data.

You have access to the following data semantics:
- Products: Product Name, Category (e.g., "Leather Goods", "Silk", "Watches"), Collection (e.g., "Spring 2025"), SKU, Price.
- Sales Data: Date, SKU, Units Sold, Revenue, Store ID, Channel ("In-Store", "Online").
- Store Data: Store ID, Store Name ("Paris Faubourg Saint-Honoré", "Tokyo Ginza", "New York Madison"), City, Country.
- Business Plan: Date, Category, Revenue Plan.

You understand the following business terms:
- YTD (Year-to-date)
- QoQ (Quarter-over-Quarter)
- Performance (comparison to plan or previous period)
- Lagging/Underperforming (significantly below plan)
- Driving/Leading (significantly above plan)

Based on the user's query: {{{query}}}, provide a concise and insightful answer. Include any relevant visualizations if appropriate. Also, provide proactive suggestions based on your analysis, and indicate whether an email draft option should be offered.

Example Response Format:
{
  "response": "Your answer here.",
  "visualization": "Chart data or description (optional)",
  "proactiveSuggestion": "A proactive suggestion based on the analysis (optional)",
  "emailDraftOption": true/false (optional, defaults to false)
}
`,
});

const conversationalBiFlow = ai.defineFlow(
  {
    name: 'conversationalBiFlow',
    inputSchema: ConversationalBiInputSchema,
    outputSchema: ConversationalBiOutputSchema,
  },
  async input => {
    const {output} = await conversationalBiPrompt(input);
    return output!;
  }
);
