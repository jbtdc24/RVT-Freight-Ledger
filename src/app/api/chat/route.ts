

// AI Chatbot API - Uses OpenRouter to answer questions about the user's account

import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// System prompt with tax expertise
const SYSTEM_PROMPT = `You are RVT AI Assistant, an expert trucking business consultant and tax advisor for the RVT Freight Ledger system.

YOUR CAPABILITIES:
1. Read and analyze account data including:
   - Freight loads (shipments, deliveries, revenue, expenses)
   - Drivers (names, pay rates, assignments)
   - Assets/Trucks (identifiers, types, expenses)
   - Financial summaries (revenue, expenses, profit)
   - Business expenses (fuel, maintenance, etc.)

2. Answer questions about:
   - "How many loads this month?"
   - "What's my total revenue?"
   - "Which driver has the most deliveries?"
   - "Show me expenses for Truck 101"
   - "What's my profit margin?"

3. TAX EXPERTISE - You can advise on:
   - Deductible business expenses for trucking
   - Per diem rates and meal deductions
   - Fuel tax credits (IFTA)
   - Depreciation on trucks and equipment
   - Owner-operator tax deductions
   - Quarterly estimated tax payments
   - 1099 filing requirements
   - Business vs personal expense separation
   - Record keeping requirements
   - IRS mileage rates
   - Section 179 deductions
   - Heavy vehicle use tax (HVUT/Form 2290)
   - Self-employment tax calculations

4. Provide insights and analysis:
   - Trends in revenue/expenses
   - Driver performance
   - Cost per mile calculations
   - Tax optimization suggestions
   - Cash flow analysis

5. CRITICAL - You CANNOT actually modify data. You can only:
   - Answer questions
   - Provide analysis
   - Suggest actions (user must do manually)
   - Give tax advice (not legal advice - always recommend consulting a CPA)

RESPONSE FORMAT:
- Be concise but informative
- Use bullet points for lists
- Show calculations when relevant
- Format currency as $X,XXX.XX
- If data is empty/missing, say so clearly
- For tax questions, provide general guidance and add disclaimer: "This is general information. Consult a qualified CPA for personalized tax advice."

When the user asks you to DO something (create, update, delete), explain that you can only provide information and they need to use the UI to make changes.`;

export async function POST(req: NextRequest) {
    try {
        // Check API key first
        if (!OPENROUTER_API_KEY) {
            console.error("[CHAT] OPENROUTER_API_KEY not configured");
            return NextResponse.json({ 
                error: "AI not configured. Please add OPENROUTER_API_KEY to .env.local" 
            }, { status: 500 });
        }

        const body = await req.json();
        const { messages, context } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Messages array required" }, { status: 400 });
        }

        // Build context summary from account data
        let contextPrompt = "";
        if (context) {
            contextPrompt = buildContextPrompt(context);
        }

        // Prepare messages for OpenRouter
        const fullMessages = [
            { role: "system", content: SYSTEM_PROMPT + contextPrompt },
            ...messages.map((m: any) => ({
                role: m.role,
                content: m.content
            }))
        ];

        console.log("[CHAT] Calling OpenRouter API...");
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:9003",
                "X-Title": "RVT Freight Ledger"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: fullMessages,
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        console.log("[CHAT] Response status:", response.status);

        const responseText = await response.text();
        console.log("[CHAT] Response text:", responseText.substring(0, 500));

        if (!response.ok) {
            console.error("[CHAT] OpenRouter API error:", responseText);
            return NextResponse.json({ 
                error: `API Error ${response.status}: ${responseText}` 
            }, { status: 500 });
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("[CHAT] JSON parse error:", e);
            return NextResponse.json({ error: "Invalid JSON from API" }, { status: 500 });
        }

        const reply = data.choices?.[0]?.message?.content;

        if (!reply) {
            console.error("[CHAT] No reply in response:", data);
            return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
        }

        return NextResponse.json({ reply });

    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Chat failed" },
            { status: 500 }
        );
    }
}

