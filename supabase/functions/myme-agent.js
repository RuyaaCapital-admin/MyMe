import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const COMPOSIO_API_KEY = Deno.env.get("COMPOSIO_API_KEY") || "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function getErrorMessage(error) {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  try {
    return JSON.stringify(error);
  } catch (_) {
    return "Unknown error";
  }
}

function getAccessToken(req) {
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return "";
  const token = authHeader.slice(7).trim();
  if (!token || token.length < 20) return "";
  return token;
}

function safeJsonParse(value, fallback) {
  if (typeof value !== "string") {
    if (value && typeof value === "object") return value;
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
}

function normalizeToolParameters(schema) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return { type: "object", properties: {} };
  }

  const cloned = safeJsonParse(JSON.stringify(schema), {
    type: "object",
    properties: {},
  });

  if (cloned.type !== "object") cloned.type = "object";
  if (
    !cloned.properties ||
    typeof cloned.properties !== "object" ||
    Array.isArray(cloned.properties)
  ) {
    cloned.properties = {};
  }
  if (!Array.isArray(cloned.required)) cloned.required = [];

  return cloned;
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter(Boolean)
    .map(function (msg) {
      const clean = {
        role: msg.role,
      };

      if ("content" in msg) clean.content = msg.content;
      if ("name" in msg) clean.name = msg.name;
      if ("tool_call_id" in msg) clean.tool_call_id = msg.tool_call_id;
      if (Array.isArray(msg.tool_calls)) clean.tool_calls = msg.tool_calls;

      return clean;
    })
    .filter(function (msg) {
      return typeof msg.role === "string";
    });
}

async function getOptionalUser(req) {
  const accessToken = getAccessToken(req);

  if (!accessToken) {
    console.log("No valid auth token found.");
    return null;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    return null;
  }

  try {
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const authResult = await authClient.auth.getUser(accessToken);

    if (authResult.error || !authResult.data || !authResult.data.user) {
      console.error(
        "Supabase getUser error:",
        authResult.error ? authResult.error.message : "No user",
      );
      return null;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      },
    });

    return {
      user: authResult.data.user,
      supabase: supabase,
      accessToken: accessToken,
    };
  } catch (error) {
    console.error("getOptionalUser failed:", getErrorMessage(error));
    return null;
  }
}

async function requireUser(req) {
  const result = await getOptionalUser(req);

  if (!result) {
    return {
      error: jsonResponse(
        {
          error: "Sign in required",
          detail: "Missing or invalid Authorization bearer token",
        },
        401,
      ),
    };
  }

  return result;
}

async function composioFetch(path, options) {
  if (!COMPOSIO_API_KEY) {
    throw new Error("Missing COMPOSIO_API_KEY");
  }

  const response = await fetch("https://backend.composio.dev/api/v1" + path, {
    method: options && options.method ? options.method : "GET",
    headers: {
      "x-api-key": COMPOSIO_API_KEY,
      "Content-Type": "application/json",
      ...(options && options.headers ? options.headers : {}),
    },
    body: options && options.body ? options.body : undefined,
  });

  const text = await response.text();
  let data = text;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {}

  if (!response.ok) {
    console.error("Composio error on", path, "=>", text);
    const message =
      (data &&
        typeof data === "object" &&
        (data.message || data.error || data.detail)) ||
      "Composio API error: " + response.status;
    throw new Error(message);
  }

  return data;
}

async function loadUserPrompt(supabase, userId) {
  let systemPrompt =
    "You are MyMe, a premium AI assistant. Be helpful, concise, and professional.";

  try {
    const result = await supabase
      .from("user_settings")
      .select("tone, instructions")
      .eq("user_id", userId)
      .maybeSingle();

    if (result.error) {
      console.error("user_settings load failed:", result.error.message);
      return systemPrompt;
    }

    if (result.data) {
      systemPrompt =
        "You are MyMe, a premium AI assistant.\n" +
        "Tone: " +
        (result.data.tone || "Professional") +
        "\n" +
        "Instructions: " +
        (result.data.instructions || "Be helpful and concise");
    }

    return systemPrompt;
  } catch (error) {
    console.error("loadUserPrompt failed:", getErrorMessage(error));
    return systemPrompt;
  }
}

