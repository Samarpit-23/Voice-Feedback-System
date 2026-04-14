const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const transcribeAudio = async (filePath) => {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("model", "whisper-large-v3");

    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                },
            }
        );

        return response.data.text;
    } catch (err) {
        console.error("Whisper Error:", err.response?.data || err.message);
        throw err;
    }
};

module.exports = transcribeAudio;