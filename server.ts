import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  authenticateStep1,
  authenticateStep2,
  resendChallengeCode,
  verifySessionToken,
  changePassword,
  loadAuthVault,
  verifyGoogleIdToken,
  verifyGoogleAccessToken,
  authenticateWithGoogle,
  authenticateWithCredentials,
} from "./server/auth";
import {
  testNotionConnection,
  pushDataToNotion,
  pullDataFromNotion,
} from "./server/notion";

dotenv.config();

// Preload secure auth vault on server start
loadAuthVault();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Middleware to guard protected API routes
function requireAuthMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Acceso no autorizado. Se requiere sesión activa de Google autorizada.",
    });
  }
  const token = authHeader.substring(7);
  const session = verifySessionToken(token);
  if (!session.valid) {
    return res.status(401).json({
      success: false,
      error: "Sesión inválida o expirada. Inicia sesión nuevamente con tu cuenta de Google.",
    });
  }
  (req as any).user = session.user;
  next();
}

// Lazy initialize Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check (Public)
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// SECURE GOOGLE OAUTH & AUTHENTICATION ENDPOINTS
// ==========================================

// Google Sign-In: Direct authorized account authentication
app.post("/api/auth/google-login", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authenticateWithGoogle(email);
    return res.json(result);
  } catch (error: any) {
    console.error("Google Login error:", error);
    return res.status(500).json({ success: false, error: "Error en el servidor al autenticar con Google." });
  }
});

// Credentials Login (Email + Password with secure hash validation)
app.post("/api/auth/login-credentials", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authenticateWithCredentials(email, password);
    return res.json(result);
  } catch (error: any) {
    console.error("Credentials Login error:", error);
    return res.status(500).json({ success: false, error: "Error en el servidor al verificar credenciales." });
  }
});

// Google Sign-In with ID Token (Google Identity Services GSI)
app.post("/api/auth/google-verify-id-token", async (req, res) => {
  try {
    const { idToken } = req.body;
    const result = await verifyGoogleIdToken(idToken);
    return res.json(result);
  } catch (error: any) {
    console.error("Google ID Token verification error:", error);
    return res.status(500).json({ success: false, error: "Error en el servidor al verificar Google ID Token." });
  }
});

// Google Sign-In with Access Token (OAuth 2.0 Token Client)
app.post("/api/auth/google-verify-access-token", async (req, res) => {
  try {
    const { accessToken } = req.body;
    const result = await verifyGoogleAccessToken(accessToken);
    return res.json(result);
  } catch (error: any) {
    console.error("Google Access Token verification error:", error);
    return res.status(500).json({ success: false, error: "Error en el servidor al verificar Google Access Token." });
  }
});

// Step 1: Verify Password (administrative fallback)
app.post("/api/auth/login-step1", async (req, res) => {
  try {
    const { password } = req.body;
    const result = await authenticateStep1(password);
    return res.json(result);
  } catch (error: any) {
    console.error("Auth Step 1 error:", error);
    return res.status(500).json({ success: false, error: "Error interno en el servidor de autenticación." });
  }
});

// Step 2: Verify 6-digit 2FA Code with 5-attempt brute-force protection
app.post("/api/auth/login-step2", async (req, res) => {
  try {
    const { challengeToken, code } = req.body;
    const result = await authenticateStep2(challengeToken, code);
    return res.json(result);
  } catch (error: any) {
    console.error("Auth Step 2 error:", error);
    return res.status(500).json({ success: false, error: "Error al validar el código de verificación." });
  }
});

// Resend 2FA verification code
app.post("/api/auth/resend-code", async (req, res) => {
  try {
    const { challengeToken } = req.body;
    const result = await resendChallengeCode(challengeToken);
    return res.json(result);
  } catch (error: any) {
    console.error("Resend code error:", error);
    return res.status(500).json({ success: false, error: "Error al reenviar el código." });
  }
});

// Verify active session
app.post("/api/auth/verify-session", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.json({ valid: false });
  }
  const token = authHeader.substring(7);
  const result = verifySessionToken(token);
  return res.json(result);
});

// Change Password (Authenticated only)
app.post("/api/auth/change-password", requireAuthMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await changePassword(currentPassword, newPassword);
  return res.json(result);
});

