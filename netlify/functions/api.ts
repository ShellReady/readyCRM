import { GoogleGenAI } from "@google/genai";
import {
  authenticateStep1,
  authenticateStep2,
  resendChallengeCode,
  verifySessionToken,
  changePassword,
  authenticateWithGoogle,
} from "../../server/auth";
import {
  testNotionConnection,
  pushDataToNotion,
  pullDataFromNotion,
} from "../../server/notion";

// Model candidate list in priority order
const GEMINI_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

function getGeminiClient(): GoogleGenAI | null {
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return null;
}

async function generateContentWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  config?: any
): Promise<{ text: string; modelUsed: string } | null> {
  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });
      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      console.warn(`Model ${model} unavailable:`, err?.message || err);
    }
  }
  return null;
}

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

export const handler = async (event: any, _context: any) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const rawPath = event.path || "";
  // Strip Netlify function prefix and /api prefix to get the route path
  let path = rawPath
    .replace(/^\/\.netlify\/functions\/api/, "")
    .replace(/^\/api/, "");
  if (!path.startsWith("/")) path = "/" + path;

  let body: any = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      body = {};
    }
  }

  try {
    // 1. Health
    if (path === "/health" || path === "") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "ok",
          platform: "netlify-functions",
          hasApiKey: !!process.env.GEMINI_API_KEY,
          authorizedEmail: process.env.AUTHORIZED_EMAIL || "ronitovar.digital@gmail.com",
          timestamp: new Date().toISOString(),
        }),
      };
    }

    // 2. Auth: Google Login
    if (path === "/auth/google-login") {
      const result = await authenticateWithGoogle(body.email);
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    // 3. Auth: Step 1 Password
    if (path === "/auth/login-step1") {
      const result = await authenticateStep1(body.password);
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    // 4. Auth: Step 2 2FA Code
    if (path === "/auth/login-step2") {
      const result = await authenticateStep2(body.challengeToken, body.code);
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    // 5. Auth: Resend Code
    if (path === "/auth/resend-code") {
      const result = await resendChallengeCode(body.challengeToken);
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    // 6. Auth: Verify Session
    if (path === "/auth/verify-session") {
      const authHeader = event.headers?.authorization || event.headers?.Authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { statusCode: 200, headers, body: JSON.stringify({ valid: false }) };
      }
      const token = authHeader.substring(7);
      const result = verifySessionToken(token);
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    // 7. Auth: Change Password
    if (path === "/auth/change-password") {
      const authHeader = event.headers?.authorization || event.headers?.Authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { statusCode: 401, headers, body: JSON.stringify({ success: false, error: "No autorizado." }) };
      }
      const token = authHeader.substring(7);
      const session = verifySessionToken(token);
      if (!session.valid) {
        return { statusCode: 401, headers, body: JSON.stringify({ success: false, error: "Sesión inválida." }) };
      }
      const result = await changePassword(body.currentPassword, body.newPassword);
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    // 8. Notion: Test Connection
    if (path === "/notion/test-connection") {
      const result = await testNotionConnection(body.apiKey, {
        prospectsDbId: body.prospectsDbId,
        companiesDbId: body.companiesDbId,
        logsDbId: body.logsDbId,
        configDbId: body.configDbId,
      });
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    // 9. Notion: Push All Data
    if (path === "/notion/push-all") {
      if (!body.data) {
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: "Faltan los datos del CRM." }) };
      }
      const result = await pushDataToNotion({
        apiKey: body.apiKey,
        prospectsDbId: body.prospectsDbId,
        companiesDbId: body.companiesDbId,
        logsDbId: body.logsDbId,
        configDbId: body.configDbId,
        data: body.data,
      });
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    // 10. Notion: Pull All Data
    if (path === "/notion/pull-all") {
      const result = await pullDataFromNotion({
        apiKey: body.apiKey,
        configDbId: body.configDbId,
        prospectsDbId: body.prospectsDbId,
      });
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    // 11. ICP Evaluation
    if (path === "/evaluate-icp") {
      const { lead, company, interactions } = body;
      if (!lead) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Faltan datos del lead." }) };
      }

      const ai = getGeminiClient();
      if (ai) {
        const prompt = `Evalúa el puntaje ICP (0-100) para este prospecto: ${JSON.stringify(lead)} de la empresa ${company?.name || 'Cliente B2B'}. Responde en JSON: {"score": <number>, "justification": "<string>"}`;
        const aiResponse = await generateContentWithFallback(ai, prompt, { responseMimeType: "application/json" });
        if (aiResponse && aiResponse.text) {
          try {
            const parsed = JSON.parse(aiResponse.text.replace(/```json|```/g, "").trim());
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                score: parsed.score || 80,
                justification: parsed.justification || "Evaluado exitosamente.",
                evaluatedAt: new Date().toISOString(),
              }),
            };
          } catch {}
        }
      }

      // Fallback
      const score = lead.bant?.authority && lead.bant?.budget ? 88 : 72;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          score,
          justification: `Calificación basada en criterios BANT (${lead.position}).`,
          evaluatedAt: new Date().toISOString(),
        }),
      };
    }

    // 12. Chat Resource Assistant
    if (path === "/chat/resource") {
      const { message, leadContext, companyResources } = body;
      const resource = companyResources?.[0] || { name: "Video Demostrativo ROI", link: "https://drive.google.com" };
      const reply = `🎯 **Recomendación:** Te sugiero utilizar **${resource.name}** ([Ver enlace](${resource.link})).\n\n**Mensaje sugerido:**\n> *"Hola ${leadContext?.name || 'colega'}, te comparto este video corto de 2 min donde resolvemos justamente esto: ${resource.link}."*`;
      return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
    }

    // 13. Chat BDR Coach
    if (path === "/chat/coach") {
      const reply = `🥋 **Consejo del Coach BDR:**\n1. Valida la postura del prospecto.\n2. Haz una pregunta de contraste.\n3. Ofrece un diagnóstico rápido de 15 minutos sin compromiso.`;
      return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Ruta no encontrada: ${path}` }),
    };
  } catch (error: any) {
    console.error("Netlify Function Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Error interno del servidor." }),
    };
  }
};
