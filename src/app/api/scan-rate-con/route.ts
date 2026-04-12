

// Uses Kimi/Moonshot API for freight document extraction
// Docs: https://platform.moonshot.cn/docs/api-reference

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const pdfParse = require("pdf-parse");
        console.log("[SCAN] Received PDF scan request");

        // 2. Extract base64 from request JSON
        const body = await req.json();
        const fileBase = body.fileBase;

        if (!fileBase) {
            return NextResponse.json({ error: "No file content provided" }, { status: 400 });
        }

        // 3. Decode Base64 to Buffer
        const buffer = Buffer.from(fileBase, 'base64');

        // 4. Parse PDF text
        const pdfData = await pdfParse(buffer);
        const textContent = pdfData.text;

        if (!textContent || textContent.trim().length === 0) {
            return NextResponse.json({ error: "Could not extract text from the PDF" }, { status: 400 });
        }

        console.log("[SCAN] PDF parsed, text length:", textContent.length);

        // 5. Truncate if too long (Kimi has token limits)
        const truncatedText = textContent.length > 8000 
            ? textContent.substring(0, 8000) + "..."
            : textContent;

        // 6. Build prompt
        const messages = [
            {
                role: "system" as const,
                content: `You are a logistics data extraction expert. Extract freight details and return ONLY JSON with this exact structure:
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
Use "" for missing strings, 0 for missing numbers. Return raw JSON only.`
            },
            {
                role: "user" as const,
                content: `Extract freight data from this Rate Confirmation/BOL:\n\n${truncatedText}`
            }
        ];

        // 7. Call Kimi API with exact format from docs
        const apiKey = "sk-kimi-nEcqvDMDB80JcxNpZXUDVYhdKelSpIhrwWmMIuTg1Ml8eGfKlyX0zQHvoem55un0";
        
        const payload = {
            model: "moonshot-v1-8k",
            messages: messages,
            temperature: 0.1,
            max_tokens: 2048
        };

        console.log("[SCAN] Calling Kimi API...");
        console.log("[SCAN] Payload:", JSON.stringify(payload, null, 2));
        
        const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        console.log("[SCAN] Response status:", response.status);
        console.log("[SCAN] Response headers:", Object.fromEntries(response.headers.entries()));
        console.log("[SCAN] Response body:", responseText.substring(0, 1000));

        if (!response.ok) {
            // Try to parse error
            let errorDetail = responseText;
            try {
                const errJson = JSON.parse(responseText);
                errorDetail = JSON.stringify(errJson, null, 2);
            } catch {}
            
            return NextResponse.json(
                { error: `Kimi API Error ${response.status}: ${errorDetail}` },
                { status: 500 }
            );
        }

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            return NextResponse.json(
                { error: "Invalid JSON from Kimi API", raw: responseText },
                { status: 500 }
            );
        }

        const resultText = responseData.choices?.[0]?.message?.content;

        if (!resultText) {
            console.error("[SCAN] No content in response:", JSON.stringify(responseData, null, 2));
            return NextResponse.json(
                { error: "Kimi returned empty content" },
                { status: 500 }
            );
        }

        console.log("[SCAN] Raw result:", resultText.substring(0, 500));

        // 8. Parse JSON from response
        let parsedData;
        try {
            // Remove markdown if present
            const cleanText = resultText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            parsedData = JSON.parse(cleanText);
        } catch (e) {
            console.error("[SCAN] JSON parse error:", e);
            return NextResponse.json(
                { error: "Failed to parse Kimi response as JSON", raw: resultText },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: parsedData });

    } catch (error) {
        console.error("[SCAN] Fatal error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Scan failed: ${errorMessage}` },
            { status: 500 }
        );
    }
}
