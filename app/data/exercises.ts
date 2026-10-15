import type { Exercise, Language, Level } from '../utils/practice'

// Original starter content. Level labels are indicative, not examiner validation.
type Pack = {
  grammar: [string, string[], number, string][]
  reading: [string, string, string[], number, string][]
  writing: string
  speaking: string
}
const packs: Record<Language, Record<Level, Pack>> = {
  ca: {
    A1: {
      grammar: [
        ['Jo ___ de Palma.', ['soc', 'ets', 'és'], 0, 'La primera persona del singular del verb ser és «soc».'],
        ['Na Maria té ___ germana.', ['un', 'una', 'uns'], 1, '«Germana» és un nom femení singular: una germana.'],
      ],
      reading: [
        ['La biblioteca obre a les nou del matí i tanca a les sis de la tarda.', 'A quina hora obre la biblioteca?', ['A les sis', 'A les nou', 'A les deu'], 1, 'El text diu que obre a les nou del matí.'],
        ['Em dic Joan. Visc a Inca i treball a Palma. Hi vaig amb tren.', 'On viu en Joan?', ['A Palma', 'A Sóller', 'A Inca'], 2, 'Viu a Inca; Palma és el lloc on treballa.'],
      ],
      writing: 'Escriu un missatge a un company nou. Presenta’t, digues on vius i explica què t’agrada fer en el temps lliure.',
      speaking: 'Presenta’t: nom, lloc on vius, feina o estudis i dues activitats que t’agraden. Després fes dues preguntes a un company.',
    },
    A2: {
      grammar: [
        ['Ahir nosaltres ___ al mercat.', ['anam', 'vàrem anar', 'anirem'], 1, '«Ahir» situa l’acció en el passat: vàrem anar.'],
        ['No tenim pa. Demà ___ compraré.', ['en', 'hi', 'li'], 0, 'El pronom «en» substitueix una quantitat indeterminada de pa.'],
      ],
      reading: [
        ['El curs de cuina es fa els dimarts. Cal dur un davantal, però el centre proporciona tots els ingredients.', 'Què han de dur els participants?', ['Els ingredients', 'Un davantal', 'Un llibre'], 1, 'El centre posa els ingredients; els participants duen el davantal.'],
        ['Dissabte el bus no passarà pel centre a causa d’unes obres. La parada provisional serà davant el poliesportiu.', 'Per què canvia la parada?', ['Per unes obres', 'Per una festa', 'Per manca de busos'], 0, 'El canvi es deu a les obres al centre.'],
      ],
      writing: 'Escriu un correu a una amiga per convidar-la a passar el cap de setmana a ca teva. Explica com arribar-hi i proposa dues activitats.',
      speaking: 'Explica com és el teu barri, quins serveis hi ha i com arribes a la feina o al centre d’estudis.',
    },
    B1: {
      grammar: [
        ['Quan ___ temps, visitaré el museu.', ['tindré', 'tengui', 'tenia'], 1, 'En una subordinada temporal de futur s’usa el present de subjuntiu. «Tengui» és una forma balear normativa.'],
        ['Vaig deixar les claus al calaix, però ara no ___ són.', ['en', 'hi', 'ho'], 1, '«Hi» substitueix el complement de lloc «al calaix».'],
      ],
      reading: [
        ['La cooperativa recull bicicletes velles i les repara. Les ven a preus assequibles i destina els beneficis a tallers gratuïts per a joves.', 'Què finança la venda de bicicletes?', ['Tallers per a joves', 'Un aparcament privat', 'Bicicletes de competició'], 0, 'Els beneficis es destinen als tallers gratuïts.'],
        ['El teatre ofereix un descompte als menors de trenta anys. Per obtenir-lo, s’ha de presentar un document d’identitat a la taquilla; no es pot aplicar en compres per internet.', 'Com es pot obtenir el descompte?', ['Comprant sempre per internet', 'A la taquilla amb identificació', 'Telefonant després de la funció'], 1, 'Cal acreditar l’edat a la taquilla.'],
      ],
      writing: 'Escriu a l’ajuntament per proposar una millora al teu barri. Descriu el problema, explica com afecta els veïns i suggereix una solució.',
      speaking: 'Explica un viatge que recordis especialment. Descriu un imprevist, com el vares resoldre i què recomanaries a algú que hi volgués anar.',
    },
    B2: {
      grammar: [
        ['Si m’ho haguessis dit abans, t’___ ajudat.', ['hauria', 'hagués', 'havia'], 0, 'En aquesta condicional irreal de passat, el resultat s’expressa amb el condicional compost: hauria ajudat.'],
        ['No entenc ___ has canviat d’opinió.', ['perquè', 'per què', 'per a què'], 1, 'La interrogativa indirecta demana la causa: «per què». «Perquè» introdueix una causa o una finalitat.'],
      ],
      reading: [
        ['L’ajuntament ampliarà l’horari de la biblioteca durant els exàmens, però no augmentarà el personal. Les associacions d’estudiants celebren la mesura, tot i que reclamen que es mantengui tot l’any. El consistori n’avaluarà l’ús abans de prendre una decisió definitiva.', 'Quina afirmació reflecteix la posició de l’ajuntament?', ['L’ampliació serà permanent des d’ara.', 'La continuïtat dependrà de l’ús del servei.', 'Es contractarà més personal immediatament.'], 1, 'El consistori observarà l’ús abans de decidir si manté l’ampliació.'],
        ['Fer feina des de casa pot reduir els desplaçaments, però no garanteix una millor conciliació. Sense límits clars, la jornada s’allarga i la llar es converteix en una extensió de l’oficina. Per això, qualsevol acord hauria d’incloure el dret a desconnectar.', 'Quina és la tesi del text?', ['El teletreball necessita límits per afavorir la conciliació.', 'El teletreball sempre empitjora la vida familiar.', 'Reduir els desplaçaments és impossible.'], 0, 'El text reconeix avantatges, però condiciona la conciliació a uns límits clars.'],
      ],
      writing: 'Una revista local demana opinions sobre limitar l’accés dels cotxes al centre. Escriu un article: presenta la qüestió, exposa avantatges i inconvenients i defensa una proposta amb exemples. Extensió orientativa de pràctica, no una consigna oficial.',
      speaking: 'L’ajuntament vol convertir un aparcament en un espai públic. Compara dues opcions: un jardí o una zona esportiva. Defensa una opció i respon a l’objecció que es perdran places d’aparcament.',
    },
    C1: {
      grammar: [
        ['Cal que els participants s’___ a les normes del concurs.', ['atenguin', 'atenen', 'atindran'], 0, '«Cal que» exigeix subjuntiu; el verb és «atenir-se»: s’atenguin.'],
        ['___ les dificultats, el projecte va tirar endavant.', ['Malgrat', 'Degut', 'Tot i que'], 0, '«Malgrat» pot precedir un sintagma nominal. «Tot i que» necessita una oració amb verb.'],
      ],
      reading: [
        ['Presentar la digitalització com un procés inevitable permet eludir el debat sobre qui en fixa les regles. L’eficiència, sovint invocada com a argument definitiu, no determina per si mateixa si el repartiment dels beneficis és just.', 'Què qüestiona l’autor?', ['La possibilitat de digitalitzar serveis', 'L’ús de la inevitabilitat per evitar el debat polític', 'Qualsevol millora d’eficiència'], 1, 'La crítica se centra en la manera de justificar el procés i esquivar el debat sobre les regles.'],
        ['La restauració del barri ha recuperat façanes, però ha esborrat part de la vida que les habitava. Si el patrimoni es redueix a una imatge, la conservació pot acabar preservant l’escenari mentre expulsa els protagonistes.', 'A què es refereix «els protagonistes»?', ['Als arquitectes de les façanes', 'Als visitants ocasionals', 'Als residents del barri'], 2, 'La metàfora contraposa l’escenari físic a la comunitat que hi viu.'],
      ],
      writing: 'Redacta un informe per a una associació veïnal sobre els efectes dels habitatges turístics. Distingeix beneficis i costos, anticipa objeccions i proposa mesures que es puguin avaluar.',
      speaking: 'Valora la tensió entre preservar el patrimoni i garantir l’accés a l’habitatge. Proposa un acord entre residents, propietaris i administració i matisa els límits de la teva proposta.',
    },
    C2: {
      grammar: [
        ['La proposta és complexa; ___, mereix un estudi detallat.', ['això no obstant', 'atès que', 'a fi que'], 0, '«Això no obstant» introdueix una concessió. Les altres opcions introdueixen causa o finalitat i requereixen una subordinada.'],
        ['Quina frase evita una ambigüitat sobre qui havia arribat tard?', ['La directora va dir a la secretària que havia arribat tard.', 'La directora va dir: «He arribat tard».', 'Li va dir que havia arribat tard.'], 1, 'El discurs directe identifica inequívocament la directora com la persona que ha arribat tard.'],
      ],
      reading: [
        ['L’autor proclama que no pren partit, però només exigeix proves als qui qüestionen l’ordre establert. La seva neutralitat és, doncs, una balança que ja s’ha inclinat abans de pesar els arguments.', 'Quina funció té la metàfora de la balança?', ['Elogiar el rigor de l’autor', 'Mostrar una imparcialitat aparent que amaga un biaix', 'Negar que hi hagi arguments'], 1, 'La balança inclinada representa uns criteris d’exigència desiguals.'],
        ['S’ha confós la memòria amb un inventari de certeses. Tanmateix, recordar també és tornar a interrogar allò que crèiem resolt: no per dissoldre els fets, sinó per entendre els silencis que els han envoltat.', 'Quina concepció de la memòria defensa el text?', ['Un registre immutable de dades', 'Una substitució dels fets per opinions', 'Una revisió crítica que incorpora els silencis del relat'], 2, 'El text manté els fets, però proposa revisar-ne la interpretació i les omissions.'],
      ],
      writing: 'Escriu un assaig sobre si una institució cultural pot ser neutral. Defineix què entens per neutralitat, examina un contraargument sòlid i formula una conclusió matisada, amb un registre precís.',
      speaking: 'Defensa i després qüestiona aquesta afirmació: «La transparència sempre genera confiança». Distingeix contexts, reformula l’argument contrari amb rigor i proposa una síntesi.',
    },
  },
  en: {
    A1: {
      grammar: [
        ['She ___ a teacher.', ['am', 'is', 'are'], 1, 'Con «she», la forma de «be» es «is».'],
        ['I have ___ apple.', ['a', 'an', 'two'], 1, 'Se usa «an» delante de un sonido vocálico: an apple.'],
      ],
      reading: [
        ['The shop opens at ten on Sundays. On other days, it opens at eight.', 'When does the shop open on Sunday?', ['At eight', 'At nine', 'At ten'], 2, 'El horario del domingo es a las diez.'],
        ['My name is Sam. I live with my sister in a small flat near the station.', 'Who does Sam live with?', ['His sister', 'His parents', 'His friend'], 0, 'El texto dice «with my sister».'],
      ],
      writing: 'Write a short message to a new classmate. Introduce yourself, say where you live and name two things you like.',
      speaking: 'Introduce yourself. Talk about your home, your work or studies and two things you enjoy. Ask a partner two simple questions.',
    },
    A2: {
      grammar: [
        ['Yesterday we ___ to the beach.', ['go', 'went', 'going'], 1, '«Yesterday» pide pasado simple: go → went.'],
        ['This bag is ___ than that one.', ['cheap', 'cheapest', 'cheaper'], 2, 'El comparativo de «cheap» es «cheaper», seguido de «than».'],
      ],
      reading: [
        ['Please bring a towel to the swimming lesson. You can borrow goggles at reception, but you must return them afterwards.', 'What must students bring?', ['Goggles', 'A towel', 'A form'], 1, 'Las gafas se pueden pedir prestadas; la toalla debe traerla cada alumno.'],
        ['The café is closed this Monday for repairs. It will open again on Tuesday at the usual time.', 'Why is the café closed?', ['The owner is on holiday.', 'It is being repaired.', 'It closes every Monday.'], 1, 'Cierra por reparaciones, no por su horario habitual.'],
      ],
      writing: 'Write an email inviting a friend to visit you at the weekend. Explain how to get to your home and suggest two activities.',
      speaking: 'Describe your neighbourhood. Explain which shops and services it has and how you travel to work or school.',
    },
    B1: {
      grammar: [
        ['I have lived here ___ 2020.', ['for', 'since', 'during'], 1, '«Since» introduce el momento de inicio; «for», una duración.'],
        ['If it rains tomorrow, we ___ at home.', ['will stay', 'would stay', 'stayed'], 0, 'Primera condicional: if + presente, will + infinitivo.'],
      ],
      reading: [
        ['The community garden is open to everyone. Volunteers work there on Saturday mornings, and the vegetables are shared among the people who help.', 'Who receives the vegetables?', ['Only the organisers', 'People who volunteer', 'All nearby shops'], 1, 'Se reparten entre las personas que ayudan en el huerto.'],
        ['The museum offers free entry on Friday evenings, but visitors still need to book a ticket online because space is limited.', 'What must Friday evening visitors do?', ['Pay at the door', 'Join a guided tour', 'Book online'], 2, 'La entrada gratuita sigue requiriendo reserva.'],
      ],
      writing: 'Write to your local council about a problem in your neighbourhood. Describe the problem, explain its effects and suggest a practical solution.',
      speaking: 'Describe a memorable trip. Explain a problem you had, how you solved it and what advice you would give to another traveller.',
    },
    B2: {
      grammar: [
        ['If I had known about the delay, I ___ a different train.', ['would take', 'would have taken', 'had taken'], 1, 'Tercera condicional: if + past perfect, would have + participio. Expresa un resultado hipotético en el pasado.'],
        ['The new policy aims to prevent staff ___ working excessive hours.', ['to', 'from', 'for'], 1, 'La construcción es «prevent someone from doing something».'],
      ],
      reading: [
        ['A four-day working week sounds attractive, but compressing the same workload into fewer days may increase stress. The pilot scheme therefore reduced tasks as well as hours. Its organisers warn that copying the timetable alone would miss the point.', 'What do the organisers consider essential?', ['Keeping all tasks unchanged', 'Reducing workload alongside working hours', 'Extending each working day'], 1, 'La clave es reducir tareas además de horas; copiar solo el horario no reproduce el modelo.'],
        ['The council has introduced cheaper bus tickets to encourage drivers to switch to public transport. However, residents in outlying villages say that price is not their main concern: services stop too early for people working late shifts.', 'What is the residents’ main objection?', ['Tickets remain too expensive.', 'The buses are uncomfortable.', 'The timetable does not meet their needs.'], 2, 'El problema principal es que el servicio termina demasiado pronto.'],
      ],
      writing: 'A local magazine is discussing whether cars should be restricted in town centres. Write an article considering benefits and drawbacks and recommending a balanced approach. Use examples. The word range is for practice, not an official exam task.',
      speaking: 'Your town plans to replace a car park with a public space. Compare a garden with a sports area, recommend one and respond to concerns about losing parking spaces.',
    },
    C1: {
      grammar: [
        ['Rarely ___ such a convincing argument.', ['I have heard', 'have I heard', 'I heard have'], 1, 'Al empezar con el adverbio negativo «rarely», se invierten auxiliar y sujeto.'],
        ['The proposal was rejected on the ___ that it was too costly.', ['grounds', 'basis of', 'reason'], 0, 'La colocación es «on the grounds that», para introducir el motivo de una decisión.'],
      ],
      reading: [
        ['Treating digitalisation as inevitable removes the question of who shapes it from public debate. Efficiency may be desirable, but it cannot tell us whether the resulting distribution of benefits is fair.', 'What assumption does the writer challenge?', ['That digital tools can be useful', 'That efficiency alone justifies how digitalisation is implemented', 'That public debate is possible'], 1, 'El autor cuestiona que la eficiencia baste para justificar las decisiones distributivas.'],
        ['The renovated district has retained its façades while losing many of its residents. When heritage becomes merely a visual asset, conservation risks preserving the stage while displacing the cast.', 'What does “the cast” refer to?', ['The architects', 'The tourists', 'The local residents'], 2, 'La metáfora contrapone los edificios conservados a la comunidad desplazada.'],
      ],
      writing: 'Write a report for a residents’ association on the effects of short-term holiday rentals. Weigh competing interests, anticipate objections and recommend measures whose outcomes could be evaluated.',
      speaking: 'Discuss the tension between preserving heritage and providing affordable housing. Propose a compromise among residents, property owners and the council, acknowledging its limitations.',
    },
    C2: {
      grammar: [
        ['___ it not been for her intervention, the negotiations would have failed.', ['Were', 'Had', 'Should'], 1, '«Had it not been for» es una condicional de pasado con inversión: if it had not been for.'],
        ['His apology was so ___ that it only deepened the impression of indifference.', ['perfunctory', 'meticulous', 'unequivocal'], 0, '«Perfunctory» describe algo hecho de forma rutinaria, sin interés real, coherente con la indiferencia.'],
      ],
      reading: [
        ['The columnist insists on neutrality, yet demands evidence only from those challenging the status quo. His scales are therefore tilted before any argument is weighed.', 'What does the metaphor imply?', ['His apparent neutrality conceals unequal standards.', 'He refuses to consider any evidence at all.', 'Both sides receive equal scrutiny.'], 0, 'Exigir pruebas a un solo lado revela un criterio asimétrico pese a la neutralidad declarada.'],
        ['Memory has been mistaken for an inventory of settled truths. To remember critically is not to dissolve facts, but to revisit the silences that shaped their telling.', 'Which view of memory is advocated?', ['Replacing facts with personal preference', 'Treating historical accounts as beyond revision', 'Examining omissions while retaining respect for facts'], 2, 'El texto defiende revisar los silencios del relato sin negar los hechos.'],
      ],
      writing: 'Write an essay on whether cultural institutions can be neutral. Define neutrality precisely, engage with a strong counterargument and reach a nuanced conclusion in an appropriately formal register.',
      speaking: 'Defend and then challenge the claim that transparency always builds trust. Distinguish contexts, represent the opposing view fairly and develop a nuanced synthesis.',
    },
  },
}

