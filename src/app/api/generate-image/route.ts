import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { prompt, filename } = await req.json();

    if (!prompt || !filename) {
      return NextResponse.json(
        { error: "prompt and filename are required" },
        { status: 400 }
      );
    }

    const outputPath = path.join(
      process.cwd(),
      "public",
      "generated",
      `${filename}.png`
    );
    const publicUrl = `/generated/${filename}.png`;

    // Return cached image if it already exists
    if (existsSync(outputPath)) {
      return NextResponse.json({ url: publicUrl });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      return NextResponse.json(
        { error: "No response from Gemini" },
        { status: 500 }
      );
    }

    const imagePart = parts.find(
      (p) => "inlineData" in p && p.inlineData?.data
    );

    if (!imagePart || !("inlineData" in imagePart) || !imagePart.inlineData?.data) {
      return NextResponse.json(
        { error: "No image in response" },
        { status: 500 }
      );
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
    await writeFile(outputPath, imageBuffer);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
