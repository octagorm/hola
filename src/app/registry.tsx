import { lazy } from 'react'
import type { ComponentType } from 'react'

// Every page but the home page, by the URL's hash: /#palabra, and for a
// chapter of the story /#quijote/molinos (the part after the slash is the
// page's `arg`). Each page's code is loaded when it is first opened. To add
// a page, add a file to games/ and a line here.

export interface PageProps {
  // The page's id: a story's page tells by it which story it is
  id: string
  arg?: string
}

const page = (load: () => Promise<{ default: ComponentType<PageProps> }>) =>
  lazy(load)

export const PAGES = [
  {
    id: 'hoy',
    es: 'Capítulo de hoy',
    no: 'Dagens kapittel',
    Page: page(() => import('./games/hoy')),
  },
  {
    id: 'repaso',
    es: 'Repaso',
    no: 'Repetisjon',
    Page: page(() => import('./games/repaso')),
  },
  {
    id: 'nuevas',
    es: 'Palabras nuevas',
    no: 'Nye ord',
    Page: page(() => import('./games/nuevas')),
  },
  {
    id: 'tema',
    es: 'Temas',
    no: 'Emner',
    Page: page(() => import('./games/tema')),
  },
  {
    id: 'quijote',
    es: 'Don Quijote',
    no: 'Don Quijote',
    Page: page(() => import('./games/story')),
  },
  {
    id: 'palabra',
    es: 'La palabra',
    no: 'Dagens ord',
    Page: page(() => import('./games/palabra')),
  },
  {
    id: 'crucigrama',
    es: 'Mini crucigrama',
    no: 'Kryssord',
    Page: page(() => import('./games/crucigrama')),
  },
  {
    id: 'rosco',
    es: 'El rosco',
    no: 'Bokstavringen',
    Page: page(() => import('./games/rosco')),
  },
  {
    id: 'cadaver',
    es: 'Cadáver exquisito',
    no: 'Setningsleken',
    Page: page(() => import('./games/cadaver')),
  },
  {
    id: 'sopa',
    es: 'Sopa de letras',
    no: 'Ordleting',
    Page: page(() => import('./games/sopa')),
  },
  {
    id: 'reloj',
    es: 'El reloj blando',
    no: 'Den myke klokken',
    Page: page(() => import('./games/reloj')),
  },
  {
    id: 'porpara',
    es: 'Por o para',
    no: 'Por eller para',
    Page: page(() => import('./games/porpara')),
  },
  {
    id: 'tiempos',
    es: 'Ayer, hoy, mañana',
    no: 'I går, i dag, i morgen',
    Page: page(() => import('./games/tiempos')),
  },
  {
    id: 'letras',
    es: 'Letras',
    no: 'Bokstavene',
    Page: page(() => import('./games/letras')),
  },
  {
    id: 'cadena',
    es: 'Palabras encadenadas',
    no: 'Ordkjeden',
    Page: page(() => import('./games/cadena')),
  },
  {
    id: 'elola',
    es: '¿El o la?',
    no: 'Hankjønn eller hunkjønn',
    Page: page(() => import('./games/elola')),
  },
  {
    id: 'ordbank',
    es: 'Tus palabras',
    no: 'Ordbank',
    Page: page(() => import('./games/ordbank')),
  },
  {
    id: 'ajustes',
    es: 'Ajustes',
    no: 'Innstillinger',
    Page: page(() => import('./games/ajustes')),
  },
  {
    id: 'credencial',
    es: 'La credencial',
    no: 'Pilegrimspasset',
    Page: page(() => import('./games/credencial')),
  },
] as const

export type PageId = (typeof PAGES)[number]['id']