const wordRanges: Record<Level, [number, number]> = { A1: [30, 50], A2: [60, 90], B1: [100, 140], B2: [150, 200], C1: [220, 280], C2: [280, 350] }
export const exercises: Exercise[] = Object.entries(packs).flatMap(([language, byLevel]) =>
  Object.entries(byLevel).flatMap(([level, pack]) => {
    const base = { language: language as Language, level: level as Level }
    return [
      ...pack.grammar.map(([prompt, options, answer, explanation], i) => ({ ...base, id: `${language}-${level}-grammar-${i + 1}`, skill: 'grammar' as const, title: language === 'ca' ? 'Domini de la llengua' : 'Use of English', prompt, options, answer, explanation })),
      ...pack.reading.map(([passage, prompt, options, answer, explanation], i) => ({ ...base, id: `${language}-${level}-reading-${i + 1}`, skill: 'reading' as const, title: language === 'ca' ? 'Llegir entre línies' : 'Read between the lines', passage, prompt, options, answer, explanation })),
      { ...base, id: `${language}-${level}-writing-1`, skill: 'writing' as const, title: language === 'ca' ? 'Posa-ho per escrit' : 'Put it into words', prompt: pack.writing, words: wordRanges[level as Level], checklist: ['He respondido a todos los puntos de la consigna.', 'He organizado las ideas y utilizado conectores.', 'He elegido un registro adecuado al destinatario.', 'He revisado gramática, vocabulario y ortografía.'] },
      { ...base, id: `${language}-${level}-speaking-1`, skill: 'speaking' as const, title: language === 'ca' ? 'És el teu torn' : 'Your turn to speak', prompt: pack.speaking, checklist: ['He desarrollado las ideas con ejemplos.', 'He hablado con claridad y un ritmo comprensible.', 'He utilizado vocabulario variado para mi nivel.', 'He respondido a las preguntas y considerado otra opinión.'] },
    ]
  }),
)