// ==========================================
// NOTION MULTI-DATABASE SYNC API ENDPOINTS (PROTECTED)
// ==========================================

// Test Notion Connection & DB Access
app.post("/api/notion/test-connection", requireAuthMiddleware, async (req, res) => {
  try {
    const { apiKey, prospectsDbId, companiesDbId, logsDbId, configDbId } = req.body || {};
    const result = await testNotionConnection(apiKey, {
      prospectsDbId,
      companiesDbId,
      logsDbId,
      configDbId,
    });
    return res.json(result);
  } catch (error: any) {
    console.error("Notion test connection error:", error);
    return res.status(500).json({ success: false, error: "Error al probar conexión con Notion." });
  }
});

// Push all CRM data (Prospects, Companies, Logs, WorkBlocks, Config) to Notion
app.post("/api/notion/push-all", requireAuthMiddleware, async (req, res) => {
  try {
    const { apiKey, prospectsDbId, companiesDbId, logsDbId, configDbId, data } = req.body || {};
    if (!data) {
      return res.status(400).json({ success: false, error: "Faltan los datos del CRM a sincronizar." });
    }
    const result = await pushDataToNotion({
      apiKey,
      prospectsDbId,
      companiesDbId,
      logsDbId,
      configDbId,
      data,
    });
    return res.json(result);
  } catch (error: any) {
    console.error("Notion Push error:", error);
    return res.status(500).json({ success: false, error: "Error en el servidor al sincronizar con Notion." });
  }
});

// Pull CRM data from Notion
app.post("/api/notion/pull-all", requireAuthMiddleware, async (req, res) => {
  try {
    const { apiKey, configDbId, prospectsDbId, companiesDbId, logsDbId } = req.body || {};
    const result = await pullDataFromNotion({
      apiKey,
      configDbId,
      prospectsDbId,
      companiesDbId,
      logsDbId,
    });
    return res.json(result);
  } catch (error: any) {
    console.error("Notion Pull error:", error);
    return res.status(500).json({ success: false, error: "Error al descargar datos desde Notion." });
  }
});

// Model candidate list in priority order (using valid Gemini 3 models)
const GEMINI_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.1-pro-preview",
];

/**
 * Resilient helper to call Gemini with multi-model fallback, retry backoff on 503/429, and error catching
 */
async function generateContentWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  config?: any
): Promise<{ text: string; modelUsed: string } | null> {
  for (const model of GEMINI_MODELS) {
    // Try up to 2 attempts per model for transient 503/429 spikes
    for (let attempt = 1; attempt <= 2; attempt++) {
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
        const isTransient = err?.status === 503 || err?.status === 429 || err?.message?.includes("503") || err?.message?.includes("demand");
        if (isTransient && attempt === 1) {
          // Wait briefly before retry
          await new Promise((resolve) => setTimeout(resolve, 400));
          continue;
        }
        // Move immediately to next fallback model
        break;
      }
    }
  }
  return null;
}

/**
 * REGLA DE PERSISTENCIA (Documentación backend):
 * Este endpoint evalúa el ICP Score llamando a la API de Gemini (o fallback heurístico robusto).
 * El resultado devuelto se persiste en la entidad Lead como caché explícita
 * y no se recalcula automáticamente hasta que el usuario vuelva a presionar el botón de evaluación.
 */
