'use server';

/**
 * @fileOverview An AI agent that understands LVMH-specific data semantics.
 *
 * - understandDataSemantics - A function that processes user queries and returns insights based on LVMH data semantics.
 * - UnderstandDataSemanticsInput - The input type for the understandDataSemantics function.
 * - UnderstandDataSemanticsOutput - The return type for the understandDataSemantics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UnderstandDataSemanticsInputSchema = z.object({
  query: z
    .string()
    .describe("A natural language query from the user regarding LVMH business data."),
});
export type UnderstandDataSemanticsInput = z.infer<typeof UnderstandDataSemanticsInputSchema>;

const UnderstandDataSemanticsOutputSchema = z.object({
  insight: z.string().describe("A concise insight generated based on the user's query and LVMH's data semantics."),
  visualizationType: z.string().optional().describe("The type of visualization recommended for the insight, e.g., 'line chart', 'bar chart'."),
  visualizationData: z.string().optional().describe("Data suitable for the suggested visualization."),
});
export type UnderstandDataSemanticsOutput = z.infer<typeof UnderstandDataSemanticsOutputSchema>;

export async function understandDataSemantics(input: UnderstandDataSemanticsInput): Promise<UnderstandDataSemanticsOutput> {
  return understandDataSemanticsFlow(input);
}

const dataUnderstandingPrompt = ai.definePrompt({
  name: 'dataUnderstandingPrompt',
  input: {schema: UnderstandDataSemanticsInputSchema},
  output: {schema: UnderstandDataSemanticsOutputSchema},
  prompt: `You are an AI assistant with deep understanding of LVMH's business data. 
You will receive a query from Sömayya, Head Of Insights.
Use your knowledge of LVMH's data semantics (products, sales, stores, plans) to provide a relevant and insightful response.

Understood data semantics:
- Products: Product Name, Category (eg., "Leather Goods", "Silk", "Watches"), Collection (e.g., "Spring 2025"), SKU, Price.
- Sales Data: Date, SKU, Units Sold, Revenue, Store ID, Channel ("In-Store", "Online").
- Store Data: Store ID, Store Name ("Paris Faubourg Saint-Honoré", "Tokyo Ginza", "New York Madison"), City, Country.
- Business Plan: Date, Category, Revenue Plan. The agent must be able to calculate "performance vs. plan".

Business Language:
- "YTD" (Year-to-date).
- "QoQ" (Quarter-over-Quarter).
- "Performance" (implies comparison to plan or previous period).
- "Lagging" or "Underperforming" (significantly below plan).
- "Driving" or "Leading" (significantly above plan).

Consider suggesting a visualization type that would best represent the data.

Query: {{{query}}}

Insight: `,
});

const understandDataSemanticsFlow = ai.defineFlow(
  {
    name: 'understandDataSemanticsFlow',
    inputSchema: UnderstandDataSemanticsInputSchema,
    outputSchema: UnderstandDataSemanticsOutputSchema,
  },
  async input => {
    const {output} = await dataUnderstandingPrompt(input);
    return output!;
  }
);
