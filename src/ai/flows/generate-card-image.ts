
'use server';
/**
 * @fileOverview Generates a simple drawing for a story card based on a hint.
 *
 * - generateCardImage - A function that generates an image.
 * - GenerateCardImageInput - The input type for the generateCardImage function.
 * - GenerateCardImageOutput - The return type for the generateCardImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCardImageInputSchema = z.object({
  imageHint: z.string().describe('A short description or hint for the image content (e.g., "dark forest", "eerie scarecrow"). Maximum two words.'),
});
export type GenerateCardImageInput = z.infer<typeof GenerateCardImageInputSchema>;

const GenerateCardImageOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateCardImageOutput = z.infer<typeof GenerateCardImageOutputSchema>;

export async function generateCardImage(input: GenerateCardImageInput): Promise<GenerateCardImageOutput> {
  return generateCardImageFlow(input);
}

const generateCardImageFlow = ai.defineFlow(
  {
    name: 'generateCardImageFlow',
    inputSchema: GenerateCardImageInputSchema,
    outputSchema: GenerateCardImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Using the specified model for image generation
      prompt: `Generate an image for a spooky story card based on the hint: "${input.imageHint}". The style should be vibrant and eye-catching, reminiscent of classic "Goosebumps" book cover art. Use bold, contrasting colors (like electric greens, deep purples, eerie oranges against dark, shadowy backgrounds) with a playful yet eerie atmosphere. The illustration should be somewhat detailed but maintain a stylized, slightly exaggerated or cartoony look, suitable for a young adult horror theme. Focus on creating a compelling and spooky visual that matches the hint. Ensure the output is just the image.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Required for this model
         safetySettings: [ // Loosen safety settings slightly for creative content, adjust as needed
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed or returned no media.');
    }
    // The media.url is already a data URI in the format 'data:image/png;base64,...'
    return { imageDataUri: media.url };
  }
);