async function loadConnectedTools(userId) {
  const connectedAccounts = [];
  const tools = [];
  const toolMeta = {};
  const seenNames = new Set();

  try {
    const qs = new URLSearchParams({
      user_uuid: userId,
      showActiveOnly: "true",
    });

    const connResult = await composioFetch(
      "/connectedAccounts?" + qs.toString(),
    );
    const accounts = Array.isArray(connResult && connResult.items)
      ? connResult.items
      : Array.isArray(connResult)
        ? connResult
        : [];

    connectedAccounts.push(...accounts);

    for (const account of accounts) {
      const appName = account && account.appName ? account.appName : null;
      if (!appName) continue;

      try {
        const aqs = new URLSearchParams({
          appNames: appName,
          limit: "50",
          user_uuid: userId,
        });

        const actionResult = await composioFetch("/actions?" + aqs.toString());
        const actionItems = Array.isArray(actionResult && actionResult.items)
          ? actionResult.items
          : [];

        for (const action of actionItems) {
          if (!action || !action.name) continue;
          if (seenNames.has(action.name)) continue;

          seenNames.add(action.name);

          tools.push({
            type: "function",
            function: {
              name: action.name,
              description: action.description || "Execute " + action.name,
              parameters: normalizeToolParameters(
                action.parameters || action.inputParameters || {},
              ),
            },
          });

          toolMeta[action.name] = {
            connectedAccountId: account.id || null,
            appName: appName,
          };
        }
      } catch (error) {
        console.warn(
          "Failed loading tools for app",
          appName,
          getErrorMessage(error),
        );
      }
    }
  } catch (error) {
    console.error("loadConnectedTools failed:", getErrorMessage(error));
  }

  return {
    connectedAccounts: connectedAccounts,
    tools: tools,
    toolMeta: toolMeta,
  };
}

function appendToolResultMessages(
  agentMessages,
  incomingToolCall,
  toolId,
  toolResult,
) {
  const hasToolId = toolId !== undefined && toolId !== null && toolId !== "";
  const hasToolResult = toolResult !== undefined;

  if (!hasToolId || !hasToolResult) return;

  const alreadyHasAssistantToolCall = agentMessages.some(function (msg) {
    return (
      msg &&
      msg.role === "assistant" &&
      Array.isArray(msg.tool_calls) &&
      msg.tool_calls.some(function (tc) {
        return tc && tc.id === toolId;
      })
    );
  });

  if (!alreadyHasAssistantToolCall && incomingToolCall) {
    const functionName =
      (incomingToolCall.function && incomingToolCall.function.name) ||
      incomingToolCall.name ||
      "tool_function";

    const functionArguments =
      incomingToolCall.function &&
      typeof incomingToolCall.function.arguments === "string"
        ? incomingToolCall.function.arguments
        : JSON.stringify(
            (incomingToolCall.function &&
              incomingToolCall.function.arguments) ||
              incomingToolCall.arguments ||
              {},
          );

    agentMessages.push({
      role: "assistant",
      content: null,
      tool_calls: [
        {
          id: toolId,
          type: "function",
          function: {
            name: functionName,
            arguments: functionArguments,
          },
        },
      ],
    });
  }

  agentMessages.push({
    role: "tool",
    tool_call_id: toolId,
    content:
      typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult),
  });
}