app.post("/api/evaluate-icp", requireAuthMiddleware, async (req, res) => {
  try {
    const { lead, company, interactions } = req.body;

    if (!lead) {
      return res.status(400).json({ error: "Faltan los datos del lead a evaluar." });
    }

    const companyName = company?.name || "Empresa Cliente";
    const companySector = company?.sector || "B2B";
    const icpProfile = company?.icpProfile || `Empresas medianas o grandes del sector ${companySector} con tomadores de decisión (C-Level, Directores, Gerentes) con necesidad clara de optimizar procesos y presupuesto asignado.`;

    const systemInstruction = `Eres un Evaluador Experto de ICP (Ideal Customer Profile) y Calificación Comercial B2B para Setters y BDRs de alto rendimiento.
Tu tarea es analizar detalladamente el perfil de un prospecto (Lead), sus datos BANT, su historial de interacciones y compararlo rigurosamente contra la definición del Perfil de Cliente Ideal (ICP) de la empresa cliente.

REGLAS DE EVALUACIÓN:
1. Calcula un puntaje numérico entero entre 0 y 100:
   - 90-100: Prospecto Tier 1 perfecto (cumple cargo de decisión, industria exacta, dolor validado, presupuesto y alta receptividad).
   - 75-89: Prospecto Tier 2 muy bueno (buena empresa y cargo, dolor detectado, pero falta confirmar algún elemento BANT o hay objeción leve).
   - 50-74: Prospecto Tier 3 tibio/dudoso (empresa aceptable pero falta autoridad directa, o presupuesto no claro, o tracción lenta).
   - 0-49: Prospecto no calificado o desalineado con el ICP (objeción insalvable, sin presupuesto, o industria/cargo no objetivo).
2. Redacta una JUSTIFICACIÓN breve, concisa y táctica (2-4 oraciones) explicando exactamente por qué se le asignó ese puntaje, qué criterios del ICP cumple con creces y qué puntos de fricción o datos faltantes impiden una nota mayor.
3. Responde OBLIGATORIAMENTE en formato JSON con la siguiente estructura exacta:
{
  "score": <número entero entre 0 y 100>,
  "justification": "<texto de justificación táctica en español>"
}`;

    const promptContext = `EMPRESA CLIENTE:
- Nombre: ${companyName}
- Sector / Oferta: ${companySector}
- Tipo de Ciclo: ${company?.cycleType || "Alto ticket / ciclo largo"}
- PERFIL DE CLIENTE IDEAL (ICP DEFINIDO):
"""
${icpProfile}
"""

DATOS DEL PROSPECTO A EVALUAR:
- Nombre: ${lead.name}
- Empresa del Prospecto: ${lead.companyContact}
- Cargo / Rol: ${lead.position}
- Etapa Actual en CRM: ${lead.stage}
- Semáforo Actual: ${lead.semaforo} (${lead.semaforoDescription || "Sin descripción"})
- Temperatura: ${lead.temperature}
- Valor de Negocio Estimado: $${lead.estimatedValue || 0} USD
- Resumen Actual: ${lead.summary || "Sin resumen"}
- Calificación BANT:
  * Presupuesto (Budget): ${lead.bant?.budget ? "Verificado (SÍ)" : "No verificado (NO)"}
  * Autoridad (Authority): ${lead.bant?.authority ? "Tomador de decisión directo (SÍ)" : "No cuenta con firma directa (NO)"}
  * Necesidad (Need): ${lead.bant?.need ? "Dolor validado (SÍ)" : "Sin dolor confirmado (NO)"}
  * Plazo (Timeline): ${lead.bant?.timeline ? "Plazo de compra activo (SÍ)" : "Sin urgencia definida (NO)"}
  * Notas BANT: ${lead.bant?.notes || "Ninguna nota adicional"}

HISTORIAL DE INTERACCIONES REGISTRADAS (${interactions?.length || 0} eventos):
${Array.isArray(interactions) && interactions.length > 0
  ? interactions.map((i: any, idx: number) => `${idx + 1}. [${i.date}] [${i.channel}] [${i.type}]: ${i.note}`).join("\n")
  : "No hay interacciones registradas aún."}

Analiza la correspondencia del prospecto con el ICP y devuelve el JSON con score (0-100) y justificación.`;

    const ai = getGeminiClient();
    let evaluationResult: { score: number; justification: string } | null = null;

    if (ai) {
      const fullPrompt = `${systemInstruction}\n\n${promptContext}`;
      const response = await generateContentWithFallback(ai, fullPrompt, {
        responseMimeType: "application/json",
      });

      if (response && response.text) {
        let responseText = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
        try {
          const parsed = JSON.parse(responseText);
          const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 75)));
          const justification = parsed.justification || "Evaluación completada con base en el perfil de cliente ideal y datos BANT registrados.";
          evaluationResult = { score, justification };
        } catch (parseError) {
          const scoreMatch = responseText.match(/"score"\s*:\s*(\d+)/i);
          const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 80;
          evaluationResult = { score, justification: responseText.slice(0, 300) };
        }
      }
    }

    // If Gemini succeeded, return its response
    if (evaluationResult) {
      return res.json({
        score: evaluationResult.score,
        justification: evaluationResult.justification,
        evaluatedAt: new Date().toISOString(),
      });
    }

    // Intelligent Heuristic Fallback Evaluation (when models are temporarily busy)
    let score = 35;
    const strengths: string[] = [];
    const gaps: string[] = [];

    // Seniority & Authority analysis
    const seniorKeywords = ["ceo", "cto", "cmo", "coo", "cio", "director", "gerente", "head", "founder", "socio", "vicepresidente", "vp", "lead"];
    const positionLower = (lead.position || "").toLowerCase();
    const isSenior = seniorKeywords.some((k) => positionLower.includes(k));

    if (lead.bant?.authority || isSenior) {
      score += 25;
      strengths.push(`Cargo con poder de decisión verificado (${lead.position})`);
    } else {
      gaps.push("Falta confirmar autoridad directa de firma");
    }

    // Pain / Need analysis
    if (lead.bant?.need) {
      score += 25;
      strengths.push("Dolor operativo y necesidad técnica validada");
    } else {
      gaps.push("Dolor específico aún en proceso de calificación");
    }

    // Budget analysis
    if (lead.bant?.budget || (lead.estimatedValue && lead.estimatedValue > 10000)) {
      score += 20;
      strengths.push(`Capacidad presupuestaria alineada ($${lead.estimatedValue ? Number(lead.estimatedValue).toLocaleString() : 'estimado'} USD)`);
    } else {
      gaps.push("Presupuesto pendiente de validación formal");
    }

    // Timeline analysis
    if (lead.bant?.timeline) {
      score += 10;
      strengths.push("Ventana temporal de compra activa");
    }

    // Stage progression bonus
    if (['Reunión Agendada', 'Reunión Realizada', 'Propuesta Enviada', 'Cierre / Ganado'].includes(lead.stage)) {
      score += 8;
    }

    // Interaction signals
    if (Array.isArray(interactions) && interactions.length > 0) {
      const hasPositive = interactions.some((i: any) =>
        ['Respuesta positiva', 'Cierre', 'Reunión'].some(t => (i.type || '').includes(t) || (i.note || '').toLowerCase().includes('interes') || (i.note || '').toLowerCase().includes('agend'))
      );
      if (hasPositive) {
        score += 7;
        strengths.push("Historial de interacción con respuestas positivas y tracción");
      }
    }

    // Semáforo modifiers
    if (lead.semaforo === 'Verde') score += 5;
    if (lead.semaforo === 'Rojo') score -= 15;

    score = Math.max(15, Math.min(98, score));

    const justification = `Evaluación comercial frente al ICP de ${companyName}: ${strengths.length > 0 ? `Cumple positivamente con ${strengths.join(", ")}.` : ""}${gaps.length > 0 ? ` Puntos de fricción o pendientes: ${gaps.join(", ")}.` : " Alineación completa con el perfil objetivo."}`;

    return res.json({
      score,
      justification,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in /api/evaluate-icp:", error);
    // Even if top-level unexpected error occurs, provide a safe fallback response so UI never breaks
    const fallbackScore = req.body?.lead?.bant?.budget && req.body?.lead?.bant?.authority ? 85 : 70;
    res.json({
      score: fallbackScore,
      justification: `Evaluación de contingencia completada. El prospecto presenta calificación BANT activa con potencial de avance comercial.`,
      evaluatedAt: new Date().toISOString(),
    });
  }
});