// Build a summary of account data for the AI context
function buildContextPrompt(context: any): string {
    const { freight, drivers, assets, expenses, homeTransactions } = context;
    
    let prompt = "\n\nCURRENT ACCOUNT DATA:\n";
    
    // Freight summary
    if (freight && freight.length > 0) {
        const totalLoads = freight.length;
        const delivered = freight.filter((f: any) => f.status === 'Delivered').length;
        const inTransit = freight.filter((f: any) => f.status === 'In Route').length;
        const pending = freight.filter((f: any) => f.status === 'For Pickup').length;
        const cancelled = freight.filter((f: any) => f.status === 'Cancelled').length;
        const totalRevenue = freight.reduce((sum: number, f: any) => sum + (f.revenue || 0), 0);
        const totalExpenses = freight.reduce((sum: number, f: any) => sum + (f.totalExpenses || 0), 0);
        const totalProfit = freight.reduce((sum: number, f: any) => sum + (f.netProfit || 0), 0);
        const totalMiles = freight.reduce((sum: number, f: any) => sum + (f.distance || 0), 0);
        
        prompt += `\nFREIGHT LOADS (${totalLoads} total):\n`;
        prompt += `- Status: ${delivered} Delivered, ${inTransit} In Transit, ${pending} Pending, ${cancelled} Cancelled\n`;
        prompt += `- Total Revenue: $${totalRevenue.toLocaleString()}\n`;
        prompt += `- Total Expenses: $${totalExpenses.toLocaleString()}\n`;
        prompt += `- Net Profit: $${totalProfit.toLocaleString()}\n`;
        prompt += `- Total Miles: ${totalMiles.toLocaleString()}\n`;
        prompt += `- Average Revenue per Load: $${Math.round(totalRevenue / totalLoads).toLocaleString()}\n`;
        prompt += `- Average per Mile: $${totalMiles > 0 ? (totalRevenue / totalMiles).toFixed(2) : '0.00'}\n`;
        
        // Recent loads (last 5)
        const recent = freight.slice(0, 5);
        prompt += `- Recent loads: ${recent.map((f: any) => `${f.freightId} ($${f.revenue})`).join(', ')}\n`;
    } else {
        prompt += "\nFREIGHT: No loads in system\n";
    }
    
    // Drivers
    if (drivers && drivers.length > 0) {
        prompt += `\nDRIVERS (${drivers.length}):\n`;
        drivers.forEach((d: any) => {
            const payType = d.payType === 'per-mile' ? '$/mile' : '%';
            prompt += `- ${d.name} (${d.payRate}${payType})\n`;
        });
    }
    
    // Assets
    if (assets && assets.length > 0) {
        prompt += `\nASSETS (${assets.length}):\n`;
        assets.forEach((a: any) => {
            prompt += `- ${a.identifier} (${a.type})\n`;
        });
    }
    
    // Business expenses
    if (expenses && expenses.length > 0) {
        const totalBizExpenses = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        const byCategory: Record<string, number> = {};
        expenses.forEach((e: any) => {
            byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0);
        });
        
        prompt += `\nBUSINESS EXPENSES:\n`;
        prompt += `- Total: $${totalBizExpenses.toLocaleString()}\n`;
        prompt += `- Count: ${expenses.length} entries\n`;
        prompt += `- By Category:\n`;
        Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .forEach(([cat, amt]) => {
                prompt += `  • ${cat}: $${(amt as number).toLocaleString()}\n`;
            });
    }
    
    // Home transactions
    if (homeTransactions && homeTransactions.length > 0) {
        const income = homeTransactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
        const homeExpenses = homeTransactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
        prompt += `\nPERSONAL/HOME:\n`;
        prompt += `- Income: $${income.toLocaleString()}\n`;
        prompt += `- Expenses: $${homeExpenses.toLocaleString()}\n`;
    }
    
    return prompt;
}
