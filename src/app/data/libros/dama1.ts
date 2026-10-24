import { DAMA } from './fuentes.ts'
import type { Book } from '../biblioteca.ts'

// La dama del abanico azul, a crime story written for Hola in seven short
// chapters, a text each (dama1 … dama7): told in the present, in short
// sentences, with the past coming in as the story goes on. Toledo is real;
// the museum, its painting and everyone in it are made up.

export const DAMA1: Book = {
  id: 'dama1',
  shelf: 'dama',
  es: 'Una mujer en Toledo',
  no: 'En kvinne i Toledo',
  by: 'Kapittel 1',
  about:
    'Marit Haugen fra Bergen har vært politietterforsker i tretti år. Nå er hun pensjonist og reiser til Toledo i en måned for å lære spansk. Hun bor hos Pilar, som snakker fort og kjenner alle i byen, og første søndag går hun på et lite museum.',
  source: DAMA,
  text: [
    [
      '^Marit_Haugen tiene>tener=er sesenta_y_un>sesenta_y_uno=sekstien años>el_año=år y vive>vivir=bor en=i ^Bergen , en=i ^Noruega .',
      'Durante=i treinta=tretti años>el_año=år trabajó>trabajar=arbeidet_hun en=i la_policía=politiet .',
      'Ahora=nå está>estar=er jubilada>jubilado=pensjonist , y en=i ^Bergen llueve>llover=regner_det mucho=mye .',
      'Un_día>el_día=en_dag de=i marzo=mars , ^Marit decide>decidir=bestemmer_seg_for hacer=å_gjøre algo=noe nuevo=nytt : va_a>ir=skal pasar=tilbringe un_mes>el_mes=en_måned en=i ^Toledo para=for_å aprender=lære español>el_español=spansk .',
    ],
    [
      'El_piso=leiligheten está>estar=ligger en=i una_calle>la_calle=en_gate estrecha>estrecho=smal , cerca_de=nær la_catedral=katedralen .',
      'La_dueña>el_dueño=eieren se_llama>llamarse=heter ^Pilar .',
      'Es>ser=er una_señora>la_señora=en_dame pequeña>pequeño=liten , con=med el_pelo=håret blanco=hvitt , y habla>hablar=snakker muy=veldig rápido=fort .',
    ],
    [
      '— ¡ Bienvenida>bienvenido=velkommen , ^Marit ! — dice>decir=sier ^Pilar ~ .',
      'Aquí=her tienes>tener=har_du las_llaves>la_llave=nøklene .',
      'La=den grande=store es>ser=er de=til la_puerta=døra de=ut_mot la_calle=gata y la=den pequeña>pequeño=lille es>ser=er de=til tu=din piso>el_piso=leilighet .',
      'Yo=jeg vivo>vivir=bor abajo=nede .',
      'Si=hvis necesitas>necesitar=du_trenger algo=noe , llamas>llamar=banker_du a=på mi=min puerta>la_puerta=dør .',
    ],
    [
      '— Muchas_gracias=tusen_takk .',
      '¿ Puede>poder=kan_De hablar=snakke un_poco>poco=litt más=mer despacio=sakte , por_favor=vær_så_snill ?',
    ],
    ['^Pilar se_ríe>reírse=ler .'],
    [
      '— Perdona>perdonar=unnskyld , hija>la_hija=jenta_mi .',
      'Todo_el_mundo=alle me=til_meg dice>decir=sier lo_mismo=det_samme .',
    ],
    [
      'Por_la_mañana>la_mañana=om_morgenen , ^Marit va>ir=går a=på una_escuela>la_escuela=en_skole de=for idiomas>el_idioma=språk .',
      'Por_la_tarde>la_tarde=om_ettermiddagen pasea>pasear=spaserer_hun por=gjennom la_ciudad=byen con=med un_cuaderno>el_cuaderno=en_skissebok .',
      'Le_gusta>gustar=hun_liker dibujar=å_tegne .',
      'Treinta=tretti años>el_año=år en=i la_policía=politiet le=henne han_enseñado>enseñar=har_lært a=å mirar=se bien=godt : dibuja>dibujar=hun_tegner puertas>la_puerta=dører , ventanas>la_ventana=vinduer , gatos>el_gato=katter y personas>la_persona=folk en=på los_cafés>el_café=kafeene .',
    ],
    [
      'El_primer_domingo>el_domingo=den_første_søndagen , ^Pilar le=til_henne dice>decir=sier :',
    ],
    [
      '— Tienes_que>tener_que=du_må ver=se el_Museo_de_San_Lucas>el_museo=San_Lucas-museet .',
      'Es>ser=det_er pequeño=lite , pero=men es>ser=det_er precioso=nydelig .',
      'Y=og los_domingos>el_domingo=på_søndager la_entrada=inngangen es>ser=er gratis=gratis .',
    ],
    [
      'El_museo=museet está>estar=ligger en=i una_casa>la_casa=et_hus antigua>antiguo=gammelt con=med un_patio>el_patio=en_gårdsplass lleno_de>lleno=full_av flores>la_flor=blomster .',
      'Dentro=inne hay=er_det poca>poco=lite gente>la_gente=folk .',
      'Una_chica>la_chica=en_jente joven=ung está_sentada>estar_sentado=sitter junto_a=ved la_puerta=døra .',
      'Lee>leer=hun_leser un_libro>el_libro=en_bok y no=ikke levanta>levantar=løfter la_cabeza=hodet .',
    ],
    [
      'En=i la_sala=salen más=mest grande=store hay=er_det un_cuadro>el_cuadro=et_maleri que=som ^Marit mira>mirar=ser_på durante=i mucho=lang tiempo>el_tiempo=tid .',
      'Es>ser=det_er el_retrato=portrettet de=av una_mujer>la_mujer=en_kvinne joven=ung con=i un_vestido>el_vestido=en_kjole negro=svart .',
      'En=i la_mano=hånda derecha>derecho=høyre tiene>tener=har_hun un_abanico>el_abanico=ei_vifte azul=blå , y en=på la=den izquierda>izquierdo=venstre lleva>llevar=har_hun un_anillo>el_anillo=en_ring con=med una_piedra>la_piedra=en_stein verde=grønn .',
      'La_mujer=kvinnen no=ikke sonríe>sonreír=smiler , pero=men sus>su=hennes ojos>el_ojo=øyne parecen>parecer=virker vivos>vivo=levende .',
      'Al_lado_del>al_lado_de=ved_siden_av cuadro>el_cuadro=maleriet hay=er_det un_cartel>el_cartel=et_skilt : « ^Dama_del_abanico_azul . Anónimo>anónimo=ukjent_kunstner . Siglo>el_siglo=århundre ^XVII » .',
    ],
    [
      'Delante_del>delante_de=foran cuadro>el_cuadro=maleriet hay=står_det una_mujer>la_mujer=en_kvinne de=på unos=rundt cuarenta=førti años>el_año=år , con=med una_chaqueta>la_chaqueta=en_jakke roja>rojo=rød y zapatos>el_zapato=sko blancos>blanco=hvite con=med manchas>la_mancha=flekker de=av pintura>la_pintura=maling azul=blå .',
      'Hace>hacer=hun_tar fotos>la_foto=bilder de=av la_dama=damen con=med su=sin móvil>el_móvil=mobil .',
      'Luego=så se_pone>ponerse=stiller_hun_seg de_espaldas=med_ryggen a=mot el_cuadro=maleriet y se_hace>hacer=tar una_foto>la_foto=et_bilde con=med la_dama=damen , sonriendo>sonreír=smilende .',
    ],
    [
      '— Perdone>perdonar=unnskyld — dice>decir=sier la_mujer=kvinnen ~ .',
      'Ya=snart termino>terminar=er_jeg_ferdig .',
      'Soy>ser=jeg_er ^Beatriz_Vega , restauradora>el_restaurador=konservator .',
      'Vengo>venir=jeg_kommer de=fra ^Madrid y cuido>cuidar=steller_jeg los_cuadros>el_cuadro=maleriene del=til museo>el_museo=museet .',
    ],
    [
      '^Marit se_sienta>sentarse=setter_seg en=på un_banco>el_banco=en_benk , abre>abrir=åpner el_cuaderno=skisseboka y empieza_a>empezar=begynner_å dibujar=tegne a=– la_dama=damen#a .',
      'Dibuja>dibujar=hun_tegner el_vestido=kjolen , el_abanico=vifta , el_anillo=ringen y los_ojos>el_ojo=øynene .',
      'Tarda>tardar=hun_bruker casi=nesten una_hora>la_hora=en_time .',
    ],
    [
      'Un_hombre>el_hombre=en_mann de=på unos=rundt sesenta=seksti años>el_año=år , con=med traje>el_traje=dress gris=grå y gafas>las_gafas=briller , se_acerca>acercarse=kommer_bort .',
    ],
    [
      '— ¿ Le=Dem gusta>gustar=liker nuestra>nuestro=vår dama>la_dama=dame ? — pregunta>preguntar=spør_han .',
    ],
    [
      '— Sí=ja , mucho=veldig .',
      'Es>ser=hun_er muy=veldig bonita>bonito=vakker .',
    ],
    [
      '— Es>ser=det_er el_cuadro>el_cuadro=maleriet más=mest importante=viktige del=i museo>el_museo=museet .',
      'Soy>ser=jeg_er ^Andrés_Molina , el_director=direktøren .',
      '— Mira>mirar=han_ser_på el_cuaderno=skisseboka de=til ^Marit ~ .',
      'Usted=De dibuja>dibujar=tegner muy=veldig bien=godt , señora>la_señora=frue .',
    ],
    [
      '— Gracias=takk .',
      'Es>ser=det_er solo=bare una_afición>la_afición=en_hobby .',
    ],
    [
      'Cuando=når ^Marit sale>salir=går_ut del=av museo>el_museo=museet , ve>ver=ser_hun a=– un_hombre>el_hombre=en_mann#a joven=ung en=på la_plaza=plassen .',
      'Tiene>tener=han_har un_caballete>el_caballete=et_staffeli y pinta>pintar=maler copias>la_copia=kopier de=av cuadros>el_cuadro=malerier famosos>famoso=berømte para=for los_turistas>el_turista=turistene .',
      'Entre=blant sus>su=hans cuadros>el_cuadro=malerier hay=er_det una_copia>la_copia=en_kopi pequeña>pequeño=liten de=av la_Dama_del_abanico_azul>la_dama=Damen_med_den_blå_vifta .',
    ],
    [
      '— Cincuenta=femti euros>el_euro=euro , señora>la_señora=frue — dice>decir=sier el_pintor=maleren ~ .',
      'Es>ser=den_er casi=nesten igual_que>igual=lik la=den original=originale .',
    ],
    [
      '— No=nei , gracias=takk — dice>decir=sier ^Marit , y sigue>seguir=fortsetter su=sin camino>el_camino=vei .',
    ],
    [
      'Una_semana>la_semana=en_uke después=senere , el_lunes=mandag por_la_mañana>la_mañana=morgen , alguien=noen llama>llamar=banker a=på la_puerta=døra de=til ^Marit .',
      'Es>ser=det_er ^Pilar , con=med la_cara=ansiktet blanca>blanco=hvitt .',
    ],
    [
      '— ¡ ^Marit !',
      '¡ El_director=direktøren del=for museo>el_museo=museet está>estar=er muerto=død !',
    ],
  ],
  forms: {
    'sesenta y un': 'sesenta y uno foran et hankjønnsord: sekstien',
    trabajó: 'trabajar i fortid: han, hun arbeidet',
    jubilada: 'jubilado om en kvinne: pensjonist',
    llueve: 'llover i presens: det regner',
    'se llama': 'llamarse i presens: han, hun heter',
    'se ríe': 'reírse i presens: han, hun ler',
    perdona: 'perdonar som oppfordring, til en du sier du til: unnskyld',
    perdone: 'perdonar som oppfordring, høflig: unnskyld',
    'han enseñado': 'enseñar i perfektum: de har lært',
    'está sentada': 'estar sentado om en kvinne: hun sitter',
    sonríe: 'sonreír i presens: han, hun smiler',
    sonriendo: 'sonreír som gerundium: smilende',
    parecen: 'parecer i presens: de virker, ser ut',
    'se pone': 'ponerse i presens: han, hun stiller seg',
    'se hace': 'hacerse i presens: han, hun tar (et bilde av seg)',
    vengo: 'venir i presens: jeg kommer',
    'se sienta': 'sentarse i presens: han, hun setter seg',
    'empieza a': 'empezar a i presens: han, hun begynner å',
    'se acerca': 'acercarse i presens: han, hun kommer nærmere',
    sale: 'salir i presens: han, hun går ut',
    sigue: 'seguir i presens: han, hun fortsetter',
    ve: 'ver i presens: han, hun ser',
  },
  notes: {
    a: 'Når den man ser eller tegner er en person, setter spansk a foran: dibujar a la dama, ver a un hombre. Det oversettes ikke.',
  },
}
