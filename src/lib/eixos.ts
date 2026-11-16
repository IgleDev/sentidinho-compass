import type { Pregunta, Respostas } from "./scoring";

export type Eixo = {
  id: string;
  n: string;
  titulo: string;
  esq: string;
  dir: string;
  desc: string;
  /** ids de preguntas nas que estar de acordo empurra cara ao polo dereito */
  pos: number[];
  /** ids de preguntas nas que estar de acordo empurra cara ao polo esquerdo */
  neg: number[];
};

export const EIXOS: Eixo[] = [
  {
    id: "estrutura", n: "01", titulo: "Estrutura",
    esq: "Centralismo", dir: "Soberanismo",
    desc: "Mide se prefires un Estado unitario con leis uniformes ou un autogoberno con competencias, facenda e recoñecemento nacional propios para Galicia.",
    pos: [6, 8, 10, 21, 71, 72, 74, 76, 78, 79],
    neg: [7, 30, 38, 40, 73, 77, 80],
  },
  {
    id: "estratexia", n: "02", titulo: "Estratexia",
    esq: "Institucional", dir: "Rupturista",
    desc: "Compara a vía do pacto, a reforma e a xestión das institucións coa mobilización, o contrapoder popular e a confrontación co réxime vixente.",
    pos: [27, 57, 60, 94, 115, 116],
    neg: [25, 49, 56, 58, 113, 114, 117, 118],
  },
  {
    id: "economia", n: "03", titulo: "Economía",
    esq: "Público", dir: "Privado",
    desc: "Avalía a preferencia por servizos, banca e enerxía públicos fronte á iniciativa privada, a privatización e a baixada de impostos.",
    pos: [2, 32, 34, 70],
    neg: [1, 31, 35, 61, 63, 65],
  },
  {
    id: "desenvolvemento", n: "04", titulo: "Desenvolvemento",
    esq: "Comunal", dir: "Produtivista",
    desc: "Mide a defensa da xestión comunal, cooperativa e sostible do rural e do mar fronte ao crecemento por macroproxectos, turismo e concentración empresarial.",
    pos: [4, 62, 64, 66, 68, 96],
    neg: [5, 33, 69, 95],
  },
  {
    id: "lingua", n: "05", titulo: "Lingua",
    esq: "Bilingüismo", dir: "Normalización",
    desc: "Observa se valoras sobre todo a liberdade individual de elixir idioma ou a prioridade institucional do galego no ensino, a administración e os medios.",
    pos: [11, 15, 41, 81, 90],
    neg: [12, 82, 83, 85],
  },
  {
    id: "cultura", n: "06", titulo: "Cultura",
    esq: "Universalista", dir: "Enraizada",
    desc: "Compara unha cultura aberta, cosmopolita e crítica cos mitos fundacionais coa defensa da tradición popular, labrega e mariñeira como esencia do país.",
    pos: [13, 86, 89, 100],
    neg: [14, 44, 45, 87, 88],
  },
  {
    id: "relixion", n: "07", titulo: "Relixión",
    esq: "Laico", dir: "Católico",
    desc: "Compara a separación entre Igrexa e institucións, e a laicidade do ensino, co papel histórico e moral da tradición católica en Galicia.",
    pos: [17, 92],
    neg: [18, 20, 46, 93],
  },
  {
    id: "moral", n: "08", titulo: "Moral",
    esq: "Progresista", dir: "Tradicionalista",
    desc: "Avalía feminismo, dereitos LGTBIQ+, inmigración e novos modelos familiares fronte á familia tradicional, o natalismo e as costumes herdadas.",
    pos: [47, 98],
    neg: [16, 91, 97, 99],
  },
  {
    id: "memoria", n: "09", titulo: "Memoria",
    esq: "Memoria crítica", dir: "Pasar páxina",
    desc: "Mide o compromiso coa memoria histórica, o antifranquismo e a reparación fronte á reconciliación, a estabilidade e a mirada cara adiante.",
    pos: [22, 53, 54, 104, 106, 109, 110],
    neg: [51, 52, 101, 103, 105],
  },
  {
    id: "prioridade", n: "10", titulo: "Prioridade",
    esq: "Clase", dir: "Nación",
    desc: "Observa se a emancipación da clase traballadora é universal e vén primeiro, ou se a liberación nacional de Galicia é o marco prioritario da loita política.",
    pos: [3, 23, 28, 55, 102, 107, 111],
    neg: [26, 108],
  },
  {
    id: "poder", n: "11", titulo: "Poder",
    esq: "Descentralizado", dir: "Estado forte",
    desc: "Compara o poder repartido en concellos, parroquias e comarcas (ou a abolición do Estado) coa autoridade centralizada, a orde e o Estado forte.",
    pos: [19, 24, 112],
    neg: [9, 36, 37, 50, 59],
  },
  {
    id: "exterior", n: "12", titulo: "Exterior",
    esq: "Estatal", dir: "Atlántica",
    desc: "Mide se Galicia debe proxectarse a través do Estado español ou mirar a Portugal, Europa e os pobos sen Estado cunha voz exterior propia.",
    pos: [29, 39, 42, 48, 67, 75, 84, 119],
    neg: [43, 120],
  },
];

const EIXO_DE: Record<number, string> = {};
EIXOS.forEach((e) => [...e.pos, ...e.neg].forEach((q) => (EIXO_DE[q] = e.id)));

/** Valor de cada eixo entre -1 (polo esquerdo) e +1 (polo dereito); null se non hai respostas. */
export function calcularEixos(respostas: Respostas) {
  return EIXOS.map((eixo) => {
    let suma = 0;
    let n = 0;
    for (const q of eixo.pos) {
      const m = respostas[q];
      if (m !== undefined) { suma += m; n++; }
    }
    for (const q of eixo.neg) {
      const m = respostas[q];
      if (m !== undefined) { suma -= m; n++; }
    }
    return { eixo, valor: n ? suma / n : null, n };
  });
}

/** Escolle `total` preguntas repartidas equitativamente polos 12 eixos e intercaladas. */
export function escollerPreguntas(todas: Pregunta[], total: number): Pregunta[] {
  const colas = EIXOS.map((e) => todas.filter((p) => EIXO_DE[p.id] === e.id));
  const out: Pregunta[] = [];
  for (let r = 0; out.length < total; r++) {
    let engadiu = false;
    for (const c of colas) {
      if (r < c.length && out.length < total) {
        out.push(c[r]);
        engadiu = true;
      }
    }
    if (!engadiu) break;
  }
  return out;
}