import { HARRISON } from './fuentes.ts'
import type { Book } from '../biblioteca.ts'

// El testamento, from Harrison's reader (V), where it has no source named

export const TESTAMENTO: Book = {
  id: 'testamento',
  es: 'El testamento',
  no: 'Testamentet',
  by: 'Spansk folkefortelling',
  about:
    'En fattig mann på landet ligger for døden og har bare en hund og en hest. I testamentet sitt ber han kona selge hesten og gi pengene til slektningene hans. Hun gjør som han sier, på sin måte. Prisene er i gamle spanske mynter: en duro var fem pesetas, og en real en kvart peseta, så tjue reales gikk på en duro.',
  source: HARRISON,
  text: [
    [
      'Cierto>cierto=en_viss lugareño>el_lugareño=landsbyboer estaba_a_punto_de>estar_a_punto_de=holdt_på_å morir=dø .',
      'No=ikke era>ser=var muy rico=rik .',
      'Solo=bare tenía>tener=hadde un_perro>el_perro=en_hund y un_caballo>el_caballo=en_hest .',
      'No=ikke tenía>tener=hadde hijos>los_hijos=barn , pero tenía>tener=hadde una_mujer>la_mujer=en_kone .',
    ],
    [
      'Poco_antes_de>poco_antes_de=kort_før morir=å_dø , llamó>llamar=kalte_på a_su_mujer>la_mujer=kona_si#a y le=til_henne dijo>decir=sa :',
    ],
    [
      '— Ya=jo sabes>saber=vet_du que=at voy_a>ir=jeg_skal morir=dø .',
      'No=ikke te=deg he_olvidado>olvidar=har_jeg_glemt en=i mi=mitt testamento>el_testamento=testamente ; pero no=ikke soy>ser=er_jeg rico=rik y no=ikke tengo>tener=har_jeg más=annen bienes>los_bienes=eiendom que=enn#masque un_perro>el_perro=en_hund y un_caballo>el_caballo=en_hest .',
    ],
    [
      '— Yo=jeg apreciaré>apreciar=skal_sette_pris_på tu=ditt recuerdo>el_recuerdo=minne , marido>el_marido=mann mío=min — dijo>decir=sa la_mujer=kona llorando>llorar=gråtende .',
    ],
    [
      '— Después_de>después_de=etter mi=min muerte>la_muerte=død — continuó>continuar=fortsatte el_marido=mannen ~ , debes>deber=du_skal vender=selge el_caballo=hesten y entregar=gi el_dinero=pengene a=til mis>mi=mine parientes>el_pariente=slektninger .',
    ],
    [
      '— ¡ Cómo=hva#como ! ¿ Debo>deber=skal_jeg entregar=gi el_dinero=pengene a=til tus>tu=dine parientes>el_pariente=slektninger ?',
    ],
    [
      '— Sí=ja ; pero espera>esperar=vent .',
      'Te=deg regalo>regalar=gir_jeg generosamente=gavmildt el_perro=hunden .',
      'Puedes>poder=du_kan venderlo>vender=selge_den#lo , si=hvis quieres>querer=du_vil , o=eller puedes>poder=du_kan conservarlo>conservar=beholde_den#lo para=for_å guardar=passe_på la_casa=huset .',
      'Es>ser=den_er un_animal>el_animal=et_dyr fiel=trofast .',
      'Te=for_deg servirá_de>servir_de=vil_være gran=stor consuelo>el_consuelo=trøst .',
    ],
    [
      'El_lugareño>el_lugareño=landsbyboeren se_murió>morirse=døde .',
      'La_mujer=kona quería>querer=ville obedecer=adlyde a_su_marido>el_marido=mannen_sin#a .',
      'Una_mañana>la_mañana=en_morgen cogió>coger=tok el_caballo=hesten y el_perro=hunden y los=dem llevó>llevar=tok_med a=til la_feria=markedet .',
    ],
    [
      '— ¿ Cuánto=hvor_mye quiere>querer=vil_ha usted=De por=for ese=den caballo>el_caballo=hesten ? — preguntó>preguntar=spurte un_hombre>el_hombre=en_mann .',
    ],
    [
      '— Quiero>querer=jeg_vil vender=selge el_caballo=hesten y el_perro=hunden juntos=sammen — respondió>responder=svarte la_mujer=kona ~ .',
      'Quiero>querer=jeg_vil_ha por=for el_perro=hunden cien=hundre duros>el_duro=store_mynter#duro y por=for el_caballo=hesten diez=ti reales>el_real=småmynter#duro .',
    ],
    [
      '— Acepto>aceptar=jeg_godtar — dijo>decir=sa el_hombre=mannen ~ , porque=for el_precio=prisen de=for los=de dos=to juntos=sammen es>ser=er razonable=rimelig .',
    ],
    [
      'La_buena_mujer>la_mujer=den_snille_kona dio>dar=ga a_los_parientes>el_pariente=slektningene de=til su=sin marido>el_marido=mann los_diez_reales>el_real=de_ti_realene que=som recibió>recibir=hun_fikk por=for el_caballo=hesten , y conservó>conservar=beholdt los_cien_duros>el_duro=de_hundre_duroene que=som recibió>recibir=hun_fikk por=for el_perro=hunden .',
      'Así=slik obedeció>obedecer=adlød a_su_marido>el_marido=mannen_sin#a .',
    ],
  ],
  forms: {
    'estaba a punto de': 'estar a punto de i fortid: han holdt på å',
    era: 'ser i fortid, om det som varte: jeg, han, hun var',
    tenía: 'tener i fortid, om det som varte: jeg, han, hun hadde',
    llamó: 'llamar i fortid: han, hun kalte på',
    dijo: 'decir i fortid: han, hun, De sa',
    sabes: 'saber i presens: du vet',
    'voy a': 'ir a i presens: jeg skal (gjøre noe snart)',
    'he olvidado': 'olvidar i perfektum: jeg har glemt',
    soy: 'ser i presens: jeg er',
    tengo: 'tener i presens: jeg har',
    apreciaré: 'apreciar i framtid: jeg skal sette pris på',
    llorando: 'llorar som gerundium: gråtende, mens hun gråt',
    continuó: 'continuar i fortid: han, hun fortsatte',
    debes: 'deber i presens: du skal, du må',
    debo: 'deber i presens: jeg skal, jeg må',
    espera: 'esperar som imperativ: vent!',
    regalo: 'regalar i presens: jeg gir (i gave)',
    puedes: 'poder i presens: du kan',
    quieres: 'querer i presens: du vil',
    venderlo: 'vender + lo: å selge den',
    conservarlo: 'conservar + lo: å beholde den',
    es: 'ser i presens: han, hun, den er',
    'servirá de': 'servir de i framtid: den vil være til',
    'se murió': 'morirse i fortid: han, hun døde',
    quería: 'querer i fortid, om det som varte: jeg, han, hun ville',
    cogió: 'coger i fortid: han, hun tok',
    llevó: 'llevar i fortid: han, hun tok med, bar',
    quiere: 'querer i presens: han, hun, De vil',
    preguntó: 'preguntar i fortid: han, hun spurte',
    quiero: 'querer i presens: jeg vil',
    respondió: 'responder i fortid: han, hun svarte',
    acepto: 'aceptar i presens: jeg godtar',
    dio: 'dar i fortid: han, hun ga',
    recibió: 'recibir i fortid: han, hun fikk',
    conservó: 'conservar i fortid: han, hun beholdt',
    obedeció: 'obedecer i fortid: han, hun adlød',
  },
  notes: {
    a: 'Foran en person som er objekt, setter spansk en a som ikke oversettes: obedecer a su marido, adlyde mannen sin.',
    masque:
      'No … más que: ikke annet enn. No tengo más bienes que un perro: jeg eier ikke annet enn en hund.',
    como: '¡Cómo! alene er et utrop: hva!, hva sier du?',
    lo: 'Lo, den, henges på slutten av infinitiven: venderlo, å selge den.',
    duro: 'En duro var en mynt på fem pesetas, og en real en kvart peseta. Hundre duros var altså to tusen reales.',
  },
}
