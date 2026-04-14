const axios = require("axios");

const callGroq = async (model, text) => {
    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model,
                messages: [
                    {
                        role: "system",
                        content: `
Return ONLY valid JSON with no markdown or code fences:

{
  "sentiment": "positive | negative | neutral | mixed",
  "summary": "short summary",
  "keywords": ["keyword1", "keyword2"],
  "issues": ["issue1", "issue2"]
}
          `,
                    },
                    {
                        role: "user",
                        content: text,
                    },
                ],
                temperature: 0.3,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (err) {
        // Log the actual Groq API error for debugging
        console.error(`Groq [${model}] error:`, err.response?.data?.error || err.message);
        throw err;
    }
};

// 🔥 fallback logic
const analyzeWithGroq = async (text) => {
    try {
        // 🥇 Primary: best quality
        return await callGroq("llama-3.3-70b-versatile", text);
    } catch (err) {
        console.log("⚠️ 70B failed, switching to 8B...");

        try {
            // 🥈 Fallback: lighter, faster, still good
            return await callGroq("llama-3.1-8b-instant", text);
        } catch (err2) {
            console.log("❌ Both Groq models failed");
            throw err2;
        }
    }
};

module.exports = analyzeWithGroq;