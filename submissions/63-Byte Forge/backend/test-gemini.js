require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'hello',
    });
    console.log(response);
    console.log("Text is:", response.text);
    console.log("Type of text:", typeof response.text);
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  }
}
run();
