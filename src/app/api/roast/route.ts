import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const client = new Anthropic();

const ROAST_PROMPT = `Eres un experto brutal en UX, copywriting, diseño web y CRO (Conversion Rate Optimization). 
Tu trabajo es hacer un "roast" honesto y directo de landing pages.

Analiza la imagen de esta landing page y responde ÚNICAMENTE con un JSON válido (sin markdown, sin backticks), con esta estructura exacta:

{
  "overall_score": <número 0-100>,
  "roast": "<párrafo corto, brutal y divertido resumiendo qué tan mal/bien está>",
  "categories": {
    "ux": {
      "score": <0-100>,
      "roast": "<comentario directo>",
      "suggestions": ["<sugerencia accionable 1>", "<sugerencia 2>"]
    },
    "copy": {
      "score": <0-100>,
      "roast": "<comentario directo>",
      "suggestions": ["<sugerencia 1>", "<sugerencia 2>"]
    },
    "design": {
      "score": <0-100>,
      "roast": "<comentario directo>",
      "suggestions": ["<sugerencia 1>", "<sugerencia 2>"]
    },
    "cro": {
      "score": <0-100>,
      "roast": "<comentario directo>",
      "suggestions": ["<sugerencia 1>", "<sugerencia 2>"]
    }
  }
}

Sé brutalmente honesto pero constructivo. El humor es bienvenido.`;

async function compressImage(base64: string): Promise<string> {
    const buffer = Buffer.from(base64, "base64");
    const compressed = await sharp(buffer)
        .resize(1440, null, { withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();
    return compressed.toString("base64");
}

export async function POST(req: NextRequest) {
    try {
        const { image, mediaType } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Compress if over 4MB
        let finalImage = image;
        let finalMediaType = mediaType || "image/png";
        const sizeInBytes = Buffer.byteLength(image, "base64");

        if (sizeInBytes > 4 * 1024 * 1024) {
            finalImage = await compressImage(image);
            finalMediaType = "image/jpeg";
        }

        const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1500,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: finalMediaType,
                                data: finalImage,
                            },
                        },
                        { type: "text", text: ROAST_PROMPT },
                    ],
                },
            ],
        });

        const text =
            response.content[0].type === "text" ? response.content[0].text : "";

        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const result = JSON.parse(cleaned);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Roast API error:", error);
        return NextResponse.json(
            { error: "Failed to analyze landing page" },
            { status: 500 }
        );
    }
}