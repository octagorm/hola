// The credential, the pilgrim's passport: each day's chapter finished is a
// stage of the Camino Francés, from Saint-Jean-Pied-de-Port over the
// Pyrenees to Santiago de Compostela, and on to Fisterra at the sea. Each
// stage ends in a town that stamps the passport. The motif on a stamp is
// something the town is known for.

export type Motif =
  | 'shell'
  | 'cross'
  | 'bridge'
  | 'tower'
  | 'grapes'
  | 'rooster'
  | 'lion'
  | 'castle'
  | 'wheat'
  | 'mountain'
  | 'star'
  | 'sun'

export interface Stage {
  town: string
  motif: Motif
}

export const START = 'Saint-Jean-Pied-de-Port'

export const STAGES: Array<Stage> = [
  { town: 'Roncesvalles', motif: 'cross' },
  { town: 'Zubiri', motif: 'bridge' },
  { town: 'Pamplona', motif: 'tower' },
  { town: 'Puente la Reina', motif: 'bridge' },
  { town: 'Estella', motif: 'tower' },
  { town: 'Los Arcos', motif: 'cross' },
  { town: 'Logroño', motif: 'grapes' },
  { town: 'Nájera', motif: 'grapes' },
  { town: 'Santo Domingo de la Calzada', motif: 'rooster' },
  { town: 'Belorado', motif: 'wheat' },
  { town: 'San Juan de Ortega', motif: 'cross' },
  { town: 'Burgos', motif: 'castle' },
  { town: 'Hornillos del Camino', motif: 'wheat' },
  { town: 'Castrojeriz', motif: 'castle' },
  { town: 'Frómista', motif: 'tower' },
  { town: 'Carrión de los Condes', motif: 'wheat' },
  { town: 'Terradillos de los Templarios', motif: 'cross' },
  { town: 'El Burgo Ranero', motif: 'wheat' },
  { town: 'Mansilla de las Mulas', motif: 'tower' },
  { town: 'León', motif: 'lion' },
  { town: 'San Martín del Camino', motif: 'shell' },
  { town: 'Astorga', motif: 'tower' },
  { town: 'Rabanal del Camino', motif: 'cross' },
  { town: 'Ponferrada', motif: 'castle' },
  { town: 'Villafranca del Bierzo', motif: 'grapes' },
  { town: 'O Cebreiro', motif: 'mountain' },
  { town: 'Triacastela', motif: 'castle' },
  { town: 'Sarria', motif: 'shell' },
  { town: 'Portomarín', motif: 'bridge' },
  { town: 'Palas de Rei', motif: 'tower' },
  { town: 'Arzúa', motif: 'shell' },
  { town: 'O Pedrouzo', motif: 'shell' },
  { town: 'Santiago de Compostela', motif: 'star' },
  { town: 'Negreira', motif: 'bridge' },
  { town: 'Olveiroa', motif: 'shell' },
  { town: 'Fisterra', motif: 'sun' },
]

// The stage a day's chapter reaches, counting from 1; past Fisterra the
// walk starts again from the Pyrenees
export const stageOf = (n: number): Stage =>
  STAGES[(Math.max(1, n) - 1) % STAGES.length]

// Where a stage starts
export const fromOf = (n: number): string =>
  (n - 1) % STAGES.length === 0 ? START : stageOf(n - 1).town
