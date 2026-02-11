
import { GoogleGenAI, Type, Modality } from "@google/genai";

export class GeminiService {
  private getAi() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async extractPetFromSocialProfile(handle: string, platform: string): Promise<any> {
    const ai = this.getAi();
    const prompt = `Simulate extracting pet data from a ${platform} profile for ${handle}. 
    Return a JSON object with: 
    - petName (string)
    - species (string: Dog, Cat, etc)
    - breed (string)
    - bio (string summary)
    - recentActivity (string: "Just won a dog show", "Finished a 5km run", etc)
    - birthday (string: YYYY-MM-DD)
    Make the data sound realistic and charming based on typical pet influencers on ${platform}.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              petName: { type: Type.STRING },
              species: { type: Type.STRING },
              breed: { type: Type.STRING },
              bio: { type: Type.STRING },
              recentActivity: { type: Type.STRING },
              birthday: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Extraction failed", error);
      return null;
    }
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
              { inlineData: { mimeType: 'image/jpeg', data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64 } },
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

  async generateAlertGraphic(petName: string, species: string, breed: string, imageBase64: string, type: 'LOST' | 'BIRTHDAY', details?: string): Promise<string | undefined> {
    const ai = this.getAi();
    const prompt = type === 'LOST' 
      ? `Create a high-impact, professional "MISSING PET" poster for a ${species} named ${petName} (${breed}). The design must be bold, with a bright red header that says "MISSING: ${petName.toUpperCase()}". Include the text "LAST SEEN: ${details || 'Unknown Location'}" in a high-visibility font. The pet's photo should be central and clear. The overall aesthetic should be urgent and high-contrast for social media visibility.`
      : `Create a vibrant, celebratory "HAPPY BIRTHDAY" card for a ${species} named ${petName}. The design should be festive with confetti, balloons, and a 3D stylized text that says "HAPPY BIRTHDAY ${petName.toUpperCase()}!". Use a warm, joyful color palette and make the provided pet photo the star of the celebration.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        }
      });
      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return imagePart?.inlineData?.data ? `data:image/jpeg;base64,${imagePart.inlineData.data}` : undefined;
    } catch (e) {
      console.error("Alert graphic generation failed", e);
      return undefined;
    }
  }

  async generateShareCard(petName: string, species: string, breed: string, imageBase64: string, type: 'PROFILE' | 'POST'): Promise<string | undefined> {
    const ai = this.getAi();
    const prompt = type === 'PROFILE' 
      ? `Create a high-quality, vibrant "VIP Pet Identity Card" for a ${species} named ${petName} (${breed}). The design should look like a premium social media profile highlight with a holographic border, modern typography, and a "PawNet Verified" badge. Use the provided pet photo as the central feature.`
      : `Create a cinematic "Social Media Highlight Card" featuring a ${species} named ${petName}. Add a stylized overlay that says "Life with ${petName}" in trendy, modern font. The design should be perfect for an Instagram Story or TikTok cover, with vibrant lighting and a polished, professional aesthetic.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        }
      });
      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return imagePart?.inlineData?.data ? `data:image/jpeg;base64,${imagePart.inlineData.data}` : undefined;
    } catch (e) {
      console.error("Share card generation failed", e);
      return undefined;
    }
  }

  async editImage(prompt: string, imageBase64: string): Promise<string | undefined> {
    const ai = this.getAi();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64, mimeType: 'image/jpeg' } },
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
            { inlineData: { data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64, mimeType: 'image/jpeg' } },
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
            { inlineData: { data: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64, mimeType: 'image/jpeg' } },
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
          imageBytes: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64,
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
