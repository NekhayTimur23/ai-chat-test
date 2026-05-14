import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

app.get("/", (req, res) => {
  res.send("Backend is working");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    console.log("Message from client:", messages);

   if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Сообщение не может быть пустым" });
    }

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
    });

   const answer = response.choices[0]?.message?.content;

    console.log("AI answer:", answer);

    return res.json({ answer });
  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      error: "Ошибка при обращении к AI API",
    });
  }
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
