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
    const { system, messages, externalUrl, externalBody, externalAuth } = req.body;

    // If an external URL is provided, proxy the request server-side (avoids browser CORS)
    if (externalUrl) {
      const headers = { "Content-Type": "application/json" };
      if (externalAuth?.username && externalAuth?.password) {
        const creds = Buffer.from(`${externalAuth.username}:${externalAuth.password}`).toString("base64");
        headers["Authorization"] = `Basic ${creds}`;
      }
      const extResp = await fetch(externalUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(externalBody)
      });
      const extText = await extResp.text();
      if (!extResp.ok) {
        return res.status(extResp.status).json({ error: `External API Error ${extResp.status}: ${extText.slice(0, 500)}` });
      }
      let extData;
      try {
        extData = JSON.parse(extText);
      } catch {
        return res.status(502).json({ error: `External API returned non-JSON response: ${extText.slice(0, 300)}` });
      }
      // Try common response shapes, then fall back to raw JSON
      const reply = extData.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("\n")
        || extData.choices?.[0]?.message?.content
        || extData.content?.map?.(b => b.text || "").join("\n")
        || extData.reply || extData.response || extData.message || extData.text || extData.output
        || JSON.stringify(extData);
      return res.status(200).json({ content: [{ type: "text", text: reply }] });
    }

    // Convert from Anthropic format to Gemini format
    const contents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
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

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: `Gemini API Error ${response.status}: ${responseText.slice(0, 500)}` });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return res.status(502).json({ error: `Gemini returned non-JSON response: ${responseText.slice(0, 300)}` });
    }
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    // Return in Anthropic-compatible format so the frontend works without changes
    return res.status(200).json({
      content: [{ type: "text", text: reply }]
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
