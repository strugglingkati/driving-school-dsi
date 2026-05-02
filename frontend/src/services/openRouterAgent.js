// /**
//  * توثيق: وكيل MarocTL الذكي باستخدام OpenRouter
//  * الهدف: بناء مساعد ذكي قادر على استخدام أدوات برمجية لتحليل بيانات المترشحين.
//  */

// import { callModel, tool } from '@openrouter/agent';
// import { z } from 'zod';

// // 1. تعريف "أداة" لحساب المديونية (كمثال عملي لمشروعك)
// const debtCalculatorTool = tool({
//   name: 'calculate_debt',
//   description: 'تحسب المبلغ المتبقي على المترشح بناءً على الثمن والمدفوع',
//   inputSchema: z.object({
//     total: z.number().describe('الثمن الكلي المتفق عليه'),
//     paid: z.number().describe('المبلغ الذي تم دفعه'),
//   }),
//   execute: async ({ total, paid }) => {
//     const balance = total - paid;
//     return { balance, status: balance > 0 ? 'مديون' : 'خالص' };
//   },
// });

// /**
//  * دالة لتشغيل الوكيل الذكي
//  * @param {string} userMessage - رسالة المستخدم (مثلاً: "كم بقي على مترشح دفع 20 من أصل 3500؟")
//  */
// export const runMarocAgent = async (userMessage) => {
//   try {
//     const result = await callModel({
//       // يمكنك اختيار أي نموذج متاح في OpenRouter
//       model: 'google/gemini-2.0-flash-001', 
//       apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
//       messages: [
//         { role: 'user', content: userMessage },
//       ],
//       tools: [debtCalculatorTool], // تزويد العميل بالأدوات التي صنعناها
//     });

//     return await result.getText();
//   } catch (error) {
//     console.error("خطأ في وكيل OpenRouter:", error);
//     return "عذراً، حدث خطأ في معالجة الطلب.";
//   }
// };