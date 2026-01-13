
import { GoogleGenAI } from "@google/genai";
import { PropertyData } from "../types";

export const generateDescription = async (data: Partial<PropertyData>): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Atue como um redator imobiliário experiente. Gere uma descrição persuasiva e profissional para um imóvel com os seguintes dados:
    Título: ${data.title}
    Tipo: ${data.type}
    Preço: R$ ${data.price}
    Área: ${data.area}m²
    Quartos: ${data.bedrooms}
    Banheiros: ${data.bathrooms}
    Cidade: ${data.city}

    A descrição deve ser atraente para compradores, destacando o estilo de vida e o valor do investimento. Use tom profissional e acolhedor.
    Retorne apenas o texto da descrição, sem introduções ou notas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error("Erro ao gerar descrição com IA:", error);
    return "Não foi possível gerar a descrição automaticamente no momento.";
  }
};
