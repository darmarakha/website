import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      responseModalities: ["TEXT", "AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Puck" }
        }
      }
    }
  });

  const response = await chat.sendMessage({ message: "Hello! Tell me a short joke." });
  console.log("Text response:");
  console.log(response.text);
  const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType?.startsWith('audio/'));
  if (audioPart) {
    console.log("Audio data length:", audioPart.inlineData.data.length);
  } else {
    console.log("No audio part found");
  }
}
run();
