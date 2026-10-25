// Who reads Hola's Spanish aloud, and how: voices designed from a
// description, the teacher and the narrator from Madrid. The teacher says
// each word on its own, and the sample in Settings; the narrator says whole
// sentences, the stories' and the games'. The cast of the games and
// of El caso del reloj perdido speak in voices of their own. The page uses
// only the names, as keys to the recordings; scripts/audio.py reads the
// rest through scripts/speech.ts.

export interface Voice {
  // One of DESIGNED, or a Gemini prebuilt voice
  base: string
  // How to say it, in a few words. Google's advice is to keep this to the
  // delivery: age, sex and accent belong to the voice.
  style: string
  // The language it speaks, for the TTS: Castilian Spanish unless said
  lang?: string
}

export const WORD_VOICE = 'Profesora'
export const LINE_VOICE = 'Narrador'
// Números: a woman and a man taking turns with the numbers in everyday
// sentences, and the Christmas lottery sung as the San Ildefonso children
// sing it
export const NUMBER_VOICES = ['Lola', 'Andrés']
export const LOTTERY_VOICE = 'Ildefonso'
// Taxi: the passenger in the back
export const TAXI_VOICE = 'Pasajero'

// Voices designed from a description, each made once (their ids are kept
// in scripts/voices.json; delete one to design it again)
export const DESIGNED: Record<string, string> = {
  // The audiobooks' hosts (data/lydbok.ts), who talk in both languages
  Marta:
    'A Spanish woman in her forties from Madrid who has lived many years in Oslo: she speaks Castilian Spanish with distinción (z, and c before e or i, said as θ) as her own language, and fluent Norwegian bokmål with a light Spanish colour. A warm, bright and clear voice, a good teacher on the radio, every Spanish word crisp.',
  Ingrid:
    'A Norwegian woman in her sixties from Oslo, speaking Norwegian bokmål with a natural eastern Norwegian accent, who is learning Spanish and says Spanish words carefully and well, as a keen learner does. A warm, friendly voice with a smile in it, unhurried and clear.',
  Profesora:
    'A Spanish woman in her thirties, a native speaker from Madrid who teaches Spanish, speaking Castilian Spanish with distinción (z, and c before e or i, said as θ, as in zapato and cielo): a clear, warm and natural voice, friendly and patient, every sound crisp.',
  Narrador:
    'A Spanish man in his fifties, a native speaker from Madrid, speaking Castilian Spanish with distinción (z, and c before e or i, said as θ, as in corazón and cerca): a warm, clear and natural voice, a storyteller reading an old novel aloud to a friend, lively but never theatrical.',
  // Three witnesses in El caso del reloj perdido (data/caso.ts), from
  // Cadaqués
  Narcís:
    'A Spanish man of almost eighty, a retired fisherman born and raised in Cadaqués on the coast of Catalonia, speaking Castilian Spanish with distinción (z, and c before e or i, said as θ, as in cerca and corazón): a deep, slightly hoarse and warm voice, slow and gentle, every word clear.',
  Remei:
    'A Spanish woman in her seventies, born and raised in Cadaqués on the coast of Catalonia, speaking Castilian Spanish with distinción (z, and c before e or i, said as θ, as in plaza and cielo): a bright, lively voice with a smile in it, a neighbour who loves to tell what she has seen, and always clear.',
  Laia: 'A Spanish woman in her twenties, born and raised in Cadaqués on the coast of Catalonia, speaking Castilian Spanish with distinción (z, and c before e or i, said as θ, as in azul and hacer): a clear, warm and natural young voice, friendly and a little shy.',
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
  // The guests who order at the bar in Tapas (lib/tapas.ts), two women
  // and two men, in Gemini's prebuilt voices
  Lucía: {
    base: 'Laomedeia',
    style: 'ordering at the bar, cheerful and natural, at a calm pace',
  },
  Manolo: {
    base: 'Charon',
    style: 'ordering at his usual bar, relaxed and friendly, at a calm pace',
  },
  Carmen: {
    base: 'Sulafat',
    style: 'ordering at the bar, warm and unhurried',
  },
  Javi: {
    base: 'Achird',
    style: 'ordering at the bar, casual and friendly, at a calm pace',
  },
  // The four sellers at El Rastro (lib/rastro.ts); the player's own lines
  // there are the teacher's
  Paco: {
    base: 'Algenib',
    style: 'selling old books at a flea market, gruff but kind, at a calm pace',
  },
  Rosa: {
    base: 'Pulcherrima',
    style: 'selling at a flea market, lively and warm, at a calm pace',
  },
  Julián: {
    base: 'Sadaltager',
    style: 'an antique dealer at a flea market, courteous, at a calm pace',
  },
  Pilar: {
    base: 'Gacrux',
    style: 'selling at a flea market, brisk and warm, at a calm pace',
  },
  // El caso del reloj perdido (data/caso.ts): the inspector in the
  // narrator's voice, three witnesses in voices of their own, and the
  // rest in Gemini's prebuilt voices
  Garrido: {
    base: 'Narrador',
    style: 'an inspector asking a witness, kind and calm',
  },
  Narcís: {
    base: 'Narcís',
    style: 'an old fisherman talking to the inspector, warm and unhurried',
  },
  Remei: {
    base: 'Remei',
    style: 'a chatty neighbour, lively and warm, at a calm pace',
  },
  Laia: {
    base: 'Laia',
    style: 'a young woman talking to the inspector, warm, at a calm pace',
  },
  Montse: {
    base: 'Aoede',
    style: 'running a beach bar, lively and warm, at a calm pace',
  },
  Quim: {
    base: 'Alnilam',
    style:
      'an old fisherman at his market stall, gruff and proud, at a calm pace',
  },
  Puig: {
    base: 'Algieba',
    style: 'a refined collector from Barcelona, smooth, at a calm pace',
  },
  Jordi: {
    base: 'Iapetus',
    style: 'a shy young watchmaker, gentle, at a calm pace',
  },
  Lola: {
    base: 'Profesora',
    style: 'an everyday sentence with a number in it, clear and natural',
  },
  Andrés: {
    base: 'Narrador',
    style: 'an everyday sentence with a number in it, clear and natural',
  },
  // A prebuilt voice, young, as the lottery's children are
  Ildefonso: {
    base: 'Leda',
    style: 'a child singing out the Christmas lottery draw, in its sing-song',
  },
  // The audiobooks' hosts (data/lydbok.ts): their talk goes between
  // Norwegian and Spanish within a line; the story itself is the
  // narrator's, and its people speak in the cast's voices
  Marta: {
    base: 'Marta',
    style: 'a podcast host teaching Spanish, warm and lively, at a calm pace',
    lang: 'Norwegian bokmål and Castilian Spanish, each word in its own language as written',
  },
  Ingrid: {
    base: 'Ingrid',
    style: 'a podcast host learning Spanish, warm and curious, at a calm pace',
    lang: 'Norwegian bokmål and Castilian Spanish, each word in its own language as written',
  },
  Pasajero: {
    base: 'Narrador',
    style: 'a passenger in a Madrid taxi giving the way, polite and clear',
  },
}

// What «Prøv stemmen» in Settings says
export const SAMPLE = 'Hola, ¿qué tal? Poco a poco se va lejos.'
