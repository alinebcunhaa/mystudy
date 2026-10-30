// Supabase Edge Function: notion-caso
// Recebe um caso da pasta "Casos PS Aline" (medicacao.html) e cria/atualiza
// a página correspondente no banco "📋 Casos PSA" do Notion.
// Segredo necessário: NOTION_TOKEN (chave da integração interna do Notion).
// Desligue "Verify JWT" nesta função: a autenticação é o PIN do hub.

const DB_ID = "1a053f98fc5141ecaf95bf6340887628"; // 📋 Casos PSA
const NOTION = "https://api.notion.com/v1";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, content-type, authorization, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

// texto -> rich_text (Notion limita 2000 caracteres por bloco de texto)
const rt = (s?: string) => {
  const t = (s || "").trim();
  const out = [];
  for (let i = 0; i < t.length && out.length < 100; i += 2000) out.push({ type: "text", text: { content: t.slice(i, i + 2000) } });
  return { rich_text: out };
};
const sel = (v?: string) => ({ select: v ? { name: v.replace(/,/g, " ") } : null });
const AREA: Record<string, string> = { "Psiq": "Saúde Mental", "Trauma/Orto": "Trauma" };
const DESF: Record<string, string> = { "Observação": "Em observação" };

function props(c: Record<string, any>) {
  const pac = [c.nome, c.idade && c.idade + "a", c.sexo].filter(Boolean).join(", ") + (c.atend ? ` (at. ${c.atend})` : "");
  const titulo = [c.hd || "Caso sem HD", c.idade && c.idade + "a"].filter(Boolean).join(" · ");
  const p: Record<string, unknown> = {
    "Caso": { title: [{ type: "text", text: { content: titulo.slice(0, 2000) } }] },
    "Data": { date: c.data ? { start: c.data } : null },
    "Local": sel(c.onde),
    "Paciente": rt(pac),
    "área médica": { multi_select: (c.tags || []).map((t: string) => ({ name: (AREA[t] || t).replace(/,/g, " ") })) },
    "Apresentação clínica": rt(c.anam),
    "Antecedentes": rt(c.ant),
    "Exame físico": rt(c.ef),
    "Exames": rt(c.ex),
    "Diagnóstico principal": rt(c.hd),
    "Diferenciais": rt(c.dd),
    "Conduta": rt([c.cond, c.esp && `Destino: ${c.esp}`].filter(Boolean).join("\n")),
    "Desfecho": sel(DESF[c.desf] || c.desf),
    "Aprendizado/Pontos-chave": rt(c.perola),
    "Pra estudar": rt(c.estudar),
    "Marcante": { checkbox: !!c.star },
    "ID hub": rt(c.id),
  };
  return p;
}

async function notion(path: string, method: string, body?: unknown) {
  const r = await fetch(NOTION + path, {
    method,
    headers: {
      Authorization: `Bearer ${Deno.env.get("NOTION_TOKEN")}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || `Notion ${r.status}`);
  return d;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { pin, caso } = await req.json();
    if (!pin || !caso?.id) return json({ error: "Faltou PIN ou caso" }, 400);

    // Confere o PIN usando a mesma função do hub (psa_listar)
    const apikey = req.headers.get("apikey") || Deno.env.get("SUPABASE_ANON_KEY") || "";
    const chk = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/psa_listar`, {
      method: "POST",
      headers: { apikey, "Content-Type": "application/json" },
      body: JSON.stringify({ p_pin: pin }),
    });
    if (!chk.ok) return json({ error: "PIN inválido" }, 401);
    if (!Deno.env.get("NOTION_TOKEN")) return json({ error: "Falta o segredo NOTION_TOKEN no Supabase" }, 500);

    // Acha a página: pelo id salvo no hub ou pela coluna "ID hub"
    let pageId: string | null = caso.notion || null;
    if (pageId) {
      try {
        const pg = await notion(`/pages/${pageId}`, "GET");
        if (pg.archived || pg.in_trash) pageId = null;
      } catch { pageId = null; }
    }
    if (!pageId) {
      const q = await notion(`/databases/${DB_ID}/query`, "POST", {
        filter: { property: "ID hub", rich_text: { equals: caso.id } }, page_size: 1,
      });
      pageId = q.results?.[0]?.id || null;
    }

    const properties = props(caso);
    const page = pageId
      ? await notion(`/pages/${pageId}`, "PATCH", { properties })
      : await notion(`/pages`, "POST", { parent: { database_id: DB_ID }, icon: { type: "emoji", emoji: "🩺" }, properties });
    return json({ id: page.id, url: page.url, updated: !!pageId });
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
