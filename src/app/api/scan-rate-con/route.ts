import { NextRequest, NextResponse } from "next/server";

// Dynamic import for pdf-parse to avoid ES module issues
async function loadPdfParse() {
  const pdfParse = await import("pdf-parse");
  return pdfParse.default || pdfParse;
}

// Schema for the extracted data
const extractionSchema = {
  date: "YYYY-MM-DD string, the date of the load or today if not found",
  agencyName: "string, the Operating Entity, Agency Name, or broker name",
  pro: "string, PRO number or Load ID",
  freightBillNumber: "string, Freight Bill # if available",
  reference: "string, any secondary reference numbers or Customer Reference",
  pickup: "string, City, ST of pickup. (e.g. 'Dallas, TX')",
  delivery: "string, City, ST of delivery. (e.g. 'Austin, TX')",
  pickupDate: "string, Date of pickup (e.g. 'Oct 24, 2023')",
  deliveryDate: "string, Date of delivery",
  commodity: "string, description of the cargo, item, or commodity",
  weight: 0,
  pieces: 0,
  miles: 0,
  rate: 0.00,
  fuelSurcharge: 0.00,
  loading: 0.00,
  unloading: 0.00,
  notes: "string, any special instructions, temps, or bco special instructions",
  contactName: "string, name of the contact person",
  contactPhone: "string, contact phone number",
  contactEmail: "string, contact email address",
  contactFax: "string, contact fax number",
  trailerNumber: "string, trailer number",
  equipmentType: "string, equipment type (e.g. VANL, REEFER)",
  hazardousMaterial: false
};

export async function POST(req: NextRequest) {
  try {
    console.log("Received PDF scan request via Base64 payload");

    // 1. Validate API key is configured
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("API key not configured");
      return NextResponse.json(
        { error: "Server configuration error: API key not set" },
        { status: 500 }
      );
    }

    // 2. Extract base64 from request JSON
    let body: { fileBase?: string };
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON with fileBase field." },
        { status: 400 }
      );
    }

    const { fileBase } = body;

    if (!fileBase || typeof fileBase !== 'string') {
      return NextResponse.json(
        { error: "No file content provided or invalid format" },
        { status: 400 }
      );
    }

    // 3. Validate base64 format
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    const cleanBase64 = fileBase.replace(/^data:.*?;base64,/, '');
    
    if (!base64Regex.test(cleanBase64)) {
      return NextResponse.json(
        { error: "Invalid base64 format" },
        { status: 400 }
      );
    }

    // 4. Decode Base64 to Buffer
    let buffer: Buffer;
    try {
      buffer = Buffer.from(cleanBase64, 'base64');
    } catch (e) {
      return NextResponse.json(
        { error: "Failed to decode base64 content" },
        { status: 400 }
      );
    }

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "Empty file content" },
        { status: 400 }
      );
    }

    // 5. Parse PDF text
    let textContent: string;
    try {
      const pdfParse = await loadPdfParse();
      const pdfData = await pdfParse(buffer);
      textContent = pdfData.text;
    } catch (e: any) {
      console.error("PDF parsing error:", e);
      return NextResponse.json(
        { error: "Failed to parse PDF. Make sure it's a valid PDF file." },
        { status: 400 }
      );
    }

    if (!textContent || textContent.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from the PDF. The file may be scanned images or corrupted." },
        { status: 400 }
      );
    }

    console.log("PDF parsed successfully, length:", textContent.length);
    console.log("Extracting structured data via OpenRouter...");

    // 6. Build prompt for Gemini
    const prompt = `
You are an expert logistics data extraction assistant. 
I am providing you with the raw text extracted from a freight Rate Confirmation or Bill of Lading (BOL).
Your job is to extract the relevant transportation details and return ONLY a valid JSON object matching the exact schema requested.
Do not include any string wrapper, markdown formatting (like \`\`\`json), or conversational text. Return ONLY the raw JSON object.

Here is the raw text from the document:
"""
${textContent.substring(0, 10000)}
"""
`;

    const systemInstructionSchema = JSON.stringify(extractionSchema, null, 2);

    // 7. Call OpenRouter API
    const openRouterPayload = {
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: `Extract the data into this EXACT JSON structure. If a field is not found, use these defaults:
- string fields: ""
- number fields: 0
- boolean fields: false

Return ONLY valid JSON. Do not include markdown formatting or explanations.

Schema:
${systemInstructionSchema}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "RVT Freight Ledger"
      },
      body: JSON.stringify(openRouterPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      return NextResponse.json(
        { error: `AI service error: ${response.status}. Please try again.` },
        { status: 502 }
      );
    }

    const responseData = await response.json();
    let resultText = responseData.choices?.[0]?.message?.content;

    if (!resultText) {
      console.error("Empty response from OpenRouter:", responseData);
      return NextResponse.json(
        { error: "AI returned an empty response. Please try again." },
        { status: 502 }
      );
    }

    // Clean up the response - remove markdown code blocks if present
    resultText = resultText
      .replace(/^```json\s*/, '')
      .replace(/```\s*$/, '')
      .trim();

    console.log("AI extracted data successfully");

    // 8. Parse and validate the JSON
    let parsedData: Record<string, unknown>;
    try {
      parsedData = JSON.parse(resultText);
    } catch (e) {
      console.error("Failed to parse AI output as JSON:", resultText.substring(0, 200));
      return NextResponse.json(
        { error: "Failed to parse extraction results", raw: resultText.substring(0, 500) },
        { status: 500 }
      );
    }

    // 9. Validate and sanitize the extracted data
    const sanitizedData = {
      date: typeof parsedData.date === 'string' ? parsedData.date : new Date().toISOString().split('T')[0],
      agencyName: String(parsedData.agencyName || ''),
      pro: String(parsedData.pro || ''),
      freightBillNumber: String(parsedData.freightBillNumber || ''),
      reference: String(parsedData.reference || ''),
      pickup: String(parsedData.pickup || ''),
      delivery: String(parsedData.delivery || ''),
      pickupDate: String(parsedData.pickupDate || ''),
      deliveryDate: String(parsedData.deliveryDate || ''),
      commodity: String(parsedData.commodity || ''),
      weight: Number(parsedData.weight) || 0,
      pieces: Number(parsedData.pieces) || 0,
      miles: Number(parsedData.miles) || 0,
      rate: Number(parsedData.rate) || 0,
      fuelSurcharge: Number(parsedData.fuelSurcharge) || 0,
      loading: Number(parsedData.loading) || 0,
      unloading: Number(parsedData.unloading) || 0,
      notes: String(parsedData.notes || ''),
      contactName: String(parsedData.contactName || ''),
      contactPhone: String(parsedData.contactPhone || ''),
      contactEmail: String(parsedData.contactEmail || ''),
      contactFax: String(parsedData.contactFax || ''),
      trailerNumber: String(parsedData.trailerNumber || ''),
      equipmentType: String(parsedData.equipmentType || ''),
      hazardousMaterial: Boolean(parsedData.hazardousMaterial)
    };

    return NextResponse.json({ 
      success: true, 
      data: sanitizedData 
    });

  } catch (error: any) {
    console.error("Error scanning rate con:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during document scanning" },
      { status: 500 }
    );
  }
}

// Disable body parsing to handle large base64 strings
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};
