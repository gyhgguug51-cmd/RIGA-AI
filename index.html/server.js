const express = require("express");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const OpenAI = require("openai");

// پیدا کردن فایل .env
const envPaths = [
    path.join(__dirname, ".env"),
    path.join(__dirname, "..", ".env"),
    path.join(process.cwd(), ".env")
];

// بارگذاری تنظیمات
for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath, override: true });

        if (process.env.GAPGPT_API_KEY?.trim()) {
            break;
        }
    }
}

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// اتصال به GapGPT
const apiKey = process.env.GAPGPT_API_KEY?.trim();

const ai = apiKey
    ? new OpenAI({
        apiKey,
        baseURL: process.env.GAPGPT_BASE_URL?.trim()
            || "https://api.gapgpt.app/v1"
    })
    : null;

// صفحه اصلی
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// دریافت پیام و ارسال به GapGPT
app.post("/api/chat", async (req, res) => {
    try {
        if (!ai) {
            return res.status(500).json({
                error: "کلید GAPGPT_API_KEY بارگذاری نشده است. فایل .env را بررسی کنید."
            });
        }

        const message = String(req.body?.message || "").trim();

        if (!message) {
            return res.status(400).json({
                error: "لطفاً پیام خود را بنویسید."
            });
        }

        const result = await ai.chat.completions.create({
            model: "gpt-4o-mini",
           messages: [
  {
    role: "system",
    content: "تو دستیار هوش مصنوعی RIGA AI هستی. اگر کاربر پرسید سازنده، طراح یا بنیان‌گذار RIGA AI چه کسی است، همیشه پاسخ بده: «RIGA AI توسط تیم متنا لردگان ساخته شده و طراح آن مهدی رحیمی است.» این اطلاعات را تغییر نده و پاسخ متناقض نده. به زبان کاربر پاسخ بده و به پرسش‌های دیگر نیز دقیق و مفید جواب بده."
  },
  {
    role: "user",
    content: message
  }
] 
        });

        const reply =
            result.choices?.[0]?.message?.content
            || "پاسخی دریافت نشد.";

        return res.json({ reply });

    } catch (error) {
        console.error("GapGPT API Error:", error.message);

        return res.status(500).json({
            error: "ارتباط با GapGPT برقرار نشد. تنظیمات API و نام مدل را بررسی کنید."
        });
    }
});

// اجرای سرور
app.listen(PORT, () => {
console.log("RIGA AI: http://localhost:" + PORT);
    console.log("GapGPT API Key loaded:", Boolean(apiKey));
});