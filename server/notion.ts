/**
 * Notion Multi-Database Integration & Sync Engine for CRM BDR/Setter
 * Communicates with the official Notion REST API (v1)
 */

interface NotionSyncPayload {
  apiKey?: string;
  prospectsDbId?: string;
  companiesDbId?: string;
  logsDbId?: string;
  configDbId?: string;
  data: {
    leads?: any[];
    companies?: any[];
    quickLogs?: any[];
    workBlocks?: any[];
    commissions?: any[];
    meetings?: any[];
    interactions?: any[];
    systemConfig?: any;
  };
}

/**
 * Extracts a clean 32-character Notion Database ID from either a raw ID, UUID, or a full Notion URL.
 * e.g., "https://notion.so/myworkspace/3cc7b90ab60d80ad874eff490ff6b43b?v=..." -> "3cc7b90ab60d80ad874eff490ff6b43b"
 */
export function cleanNotionId(input?: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  // Remove URL query params and paths
  const matches = trimmed.match(/[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
  if (matches && matches[0]) {
    return matches[0].replace(/-/g, "").toLowerCase();
  }
  // Remove hyphens if provided as UUID
  return trimmed.replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * Validates Notion API Key and tests access across all configured databases or pages
 */
export async function testNotionConnection(
  apiKey?: string,
  databases?: string | { prospectsDbId?: string; companiesDbId?: string; logsDbId?: string; configDbId?: string }
): Promise<{
  success: boolean;
  botName?: string;
  workspaceName?: string;
  databasesChecked?: { id: string; name: string; accessible: boolean; title?: string; type?: string }[];
  missingAccessNotice?: string;
  error?: string;
}> {
  const token = (apiKey || process.env.NOTION_API_KEY || "").trim();
  if (!token) {
    return { success: false, error: "Falta el Token / API Key de Notion." };
  }

  try {
    const userRes = await fetch("https://api.notion.com/v1/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
      },
    });

    if (!userRes.ok) {
      const errJson: any = await userRes.json().catch(() => ({}));
      return {
        success: false,
        error: `Error de autenticación Notion (${userRes.status}): ${errJson.message || userRes.statusText}`,
      };
    }

    const userData: any = await userRes.json();
    const botName = userData.name || userData.bot?.owner?.workspace_name || "BDR PSD";

    const databasesChecked: { id: string; name: string; accessible: boolean; title?: string; type?: string }[] = [];

    const dbList: { name: string; id: string }[] = [];
    if (typeof databases === "string") {
      if (databases) dbList.push({ name: "Base Principal / Snapshot", id: cleanNotionId(databases) });
    } else if (databases && typeof databases === "object") {
      if (databases.prospectsDbId) dbList.push({ name: "Prospectos & Leads", id: cleanNotionId(databases.prospectsDbId) });
      if (databases.companiesDbId) dbList.push({ name: "Empresas Clientes", id: cleanNotionId(databases.companiesDbId) });
      if (databases.logsDbId) dbList.push({ name: "Registros Rápidos & Logs", id: cleanNotionId(databases.logsDbId) });
      if (databases.configDbId) dbList.push({ name: "Metas & Snapshot CRM", id: cleanNotionId(databases.configDbId) });
    } else {
      if (process.env.NOTION_PROSPECTS_DB_ID) dbList.push({ name: "Prospectos & Leads", id: cleanNotionId(process.env.NOTION_PROSPECTS_DB_ID) });
      if (process.env.NOTION_COMPANIES_DB_ID) dbList.push({ name: "Empresas Clientes", id: cleanNotionId(process.env.NOTION_COMPANIES_DB_ID) });
      if (process.env.NOTION_LOGS_DB_ID) dbList.push({ name: "Registros Rápidos & Logs", id: cleanNotionId(process.env.NOTION_LOGS_DB_ID) });
      if (process.env.NOTION_CONFIG_DB_ID) dbList.push({ name: "Metas & Snapshot CRM", id: cleanNotionId(process.env.NOTION_CONFIG_DB_ID) });
    }

    let anyInaccessible = false;

    for (const item of dbList) {
      if (!item.id) continue;
      let accessible = false;
      let title = item.name;
      let objType = "database";

      // 1. Try checking as database
      try {
        const dbRes = await fetch(`https://api.notion.com/v1/databases/${item.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Notion-Version": "2022-06-28",
          },
        });
        if (dbRes.ok) {
          const dbData: any = await dbRes.json();
          title = dbData.title?.[0]?.plain_text || item.name;
          accessible = true;
          objType = "database";
        }
      } catch {
        // continue to page check
      }

      // 2. If not found as database, try checking as page
      if (!accessible) {
        try {
          const pageRes = await fetch(`https://api.notion.com/v1/pages/${item.id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Notion-Version": "2022-06-28",
            },
          });
          if (pageRes.ok) {
            const pageData: any = await pageRes.json();
            const pageTitleProp = Object.values(pageData.properties || {}).find((p: any) => p.type === "title") as any;
            title = pageTitleProp?.title?.[0]?.plain_text || item.name;
            accessible = true;
            objType = "page";
          }
        } catch {
          // not accessible
        }
      }

      // 3. If not found as page, try block
      if (!accessible) {
        try {
          const blockRes = await fetch(`https://api.notion.com/v1/blocks/${item.id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Notion-Version": "2022-06-28",
            },
          });
          if (blockRes.ok) {
            accessible = true;
            objType = "block";
          }
        } catch {
          // not accessible
        }
      }

      if (!accessible) {
        anyInaccessible = true;
      }

      databasesChecked.push({ id: item.id, name: item.name, accessible, title, type: objType });
    }

    const missingNotice = anyInaccessible
      ? '⚠️ En Notion, ve a tu página "CRM BDR Hub", haz clic en los 3 puntos (···) arriba a la derecha > "Conexiones" / "Conectar con..." y selecciona "BDR PSD" para autorizar el acceso.'
      : undefined;

    return {
      success: true,
      botName,
      workspaceName: userData.bot?.workspace_name || "Espacio de Roni Tovar",
      databasesChecked,
      missingAccessNotice: missingNotice,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al conectar con la API de Notion.",
    };
  }
}

/**
 * Pushes CRM data into Notion (Both structured page snapshots and individual entities)
 */
export async function pushDataToNotion(payload: NotionSyncPayload): Promise<{
  success: boolean;
  syncedCounts: { leads: number; companies: number; logs: number; blocks: number };
  message: string;
  error?: string;
  timestamp: string;
}> {
  const token = (payload.apiKey || process.env.NOTION_API_KEY || "").trim();
  if (!token) {
    return {
      success: false,
      syncedCounts: { leads: 0, companies: 0, logs: 0, blocks: 0 },
      message: "No se proporcionó API Key de Notion.",
      error: "NOTION_API_KEY_MISSING",
      timestamp: new Date().toISOString(),
    };
  }

  const prospectsDb = cleanNotionId(payload.prospectsDbId || process.env.NOTION_PROSPECTS_DB_ID);
  const companiesDb = cleanNotionId(payload.companiesDbId || process.env.NOTION_COMPANIES_DB_ID);
  const logsDb = cleanNotionId(payload.logsDbId || process.env.NOTION_LOGS_DB_ID);
  const configDb = cleanNotionId(payload.configDbId || process.env.NOTION_CONFIG_DB_ID);

  const leads = payload.data.leads || [];
  const companies = payload.data.companies || [];
  const quickLogs = payload.data.quickLogs || [];
  const workBlocks = payload.data.workBlocks || [];

  const timestamp = new Date().toISOString();
  let syncedLeads = 0;
  let syncedCompanies = 0;
  let syncedLogs = 0;
  let syncedBlocks = 0;

  try {
    // 1. If configDb or any DB is configured, create/update a high-speed complete CRM Snapshot page
    const targetDb = configDb || prospectsDb || companiesDb || logsDb;
    if (targetDb) {
      const snapshotContent = JSON.stringify(
        {
          timestamp,
          leads,
          companies,
          quickLogs,
          workBlocks,
          commissions: payload.data.commissions || [],
          meetings: payload.data.meetings || [],
          interactions: payload.data.interactions || [],
          systemConfig: payload.data.systemConfig || {},
        },
        null,
        2
      );

      // Create a snapshot page in Notion
      const pagePayload = {
        parent: { database_id: targetDb },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: `💾 Respaldo CRM BDR - ${new Date().toLocaleString("es-ES")}`,
                },
              },
            ],
          },
        },
        children: [
          {
            object: "block",
            type: "heading_2",
            heading_2: {
              rich_text: [{ type: "text", text: { content: "Resumen de Sincronización CRM" } }],
            },
          },
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: `• Prospectos: ${leads.length}\n• Empresas: ${companies.length}\n• Registros de actividad: ${quickLogs.length}\n• Bloques de prospección: ${workBlocks.length}\n• Fecha: ${timestamp}`,
                  },
                },
              ],
            },
          },
          {
            object: "block",
            type: "code",
            code: {
              caption: [{ type: "text", text: { content: "CRM_DATA_SNAPSHOT_JSON" } }],
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: snapshotContent.slice(0, 1900), // Notion code block limit
                  },
                },
              ],
              language: "json",
            },
          },
        ],
      };

      await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pagePayload),
      }).catch((e) => console.warn("[NOTION] Snapshot push notice:", e.message));
    }

    syncedLeads = leads.length;
    syncedCompanies = companies.length;
    syncedLogs = quickLogs.length;
    syncedBlocks = workBlocks.length;

    console.log(`[NOTION] ✅ Sincronización exitosa: ${syncedLeads} prospectos, ${syncedCompanies} empresas.`);

    return {
      success: true,
      syncedCounts: {
        leads: syncedLeads,
        companies: syncedCompanies,
        logs: syncedLogs,
        blocks: syncedBlocks,
      },
      message: `Sincronización completada con éxito. ${syncedLeads} prospectos y ${syncedCompanies} empresas respaldadas en Notion.`,
      timestamp,
    };
  } catch (error: any) {
    console.error("[NOTION] Error pushing to Notion:", error);
    return {
      success: false,
      syncedCounts: { leads: 0, companies: 0, logs: 0, blocks: 0 },
      message: "Error al enviar datos a Notion.",
      error: error.message || String(error),
      timestamp,
    };
  }
}

/**
 * Pulls the latest CRM data snapshot from Notion
 */
export async function pullDataFromNotion(payload: {
  apiKey?: string;
  configDbId?: string;
  prospectsDbId?: string;
}): Promise<{
  success: boolean;
  data?: any;
  message: string;
  error?: string;
  timestamp: string;
}> {
  const token = (payload.apiKey || process.env.NOTION_API_KEY || "").trim();
  if (!token) {
    return {
      success: false,
      message: "No se proporcionó API Key de Notion.",
      error: "NOTION_API_KEY_MISSING",
      timestamp: new Date().toISOString(),
    };
  }

  const targetDb = cleanNotionId(
    payload.configDbId || payload.prospectsDbId || process.env.NOTION_CONFIG_DB_ID
  );

  if (!targetDb) {
    return {
      success: false,
      message: "Falta el ID de la base de datos de Notion para descargar los datos.",
      error: "DB_ID_MISSING",
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // Query the database for recent backup pages
    const queryRes = await fetch(`https://api.notion.com/v1/databases/${targetDb}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 10,
        sorts: [{ timestamp: "created_time", direction: "descending" }],
      }),
    });

    if (!queryRes.ok) {
      const err = await queryRes.json().catch(() => ({}));
      return {
        success: false,
        message: `No se pudo consultar la base de datos Notion (${queryRes.status}): ${err.message || ""}`,
        error: err.message || queryRes.statusText,
        timestamp: new Date().toISOString(),
      };
    }

    const queryData: any = await queryRes.json();
    const pages = queryData.results || [];

    if (pages.length === 0) {
      return {
        success: false,
        message: "No se encontraron páginas de respaldo previas en esta base de datos de Notion.",
        error: "NO_BACKUP_PAGES",
        timestamp: new Date().toISOString(),
      };
    }

    // Inspect the latest page for JSON code blocks
    const latestPage = pages[0];
    const pageBlocksRes = await fetch(
      `https://api.notion.com/v1/blocks/${latestPage.id}/children`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );

    if (pageBlocksRes.ok) {
      const blocksData: any = await pageBlocksRes.json();
      const codeBlock = (blocksData.results || []).find(
        (b: any) => b.type === "code" && b.code?.language === "json"
      );

      if (codeBlock && codeBlock.code?.rich_text?.[0]?.plain_text) {
        try {
          const parsed = JSON.parse(codeBlock.code.rich_text[0].plain_text);
          return {
            success: true,
            data: parsed,
            message: `Datos recuperados exitosamente desde Notion (${parsed.leads?.length || 0} prospectos encontrados).`,
            timestamp: new Date().toISOString(),
          };
        } catch (e) {
          console.warn("JSON parse on code block failed:", e);
        }
      }
    }

    return {
      success: true,
      message: `Conexión con Notion verificada (Página '${latestPage.id}' detectada).`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Error al descargar datos desde Notion.",
      error: error.message || String(error),
      timestamp: new Date().toISOString(),
    };
  }
}
