# 🧪 SynthEvaluation

**An automated multi-agent evaluation framework that stress-tests AI chatbots using synthetic user personas.**

Built by Shraddha Mahangare · MSIS 549 Agentic AI Fair

---

## What This Does

SynthEvaluation uses AI agents that pretend to be different types of users (confused grandma, angry customer, social engineer, etc.) and automatically tests chatbots by having full conversations with them. After the conversation, a separate AI evaluator grades the bot on clarity, helpfulness, empathy, safety, and adaptability.

---

## 🚀 Deploy to Vercel (Step-by-Step for Beginners)

### Step 1: Get an Anthropic API Key (Free)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click **Sign Up** (use your UW email)
3. After signing in, go to **API Keys** in the left sidebar
4. Click **Create Key**, name it "SynthEvaluation"
5. **Copy the key** — it starts with `sk-ant-...` — save it somewhere safe!

> 💡 Anthropic gives new accounts $5 in free credits, which is enough for ~100+ stress tests.

### Step 2: Push This Code to GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** button → **New repository**
3. Name it `synth-evaluation`, keep it **Public**, click **Create repository**
4. Open your terminal/command prompt and run these commands:

```bash
# Navigate to this project folder
cd synth-evaluation

# Initialize git and push
git init
git add .
git commit -m "Initial commit - SynthEvaluation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/synth-evaluation.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Deploy to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and click **Sign Up** → sign in with GitHub
2. Click **Add New Project**
3. Find your `synth-evaluation` repo and click **Import**
4. **IMPORTANT — Add your API Key:**
   - Expand **Environment Variables**
   - Name: `ANTHROPIC_API_KEY`
   - Value: paste your `sk-ant-...` key from Step 1
   - Click **Add**
5. Click **Deploy**
6. Wait ~1 minute. Vercel will give you a URL like `synth-evaluation.vercel.app`

**That's it! Your app is live.** 🎉

### Step 4: Share It

Your app is now at: `https://synth-evaluation.vercel.app` (or similar)

Share this URL with:
- Your professor
- Fair judges
- Classmates who want to try it
- Anyone with a chatbot they want to test!

---

## 🧑‍💻 Run Locally (For Development)

```bash
# Install dependencies
npm install

# Create a .env file for your API key
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env

# Start the dev server
npm run dev
```

> Note: The local dev server requires a separate backend for the API proxy.
> For local development, you can temporarily use the Anthropic API directly
> by modifying the fetch URL in `src/App.jsx` from `/api/chat` to
> `https://api.anthropic.com/v1/messages` and adding the API key header.

---

## 📁 Project Structure

```
synth-evaluation/
├── api/
│   └── chat.js              ← Serverless function (keeps API key secret)
├── src/
│   ├── App.jsx              ← Main application (all 3 layers)
│   └── main.jsx             ← React entry point
├── index.html               ← HTML shell
├── package.json             ← Dependencies
├── vite.config.js           ← Build configuration
├── vercel.json              ← Vercel routing config
└── README.md                ← You are here!
```

## 🏗️ Architecture (The 3 Layers)

### Layer 1: Persona Engine
A library of system prompts that define synthetic user archetypes:
- 👵 Confused Grandma — vague language, off-topic tangents
- 😡 Angry Customer — CAPS LOCK, demands escalation
- ⚡ Power User — technical, expects detailed answers
- 💼 Impatient Executive — ultra-brief, zero patience
- 🌍 ESL Speaker — grammar errors, language barriers
- 🕵️ Social Engineer — tries to trick the bot

### Layer 2: Simulation Layer
A conversation loop that makes two AI systems talk to each other:
1. Synthetic User generates a message (using its persona prompt)
2. Target Bot responds (using its system prompt)
3. Repeat for N turns, maintaining conversation context

### Layer 3: Evaluation Pipeline
After the conversation ends, a separate AI evaluator:
1. Reads the full transcript
2. Grades 5 categories (Clarity, Helpfulness, Empathy, Safety, Adaptability)
3. Identifies strengths and failures
4. Provides an actionable recommendation

---

## 💰 Cost Estimate

Each stress test uses approximately:
- ~2,000-4,000 tokens per conversation turn
- ~1,500 tokens for evaluation
- **Total per test: ~$0.02-0.05**
- Your $5 free credit = **~100-250 tests**

---

## 🔑 Keeping Your API Key Safe

- The API key is stored as an **environment variable** on Vercel's servers
- It is **never exposed** to the browser or in your code
- The serverless function in `api/chat.js` acts as a secure proxy
- Never commit your API key to GitHub!

---

## Questions?

Contact: smahanga@uw.edu
