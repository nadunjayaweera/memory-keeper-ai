const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = 5000;
const MODEL = "gemma3:1b";

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json({ limit: "100kb" }));

// =========================================================
// JSON DATA STORAGE
// =========================================================

const DATA_DIR = path.join(__dirname, "data");
const MEMORIES_FILE = path.join(DATA_DIR, "memories.json");

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(MEMORIES_FILE)) {
    fs.writeFileSync(MEMORIES_FILE, "[]", "utf8");
  }
}

function readMemories() {
  const content = fs.readFileSync(MEMORIES_FILE, "utf8");
  const memories = JSON.parse(content);

  if (!Array.isArray(memories)) {
    throw new Error("Invalid memories data");
  }

  return memories;
}

function writeMemories(memories) {
  fs.writeFileSync(MEMORIES_FILE, JSON.stringify(memories, null, 2), "utf8");
}

ensureStorage();

// =========================================================
// HEALTH CHECK
// =========================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Memory Keeper AI API is running",
  });
});

// =========================================================
// GENERATE MEMORY STORY USING GEMMA
// =========================================================

app.post("/api/generate-memory-story", async (req, res) => {
  try {
    const { title, memory, person = "", tone = "warm" } = req.body || {};

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.length > 120 ||
      typeof memory !== "string" ||
      !memory.trim() ||
      memory.length > 5000 ||
      typeof person !== "string" ||
      person.length > 100 ||
      !["warm", "reflective", "celebratory"].includes(tone)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid title and memory.",
      });
    }

    const prompt = `
You are Memory Keeper AI, a compassionate local AI writing assistant.

Your purpose is to help people preserve personal memories,
family stories, and memories of loved ones.

IMPORTANT RULES:
- Use ONLY the facts provided by the user.
- Do not invent names, places, dates, events, or quotations.
- If the memory is short, keep the story short.
- Use a respectful and natural tone.
- Do not pretend to contact or speak for deceased people.
- Write in the same language as the original memory.
- Return valid JSON only, without markdown.

Memory title:
${title.trim()}

Person:
${person.trim() || "Not specified"}

Story tone:
${tone}

Original memory:
${memory.trim()}

Generate a meaningful memory story.

Return exactly this JSON structure:

{
  "story_title": "",
  "story": "",
  "closing_note": ""
}
`;

    const ollamaResponse = await fetch("http://127.0.0.1:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(120000),
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
        format: "json",
        options: {
          temperature: 0.3,
        },
      }),
    });

    if (!ollamaResponse.ok) {
      return res.status(502).json({
        success: false,
        message: "Ollama generation failed. Check the model.",
      });
    }

    const ollamaData = await ollamaResponse.json();

    const content = ollamaData.message?.content;

    if (!content) {
      throw new Error("Gemma returned an empty response");
    }

    let result;

    try {
      result = JSON.parse(content);
    } catch (error) {
      return res.status(502).json({
        success: false,
        message: "Gemma returned invalid JSON.",
      });
    }

    if (
      typeof result.story_title !== "string" ||
      typeof result.story !== "string" ||
      !result.story.trim() ||
      typeof result.closing_note !== "string"
    ) {
      return res.status(502).json({
        success: false,
        message: "Gemma returned an incomplete story.",
      });
    }

    const record = {
      id: crypto.randomUUID(),
      title: title.trim(),
      original_memory: memory.trim(),
      person: person.trim(),
      tone,
      story_title: result.story_title.trim(),
      story: result.story.trim(),
      closing_note: result.closing_note.trim(),
      status: "DRAFT",
      created_at: new Date().toISOString(),
      saved_at: null,
    };

    const memories = readMemories();

    memories.unshift(record);

    writeMemories(memories);

    return res.json({
      success: true,
      memory: record,
    });
  } catch (error) {
    console.error("Generate memory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate memory story. Check Ollama.",
    });
  }
});

// =========================================================
// GET ALL MEMORIES
// =========================================================

app.get("/api/memories", (req, res) => {
  try {
    const memories = readMemories();

    return res.json({
      success: true,
      count: memories.length,
      memories,
    });
  } catch (error) {
    console.error("Get memories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load memories.",
    });
  }
});

// =========================================================
// GET MEMORY BY ID
// =========================================================

app.get("/api/memories/:id", (req, res) => {
  try {
    const memories = readMemories();

    const memory = memories.find((item) => item.id === req.params.id);

    if (!memory) {
      return res.status(404).json({
        success: false,
        message: "Memory not found.",
      });
    }

    return res.json({
      success: true,
      memory,
    });
  } catch (error) {
    console.error("Get memory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load memory.",
    });
  }
});

// =========================================================
// SAVE GENERATED MEMORY
// =========================================================

app.patch("/api/memories/:id/save", (req, res) => {
  try {
    const memories = readMemories();

    const record = memories.find((item) => item.id === req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Memory not found.",
      });
    }

    if (record.status !== "SAVED") {
      record.status = "SAVED";
      record.saved_at = new Date().toISOString();

      writeMemories(memories);
    }

    return res.json({
      success: true,
      message: "Memory saved successfully.",
      memory: record,
    });
  } catch (error) {
    console.error("Save memory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save memory.",
    });
  }
});

// =========================================================
// DELETE MEMORY
// =========================================================

app.delete("/api/memories/:id", (req, res) => {
  try {
    const memories = readMemories();

    const updated = memories.filter((item) => item.id !== req.params.id);

    if (updated.length === memories.length) {
      return res.status(404).json({
        success: false,
        message: "Memory not found.",
      });
    }

    writeMemories(updated);

    return res.json({
      success: true,
      message: "Memory deleted successfully.",
    });
  } catch (error) {
    console.error("Delete memory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete memory.",
    });
  }
});

// =========================================================
// START SERVER
// =========================================================

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Memory Keeper AI running at http://127.0.0.1:${PORT}`);

  console.log(`AI Model: ${MODEL}`);
  console.log(`Storage: ${MEMORIES_FILE}`);
});
