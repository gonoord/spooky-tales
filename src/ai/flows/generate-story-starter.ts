// Use server directive is required when using Genkit
'use server';

/**
 * @fileOverview Story starter generator based on card image and phrase.
 *
 * - generateStoryStarter - A function that generates a story starter.
 * - GenerateStoryStarterInput - The input type for the generateStoryStarter function.
 * - GenerateStoryStarterOutput - The return type for the generateStoryStarter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryStarterInputSchema = z.object({    
  image: z.string().describe("The card's image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  phrase: z.string().describe('The phrase on the card.'),
});
export type GenerateStoryStarterInput = z.infer<typeof GenerateStoryStarterInputSchema>;

const GenerateStoryStarterOutputSchema = z.object({
  storyStarter: z.string().describe('An example story starter based on the card image and phrase.'),
});
export type GenerateStoryStarterOutput = z.infer<typeof GenerateStoryStarterOutputSchema>;

export async function generateStoryStarter(input: GenerateStoryStarterInput): Promise<GenerateStoryStarterOutput> {
  return generateStoryStarterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryStarterPrompt',
  input: {schema: GenerateStoryStarterInputSchema},
  output: {schema: GenerateStoryStarterOutputSchema},
  prompt: `You are a creative story writer, skilled at crafting compelling opening lines.

  Based on the image and phrase provided, write a story starter that sparks imagination.

  Image: {{media url=image}}
  Phrase: {{{phrase}}}

  Story Starter:`,  
});

const generateStoryStarterFlow = ai.defineFlow(
  {
    name: 'generateStoryStarterFlow',
    inputSchema: GenerateStoryStarterInputSchema,
    outputSchema: GenerateStoryStarterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
