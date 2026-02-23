export interface Tool {
  name: string;
  description: string;
  url: string;
  category: ToolCategory;
}

export const TOOL_CATEGORIES = [
  "All",
  "Coding & Development",
  "Hosting & Infrastructure",
  "Image Generation & Design",
  "Video Creation",
  "Audio & Speech",
  "Music Generation",
  "3D Modeling",
  "Productivity & Organization",
  "Research & Search",
  "Product Development",
  "Agent Frameworks",
  "Large Language Models",
  "Agentic Browsers",
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

export const TOOLS: Tool[] = [
  // Coding & Development
  {
    name: "v0.dev",
    description: "AI-powered UI generation by Vercel. Describe a component and get production-ready React code.",
    url: "https://v0.dev",
    category: "Coding & Development",
  },
  {
    name: "Bolt",
    description: "AI coding agent that builds and deploys full-stack web apps from a prompt.",
    url: "https://bolt.new",
    category: "Coding & Development",
  },
  {
    name: "Cursor",
    description: "AI-first code editor built on VS Code. Inline completions, chat, and codebase-aware edits.",
    url: "https://cursor.com",
    category: "Coding & Development",
  },
  {
    name: "Claude Code",
    description: "Anthropic's agentic CLI for coding. Runs terminal commands, edits files, and builds features autonomously.",
    url: "https://docs.anthropic.com/en/docs/claude-code",
    category: "Coding & Development",
  },
  {
    name: "ChatGPT Codex",
    description: "OpenAI's code generation model. Write, debug, and explain code in dozens of languages.",
    url: "https://openai.com/index/openai-codex",
    category: "Coding & Development",
  },
  {
    name: "Windsurf",
    description: "AI-powered IDE with deep codebase understanding and multi-file editing.",
    url: "https://windsurf.com",
    category: "Coding & Development",
  },
  {
    name: "Replit Agent",
    description: "Build and deploy apps directly in your browser with an AI coding agent.",
    url: "https://replit.com",
    category: "Coding & Development",
  },
  {
    name: "Rork",
    description: "AI tool for rapid mobile app prototyping and development.",
    url: "https://rork.app",
    category: "Coding & Development",
  },
  {
    name: "n8n",
    description: "Open-source workflow automation. Connect APIs, build automations, and integrate AI agents.",
    url: "https://n8n.io",
    category: "Coding & Development",
  },
  // Hosting & Infrastructure
  {
    name: "Supabase",
    description: "Open-source Firebase alternative. Postgres database, auth, storage, and realtime subscriptions.",
    url: "https://supabase.com",
    category: "Hosting & Infrastructure",
  },
  {
    name: "Vercel",
    description: "Frontend deployment platform. Zero-config deploys for Next.js, React, and more.",
    url: "https://vercel.com",
    category: "Hosting & Infrastructure",
  },
  // Image Generation & Design
  {
    name: "Krea.ai",
    description: "Real-time AI image generation and enhancement. Great for rapid visual prototyping.",
    url: "https://krea.ai",
    category: "Image Generation & Design",
  },
  {
    name: "Midjourney",
    description: "High-quality AI image generation via Discord. Excellent for concept art and branding.",
    url: "https://midjourney.com",
    category: "Image Generation & Design",
  },
  {
    name: "Vizcom",
    description: "AI-powered industrial design tool. Turn sketches into photorealistic renders.",
    url: "https://vizcom.ai",
    category: "Image Generation & Design",
  },
  {
    name: "DALL-E",
    description: "OpenAI's image generation model. Create and edit images from text descriptions.",
    url: "https://openai.com/dall-e-3",
    category: "Image Generation & Design",
  },
  {
    name: "Stable Diffusion",
    description: "Open-source image generation. Run locally or via API for full creative control.",
    url: "https://stability.ai",
    category: "Image Generation & Design",
  },
  // Video Creation
  {
    name: "Google Veo 2",
    description: "Google's video generation model. Create high-quality video from text prompts.",
    url: "https://deepmind.google/technologies/veo",
    category: "Video Creation",
  },
  {
    name: "InVideo",
    description: "AI video editor with templates, stock footage, and text-to-video generation.",
    url: "https://invideo.io",
    category: "Video Creation",
  },
  {
    name: "Minimax",
    description: "AI video and music generation platform with high-quality output.",
    url: "https://minimaxi.com",
    category: "Video Creation",
  },
  {
    name: "Kling",
    description: "AI video generation with realistic motion and cinematic quality.",
    url: "https://klingai.com",
    category: "Video Creation",
  },
  // Audio & Speech
  {
    name: "ElevenLabs",
    description: "AI voice synthesis and cloning. Text-to-speech with natural-sounding voices.",
    url: "https://elevenlabs.io",
    category: "Audio & Speech",
  },
  {
    name: "Superwhisper",
    description: "AI-powered voice-to-text for macOS. Dictate anywhere with high accuracy.",
    url: "https://superwhisper.com",
    category: "Audio & Speech",
  },
  // Music Generation
  {
    name: "Suno",
    description: "Generate full songs with vocals from a text prompt. No musical experience needed.",
    url: "https://suno.com",
    category: "Music Generation",
  },
  {
    name: "Lemonaide AI",
    description: "AI music production assistant. Generate melodies, chords, and beats.",
    url: "https://lemonaide.ai",
    category: "Music Generation",
  },
  // 3D Modeling
  {
    name: "Meshy",
    description: "AI 3D model generation. Create textured 3D assets from text or images.",
    url: "https://meshy.ai",
    category: "3D Modeling",
  },
  // Productivity & Organization
  {
    name: "Superhuman",
    description: "AI-powered email client. Triage, draft, and manage email at lightning speed.",
    url: "https://superhuman.com",
    category: "Productivity & Organization",
  },
  {
    name: "Motion",
    description: "AI calendar and project management. Auto-schedules tasks around your meetings.",
    url: "https://usemotion.com",
    category: "Productivity & Organization",
  },
  {
    name: "Granola",
    description: "AI meeting notes. Automatically captures and structures meeting transcripts.",
    url: "https://granola.ai",
    category: "Productivity & Organization",
  },
  {
    name: "Gamma",
    description: "AI presentation builder. Generate slides and documents from a brief.",
    url: "https://gamma.app",
    category: "Productivity & Organization",
  },
  // Research & Search
  {
    name: "Deep Research",
    description: "AI-powered deep research tool that synthesizes information from multiple sources.",
    url: "https://openai.com/index/introducing-deep-research",
    category: "Research & Search",
  },
  {
    name: "Exa",
    description: "Neural search engine for developers. Find content by meaning, not just keywords.",
    url: "https://exa.ai",
    category: "Research & Search",
  },
  {
    name: "Firecrawl",
    description: "Web scraping API built for AI. Extract clean data from any website.",
    url: "https://firecrawl.dev",
    category: "Research & Search",
  },
  // Product Development
  {
    name: "Naya",
    description: "AI-powered 3D design tool for product development and CAD workflows.",
    url: "https://naya.ai",
    category: "Product Development",
  },
  {
    name: "Flora",
    description: "AI design assistant for product teams. Streamlines ideation to prototype.",
    url: "https://flora.dev",
    category: "Product Development",
  },
  // Agent Frameworks
  {
    name: "Agno",
    description: "Build, ship, and monitor agentic AI systems with a lightweight framework.",
    url: "https://agno.com",
    category: "Agent Frameworks",
  },
  {
    name: "OpenAI Agents",
    description: "Build multi-step AI agents with tool use, memory, and autonomous reasoning.",
    url: "https://platform.openai.com/docs/guides/agents",
    category: "Agent Frameworks",
  },
  {
    name: "LangChain",
    description: "Framework for building applications with LLMs. Chains, agents, and retrieval.",
    url: "https://langchain.com",
    category: "Agent Frameworks",
  },
  // Large Language Models
  {
    name: "ChatGPT",
    description: "OpenAI's conversational AI. Research, brainstorm, write, and code with GPT-4.",
    url: "https://chat.openai.com",
    category: "Large Language Models",
  },
  {
    name: "Claude",
    description: "Anthropic's AI assistant. Long context, careful reasoning, and strong coding ability.",
    url: "https://claude.ai",
    category: "Large Language Models",
  },
  {
    name: "Gemini",
    description: "Google's multimodal AI. Understands text, images, code, and video natively.",
    url: "https://gemini.google.com",
    category: "Large Language Models",
  },
  {
    name: "Llama",
    description: "Meta's open-source LLM family. Run locally or fine-tune for custom use cases.",
    url: "https://llama.meta.com",
    category: "Large Language Models",
  },
  // Agentic Browsers
  {
    name: "Perplexity Comet",
    description: "Agentic browser by Perplexity. Browse, search, and take actions with AI assistance.",
    url: "https://perplexity.ai",
    category: "Agentic Browsers",
  },
  {
    name: "OpenAI Operator",
    description: "OpenAI's agentic browser. AI navigates the web and completes tasks for you.",
    url: "https://openai.com/index/introducing-operator",
    category: "Agentic Browsers",
  },
  {
    name: "Dia",
    description: "The Browser Company's AI-native browser. Built from the ground up for agentic workflows.",
    url: "https://thebrowser.company",
    category: "Agentic Browsers",
  },
];
