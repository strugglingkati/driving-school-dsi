/**
 * توثيق ملف: gemini.js
 * الموقع: frontend/src/services/gemini.js
 * الوظيفة: إعداد الاتصال بـ Google Gemini API لاستخدامه في تطبيق MarocTL.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// استدعاء مفتاح API من ملف .env (تأكد أن المفتاح يبدأ بـ VITE_)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// تهيئة عميل Google AI
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * دالة لإرسال الأسئلة إلى Gemini والحصول على رد
 * @param {string} prompt - النص أو السؤال الموجه للذكاء الاصطناعي
 */
export const askGemini = async (prompt) => {
  try {
    // تحديد النموذج (flash هو الأسرع والأنسب لمشاريع الويب)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("خطأ في الاتصال بـ Gemini API:", error);
    return "عذراً، لم نتمكن من الحصول على رد حالياً.";
  }
};