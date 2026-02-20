# 🍇 GRAPE — GRill Agent Persona Eval

**An automated multi-agent evaluation framework that stress-tests AI chatbots using synthetic user personas.**

Built by Shraddha Mahangare · MSIS 549 Agentic AI Fair

---

## What This Does

GRAPE uses AI agents that pretend to be different types of users (confused grandma, angry customer, social engineer, etc.) and automatically tests chatbots by having full conversations with them. After the conversation, a separate AI evaluator grades the bot on clarity, helpfulness, empathy, safety, and adaptability.

---

## 🚀 Deploy to Vercel (Step-by-Step for Beginners)

### Step 1: Get a Google Gemini API Key (Free)

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Go to **API Keys** in the left sidebar
4. Click **Create Key**, name it "GRAPE"
5. **Copy the key** — save it somewhere safe!

> 💡 Gemini gives free tier access which is enough for many stress tests.

### Step 2: Push This Code to GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** button → **New repository**
3. Name it `grape-eval`, keep it **Public**, click **Create repository**
4. Open your terminal/command prompt and run these commands:

```bash
# Navigate to this project folder
cd grape-eval

# Initialize git and push
git init
git add .
git commit -m "Initial commit - GRAPE"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/grape-eval.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Deploy to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and click **Sign Up** → sign in with GitHub
2. Click **Add New Project**
3. Find your repo and click **Import**
4. **IMPORTANT — Add your API Key:**
   - Expand **Environment Variables**
   - Name: `GOOGLE_API_KEY`
   - Value: paste your Gemini API key from Step 1
   - Click **Add**
5. Click **Deploy**
6. Wait ~1 minute. Vercel will give you a URL

**That's it! Your app is live.** 🎉

### Step 4: Share It

Share your app URL with:
- Your professor
- Fair judges
- Classmates who want to try it
- Anyone with a chatbot they want to test!

---

## 🧑‍💻 Run Locally (For Development)

```bash
# Install dependencies
npm install

# Create a .env.local file for your API key
echo "GOOGLE_API_KEY=your-key-here" > .env.local

# Start the dev server
npm run dev
```

---

## 📁 Project Structure

```
grape-eval/
├── api/
│   └── chat.js              ← Serverless function (keeps API key secret)
├── src/
│   ├── App.jsx              ← Main application (all 3 layers)
│   └── main.jsx             ← React entry point
├── index.html               ← HTML shell
├── package.json             ← Dependencies
├── vite.config.js           ← Build configuration
├── vercel.json              ← Vercel routing config
├── ARCHITECTURE.md          ← System architecture diagram
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

---

## 🔑 Keeping Your API Key Safe

- The API key is stored as an **environment variable** on Vercel's servers
- It is **never exposed** to the browser or in your code
- The serverless function in `api/chat.js` acts as a secure proxy
- Never commit your API key to GitHub!

---

## Questions?

Contact: smahanga@uw.edu
