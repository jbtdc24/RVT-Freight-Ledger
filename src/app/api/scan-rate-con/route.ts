import { NextRequest, NextResponse } from "next/server";
const pdfParse = require("pdf-parse");

// We rely on process.env.GOOGLE_GEMINI_API_KEY being set in .env.local
// The user provided an OpenRouter key, so we will use the fetch api directly.

export async function POST(req: NextRequest) {
    try {
        console.log("Received PDF scan request via Base64 payload");

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

        console.log("PDF parsed successfully, extracting structured data via Gemini...");

        // 5. Build prompt and expected schema for Gemini
        const prompt = `
            You are an expert logistics data extraction assistant. 
            I am providing you with the raw text extracted from a freight Rate Confirmation or Bill of Lading (BOL).
            Your job is to extract the relevant transportation details and return ONLY a valid JSON object matching the exact schema requested.
            Do not include any string wrapper, markdown formatting (like \`\`\`json), or conversational text. Return ONLY the raw JSON object.
            
            Here is the raw text from the document:
            """
            ${textContent}
            """
        `;

        const systemInstructionSchema = `
        {
            "date": "YYYY-MM-DD string, the date of the load or today if not found",
            "broker": "string, the name of the broker or customer",
            "customer": "string, alias for broker name",
            "pro": "string, PRO number or Load ID",
            "reference": "string, any secondary reference numbers",
            "pickup": "string, City, ST of pickup. (e.g. 'Dallas, TX')",
            "delivery": "string, City, ST of delivery. (e.g. 'Austin, TX')",
            "pickupDate": "string, Date of pickup (e.g. 'Oct 24, 2023')",
            "deliveryDate": "string, Date of delivery",
            "weight": 0, // number, total weight in lbs
            "pieces": 0, // number, total pieces/pallets
            "miles": 0, // number, total distance/miles (estimate if necessary or extract)
            "rate": 0.00, // number, the total pay or gross rate
            "notes": "string, any special instructions, temps, or notes"
        }`;
        // 6. Call OpenRouter API using standard fetch
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY; // Reusing the same env var name but it's an OpenRouter key

        const openRouterPayload = {
            model: "google/gemini-2.5-flash",
            messages: [
                {
                    role: "developer",
                    content: `Extract the data into this EXACT JSON structure. If a field is not found, leave it as an empty string ("") or 0 for numbers. Return ONLY this JSON. Do not include markdown formatting.\n${systemInstructionSchema}`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" }
        };

        console.log("Calling OpenRouter API...");
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(openRouterPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json();
        let resultText = responseData.choices?.[0]?.message?.content;

        if (!resultText) {
            throw new Error("Gemini returned an empty response.");
        }

        console.log("Gemini extracted data:", resultText);

        // 7. Parse the JSON and return
        let parsedData;
        try {
            parsedData = JSON.parse(resultText);
        } catch (e) {
            console.error("Failed to parse Gemini output as JSON", e);
            return NextResponse.json({ error: "Failed to parse extraction results", raw: resultText }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: parsedData });

    } catch (error: any) {
        console.error("Error scanning rate con:", error);
        return NextResponse.json(
            { error: error.message || "An unexpected error occurred during document scanning" },
            { status: 500 }
        );
    }
}
