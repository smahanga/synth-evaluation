// SynthEvaluation API Proxy — Uses Google Gemini Flash

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GOOGLE_API_KEY not configured. Add it in Vercel → Settings → Environment Variables." });
  }

  try {
    const { system, messages } = req.body;

    // Convert from Anthropic format to Gemini format
    const contents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: system }]
          },
          contents,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.8
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Gemini API Error: ${errText}` });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    // Return in Anthropic-compatible format so the frontend works without changes
    return res.status(200).json({
      content: [{ type: "text", text: reply }]
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
