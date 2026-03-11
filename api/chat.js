// GRAPE (GRill Agent Persona Eval) API Proxy
// Supports two engines: "claude" (Anthropic) for testing agents, "gemini" (Google) for evaluation

function isUrlAllowed(urlString) {
  let parsed;
  try { parsed = new URL(urlString); } catch { return false; }

  if (parsed.protocol !== "https:") return false;

  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]" ||
    hostname === "metadata.google.internal" ||
    hostname === "169.254.169.254" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".local")
  ) return false;

  // Block 172.16.0.0 - 172.31.255.255 (private range)
  const parts = hostname.split(".");
  if (parts[0] === "172") {
    const second = parseInt(parts[1], 10);
    if (second >= 16 && second <= 31) return false;
  }

  return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { system, messages, max_tokens, engine, externalUrl, externalBody, externalAuth } = req.body;

    // If an external URL is provided, proxy the request server-side (avoids browser CORS)
    if (externalUrl) {
      if (!isUrlAllowed(externalUrl)) {
        return res.status(400).json({ error: "Invalid URL. Must be HTTPS and not point to internal/private network addresses." });
      }
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

    // ── Claude (Anthropic) engine ──
    if (engine === "claude") {
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured. Add it in Vercel → Settings → Environment Variables." });
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: max_tokens || 1024,
          system: system || undefined,
          messages
        })
      });

      const responseText = await response.text();

      if (!response.ok) {
        return res.status(response.status).json({ error: `Claude API Error ${response.status}: ${responseText.slice(0, 500)}` });
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        return res.status(502).json({ error: `Claude returned non-JSON response: ${responseText.slice(0, 300)}` });
      }

      // Already in Anthropic format — return as-is
      return res.status(200).json(data);
    }

    // ── Gemini (Google) engine (default) ──
    const googleKey = process.env.GOOGLE_API_KEY;
    if (!googleKey) {
      return res.status(500).json({ error: "GOOGLE_API_KEY not configured. Add it in Vercel → Settings → Environment Variables." });
    }

    // Convert from Anthropic format to Gemini format
    const contents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${googleKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: system }]
          },
          contents,
          generationConfig: {
            maxOutputTokens: max_tokens || 1024,
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
