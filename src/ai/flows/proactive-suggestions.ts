// Proactive Suggestions Flow
'use server';
/**
 * @fileOverview This file defines the proactive suggestions flow, which generates insights and suggests actions based on data analysis.
 *
 * - proactiveSuggestions - A function that generates proactive suggestions based on performance data.
 * - ProactiveSuggestionsInput - The input type for the proactiveSuggestions function.
 * - ProactiveSuggestionsOutput - The return type for the proactiveSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProactiveSuggestionsInputSchema = z.object({
  category: z.string().describe('The product category to analyze.'),
  region: z.string().describe('The region to analyze.'),
  quarter: z.string().describe('The quarter to analyze (e.g., Q3 2025).'),
});
export type ProactiveSuggestionsInput = z.infer<typeof ProactiveSuggestionsInputSchema>;

const ProactiveSuggestionsOutputSchema = z.object({
  suggestion: z.string().describe('A proactive suggestion based on the data analysis.'),
  reason: z.string().describe('The reasoning behind the suggestion.'),
  emailDraftNeeded: z.boolean().describe('Whether an email draft is suggested.'),
});
export type ProactiveSuggestionsOutput = z.infer<typeof ProactiveSuggestionsOutputSchema>;

export async function proactiveSuggestions(input: ProactiveSuggestionsInput): Promise<ProactiveSuggestionsOutput> {
  return proactiveSuggestionsFlow(input);
}

const proactiveSuggestionsPrompt = ai.definePrompt({
  name: 'proactiveSuggestionsPrompt',
  input: {schema: ProactiveSuggestionsInputSchema},
  output: {schema: ProactiveSuggestionsOutputSchema},
  prompt: `You are an AI assistant that analyzes business performance data and provides proactive suggestions.

  Analyze the performance of the following:
  Category: {{{category}}}
  Region: {{{region}}}
  Quarter: {{{quarter}}}

  Based on this analysis, provide a proactive suggestion to improve performance or capitalize on opportunities. Explain the reasoning behind the suggestion. Also, suggest if an email draft is needed to address any issues.

  Format your response as follows:
  Suggestion: [Your proactive suggestion]
  Reason: [The reasoning behind the suggestion]
  EmailDraftNeeded: [true/false]
  `,
});

const proactiveSuggestionsFlow = ai.defineFlow(
  {
    name: 'proactiveSuggestionsFlow',
    inputSchema: ProactiveSuggestionsInputSchema,
    outputSchema: ProactiveSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await proactiveSuggestionsPrompt(input);
    return output!;
  }
);
