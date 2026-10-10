const express = require("express");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

// پیدا کردن فایل .env در پوشه فعلی یا پوشه والد
const envPaths = [
    path.join(__dirname, ".env"),
    path.join(__dirname, "..", ".env"),
    path.join(process.cwd(), ".env")
];

for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath, override: true });

        if (process.env.GEMINI_API_KEY?.trim()) {
            break;
        }
    }
}

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// خواندن کلید API
const apiKey = process.env.GEMINI_API_KEY?.trim();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// صفحه اصلی
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// دریافت پیام و ارسال به Gemini
app.post("/api/chat", async (req, res) => {
    try {
        if (!ai) {
            return res.status(500).json({
                error: "کلید Gemini بارگذاری نشده است. محل و محتوای فایل .env را بررسی کنید."
            });
        }

        const message = String(req.body?.message || "").trim();

        if (!message) {
            return res.status(400).json({
                error: "لطفاً پیام خود را بنویسید."
            });
        }

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message
        });

        return res.json({
            reply: result.text || "پاسخی دریافت نشد."
        });

    } catch (error) {
        console.error("Gemini API Error:", error.message);

        return res.status(500).json({
            error: "ارتباط با هوش مصنوعی برقرار نشد. کلید API و تنظیمات Gemini را بررسی کنید."
        });
    }
});

// اجرای سرور
app.listen(PORT, () => {
    console.log(RIGA AI: http://localhost:${PORT});
    console.log("Gemini API Key loaded:", Boolean(apiKey));
});