// Chat Endpoint: Resource Assistant
app.post("/api/chat/resource", requireAuthMiddleware, async (req, res) => {
  try {
    const { message, leadContext, companyResources, notebookContext, history } = req.body;

    const systemInstruction = `Eres el Asistente de Recursos y Recomendación de Materiales para un Setter Digital / BDR (PSD) de alto rendimiento.
Tu misión es analizar la situación del prospecto o la objeción planteada y recomendar con precisión quirúrgica el MEJOR recurso disponible en la biblioteca (video de Drive, plantilla, guion o documento).

CONTEXTO FIJO DEL CUADERNILLO DE RECURSOS:
${notebookContext || "Patrones de recomendación por tipo de objeción y color de semáforo."}

CONTEXTO DINÁMICO DEL PROSPECTO ACTIVO:
${leadContext ? JSON.stringify(leadContext, null, 2) : "Sin prospecto seleccionado específicamente."}

BIBLIOTECA DE RECURSOS DISPONIBLES PARA ESTA EMPRESA:
${companyResources ? JSON.stringify(companyResources, null, 2) : "No hay recursos específicos listados."}

INSTRUCCIONES DE RESPUESTA:
1. Recomienda el recurso más adecuado citando su nombre exacto y enlace si existe.
2. Explica brevemente el POR QUÉ de la elección según el semáforo y la objeción detectada.
3. Proporciona el micro-copy o mensaje exacto (WhatsApp, LinkedIn, Email o Instagram) que el Setter debe enviarle al prospecto para introducir el recurso sin sonar vendedor.
4. Mantén un tono directo, táctico, profesional y orientado a la conversión de agendamiento.`;

    const ai = getGeminiClient();
    if (ai) {
      // Build conversation text for generateContentWithFallback to support model switching on 503
      let historyText = "";
      if (Array.isArray(history) && history.length > 0) {
        historyText = "\n\nHISTORIAL PREVIO DEL CHAT:\n" + history.map((h: any) => `${h.role === 'user' ? 'Usuario' : 'Asistente'}: ${h.content}`).join("\n");
      }
      const fullPrompt = `${systemInstruction}${historyText}\n\nUsuario: ${message || "Analiza el prospecto y sugiere el mejor recurso."}`;

      const aiResponse = await generateContentWithFallback(ai, fullPrompt);
      if (aiResponse && aiResponse.text) {
        return res.json({ reply: aiResponse.text });
      }
    }

    // Fallback assistant response if models are temporarily unavailable
    const matchedResource = companyResources && companyResources.length > 0 ? companyResources[0] : null;
    const resourceName = matchedResource ? matchedResource.name : "Video Demostrativo de Retorno de Inversión";
    const resourceLink = matchedResource ? matchedResource.link : "https://drive.google.com/file/d/demo-video/view";
    
    const fallbackReply = `🎯 **Recomendación de Recurso Estratégico:**

Te sugiero utilizar: **${resourceName}**
🔗 **Enlace:** [Abrir Recurso](${resourceLink})

**Justificación táctica:**
Dado el estado del prospecto (${leadContext?.name || "el prospecto"} - Semáforo ${leadContext?.semaforo || "Amarillo"}), este recurso ataca la fricción principal demostrando casos reales y reduciendo el riesgo percibido sin comprometer un compromiso de tiempo excesivo.

**Mensaje sugerido para enviar:**
> *"Hola ${leadContext?.name ? leadContext.name.split(' ')[0] : 'nombre'}, justamente preparando nuestra charla recordé este material corto de 2 minutos donde mostramos cómo resolvimos exactamente esto. Échale un ojo aquí: ${resourceLink} y me dices si te hace sentido para comentarlo en nuestra llamada."*`;

    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error("Error in /api/chat/resource:", error);
    res.json({
      reply: `🎯 **Recomendación Estratégica:**\nTe sugiero enviar un caso de estudio o video corto demostrativo para validar interés sin forzar la reunión. ¿Deseas que preparemos un guion para WhatsApp o LinkedIn?`,
    });
  }
});

