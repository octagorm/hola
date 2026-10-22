// Who reads Hola's Spanish aloud, and how: two voices designed from a
// description, both from Madrid. The teacher says each word on its own, and
// the sample in Settings; the narrator says whole sentences, the story's and
// Cadáver exquisito's. The page uses only the names, as keys to the
// recordings; scripts/audio.py reads the rest through scripts/speech.ts.

export interface Voice {
  // One of DESIGNED, or a Gemini prebuilt voice
  base: string
  // How to say it, in a few words. Google's advice is to keep this to the
  // delivery: age, sex and accent belong to the voice.
  style: string
}

export const WORD_VOICE = 'Profesora'
export const LINE_VOICE = 'Narrador'

// Voices designed from a description, each made once (their ids are kept
// in scripts/voices.json; delete one to design it again)
export const DESIGNED: Record<string, string> = {
  Profesora:
    'A Spanish woman in her thirties, a native speaker from Madrid who teaches Spanish, speaking Castilian Spanish with distinción (z, and c before e or i, said as θ, as in zapato and cielo): a clear, warm and natural voice, friendly and patient, every sound crisp.',
  Narrador:
    'A Spanish man in his fifties, a native speaker from Madrid, speaking Castilian Spanish with distinción (z, and c before e or i, said as θ, as in corazón and cerca): a warm, clear and natural voice, a storyteller reading an old novel aloud to a friend, lively but never theatrical.',
}

export const VOICES: Record<string, Voice> = {
  Profesora: {
    base: 'Profesora',
    style: 'a friendly teacher, clear and natural, at a calm pace',
  },
  Narrador: {
    base: 'Narrador',
    style: 'telling a story, warm and natural, at a pace a learner can follow',
  },
}

// What «Prøv stemmen» in Settings says
export const SAMPLE = 'Hola, ¿qué tal? Poco a poco se va lejos.'
