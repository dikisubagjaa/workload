import OpenAI from "openai";
import { jsonResponse } from "@/utils/apiResponse";

export const runtime = "nodejs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
    return jsonResponse({
        msg: "✅ API is working. Use POST { content } to get AI suggestions.",
    });
}

export async function POST(req) {
    try {
        const bodyText = await req.text();

        if (!bodyText) {
            return jsonResponse({ msg: "Empty request body" }, { status: 400 });
        }

        let body;
        try {
            body = JSON.parse(bodyText);
        } catch {
            return jsonResponse({ msg: "Invalid JSON format" }, { status: 400 });
        }

        const { content } = body;
        if (!content) {
            return jsonResponse({ msg: "Missing content" }, { status: 400 });
        }

        const prompt = `
            You are an expert in content analysis, copywriting, and SEO optimization.

            Please analyze the following content and provide a **well-formatted Markdown response** with clear section titles, bullet points, and line breaks for readability.

            ---

            ### 🧩 TASKS:
            1. Provide **suggestions for improvement** in terms of:
            - Structure
            - Tone
            - Clarity
            2. Suggest **5–10 relevant SEO keywords** based on the topic.
            3. Create an **SEO Meta Title** (under 60 characters, engaging, keyword-rich).
            4. Create an **SEO Meta Description** (under 160 characters, persuasive, containing main keywords).

            ---

            ### 🧱 FORMAT YOUR RESPONSE LIKE THIS:
            **📝 Suggestions for Improvement**
            - Point 1  
            - Point 2  
            - Point 3  

            **🔑 SEO Keywords**
            - keyword1  
            - keyword2  
            - keyword3  
            - keyword4  
            - keyword5  

            **🏷️ Recommended SEO Meta Title**
            Title here

            **🧾 Recommended SEO Meta Description**
            Description here

            ---

            ### 📄 CONTENT TO ANALYZE:
            ${content}
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });

        const result = completion.choices[0]?.message?.content || "No response";
        return jsonResponse({ result });
    } catch (err) {
        console.error("❌ API Error:", err);
        return jsonResponse(
            { msg: err.message || "Unknown error" },
            { status: 500 }
        );
    }
}