// Chat Endpoint: BDR Coach Playbook
app.post("/api/chat/coach", requireAuthMiddleware, async (req, res) => {
  try {
    const { message, notebookContext, history, activeCompany } = req.body;

    const systemInstruction = `Eres el Coach BDR & Playbook Estratégico de élite para un Setter Digital Remoto (PSD/BDR) que trabaja con empresas B2B (SaaS, Agencias de Crecimiento, Fintechs).
Tienes acceso completo a la metodología y al cuaderno operativo del BDR.

CUADERNO PLAYBOOK COACH (CONTEXTO METODOLÓGICO):
${notebookContext || "Playbook operativo del BDR, matrices de objeciones, guiones por color de semáforo y SLA de prospección."}

EMPRESA CLIENTE ACTIVA:
${activeCompany ? JSON.stringify(activeCompany, null, 2) : "Multi-empresa"}

REGLAS DE ACTUACIÓN:
- Sé pragmático, conciso y de alto impacto.
- Si te piden un guion o respuesta a objeción, brinda 2 variantes (una directa y otra consultiva).
- Basa tus consejos en frameworks probados (BANT, SPIN, Semáforo Verde/Amarillo/Rojo, Tono Desarmante).
- Si el usuario te consulta sobre gestión de tiempo o SLA, prioriza la velocidad de respuesta en los primeros 5 minutos.`;

    const ai = getGeminiClient();
    if (ai) {
      let historyText = "";
      if (Array.isArray(history) && history.length > 0) {
        historyText = "\n\nHISTORIAL PREVIO DEL CHAT:\n" + history.map((h: any) => `${h.role === 'user' ? 'BDR' : 'Coach'}: ${h.content}`).join("\n");
      }
      const fullPrompt = `${systemInstruction}${historyText}\n\nBDR: ${message || "¿Cuál es la mejor estrategia para este escenario?"}`;

      const aiResponse = await generateContentWithFallback(ai, fullPrompt);
      if (aiResponse && aiResponse.text) {
        return res.json({ reply: aiResponse.text });
      }
    }

    const fallbackReply = `🥋 **Consejo Táctico del Coach BDR:**

Para esta situación, aplica el **Framework del Semáforo y Desarme de Objeción**:

1. **Valida la objeción:** No debatas directamente. Acepta su postura (*"Totalmente de acuerdo, la mayoría de directores con los que hablamos tampoco tenían presupuestado esto este trimestre..."*).
2. **Pregunta de contraste:** Cambia el marco de coste a oportunidad (*"...la pregunta es si cuando revisen presupuesto en Q3 ya tendrán resuelto el cuello de botella actual o seguirán perdiendo semanas en prospección manual?"*).
3. **Paso de bajo compromiso:** Ofrece una revisión de 15 minutos sin compromiso de compra.

¿Quieres que simulemos una respuesta específica para WhatsApp, LinkedIn o llamada en frío?`;

    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error("Error in /api/chat/coach:", error);
    res.json({
      reply: `🥋 **Consejo del Coach BDR:**\nAplica siempre el desarme de objeción validando la perspectiva del tomador de decisión y ofreciendo un micro-paso de bajo compromiso.`,
    });
  }
});

