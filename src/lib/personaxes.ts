import data from "../data/personaxes.json";

type Base = (typeof data.personaxes)[number];
export type PersonaxeImaxe = Base & { imaxe: string | null };

// Títulos de Wikipedia cando non coinciden co nome do JSON
const TITULOS: Record<string, string> = {
  castelao: "Castelao",
  moncho_reboiras: "Moncho Reboiras",
  maria_pita: "María Pita",
  alfonso_rueda: "Alfonso Rueda Valenzuela",
  basilio_alvarez: "Basilio Álvarez Rodríguez",
  bautista_alvarez: "Bautista Álvarez Domínguez",
  ramon_piñeiro: "Ramón Piñeiro López",
  francisco_vazquez: "Francisco Vázquez Vázquez",
  santiago_alvarez_gomez: "Santiago Álvarez Gómez",
};

const cache = new Map<string, string | null>();
let pendente: Promise<PersonaxeImaxe[]> | null = null;

async function miniatura(lang: string, titulo: string): Promise<string | null> {
  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      titulo.replace(/ /g, "_")
    )}`;
    const r = await fetch(url, {
      headers: { "User-Agent": "compas-politico-galego/1.0 (proxecto persoal)", Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

async function imaxeDe(p: Base): Promise<string | null> {
  // Se engades "imaxe": "https://…" a unha personaxe no JSON, ten prioridade
  const manual = (p as { imaxe?: string }).imaxe;
  if (manual) return manual;
  if (cache.has(p.id)) return cache.get(p.id)!;
  const titulo = TITULOS[p.id] ?? p.nome.replace(/\s*\(.*\)/, "");
  let url: string | null = null;
  for (const lang of ["gl", "es", "en"]) {
    url = await miniatura(lang, titulo);
    if (url) break;
  }
  cache.set(p.id, url);
  return url;
}

export function getPersonaxes(): Promise<PersonaxeImaxe[]> {
  pendente ??= (async () => {
    const out: PersonaxeImaxe[] = [];
    const lista = data.personaxes;
    for (let i = 0; i < lista.length; i += 8) {
      const lote = lista.slice(i, i + 8);
      const imaxes = await Promise.all(lote.map(imaxeDe));
      lote.forEach((p, k) => out.push({ ...p, imaxe: imaxes[k] }));
    }
    return out;
  })();
  return pendente;
}