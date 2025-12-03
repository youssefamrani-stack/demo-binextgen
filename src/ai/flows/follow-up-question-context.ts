'use server';

/**
 * @fileOverview Implements follow-up question context for conversational BI.
 *
 * - followUpQuestionContext - Handles follow-up questions, maintaining context from previous turns.
 * - FollowUpQuestionContextInput - Input type for the followUpQuestionContext function.
 * - FollowUpQuestionContextOutput - Return type for the followUpQuestionContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FollowUpQuestionContextInputSchema = z.object({
  query: z.string().describe('The user query.'),
  previousContext: z.string().optional().describe('The previous context.'),
});
export type FollowUpQuestionContextInput = z.infer<typeof FollowUpQuestionContextInputSchema>;

const FollowUpQuestionContextOutputSchema = z.object({
  updatedQuery: z.string().describe('The updated query with context.'),
});
export type FollowUpQuestionContextOutput = z.infer<typeof FollowUpQuestionContextOutputSchema>;

export async function followUpQuestionContext(
  input: FollowUpQuestionContextInput
): Promise<FollowUpQuestionContextOutput> {
  return followUpQuestionContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'followUpQuestionContextPrompt',
  input: {
    schema: FollowUpQuestionContextInputSchema,
  },
  output: {
    schema: FollowUpQuestionContextOutputSchema,
  },
  prompt: `You are an AI assistant that helps maintain context in a conversation.

  The user has asked the following question: "{{query}}"

  Here is the previous context: "{{previousContext}}"

  Please update the user's query to include the context, so that it can be understood without the previous context. If no context is needed, return the original query.
  Return only the updated query.
  `,
});

const followUpQuestionContextFlow = ai.defineFlow(
  {
    name: 'followUpQuestionContextFlow',
    inputSchema: FollowUpQuestionContextInputSchema,
    outputSchema: FollowUpQuestionContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      updatedQuery: output!.updatedQuery,
    };
  }
);