serve(async function (req) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    let body = {};

    try {
      body = await req.json();
    } catch (_) {
      body = {};
    }

    const action = body.action;
    const messages = body.messages;
    const toolCall = body.tool_call;
    const toolId = body.tool_id;
    const toolResult = body.tool_result;
    const appName = body.appName;
    const integrationId = body.integrationId || appName;
    const redirectUri =
      body.redirectUri ||
      req.headers.get("origin") ||
      "https://my-me-xi.vercel.app";

    console.log("[myme-agent] action =", action);

    if (!action) {
      return jsonResponse({ error: "Missing action" }, 400);
    }

    if (action === "list_apps") {
      try {
        const apps = await composioFetch("/apps?limit=50");
        return jsonResponse(apps && apps.items ? apps.items : apps || []);
      } catch (error) {
        return jsonResponse(
          { error: "Failed to fetch apps", detail: getErrorMessage(error) },
          502,
        );
      }
    }

    if (action === "chat") {
      if (!OPENAI_API_KEY) {
        return jsonResponse({ error: "Missing OPENAI_API_KEY" }, 500);
      }

      let systemPrompt =
        "You are MyMe, a premium AI assistant. Be helpful, concise, and professional.";
      let tools = [];
      let connectedAccounts = [];
      let toolMeta = {};

      const authResult = await getOptionalUser(req);

      if (authResult) {
        systemPrompt = await loadUserPrompt(
          authResult.supabase,
          authResult.user.id,
        );

        const toolData = await loadConnectedTools(authResult.user.id);
        tools = toolData.tools;
        connectedAccounts = toolData.connectedAccounts;
        toolMeta = toolData.toolMeta;
      }

      const agentMessages = [
        { role: "system", content: systemPrompt },
        ...normalizeMessages(messages),
      ];

      appendToolResultMessages(agentMessages, toolCall, toolId, toolResult);

      const payload = {
        model: "gpt-4o",
        messages: agentMessages,
        temperature: 0.7,
      };

      if (tools.length > 0) {
        payload.tools = tools;
        payload.tool_choice = "auto";
      }

      const openaiRes = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + OPENAI_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const raw = await openaiRes.text();
      let completion = {};

      try {
        completion = raw ? JSON.parse(raw) : {};
      } catch (_) {}

      if (!openaiRes.ok) {
        console.error("OpenAI error:", raw);
        return jsonResponse(
          {
            error: "AI service error",
            detail: raw || "status " + openaiRes.status,
          },
          502,
        );
      }

      const msg =
        completion &&
        completion.choices &&
        completion.choices[0] &&
        completion.choices[0].message
          ? completion.choices[0].message
          : null;

      if (!msg) {
        return jsonResponse(
          { error: "Invalid AI response", detail: "No message returned" },
          502,
        );
      }

      if (Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0) {
        const enrichedToolCalls = msg.tool_calls.map(function (tc) {
          const toolName = tc && tc.function ? tc.function.name : "";
          const meta = toolMeta[toolName] || {};

          return {
            ...tc,
            connectedAccountId: meta.connectedAccountId || null,
            appName: meta.appName || null,
          };
        });

        return jsonResponse({
          status: "requires_action",
          tool_call: enrichedToolCalls[0],
          tool_calls: enrichedToolCalls,
          content: msg.content || "",
          connected_accounts: connectedAccounts,
        });
      }

      return jsonResponse({
        status: "completed",
        content: msg.content || "",
      });
    }

    if (action === "get_connections") {
      const authResult = await requireUser(req);
      if ("error" in authResult) return authResult.error;

      try {
        const qs = new URLSearchParams({
          user_uuid: authResult.user.id,
          showActiveOnly: "true",
        });

        const result = await composioFetch(
          "/connectedAccounts?" + qs.toString(),
        );
        return jsonResponse(
          result && result.items ? result.items : result || [],
        );
      } catch (error) {
        return jsonResponse(
          {
            error: "Failed to fetch connections",
            detail: getErrorMessage(error),
          },
          502,
        );
      }
    }

    if (action === "connect") {
      const authResult = await requireUser(req);
      if ("error" in authResult) return authResult.error;

      if (!integrationId) {
        return jsonResponse(
          {
            error: "Missing integrationId",
            detail: "Frontend must send integrationId. Do not rely on appName.",
          },
          400,
        );
      }

      try {
        const result = await composioFetch("/connectedAccounts", {
          method: "POST",
          body: JSON.stringify({
            integrationId: integrationId,
            userUuid: authResult.user.id,
            redirectUri: redirectUri,
          }),
        });

        return jsonResponse(result);
      } catch (error) {
        return jsonResponse(
          { error: "Failed to connect", detail: getErrorMessage(error) },
          502,
        );
      }
    }

    if (action === "execute") {
      const authResult = await requireUser(req);
      if ("error" in authResult) return authResult.error;

      if (!toolCall) {
        return jsonResponse({ error: "Missing tool_call" }, 400);
      }

      const toolName =
        toolCall && toolCall.function ? toolCall.function.name : "";
      const connectedAccountId =
        toolCall.connectedAccountId || body.connectedAccountId || null;
      const args = safeJsonParse(
        toolCall && toolCall.function ? toolCall.function.arguments : {},
        {},
      );

      if (!toolName) {
        return jsonResponse({ error: "Missing tool name" }, 400);
      }

      if (!connectedAccountId) {
        return jsonResponse(
          {
            error: "Missing connectedAccountId",
            detail: "Tool returned without a mapped connected account",
          },
          400,
        );
      }

      try {
        const result = await composioFetch(
          "/actions/" + toolName + "/execute",
          {
            method: "POST",
            body: JSON.stringify({
              connectedAccountId: connectedAccountId,
              input: args,
              entityId: authResult.user.id,
            }),
          },
        );

        return jsonResponse({
          status: "completed",
          tool_result: result,
        });
      } catch (error) {
        return jsonResponse(
          { error: "Tool execution failed", detail: getErrorMessage(error) },
          502,
        );
      }
    }

    return jsonResponse({ error: "Unknown action: " + action }, 400);
  } catch (error) {
    console.error("Fatal error:", getErrorMessage(error));
    return jsonResponse({ error: getErrorMessage(error) }, 500);
  }
});
