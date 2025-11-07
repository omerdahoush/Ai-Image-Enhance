import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Enhances an image using the Gemini API.
 * @param base64ImageData The base64 encoded string of the image.
 * @param mimeType The MIME type of the image.
 * @param prompt The user-defined prompt including adjustments.
 * @returns A promise that resolves to the base64 data URL of the enhanced image.
 */
export const enhanceImageWithGemini = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-image';
    
    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // Find the image part in the response
    const imageResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imageResponsePart && imageResponsePart.inlineData) {
      const { data, mimeType: responseMimeType } = imageResponsePart.inlineData;
      return `data:${responseMimeType};base64,${data}`;
    } else {
      throw new Error("No image found in the API response.");
    }
  } catch (error) {
    console.error("Error enhancing image with Gemini:", error);
    if (error instanceof Error && error.message.includes("429")) {
        throw new Error("Request limit exceeded. Please try again later.");
    }
    throw new Error("Failed to enhance the image. Please check the console for more details.");
  }
};