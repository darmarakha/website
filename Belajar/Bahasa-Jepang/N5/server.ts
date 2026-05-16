import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { ElevenLabsClient } from "elevenlabs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      const apiKey = process.env.ELEVENLABS_API_KEY;

      if (!apiKey) {
        return res.status(503).json({ error: "ELEVENLABS_API_KEY is not configured" });
      }

      const client = new ElevenLabsClient({ apiKey });

      // We use a Japanese voice. "Mimi" is a good one, or we can use the default.
      // E.g., JBFqnCBcs6IkwhvcgUjC (George - not JP), let's use a standard pre-provided voice.
      // We will let ElevenLabs handle the default if voice id is not specified, 
      // but let's use 'Xb7hH8MSUJpSbSDYk0k2' (Alice) or turbo_v2_5 which supports Japanese.
      
      const audioStream = await client.textToSpeech.convert("EXAVITQu4vr4xnSDxMaL", {
        model_id: "eleven_turbo_v2_5", // Supports Japanese and has low latency
        text: text,
        output_format: "pcm_24000",
      });

      const chunks: Buffer[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);
      res.json({ base64: buffer.toString('base64') });
    } catch (e: any) {
      console.error("ElevenLabs TTS Error:", e);
      res.status(500).json({ error: "Failed to generate TTS" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
