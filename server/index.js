const express = require("express");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const Review = require("./models/Review");
const fs = require("fs");

// ✅ NEW utils
const transcribeAudio = require("./utils/whisper");
const analyzeWithGroq = require("./utils/groq");
// const analyzeWithGemini = require("./utils/gemini");

const app = express();
app.use(cors());
connectDB();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".webm");
  },
});

const upload = multer({ storage });

// 🔧 helper to clean JSON (important)
const cleanJSON = (text) => {
  return text.replace(/```json|```/g, "").trim();
};

app.post("/upload", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded" });
  }

  const filePath = req.file.path;

  try {
    const businessId = req.body.businessId;

    // 🎤 1. TRANSCRIBE (Whisper via Groq)
    const transcript = await transcribeAudio(filePath);
    console.log("Transcript:", transcript);

    let analysis;

    try {
      const result = await analyzeWithGroq(transcript);

      analysis =
        typeof result === "string"
          ? JSON.parse(cleanJSON(result))
          : result;
    } catch (err) {
      console.log("❌ Groq analysis failed completely");
      throw err;
    }

    // ✅ Extract structured fields
    const sentiment = analysis.sentiment;
    const keywords = analysis.keywords;
    const summary = analysis.summary;
    const issues = analysis.issues;

    // 💾 Save to DB
    const newReview = new Review({
      businessId,
      audioUrl: filePath,
      transcript,
      sentiment,
      keywords,
      summary,
      issues,
    });

    await newReview.save();

    res.json({
      message: "Review saved successfully",
      data: {
        transcript,
        sentiment,
        keywords,
        summary,
        issues,
      },
    });
  } catch (err) {
    console.error("Upload error:", err?.message || err);
    res.status(500).json({ error: err?.message || "Error processing audio" });
  } finally {
    // 🧹 cleanup file
    fs.unlink(filePath, (err) => {
      if (err) console.error("File delete error:", err);
    });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));