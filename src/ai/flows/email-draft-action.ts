'use server';

/**
 * @fileOverview AI flow to draft emails based on proactive suggestions.
 *
 * - draftEmail - A function that drafts an email based on a suggestion.
 * - DraftEmailInput - The input type for the draftEmail function.
 * - DraftEmailOutput - The return type for the draftEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftEmailInputSchema = z.object({
  suggestion: z
    .string()
    .describe('The proactive suggestion from the AI to be used as the basis for the email.'),
  recipient: z.string().describe('The email address of the recipient.'),
  sender: z.string().describe('The email address of the sender.'),
  subjectPrefix: z.string().optional().describe('Optional prefix for the email subject.'),
});

export type DraftEmailInput = z.infer<typeof DraftEmailInputSchema>;

const DraftEmailOutputSchema = z.object({
  subject: z.string().describe('The subject of the drafted email.'),
  body: z.string().describe('The body of the drafted email.'),
});

export type DraftEmailOutput = z.infer<typeof DraftEmailOutputSchema>;

export async function draftEmail(input: DraftEmailInput): Promise<DraftEmailOutput> {
  return draftEmailFlow(input);
}

const draftEmailPrompt = ai.definePrompt({
  name: 'draftEmailPrompt',
  input: {schema: DraftEmailInputSchema},
  output: {schema: DraftEmailOutputSchema},
  prompt: `You are an AI assistant tasked with drafting emails based on proactive business suggestions.

  Based on the following suggestion, draft an email to the specified recipient from the specified sender. Include a subject and a body. The subject should be concise and professional, and optionally begin with the provided subject prefix. The body should be well-written and actionable.

  Suggestion: {{{suggestion}}}
  Recipient: {{{recipient}}}
  Sender: {{{sender}}}
  Subject Prefix: {{{subjectPrefix}}}
  `,
});

const draftEmailFlow = ai.defineFlow(
  {
    name: 'draftEmailFlow',
    inputSchema: DraftEmailInputSchema,
    outputSchema: DraftEmailOutputSchema,
  },
  async input => {
    const {output} = await draftEmailPrompt(input);
    return output!;
  }
);
