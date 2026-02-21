import { GoogleGenAI } from "@google/genai";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY not set");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const images = [
  {
    filename: "hero-bg",
    prompt:
      "Ultra-wide cinematic digital art. A human silhouette composed entirely of luminous neural pathways and glowing synaptic connections, standing in a dark void. Subtle biometric data readouts and heartbeat waveforms float around the figure. Color palette: electric cyan-green (#00e87b) and teal highlights against deep black. No text. Hyper-detailed, 8K quality, dark moody atmosphere.",
  },
  {
    filename: "hero-float-1",
    prompt:
      "Square format digital art. A translucent human brain viewed from above, with bioluminescent synaptic connections glowing in teal and cyan-green (#00e87b). Neural pathways light up like fiber optic cables. Background is pure black. No text. Ethereal, scientific, hyper-detailed.",
  },
  {
    filename: "hero-float-2",
    prompt:
      "Square format digital art. A human eye iris rendered as a glowing geometric mandala pattern, with concentric rings of circadian rhythm data visualizations. Colors: teal, cyan-green (#00e87b), hints of gold. Background is deep black. No text. Mystical and scientific blend.",
  },
  {
    filename: "hero-float-3",
    prompt:
      "Square format digital art. A meditating human figure in lotus position with golden luminous threads running along the body's meridian lines, connecting mind and body. The figure floats above a dark reflective surface. Colors: gold accents with cyan-green (#00e87b) energy aura. Background is black void. No text.",
  },
  {
    filename: "about-bg",
    prompt:
      "Wide format abstract digital art. A futuristic wellness data dashboard showing crystalline transparent organ systems (heart, brain, lungs) connected by glowing data streams. Minimal biometric charts and waveforms float in space. Colors: cyan-green (#00e87b) and teal on deep dark background. No text. Clean, sophisticated, medical-tech aesthetic.",
  },
  {
    filename: "tracks-bg",
    prompt:
      "Wide format digital art. A serene human face in profile view with cyberpunk-style holographic brain scan UI overlays projected around the head. Glowing neural mapping lines, data readouts, and scan grids. Colors: cyan-green (#00e87b) and teal highlights against dark background. No text. Cinematic, high-tech medical imaging aesthetic.",
  },
  {
    filename: "schedule-bg",
    prompt:
      "Wide format digital art. A DNA double helix structure rendered as fiber optic light strands spiraling elegantly through darkness. Each nucleotide base pair glows with subtle color variation. Colors: primarily cyan-green (#00e87b) and teal with hints of blue. Background is deep black. No text. Scientific, elegant, bioluminescent.",
  },
  {
    filename: "section-divider",
    prompt:
      "Ultra-wide thin horizontal digital art. An abstract wave of neural connections and synaptic nodes flowing horizontally. Very thin and wide composition. Subtle, minimal, delicate glowing lines. Colors: cyan-green (#00e87b) on black. No text. Minimal and elegant.",
  },
];

async function generateImage(img) {
  const outputPath = path.join("public", "generated", `${img.filename}.png`);

  if (existsSync(outputPath)) {
    console.log(`✓ ${img.filename}.png already exists, skipping`);
    return;
  }

  console.log(`⏳ Generating ${img.filename}.png...`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: [{ role: "user", parts: [{ text: img.prompt }] }],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No response parts");

    const imagePart = parts.find((p) => "inlineData" in p && p.inlineData?.data);
    if (!imagePart?.inlineData?.data) throw new Error("No image data in response");

    const buffer = Buffer.from(imagePart.inlineData.data, "base64");
    await writeFile(outputPath, buffer);
    console.log(`✅ ${img.filename}.png generated (${(buffer.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.error(`❌ ${img.filename}.png failed:`, err.message || err);
  }
}

// Generate sequentially to avoid rate limits
for (const img of images) {
  await generateImage(img);
}

console.log("\nDone!");
