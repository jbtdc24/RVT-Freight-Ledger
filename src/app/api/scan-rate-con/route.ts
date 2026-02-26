import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
const pdfParse = require("pdf-parse");

// 1. Initialize Gemini
// We rely on process.env.GOOGLE_GEMINI_API_KEY being set in .env.local
const ai = new GoogleGenAI({});

export async function POST(req: NextRequest) {
    try {
        console.log("Received PDF scan request");

        // 2. Extract fileUrl from request JSON
        const body = await req.json();
        const fileUrl = body.fileUrl;

        if (!fileUrl) {
            return NextResponse.json({ error: "No file URL provided" }, { status: 400 });
        }

        console.log(`Fetching file from Storage URL: ${fileUrl}`);

        // 3. Fetch the file arrayBuffer from Firebase Storage
        const fetchRes = await fetch(fileUrl);
        if (!fetchRes.ok) {
            throw new Error(`Failed to fetch file from storage. Status: ${fetchRes.status}`);
        }
        const arrayBuffer = await fetchRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

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

        // 6. Call Gemini API
        // Using gemini-2.5-flash as it's the recommended default for fast, multimodal/text tasks
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                // Force JSON output matching our Freight interface
                responseMimeType: "application/json",
                // Provide a strict schema string reflecting the Freight object we want
                // Note: the GenAI SDK config.responseSchema expects a specific format if used, 
                // but setting responseMimeType to application/json normally instructs the model to just return JSON.
                // We'll enforce the structure in the prompt.
                systemInstruction: `Extract the data into this EXACT JSON structure. If a field is not found, leave it as an empty string ("") or 0 for numbers. Return ONLY this JSON.
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
                }`
            }
        });

        const resultText = response.text;

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
