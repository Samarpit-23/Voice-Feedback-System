const axios = require("axios");

const analyzeWithGemini = async (text) => {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `
Analyze the following feedback and return ONLY valid JSON with no markdown, no code fences:

{
  "sentiment": "positive | negative | neutral",
  "summary": "short summary",
  "keywords": ["keyword1", "keyword2"]
}

Feedback:
${text}
                `,
                            },
                        ],
                    },
                ],
            }
        );

        const raw = response.data.candidates[0].content.parts[0].text;

        return JSON.parse(raw);
    } catch (err) {
        console.error("Gemini Error:", err.response?.data || err.message);
        throw err;
    }
};

module.exports = analyzeWithGemini;