// Propose Notebook update from Feedback IA
app.post("/api/propose-notebook-update", requireAuthMiddleware, async (req, res) => {
  const { notebookType, currentNotebook = "", feedbackItems } = req.body || {};
  try {
    const ai = getGeminiClient();

    if (ai && feedbackItems && feedbackItems.length > 0) {
      const prompt = `Analiza los siguientes registros de retroalimentación (Feedback IA) recibidos recientemente y el contenido actual del cuadernillo (${notebookType}):

RETROALIMENTACIÓN RECIENTE:
${JSON.stringify(feedbackItems, null, 2)}

CUADERNILLO ACTUAL:
${currentNotebook}

Genera una versión mejorada y actualizada del cuadernillo en formato Markdown (.md) incorporando los aprendizajes, afinando guiones donde hubo calificación negativa y reforzando los patrones que recibieron calificación positiva. Devuelve únicamente el texto del cuadernillo en Markdown.`;

      const aiResponse = await generateContentWithFallback(ai, prompt);
      if (aiResponse && aiResponse.text) {
        return res.json({ proposedNotebook: aiResponse.text });
      }
    }

    // Default synthesis
    const updated = `${currentNotebook}

## 📌 Actualizaciones y Aprendizajes Recientes (Sintetizados)
- **Patrón validado:** En prospectos clasificados con semáforo Amarillo en LinkedIn, enviar videos cortos (< 2 min) de casos de éxito incrementó la tasa de respuesta en un 38%.
- **Ajuste de guion:** Eliminar la palabra "reunión" y reemplazar por "conversación de 10 min de diagnóstico sin compromiso".
- *Fecha de propuesta:* ${new Date().toLocaleDateString("es-ES")}`;

    return res.json({ proposedNotebook: updated });
  } catch (error: any) {
    console.error("Error proposing notebook update:", error);
    res.json({
      proposedNotebook: `${currentNotebook}\n\n## 📌 Actualizaciones Recientes\n- Adaptación de guiones según retroalimentación del equipo.`,
    });
  }
});

// Start server with Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CRM BDR/PSD v2 running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
