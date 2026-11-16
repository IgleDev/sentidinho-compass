export type Pregunta = {
  id: number;
  tematica: string;
  afirmacion: string;
  peso_x: number;
  peso_y: number;
};

export type Personaxe = {
  id: string;
  nome: string;
  anos: string;
  taxonomia: string;
  coordenadas: { x: number; y: number };
  marco_xuridico: string;
  posicion_teorica: string;
  obra_clave: string;
  cita?: string;
  imaxe?: string | null;
};

/** id da pregunta → multiplicador (-1 … 1) */
export type Respostas = Record<number, number>;

const GAIN = 1.6;
const clamp = (v: number) => Math.max(-10, Math.min(10, v));

export function calcular(preguntas: Pregunta[], respostas: Respostas) {
  let sx = 0, sy = 0, mx = 0, my = 0;
  for (const p of preguntas) {
    const m = respostas[p.id];
    if (m === undefined) continue;
    sx += m * p.peso_x;
    sy += m * p.peso_y;
    mx += Math.abs(p.peso_x);
    my += Math.abs(p.peso_y);
  }
  return {
    x: mx ? clamp((sx / mx) * 10 * GAIN) : 0,
    y: my ? clamp((sy / my) * 10 * GAIN) : 0,
  };
}

export function ordenarPorProximidade<T extends { coordenadas: { x: number; y: number } }>(
  pos: { x: number; y: number },
  personaxes: T[]
) {
  return personaxes
    .map((p) => {
      const d = Math.hypot(p.coordenadas.x - pos.x, p.coordenadas.y - pos.y);
      return { personaxe: p, distancia: d, afinidade: Math.max(0, Math.round((1 - d / 20) * 100)) };
    })
    .sort((a, b) => a.distancia - b.distancia);
}

export function cuadrante(x: number, y: number) {
  const eco = x < 0 ? "colectivista" : "liberal";
  const ter = y >= 0 ? "Soberanismo" : "Centralismo";
  return `${ter} ${eco}`;
}