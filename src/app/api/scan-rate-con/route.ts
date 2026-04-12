

// Uses OpenRouter API with Google Gemini for freight document extraction

import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
    try {
        // Check API key first
        if (!OPENROUTER_API_KEY) {
            console.error("[SCAN] OPENROUTER_API_KEY not configured");
            return NextResponse.json({ 
                error: "AI not configured. Please add OPENROUTER_API_KEY to .env.local" 
            }, { status: 500 });
        }

        const pdfParse = require("pdf-parse");
        console.log("[SCAN] Received PDF scan request");

        // Extract base64 from request JSON
        const body = await req.json();
        const fileBase = body.fileBase;

        if (!fileBase) {
            return NextResponse.json({ error: "No file content provided" }, { status: 400 });
        }

        // Decode Base64 to Buffer
        const buffer = Buffer.from(fileBase, 'base64');

        // Parse PDF text
        const pdfData = await pdfParse(buffer);
        const textContent = pdfData.text;

        if (!textContent || textContent.trim().length === 0) {
            return NextResponse.json({ error: "Could not extract text from the PDF" }, { status: 400 });
        }

        console.log("[SCAN] PDF text length:", textContent.length);

        // Truncate if too long
        const truncatedText = textContent.length > 5000 
            ? textContent.substring(0, 5000) + "..."
            : textContent;

        // Call OpenRouter with Gemini 2.0 Flash
        const payload = {
            model: "google/gemini-2.0-flash-001",
            messages: [
                {
                    role: "system",
                    content: `You are a logistics data extraction expert. Extract freight details from Rate Confirmation/BOL and return ONLY JSON with this exact structure:
{
  "date": "YYYY-MM-DD",
  "agencyName": "",
  "pro": "",
  "freightBillNumber": "",
  "reference": "",
  "pickup": "City, ST",
  "delivery": "City, ST",
  "pickupDate": "",
  "deliveryDate": "",
  "commodity": "",
  "weight": 0,
  "pieces": 0,
  "miles": 0,
  "rate": 0,
  "fuelSurcharge": 0,
  "loading": 0,
  "unloading": 0,
  "notes": "",
  "contactName": "",
  "contactPhone": "",
  "contactEmail": "",
  "contactFax": "",
  "trailerNumber": "",
  "equipmentType": "",
  "hazardousMaterial": false
}
Use "" for missing strings, 0 for missing numbers. Raw JSON only, no markdown.`
                },
                {
                    role: "user",
                    content: `Extract freight data from this document:\n\n${truncatedText}`
                }
            ],
            temperature: 0.1
        };

        console.log("[SCAN] Calling OpenRouter API...");
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:9003",
                "X-Title": "RVT Freight Ledger"
            },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();
        console.log("[SCAN] Response status:", response.status);

        if (!response.ok) {
            console.error("[SCAN] API error:", responseData);
            return NextResponse.json(
                { error: `OpenRouter Error: ${response.status} - ${JSON.stringify(responseData)}` },
                { status: 500 }
            );
        }

        const resultText = responseData.choices?.[0]?.message?.content;

        if (!resultText) {
            return NextResponse.json(
                { error: "Empty response from AI", data: responseData },
                { status: 500 }
            );
        }

        console.log("[SCAN] Result:", resultText.substring(0, 300));

        // Parse JSON
        let parsedData;
        try {
            const cleanText = resultText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            parsedData = JSON.parse(cleanText);
        } catch (e) {
            return NextResponse.json(
                { error: "JSON parse error", raw: resultText },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: parsedData });

    } catch (error) {
        console.error("[SCAN] Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Scan failed" },
            { status: 500 }
        );
    }
}
