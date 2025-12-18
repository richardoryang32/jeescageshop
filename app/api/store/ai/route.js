import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { openai } from "@/configs/openai";

async function main(base64Image, mimeType) {
  const messages = [
    {
      role: "system",
      content: `
You are a product listing assistant for an e-commerce store.
Your job is to analyze an image of a product and generate structured data.

Respond ONLY with raw JSON (no markdown, no explanation).
Schema:
{
  "name": string,
  "description": string
}
      `,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Analyze this image and return name + description.",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`,
          },
        },
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages,
  });

  const raw = response.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("AI did not return valid JSON");
  }
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    const { base64Image, mimeType } = await request.json();

    const result = await main(base64Image, mimeType);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
