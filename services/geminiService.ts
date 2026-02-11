
import { GoogleGenAI, Type, Modality } from "@google/genai";

export class GeminiService {
  private getAi() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateCaption(petName: string, species: string, imageBase64?: string): Promise<string> {
    const ai = this.getAi();
    const prompt = `Write a short, funny, and charming social media caption for a ${species} named ${petName}. The caption should sound like it's coming from the animal's perspective. Include relevant pet emojis.`;

    try {
      if (imageBase64) {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
              { text: prompt + " The photo shows the animal doing something specific, describe that too." }
            ]
          }
        });
        return response.text || "Just living my best life! 🐾";
      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt
        });
        return response.text || "Woof/Meow! Having a great day!";
      }
    } catch (error) {
      return "Pawsome day ahead! 🌟";
    }
  }

  async editImage(prompt: string, imageBase64: string): Promise<string | undefined> {
    const ai = this.getAi();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        }
      });
      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return imagePart?.inlineData?.data ? `data:image/jpeg;base64,${imagePart.inlineData.data}` : undefined;
    } catch (e) {
      console.error("Edit failed", e);
      return undefined;
    }
  }

  async resonateBackground(caption: string, imageBase64: string): Promise<string | undefined> {
    const ai = this.getAi();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/jpeg' } },
            { text: `Re-imagine the background of this photo to perfectly resonate with this social media caption: "${caption}". Keep the animal in the foreground exactly as they are, but transform the background into a cinematic, high-quality environment that matches the mood and theme of the text. Make it look seamless and artistic.` }
          ]
        }
      });
      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return imagePart?.inlineData?.data ? `data:image/jpeg;base64,${imagePart.inlineData.data}` : undefined;
    } catch (e) {
      console.error("Background resonance failed", e);
      return undefined;
    }
  }

  async generateSticker(theme: string, imageBase64: string): Promise<string | undefined> {
    const ai = this.getAi();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/jpeg' } },
            { text: `Create a high-quality digital sticker of this pet with a ${theme} theme. The pet should be stylized as a cute die-cut sticker with a thick white border. The background must be a solid, easy to remove color. Make it fun and expressive.` }
          ]
        }
      });
      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return imagePart?.inlineData?.data ? `data:image/jpeg;base64,${imagePart.inlineData.data}` : undefined;
    } catch (e) {
      console.error("Sticker generation failed", e);
      return undefined;
    }
  }

  async animatePhoto(imageBase64: string, prompt: string): Promise<string | undefined> {
    const ai = this.getAi();
    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this photo with subtle natural movement',
        image: {
          imageBytes: imageBase64.split(',')[1],
          mimeType: 'image/jpeg',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.error("Veo failed", e);
    }
    return undefined;
  }

  async chatWithAssistant(query: string, location?: { latitude: number; longitude: number }) {
    const ai = this.getAi();
    const isLocalQuery = query.toLowerCase().includes('near') || query.toLowerCase().includes('around') || query.toLowerCase().includes('park') || query.toLowerCase().includes('restaurant');
    
    try {
      const response = await ai.models.generateContent({
        model: isLocalQuery ? "gemini-2.5-flash" : "gemini-3-flash-preview",
        contents: query,
        config: {
          tools: isLocalQuery ? [{ googleMaps: {} }] : [{ googleSearch: {} }],
          ...(isLocalQuery && location ? {
            toolConfig: {
              retrievalConfig: {
                latLng: {
                  latitude: location.latitude,
                  longitude: location.longitude
                }
              }
            }
          } : {})
        }
      });

      const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
        if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
        if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
        return null;
      }).filter(Boolean);

      return { text: response.text, urls };
    } catch (e) {
      console.error("Assistant chat failed", e);
      return { text: "I'm having trouble connecting to the network. Try again later! 🐾" };
    }
  }
}

export const geminiService = new GeminiService();
