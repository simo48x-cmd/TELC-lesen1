import { Teil1Topic, Teil1HeadingOption, Teil1Item, VariantCodeInfo } from './lesenTypes';

interface RawTeil1ItemSpec {
  origLetter: string;
  mod1Letter?: string;
  mod2Letter?: string;
  headingDe: string;
  headingAr: string;
  motCleHeading: string;
  motCleText: string;
  paragraphDe: string;
  paragraphAr: string;
  explanationAr: string;
}

const ALL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

function buildTeil1Topic(
  number: number,
  id: string,
  titleDe: string,
  titleAr: string,
  frequencyBadge: string,
  memoryStoryAr: string,
  variants: VariantCodeInfo[],
  specs: [RawTeil1ItemSpec, RawTeil1ItemSpec, RawTeil1ItemSpec, RawTeil1ItemSpec, RawTeil1ItemSpec],
  extraDistractors?: { letter: string; german: string; arabic: string }[]
): Teil1Topic {
  const usedMap = new Map<string, { german: string; arabic: string; motCle?: string }>();

  specs.forEach((s) => {
    usedMap.set(s.origLetter, {
      german: s.headingDe,
      arabic: s.headingAr,
      motCle: s.motCleHeading,
    });
  });

  if (extraDistractors) {
    extraDistractors.forEach((d) => {
      if (!usedMap.has(d.letter)) {
        usedMap.set(d.letter, { german: d.german, arabic: d.arabic });
      }
    });
  }

  const defaultDistractors: { german: string; arabic: string }[] = [
    {
      german: `Neue gesetzliche Regelungen für ${titleDe.split('/')[0].trim()} ab nächstem Jahr`,
      arabic: `قوانين وتشريعات جديدة تخص ${titleAr} ابتداءً من السنة المقبلة (عنوان فخ غير مذكور في النصوص)`,
    },
    {
      german: `Internationale Fachmesse für ${titleDe.split('/')[0].trim()} verzeichnet Besucherrekord`,
      arabic: `المعرض الدولي لـ ${titleAr} يسجل رقماً قياسياً في عدد الزوار (عنوان فخ)`,
    },
    {
      german: `Staatliche Förderprogramme unterstützen Forschungsprojekte zu ${titleDe.split('/')[0].trim()}`,
      arabic: `برامج دعم حكومية لتمويل مشاريع البحث العلمي حول ${titleAr} (عنوان فخ)`,
    },
    {
      german: `Kritik von Verbraucherschützern an steigenden Preisen im Sektor ${titleDe.split('/')[0].trim()}`,
      arabic: `انتقادات من جمعيات حماية المستهلك لارتفاع الأسعار (عنوان فخ)`,
    },
    {
      german: `Historisches Archiv veröffentlicht bisher unbekannte Dokumente über ${titleDe.split('/')[0].trim()}`,
      arabic: `الأرشيف التاريخي ينشر وثائق غير معروفة سابقاً (عنوان فخ)`,
    },
  ];

  let distIdx = 0;
  const headings: Teil1HeadingOption[] = ALL_LETTERS.map((letter) => {
    const existing = usedMap.get(letter);
    if (existing) {
      return {
        letter,
        german: existing.german,
        arabic: existing.arabic,
        motCle: existing.motCle,
      };
    }
    const d = defaultDistractors[distIdx % defaultDistractors.length];
    distIdx++;
    return {
      letter,
      german: d.german,
      arabic: d.arabic,
    };
  });

  const items: Teil1Item[] = specs.map((s, idx) => {
    const map: Record<string, string> = { original: s.origLetter };
    if (s.mod1Letter) map.mod1 = s.mod1Letter;
    if (s.mod2Letter) map.mod2 = s.mod2Letter;
    return {
      textNumber: idx + 1,
      germanParagraph: s.paragraphDe,
      arabicTranslation: s.paragraphAr,
      correctLetterByVariant: map,
      headingGerman: s.headingDe,
      headingArabic: s.headingAr,
      motCleHeading: s.motCleHeading,
      motCleText: s.motCleText,
      explanationAr: s.explanationAr,
    };
  });

  return {
    id,
    number,
    titleDe,
    titleAr,
    frequencyBadge,
    memoryStoryAr,
    variants,
    headings,
    items,
  };
}

export const TEIL1_TOPICS: Teil1Topic[] = [
  buildTeil1Topic(
    1,
    'inseln',
    'Inseln',
    'الجزر البحرية (Inseln)',
    '🔥 طايح بزاف (Agadir 2026)',
    'قصة الكود EBICJ: جزيرة أشباح خضراء في آسيا (E) ⬅ عطلة بلا هاتف وتلفاز (B) ⬅ فندق عائم في إفريقيا (I) ⬅ العمل في جزيرة ألمانية (C) ⬅ جزيرة جديدة في المحيط الهادئ (J).',
    [{ key: 'original', label: 'الأساسي', code: 'EBICJ' }],
    [
      {
        origLetter: 'E',
        headingDe: 'Grüne Geisterinsel in Asien',
        headingAr: 'جزيرة أشباح خضراء في آسيا',
        motCleHeading: 'Grüne Geisterinsel in Asien',
        motCleText: 'Shengshan (China) / verlassenes Fischerdorf / Natur holt sich alles zurück / grün überwuchert',
        paragraphDe:
          'Auf der chinesischen Insel Shengshan gibt es ein verlassenes Fischerdorf, das heute wie eine grüne Geisterinsel in Asien wirkt. Nachdem die Bewohner den Ort vor Jahrzehnten aus wirtschaftlichen Gründen verlassen hatten, holte sich die Natur alles zurück: Efeu und Kletterpflanzen haben die Steinhäuser komplett grün überwuchert und ziehen heute Fotografen aus aller Welt an.',
        paragraphAr:
          'في جزيرة شينغشان الصينية توجد قرية صيد مهجورة تبدو اليوم كجزيرة أشباح خضراء في آسيا. بعد أن غادرها السكان قبل عقود لأسباب اقتصادية، استعادت الطبيعة كل شيء وغطت النباتات الخضراء المتسلقة المنازل الحجرية بالكامل.',
        explanationAr: 'العنوان فيه Grüne Geisterinsel in Asien والنص كيهضر على الصين (Asien) وقرية مهجورة (verlassenes Fischerdorf) غطتها النباتات الخضراء (grün überwuchert).',
      },
      {
        origLetter: 'B',
        headingDe: 'Urlaub vom Alltag - ohne Handy und Fernsehen',
        headingAr: 'عطلة بعيداً عن الروتين اليومي — بدون هاتف وتلفاز',
        motCleHeading: 'ohne Handy und Fernsehen',
        motCleText: 'Insel Neuwerk / kein Fernseher, kein WLAN / Ruhe vor moderner Technik',
        paragraphDe:
          'Wer echte Erholung sucht, findet auf der kleinen Insel Neuwerk im Wattenmeer genau das Richtige. In vielen Unterkünften gibt es bewusst keinen Fernseher und kein WLAN. Statt ständig auf das Smartphone zu schauen, genießen die Gäste die Ruhe vor moderner Technik bei langen Spaziergängen am Meer.',
        paragraphAr:
          'من يبحث عن الاستجمام الحقيقي يجده في جزيرة نويفيرك الصغيرة. في العديد من أماكن الإقامة لا يوجد تلفاز ولا ويفي عمداً، ليتمتع الزوار بالهدوء بعيداً عن التكنولوجيا الحديثة والهواتف.',
        explanationAr: 'الموكلي في العنوان هو ohne Handy und Fernsehen وفي النص تلقى بوضوح kein Fernseher, kein WLAN و Ruhe vor moderner Technik.',
      },
      {
        origLetter: 'I',
        headingDe: 'Schwimmendes Hotel vor der Küste Afrikas',
        headingAr: 'فندق عائم قبالة سواحل إفريقيا',
        motCleHeading: 'Schwimmendes Hotel / Küste Afrikas',
        motCleText: 'Insel Pemba (Tansania/Ostafrika) / Manta Resort / Unterwasserzimmer im Indischen Ozean',
        paragraphDe:
          'Vor der Küste der Insel Pemba in Tansania (Ostafrika) bietet das Manta Resort ein spektakuläres Erlebnis: Ein schwimmendes Hotelzimmer mitten im Indischen Ozean. Während man auf dem Holzdeck in der Sonne liegt, befindet sich das Schlafzimmer vier Meter unter der Wasseroberfläche mit direktem Blick auf bunte Korallenfische.',
        paragraphAr:
          'قبالة سواحل جزيرة بيمبا في تنزانيا (شرق إفريقيا) يقدم منتجع مانتا تجربة مذهلة: غرفة فندقية عائمة وسط المحيط الهندي، حيث تقع غرفة النوم على عمق 4 أمتار تحت الماء.',
        explanationAr: 'العنوان فيه Schwimmendes Hotel vor der Küste Afrikas والنص فيه Tansania (Ostafrika) و Unterwasserzimmer / schwimmendes Hotelzimmer.',
      },
      {
        origLetter: 'C',
        headingDe: 'Leben und Arbeiten auf einer deutschen Ferieninsel',
        headingAr: 'العيش والعمل في جزيرة سياحية ألمانية',
        motCleHeading: 'Leben und Arbeiten / deutsche Ferieninsel',
        motCleText: 'Helgoland und Sylt / Fachkräfte gesucht / Gastronomie & Tourismus wohnen und arbeiten',
        paragraphDe:
          'Auf den deutschen Nordseeinseln wie Helgoland und Sylt werden dringend Fachkräfte gesucht. Ob in der Gastronomie, im Hotelgewerbe oder im Handwerk: Wer dort wohnen und arbeiten möchte, profitiert nicht nur von frischer Seeluft und kurzen Arbeitswegen, sondern erhält von vielen Arbeitgebern auch eine bezahlbare Personalwohnung.',
        paragraphAr:
          'في الجزر الألمانية ببحر الشمال مثل هيلغولاند وزيلت، هناك طلب كبير على العمال المهرة في الفندقة والمطاعم لمن يرغب في العيش والعمل هناك.',
        explanationAr: 'العنوان فيه Leben und Arbeiten auf einer deutschen Ferieninsel والنص فيه Helgoland / Sylt و Fachkräfte gesucht و wohnen und arbeiten.',
      },
      {
        origLetter: 'J',
        headingDe: 'Neue Insel im Pazifik entstanden',
        headingAr: 'ظهور جزيرة جديدة في المحيط الهادئ',
        motCleHeading: 'Neue Insel im Pazifik entstanden',
        motCleText: 'Vulkanausbruch im Südpazifik (Tonga) / neue Landmasse aus Lava und Asche gebildet',
        paragraphDe:
          'Durch einen gewaltigen unterseeischen Vulkanausbruch im Südpazifik nahe Tonga hat sich innerhalb weniger Wochen eine völlig neue Landmasse aus Lava und Asche gebildet. Geologen untersuchen nun, wie lange die neu entstandene Insel den Wellen standhält und welche Pflanzen und Vögel sich dort zuerst ansiedeln.',
        paragraphAr:
          'بفعل ثوران بركاني ضخم تحت الماء في جنوب المحيط الهادئ قرب تونغا، تشكلت كتلة أرضية جديدة تماماً من الحمم والرماد خلال أسابيع قليلة.',
        explanationAr: 'الموكلي المباشر هو Neue Insel im Pazifik entstanden ↔ Vulkanausbruch im Südpazifik / neue Landmasse gebildet.',
      },
    ]
  ),

  buildTeil1Topic(
    2,
    'bilder',
    'Bilder / Fotografie',
    'الصور الفوتوغرافية (Bilder)',
    '🔥 مع تعديلات (Agadir 2026)',
    'قصة الكود BIAGC (وفي المعدل BIACG غير 4 و 5 كيتقلبو!): صور قديمة بألوان جديدة (B) ⬅ نظرة نادرة للماضي (I) ⬅ جمال الطبيعة (A) ⬅ نصائح صور العطلة (G/C) ⬅ كشف الصور المزيفة بالأنترنت (C/G).',
    [
      { key: 'original', label: 'الأساسي', code: 'BIAGC' },
      { key: 'mod1', label: 'المعدل', code: 'BIACG', changeNote: 'في المعدل تقليبة بسيطة بين النص 4 والنص 5 فقط (G و C كيتبادلو).' },
    ],
    [
      {
        origLetter: 'B',
        mod1Letter: 'B',
        headingDe: 'Alte Fotos im neuen Look',
        headingAr: 'صور قديمة بمظهر وألوان جديدة',
        motCleHeading: 'Alte Fotos im neuen Look',
        motCleText: 'Schwarz-Weiß-Fotos nachträglich koloriert / digital restauriert',
        paragraphDe:
          'Dank moderner Software erstrahlen historische Schwarz-Weiß-Fotos heute in einem völlig neuen Look. Spezialisten restaurieren beschädigte Aufnahmen aus Familienalben digital und kolorieren sie nachträglich so detailgetreu, als wären sie erst gestern mit einer modernen Farbkamera aufgenommen worden.',
        paragraphAr:
          'بفضل البرامج الحديثة، تتألق الصور القديمة بالأبيض والأسود اليوم بمظهر جديد تماماً، حيث يتم ترميمها رقمياً وتلوينها بدقة عالية.',
        explanationAr: 'العنوان فيه Alte Fotos im neuen Look والنص فيه Schwarz-Weiß-Fotos nachträglich koloriert / restauriert.',
      },
      {
        origLetter: 'I',
        mod1Letter: 'I',
        headingDe: 'Seltene Einblicke in eine vergangene Welt',
        headingAr: 'نظرات نادرة إلى عالم مضى',
        motCleHeading: 'vergangene Welt / Seltene Einblicke',
        motCleText: 'Historische Aufnahmen aus dem 19. Jahrhundert / Alltag von früher',
        paragraphDe:
          'Ein neu entdecktes Fotoarchiv gewährt seltene Einblicke in den Alltag des späten 19. Jahrhunderts. Die historischen Glasplattenaufnahmen zeigen Handwerker, Marktfrauen und Straßenszenen aus einer längst vergangenen Welt, bevor Autos das Stadtbild veränderten.',
        paragraphAr:
          'أرشيف صور مكتشف حديثاً يمنح نظرات نادرة للحياة اليومية في أواخر القرن التاسع عشر ويُظهر مشاهد من عالم مضى.',
        explanationAr: 'الموكلي: vergangene Welt ↔ Historische Aufnahmen aus dem 19. Jahrhundert / Alltag von früher.',
      },
      {
        origLetter: 'A',
        mod1Letter: 'A',
        headingDe: 'Fotos zeigen die Schönheit der Natur',
        headingAr: 'صور تُظهر جمال الطبيعة',
        motCleHeading: 'Schönheit der Natur',
        motCleText: 'Naturfotografie-Wettbewerb / beeindruckende Landschaften und Wildtiere',
        paragraphDe:
          'Beim diesjährigen internationalen Naturfotografie-Wettbewerb wurden Tausende Aufnahmen eingereicht. Die preisgekrönten Bilder zeigen unberührte Landschaften, seltene Wildtiere und faszinierende Wetterphänomene, die uns vor Augen führen, wie schützenswert die Schönheit unserer Natur ist.',
        paragraphAr:
          'في المسابقة الدولية لتصوير الطبيعة هذا العام، أظهرت الصور الفائزة المناظر الطبيعية الخلابة والحيوانات البرية النادرة وجمال الطبيعة.',
        explanationAr: 'الموكلي: Schönheit der Natur ↔ Naturfotografie-Wettbewerb / Landschaften und Wildtiere.',
      },
      {
        origLetter: 'G',
        mod1Letter: 'C',
        headingDe: 'Tipps für bessere Urlaubsfotos',
        headingAr: 'نصائح لالتقاط صور عطلة أفضل',
        motCleHeading: 'Tipps für bessere Urlaubsfotos',
        motCleText: 'Fotografieren auf Reisen / Licht am Morgen, ungewöhnliche Perspektive, goldene Stunde',
        paragraphDe:
          'Wer vom Fotografieren auf Reisen mehr als nur gewöhnliche Schnappschüsse mitbringen möchte, sollte einige einfache Regeln beachten: Nutzen Sie das weiche Licht der goldenen Stunde am frühen Morgen oder späten Nachmittag und wählen Sie ungewöhnliche Perspektiven statt Motive immer nur in die Bildmitte zu setzen.',
        paragraphAr:
          'من يريد التقاط صور رائعة أثناء السفر والعطلة، عليه استغلال الإضاءة الهادئة في الصباح الباكر أو المساء واختيار زوايا تصوير مميزة.',
        explanationAr: '⚠️ انتبه: في الأساسي كودو G وفي المعدل كودو C! اعتمد دائماً على الموكلي Fotografieren auf Reisen / goldene Stunde.',
      },
      {
        origLetter: 'C',
        mod1Letter: 'G',
        headingDe: 'Gefälschte Bilder im Internet erkennen',
        headingAr: 'كشف الصور المزيفة على الإنترنت',
        motCleHeading: 'Gefälschte Bilder im Internet erkennen',
        motCleText: 'Bildbearbeitung / Photoshop / Fake-Fotos in sozialen Medien entlarven',
        paragraphDe:
          'In den sozialen Medien verbreiten sich manipulierte Aufnahmen oft rasend schnell. Experten raten Internetnutzern, genau auf unnatürliche Schatten, unscharfe Ränder oder falsche Spiegelungen zu achten, um durch Bildbearbeitung und Photoshop gefälschte Fake-Fotos im Netz zuverlässig zu entlarven.',
        paragraphAr:
          'في وسائل التواصل الاجتماعي تنتشر الصور المعدلة بسرعة. ينصح الخبراء بالانتباه للظلال غير الطبيعية والحواف لكشف الصور المزيفة بالفوتوشوب.',
        explanationAr: '⚠️ انتبه: في الأساسي كودو C وفي المعدل كودو G! الموكلي هو Bildbearbeitung / Photoshop / Fake-Fotos.',
      },
    ]
  ),

  buildTeil1Topic(
    3,
    'limonade',
    'Limonade N / Zitronen',
    'الليمون والمشروبات المنعشة (Limonade N)',
    '🔥 طايح بزاف (Agadir 2026)',
    'قصة الليمون (الأساسي FJCHE | المعدل 1 CJGHI | المعدل 2 ACBDI): عصير صيفي منزلي (1) ⬅ كثرة السكر في المشروبات (2) ⬅ الليمون منظف طبيعي للمنزل (3) ⬅ فيتامين C يقوي المناعة (4) ⬅ تاريخ الليمون في أوروبا (5).',
    [
      { key: 'original', label: 'الأساسي', code: 'FJCHE' },
      { key: 'mod1', label: 'المعدل 1', code: 'CJGHI', changeNote: 'تغيير الحروف مع بقاء نفس النصوص الخمسة بالضبط.' },
      { key: 'mod2', label: 'المعدل 2', code: 'ACBDI', changeNote: 'نسخة معدلة ثانية بنفس الكلمات المفتاحية.' },
    ],
    [
      {
        origLetter: 'F',
        mod1Letter: 'C',
        mod2Letter: 'A',
        headingDe: 'Erfrischung im Sommer selbst gemacht',
        headingAr: 'مشروب منعش في الصيف مصنوع في المنزل',
        motCleHeading: 'Erfrischung im Sommer selbst gemacht',
        motCleText: 'Hausgemachte Limonade / frische Zitronen, Minze, wenig Zucker',
        paragraphDe:
          'An heißen Sommertagen gibt es kaum etwas Besseres als eine kühle, hausgemachte Limonade. Mit frisch gepressten Zitronen, kaltem Mineralwasser, ein paar Blättern Minze und nur wenig Honig oder Zucker lässt sich eine gesunde Erfrischung im Handumdrehen zu Hause selbst zubereiten.',
        paragraphAr:
          'في أيام الصيف الحارة لا يوجد أفضل من عصير الليمون المنزلي البارد مع النعناع والقليل من السكر أو العسل كمرطب صحي تحضره بنفسك.',
        explanationAr: 'الموكلي: Erfrischung selbst gemacht ↔ Hausgemachte Limonade / Zitronen, Minze.',
      },
      {
        origLetter: 'J',
        mod1Letter: 'J',
        mod2Letter: 'C',
        headingDe: 'Zu viel Zucker in Erfrischungsgetränken',
        headingAr: 'سكر كثير جداً في المشروبات المنعشة والغازية',
        motCleHeading: 'Zu viel Zucker in Erfrischungsgetränken',
        motCleText: 'Softdrinks enthalten bis zu 10 Würfelzucker / Übergewicht und Diabetes',
        paragraphDe:
          'Ernährungswissenschaftler schlagen Alarm: Industriell hergestellte Softdrinks und fertige Limonaden aus dem Supermarkt enthalten oft bis zu zehn Würfelzucker pro Glas. Der regelmäßige Konsum solcher gezuckerten Getränke fördert besonders bei Kindern und Jugendlichen Übergewicht, Karies und Diabetes.',
        paragraphAr:
          'يحذر خبراء التغذية من أن المشروبات الغازية الجاهزة تحتوي على ما يصل إلى 10 قطع سكر في الكأس الواحد، مما يسبب السمنة والسكري.',
        explanationAr: 'الموكلي: Zu viel Zucker ↔ Softdrinks enthalten bis zu 10 Würfelzucker / Übergewicht.',
      },
      {
        origLetter: 'C',
        mod1Letter: 'G',
        mod2Letter: 'B',
        headingDe: 'Zitronen als natürliches Reinigungsmittel',
        headingAr: 'الليمون كمادة تنظيف طبيعية في المنزل',
        motCleHeading: 'natürliches Reinigungsmittel',
        motCleText: 'Zitronensäure gegen Kalk und Schmutz im Haushalt / umweltfreundlich putzen',
        paragraphDe:
          'Zitronen schmecken nicht nur gut, sondern sind auch ein wirksamer Helfer beim umweltfreundlichen Putzen im Haushalt. Die natürliche Zitronensäure löst mühelos hartnäckigen Kalk an Wasserhähnen in Küche und Bad und hinterlässt dabei einen angenehm frischen Duft ganz ohne aggressive Chemie.',
        paragraphAr:
          'الليمون ليس لذيذاً فحسب، بل هو منظف طبيعي فعال في المنزل؛ فحمض الستريك يزيل الكلس (Kalk) والأوساخ بدون مواد كيميائية ضارة.',
        explanationAr: 'الموكلي: natürliches Reinigungsmittel ↔ Zitronensäure gegen Kalk und Schmutz im Haushalt.',
      },
      {
        origLetter: 'H',
        mod1Letter: 'H',
        mod2Letter: 'D',
        headingDe: 'Vitamin C stärkt die Abwehrkräfte',
        headingAr: 'فيتامين C يقوي جهاز المناعة',
        motCleHeading: 'Vitamin C stärkt die Abwehrkräfte',
        motCleText: 'Zitrusfrüchte im Winter / Immunsystem gegen Erkältungen schützen',
        paragraphDe:
          'Besonders in der kalten Jahreszeit greifen viele Menschen zu Zitrusfrüchten. Zitronen und Orangen liefern reichlich Vitamin C, das das menschliche Immunsystem unterstützt, freie Radikale abfängt und hilft, den Körper besser gegen herbstliche und winterliche Erkältungen zu schützen.',
        paragraphAr:
          'في فصل الشتاء يقبل الناس على الحوامض لأنها غنية بفيتامين C الذي يدعم جهاز المناعة ويحمي الجسم من نزلات البرد.',
        explanationAr: 'الموكلي: Vitamin C / Abwehrkräfte ↔ Zitrusfrüchte im Winter / Immunsystem.',
      },
      {
        origLetter: 'E',
        mod1Letter: 'I',
        mod2Letter: 'I',
        headingDe: 'Geschichte der Zitrone in Europa',
        headingAr: 'تاريخ الليمون في أوروبا',
        motCleHeading: 'Geschichte der Zitrone in Europa',
        motCleText: 'Ursprung in Asien / über Mittelmeerraum und Italien nach Nordeuropa',
        paragraphDe:
          'Ursprünglich stammt die Zitrone aus Asien, von wo aus sie vor Jahrhunderten über Handelsrouten in den Mittelmeerraum und nach Süditalien gelangte. In Nordeuropa galten die gelben Früchte lange Zeit als kostbares Luxusgut an Fürstenhöfen, wo man spezielle Gewächshäuser baute, um die empfindlichen Bäume zu überwintern.',
        paragraphAr:
          'يعود أصل الليمون إلى آسيا ومنها انتقل عبر طرق التجارة إلى البحر الأبيض المتوسط وإيطاليا، وكان يعتبر سلعة فاخرة في شمال أوروبا.',
        explanationAr: 'الموكلي: Geschichte der Zitrone in Europa ↔ Ursprung in Asien / Mittelmeerraum nach Nordeuropa.',
      },
    ]
  ),

  buildTeil1Topic(
    4,
    'grundschule',
    'Grundschule',
    'المدارس الابتدائية (Grundschule)',
    '🔥 طايح بزاف (Agadir 2026)',
    'قصة الكود FGECA: لغات أجنبية مبكراً (F) ⬅ فطور صحي لنقط أفضل (G) ⬅ التابلت والوسائط الرقمية (E) ⬅ حركة ورياضة في المدرسة (C) ⬅ انخراط الآباء في المدرسة (A).',
    [{ key: 'original', label: 'الأساسي', code: 'FGECA' }],
    [
      {
        origLetter: 'F',
        headingDe: 'Früher Fremdsprachenunterricht in der Grundschule',
        headingAr: 'تعليم اللغات الأجنبية مبكراً في المدرسة الابتدائية',
        motCleHeading: 'Früher Fremdsprachenunterricht',
        motCleText: 'Englisch oder Französisch schon ab der 1. oder 3. Klasse spielerisch lernen',
        paragraphDe:
          'In vielen Bundesländern lernen Kinder heute schon ab der ersten oder dritten Klasse spielerisch Englisch oder Französisch. Durch Lieder, Reime und kleine Rollenspiele verlieren die Grundschüler schnell die Scheu vor der fremden Sprache und entwickeln ein gutes Gefühl für die Aussprache.',
        paragraphAr:
          'في العديد من الولايات يتعلم الأطفال الإنجليزية أو الفرنسية منذ السنة الأولى أو الثالثة ابتدائي بطريقة ترفيهية عبر الأغاني والألعاب.',
        explanationAr: 'الموكلي: Fremdsprachenunterricht ↔ Englisch oder Französisch ab der 1. oder 3. Klasse.',
      },
      {
        origLetter: 'G',
        headingDe: 'Gesundes Frühstück für bessere Noten',
        headingAr: 'فطور صحي من أجل نقط وتركيز أفضل',
        motCleHeading: 'Gesundes Frühstück für bessere Noten',
        motCleText: 'Schulfrühstück / Vollkornbrot und Obst fördern Konzentration der Schüler',
        paragraphDe:
          'Wer morgens mit leerem Magen im Unterricht sitzt, wird schnell müde und unaufmerksam. Schulen, die ein gemeinsames gesundes Schulfrühstück mit Vollkornbrot, Milchprodukten und frischem Obst anbieten, beobachten eine deutlich höhere Konzentration und bessere Leistungen bei den Kindern.',
        paragraphAr:
          'المدارس التي توفر فطوراً صحياً يحتوي على خبز كامل وفواكه تلاحظ ارتفاعاً واضحاً في تركيز التلاميذ وتحسن نقطهم.',
        explanationAr: 'الموكلي: Gesundes Frühstück ↔ Schulfrühstück / Vollkornbrot und Obst fördern Konzentration.',
      },
      {
        origLetter: 'E',
        headingDe: 'Digitale Medien im Klassenzimmer',
        headingAr: 'الوسائط الرقمية في حجرة الدراسة',
        motCleHeading: 'Digitale Medien im Klassenzimmer',
        motCleText: 'Tablets und interaktive Whiteboards statt klassischer Kreidetafel',
        paragraphDe:
          'Die klassische grüne Kreidetafel hat in immer mehr Schulen ausgedient. Stattdessen arbeiten Lehrkräfte und Grundschüler mit interaktiven Whiteboards und Lern-Apps auf Tablets, wodurch sich Aufgaben individuell an das Lerntempo jedes einzelnen Kindes anpassen lassen.',
        paragraphAr:
          'تراجعت السبورة الطباشيرية التقليدية وحلت محلها السبورات التفاعلية واللوحات الرقمية (Tablets) في الأقسام.',
        explanationAr: 'الموكلي: Digitale Medien ↔ Tablets und interaktive Whiteboards statt Kreidetafel.',
      },
      {
        origLetter: 'C',
        headingDe: 'Mehr Bewegung im Schulalltag',
        headingAr: 'حركة أكثر في اليوم الدراسي',
        motCleHeading: 'Mehr Bewegung im Schulalltag',
        motCleText: 'Sportpausen und bewegter Unterricht gegen stundenlanges Sitzen',
        paragraphDe:
          'Stundenlanges Stillsitzen fällt besonders jüngeren Kindern schwer und schadet der Haltung. Deshalb setzen moderne Grundschulen auf bewegten Unterricht, kurze Sportpausen im Klassenzimmer und Klettergeräte auf dem Pausenhof, damit die Schüler ihre Energie sinnvoll abbauen können.',
        paragraphAr:
          'الجلوس الطويل يضر الأطفال، لذلك تعتمد المدارس الحديثة على حصص حركية واستراحات رياضية لتفريغ الطاقة.',
        explanationAr: 'الموكلي: Mehr Bewegung ↔ Sportpausen / bewegter Unterricht gegen langes Sitzen.',
      },
      {
        origLetter: 'A',
        headingDe: 'Eltern engagieren sich für die Schule ihrer Kinder',
        headingAr: 'الآباء ينخرطون في مدرسة أطفالهم',
        motCleHeading: 'Eltern engagieren sich',
        motCleText: 'Elternverein / ehrenamtliche Hilfe bei Schulfesten, Bibliothek und Renovierung',
        paragraphDe:
          'Ohne die tatkräftige Unterstützung von Müttern und Vätern wäre manches Schulprojekt kaum denkbar. Im Elternverein organisieren sie Schulfeste, betreuen ehrenamtlich die Schülerbibliothek oder greifen am Wochenende selbst zum Pinsel, um Klassenräume frisch zu streichen.',
        paragraphAr:
          'ينخرط الآباء والأمهات في جمعية الآباء لتنظيم الحفلات المدرسية وإدارة المكتبة وتجديد الأقسام.',
        explanationAr: 'الموكلي: Eltern engagieren sich ↔ Elternverein / Hilfe bei Schulfesten und Bibliothek.',
      },
    ]
  ),

  buildTeil1Topic(
    5,
    'insekten',
    'Insekten',
    'الحشرات (Insekten)',
    '🔥 رقم 1 في التسريبات (Agadir 2026)',
    'قصة الحشرات (الأساسي CHBEI | المعدل IHBEC غير 1 و 5 كيتقلبو!): الحشرات غذاء المستقبل (C/I) ⬅ انقراض الحشرات يهدد الطبيعة (H) ⬅ حماية طبيعية من الناموس (B) ⬅ تربية النحل في المدينة (E) ⬅ معرض الحشرات في المتحف (I/C).',
    [
      { key: 'original', label: 'الأساسي', code: 'CHBEI' },
      { key: 'mod1', label: 'المعدل', code: 'IHBEC', changeNote: '⚠️ خطير جداً: في المعدل قلبوا النص 1 والنص 5 (C و I تبادلو)، باقي النصوص H B E بقات في بلاصتها!' },
    ],
    [
      {
        origLetter: 'C',
        mod1Letter: 'I',
        headingDe: 'Insekten als Nahrungsmittel der Zukunft',
        headingAr: 'الحشرات كغذاء للمستقبل',
        motCleHeading: 'Nahrungsmittel der Zukunft',
        motCleText: 'Essbare Grillen und Heuschrecken / viel Protein, nachhaltige Ernährung',
        paragraphDe:
          'Für Milliarden Menschen weltweit gehören essbare Grillen, Käfer und Heuschrecken längst auf den Speiseplan. Da sie viel hochwertiges Protein liefern und ihre Zucht deutlich weniger Wasser, Platz und Futter verbraucht als Rinder, gelten Insekten auch in Europa als nachhaltiges Nahrungsmittel der Zukunft.',
        paragraphAr:
          'تعتبر الصراصير والجراد الصالحة للأكل غنية جداً بالبروتين وتستهلك ماءً ومساحة أقل بكثير من الأبقار، ولذلك تعد غذاء المستقبل المستدام.',
        explanationAr: '⚠️ انتبه للتعديل بين C و I! الموكلي الواضح هو Nahrungsmittel der Zukunft ↔ Essbare Grillen / viel Protein.',
      },
      {
        origLetter: 'H',
        mod1Letter: 'H',
        headingDe: 'Rückgang der Insekten bedroht die Natur',
        headingAr: 'تراجع أعداد الحشرات يهدد الطبيعة',
        motCleHeading: 'Rückgang der Insekten bedroht die Natur',
        motCleText: 'Insektensterben durch Pestizide und Monokulturen / Bestäubung von Pflanzen fehlt',
        paragraphDe:
          'Naturschützer beobachten seit Jahren ein dramatisches Insektensterben. Durch den Einsatz chemischer Pestizide und große Monokulturen in der Landwirtschaft verlieren Wildbienen und Schmetterlinge ihren Lebensraum – mit fatalen Folgen für die Bestäubung von Nutzpflanzen und für Vögel, denen die Nahrung fehlt.',
        paragraphAr:
          'يلاحظ حماة البيئة تراجعاً خطيراً في أعداد الحشرات بسبب المبيدات الحشرية، مما يهدد تلقيح النباتات والطيور.',
        explanationAr: 'الموكلي: Rückgang bedroht die Natur ↔ Insektensterben durch Pestizide / Bestäubung fehlt.',
      },
      {
        origLetter: 'B',
        mod1Letter: 'B',
        headingDe: 'Natürlicher Schutz vor Mücken im Sommer',
        headingAr: 'حماية طبيعية من البعوض (الناموس) في الصيف',
        motCleHeading: 'Natürlicher Schutz vor Mücken',
        motCleText: 'Ätherische Öle, Lavendel und Fliegengitter statt chemischer Sprays',
        paragraphDe:
          'Laue Sommerabende am See oder auf dem Balkon werden oft durch lästige Stechmücken gestört. Wer auf chemische Insektensprays verzichten möchte, kann sich mit engen Fliegengittern am Fenster sowie dem Duft von Lavendel, Zitronenmelisse und ätherischen Ölen auf natürliche Weise schützen.',
        paragraphAr:
          'في أمسيات الصيف يمكن الاستغناء عن المبيدات الكيميائية واستعمال شباك النوافذ ورائحة الخزامى (Lavendel) والزيوت العطرية للحماية الطبيعية من الناموس.',
        explanationAr: 'الموكلي: Natürlicher Schutz vor Mücken ↔ Ätherische Öle, Lavendel und Fliegengitter.',
      },
      {
        origLetter: 'E',
        mod1Letter: 'E',
        headingDe: 'Bienenhaltung mitten in der Großstadt',
        headingAr: 'تربية النحل في قلب المدينة الكبرى',
        motCleHeading: 'Bienenhaltung mitten in der Großstadt',
        motCleText: 'Stadtimker auf Hausdächern und Balkonen / Honig aus der Stadt',
        paragraphDe:
          'Immer mehr Großstädter entdecken das Imkern als Hobby und stellen Bienenstöcke auf begrünten Hausdächern, in Hinterhöfen oder auf großen Balkonen auf. Da es in städtischen Parks, Alleen und Gärten das ganze Jahr über vielfältige Blüten und kaum Pestizide gibt, ernten Stadtimker oft besonders aromatischen Honig.',
        paragraphAr:
          'يكتشف سكان المدن الكبرى تربية النحل كهواية ويضعون خلايا النحل فوق أسطح المباني والشرفات لإنتاج عسل المدينة.',
        explanationAr: 'الموكلي: Bienenhaltung in der Großstadt ↔ Stadtimker auf Hausdächern und Balkonen.',
      },
      {
        origLetter: 'I',
        mod1Letter: 'C',
        headingDe: 'Faszination für kleine Krabbeltiere im Museum',
        headingAr: 'إعجاب بالحشرات الصغيرة في المتحف',
        motCleHeading: 'Krabbeltiere im Museum',
        motCleText: 'Sonderausstellung über Käfer und Schmetterlinge im Naturkundemuseum',
        paragraphDe:
          'Eine neue Sonderausstellung im Naturkundemuseum zeigt die erstaunliche Vielfalt von Käfern, Ameisen und Schmetterlingen unter riesigen Vergrößerungsgläsern. Besucher jeden Alters können dort lebende Stabheuschrecken beobachten und lernen, welche erstaunlichen Kräfte in den winzigen Tieren stecken.',
        paragraphAr:
          'يعرض معرض خاص جديد في متحف التاريخ الطبيعي التنوع المذهل للخنافس والفراشات تحت عدسات مكبرة ضخمة.',
        explanationAr: '⚠️ انتبه للتعديل بين I و C! الموكلي هو Museum ↔ Sonderausstellung im Naturkundemuseum.',
      },
    ]
  ),

  buildTeil1Topic(
    6,
    'das-licht',
    'Das Licht',
    'الضوء (Das Licht)',
    '✅ أساسي + معدل',
    'قصة الضوء (الأساسي IEBAF | المعدل BFIEJ): تأثير الضوء على المزاج (1) ⬅ التلوث الضوئي يزعج الإنسان والحيوان (2) ⬅ اقتصاد الكهرباء بمصابيح LED (3) ⬅ الضوء الأزرق للشاشات يفسد النوم (4) ⬅ مهرجان الأنوار في المدينة (5).',
    [
      { key: 'original', label: 'الأساسي', code: 'IEBAF' },
      { key: 'mod1', label: 'المعدل', code: 'BFIEJ', changeNote: 'تغيير حروف العناوين إلى BFIEJ مع نفس الكلمات المفتاحية.' },
    ],
    [
      {
        origLetter: 'I',
        mod1Letter: 'B',
        headingDe: 'Einfluss von Tageslicht auf unsere Stimmung',
        headingAr: 'تأثير ضوء النهار على مزاجنا',
        motCleHeading: 'Tageslicht / Stimmung',
        motCleText: 'Lichtmangel im Winter / Serotonin und Vitamin D gegen Winterdepression',
        paragraphDe:
          'Wenn im Herbst und Winter die Tage kürzer werden, leiden viele Menschen unter Müdigkeit und gedrückter Laune. Ärzte empfehlen tägliche Spaziergänge bei Tageslicht, da das natürliche Sonnenlicht die Bildung des Glückshormons Serotonin und von Vitamin D anregt und so einer Winterdepression vorbeugt.',
        paragraphAr:
          'عندما تقصر الأيام في الشتاء يعاني الكثيرون من التعب، لذا ينصح الأطباء بالمشي في ضوء النهار لتحفيز هرمون السيروتونين وفيتامين D.',
        explanationAr: 'الموكلي: Tageslicht / Stimmung ↔ Lichtmangel im Winter / Serotonin gegen Winterdepression.',
      },
      {
        origLetter: 'E',
        mod1Letter: 'F',
        headingDe: 'Lichtverschmutzung stört Mensch und Tier',
        headingAr: 'التلوث الضوئي يزعج الإنسان والحيوان',
        motCleHeading: 'Lichtverschmutzung stört Mensch und Tier',
        motCleText: 'Künstliche Beleuchtung in Städten / Nachtaktive Tiere und Sterne unsichtbar',
        paragraphDe:
          'Straßenlaternen, Leuchtreklamen und angestrahlte Bürogebäude sorgen dafür, dass es in unseren Großstädten nachts kaum noch richtig dunkel wird. Diese Lichtverschmutzung lässt nicht nur den Sternenhimmel verblassen, sondern bringt auch Zugvögel und nachtaktive Insekten völlig aus dem Gleichgewicht.',
        paragraphAr:
          'تتسبب مصابيح الشوارع والإعلانات المضيئة في المدن في تلوث ضوئي يحجب النجوم ويزعج الطيور المهاجرة والحشرات الليلية.',
        explanationAr: 'الموكلي: Lichtverschmutzung ↔ Künstliche Beleuchtung in Städten / Nachtaktive Tiere.',
      },
      {
        origLetter: 'B',
        mod1Letter: 'I',
        headingDe: 'Strom sparen mit moderner LED-Technik',
        headingAr: 'توفير الكهرباء بتقنية LED الحديثة',
        motCleHeading: 'Strom sparen / LED-Technik',
        motCleText: 'LED-Lampen verbrauchen bis zu 80 Prozent weniger Energie als alte Glühbirnen',
        paragraphDe:
          'Der Austausch alter Glühbirnen und Halogenstrahler durch moderne LED-Lampen lohnt sich für jeden Haushalt. LEDs verbrauchen bis zu 80 Prozent weniger elektrische Energie, halten viele Jahre lang und senken die jährliche Stromrechnung spürbar.',
        paragraphAr:
          'تستهلك مصابيح LED الحديثة طاقة كهربائية أقل بنسبة 80% مقارنة بالمصابيح القديمة وتخفض فاتورة الكهرباء.',
        explanationAr: 'الموكلي: Strom sparen / LED ↔ 80 Prozent weniger Energie als Glühbirnen.',
      },
      {
        origLetter: 'A',
        mod1Letter: 'E',
        headingDe: 'Blaues Licht von Bildschirmen verschlechtert den Schlaf',
        headingAr: 'الضوء الأزرق للشاشات يضعف جودة النوم',
        motCleHeading: 'Blaues Licht / Schlaf',
        motCleText: 'Smartphone und Laptop am Abend hemmen das Schlafhormon Melatonin',
        paragraphDe:
          'Wer kurz vor dem Einschlafen im Bett noch lange auf das Smartphone oder den Laptop schaut, schläft oft schlechter ein. Der hohe Blauanteil des Bildschirmlichts signalisiert dem Gehirn, es sei noch Tag, und hemmt die Ausschüttung des wichtigen Schlafhormons Melatonin.',
        paragraphAr:
          'النظر إلى الهاتف أو الحاسوب في السرير قبل النوم يقلل من إفراز هرمون النوم (الميلاتونين) بسبب الضوء الأزرق.',
        explanationAr: 'الموكلي: Blaues Licht / Schlaf ↔ Smartphone am Abend hemmt Schlafhormon Melatonin.',
      },
      {
        origLetter: 'F',
        mod1Letter: 'J',
        headingDe: 'Lichterfest lockt Tausende Besucher in die Innenstadt',
        headingAr: 'مهرجان الأنوار يجذب آلاف الزوار إلى وسط المدينة',
        motCleHeading: 'Lichterfest / Besucher',
        motCleText: 'Kunstvolle Illuminationen auf historischen Gebäuden / Festival of Lights',
        paragraphDe:
          'Eine Woche lang verwandelt sich die historische Altstadt jeden Abend in eine leuchtende Freiluftgalerie. Beim jährlichen Lichterfest projizieren internationale Lichtkünstler farbenfrohe Illuminationen auf Rathäuser, Brücken und Kirchen und begeistern damit Tausende Zuschauer.',
        paragraphAr:
          'يتحول وسط المدينة التاريخي كل مساء خلال مهرجان الأنوار إلى معرض مفتوح بعروض ضوئية فنية تجذب آلاف الزوار.',
        explanationAr: 'الموكلي: Lichterfest ↔ Kunstvolle Illuminationen auf historischen Gebäuden.',
      },
    ]
  ),

  buildTeil1Topic(
    7,
    'umwelt',
    'Die Umwelt / Online',
    'البيئة (Die Umwelt)',
    '🔥 طايح (Agadir 2026)',
    'قصة البيئة (الأساسي CIFAJ | المعدل HBEJA): تسوق بدون بلاستيك (1) ⬅ تنقل صديق للبيئة في المدينة (2) ⬅ حماية المناخ تبدأ من الأكل (3) ⬅ الإصلاح بدل الرمي (4) ⬅ غرس الأشجار لتحسين مناخ المدينة (5).',
    [
      { key: 'original', label: 'الأساسي', code: 'CIFAJ' },
      { key: 'mod1', label: 'المعدل', code: 'HBEJA', changeNote: 'نسخة معدلة بكود HBEJA مع نفس النصوص الخمسة.' },
    ],
    [
      {
        origLetter: 'C',
        mod1Letter: 'H',
        headingDe: 'Plastikfrei einkaufen im Alltag',
        headingAr: 'التسوق بدون بلاستيك في الحياة اليومية',
        motCleHeading: 'Plastikfrei einkaufen',
        motCleText: 'Unverpackt-Läden / eigene Behälter, Gläser und Stoffbeutel mitbringen',
        paragraphDe:
          'In immer mehr Städten eröffnen sogenannte Unverpackt-Läden. Kunden bringen dort einfach ihre eigenen Gläser, Dosen und Stoffbeutel von zu Hause mit und füllen Nudeln, Reis, Nüsse oder Reinigungsmittel direkt ab – ganz ohne unnötige Plastikverpackungen.',
        paragraphAr:
          'تفتتح في المدن متاجر بدون تغليف (Unverpackt-Läden) حيث يحضر الزبناء أوانيهم الزجاجية وأكياس القماش للتسوق بدون بلاستيك.',
        explanationAr: 'الموكلي: Plastikfrei einkaufen ↔ Unverpackt-Läden / eigene Behälter und Stoffbeutel.',
      },
      {
        origLetter: 'I',
        mod1Letter: 'B',
        headingDe: 'Umweltfreundlich unterwegs in der Stadt',
        headingAr: 'التنقل بطريقة صديقة للبيئة في المدينة',
        motCleHeading: 'Umweltfreundlich unterwegs in der Stadt',
        motCleText: 'Lastenräder, ÖPNV und Carsharing statt eigenem Auto im Stadtverkehr',
        paragraphDe:
          'Für kurze Wege in der Innenstadt braucht man heute kein eigenes Auto mehr. Gut ausgebaute Radwege, kostenlose Leih-Lastenräder sowie die Kombination aus Straßenbahn und Carsharing machen es leicht, im Alltag schnell und abgasfrei ans Ziel zu kommen.',
        paragraphAr:
          'للمسافات القصيرة داخل المدينة توفر الدراجات ووسائل النقل العمومي ومشاركة السيارات بديلاً نظيفاً للسيارة الخاصة.',
        explanationAr: 'الموكلي: Umweltfreundlich unterwegs ↔ Lastenräder, ÖPNV und Carsharing.',
      },
      {
        origLetter: 'F',
        mod1Letter: 'E',
        headingDe: 'Klimaschutz fängt beim Essen an',
        headingAr: 'حماية المناخ تبدأ من الطعام',
        motCleHeading: 'Klimaschutz fängt beim Essen an',
        motCleText: 'Regionale und saisonale Produkte / weniger Fleischkonsum spart CO2',
        paragraphDe:
          'Unsere tägliche Ernährung hat großen Einfluss auf die Treibhausgasbilanz. Wer häufiger zu regionalem Gemüse der Saison greift, lange Transportwege per Flugzeug vermeidet und den Fleischkonsum reduziert, leistet auf dem eigenen Teller einen wirksamen Beitrag zum Klimaschutz.',
        paragraphAr:
          'اختيار الخضر الموسمية المحلية وتقليل استهلاك اللحوم يوفر الكثير من انبعاثات ثنائي أكسيد الكربون ويحمي المناخ.',
        explanationAr: 'الموكلي: Klimaschutz beim Essen ↔ Regionale Produkte / weniger Fleischkonsum spart CO2.',
      },
      {
        origLetter: 'A',
        mod1Letter: 'J',
        headingDe: 'Reparieren statt Wegwerfen',
        headingAr: 'الإصلاح بدلاً من الرمي',
        motCleHeading: 'Reparieren statt Wegwerfen',
        motCleText: 'Repair-Cafés / defekte Elektrogeräte und Kleidung gemeinsam richten',
        paragraphDe:
          'Wenn der Toaster streikt oder das Fahrradlicht kaputtgeht, landet vieles vorschnell im Müll. In ehrenamtlichen Repair-Cafés treffen sich Nachbarn mit erfahrenen Bastlern, um defekte Elektrogeräte, Möbel oder Kleidungsstücke bei einer Tasse Kaffee gemeinsam wieder funktionsfähig zu machen.',
        paragraphAr:
          'في مقاهي الإصلاح التطوعية (Repair-Cafés) يجتمع الجيران مع الحرفيين لإصلاح الأجهزة الكهربائية المعطلة بدل رميها.',
        explanationAr: 'الموكلي: Reparieren statt Wegwerfen ↔ Repair-Cafés / defekte Elektrogeräte richten.',
      },
      {
        origLetter: 'J',
        mod1Letter: 'A',
        headingDe: 'Bäume pflanzen für ein besseres Stadtklima',
        headingAr: 'غرس الأشجار من أجل مناخ حضري أفضل',
        motCleHeading: 'Bäume pflanzen / Stadtklima',
        motCleText: 'Bürgerinitiative begrünt Innenhöfe und Straßenränder gegen Sommerhitze',
        paragraphDe:
          'Dicht bebaute Asphaltflächen heizen sich im Hochsommer extrem auf. Eine engagierte Bürgerinitiative pflanzt deshalb gemeinsam mit der Stadtverwaltung Hunderte neue Laubbäume entlang von Straßen und in Innenhöfen, die Schatten spenden, Feinstaub filtern und die Luft abkühlen.',
        paragraphAr:
          'تقوم مبادرة للمواطنين بغرس مئات الأشجار في الشوارع والساحات لتوفير الظل وتنقية الهواء وتلطيف حرارة الصيف.',
        explanationAr: 'الموكلي: Bäume pflanzen / Stadtklima ↔ Bürgerinitiative begrünt Innenhöfe gegen Hitze.',
      },
    ]
  ),

  buildTeil1Topic(
    8,
    'benzin',
    'Benzin',
    'البنزين والوقود (Benzin)',
    '🔥 طايح (Agadir 2026)',
    'قصة الكود IBCDE: توفير الوقود بالسياقة الصحيحة (I) ⬅ غلاء البنزين يرهق المسافرين اليوميين (B) ⬅ المحركات البديلة والكهربائية (C) ⬅ التزود بالوقود بأرخص ثمن في المساء (D) ⬅ الوقود الحيوي من بقايا النباتات (E).',
    [{ key: 'original', label: 'الأساسي', code: 'IBCDE' }],
    [
      {
        origLetter: 'I',
        headingDe: 'Sprit sparen durch richtige Fahrweise',
        headingAr: 'توفير الوقود من خلال طريقة القيادة الصحيحة',
        motCleHeading: 'Sprit sparen durch richtige Fahrweise',
        motCleText: 'Früh hochschalten, vorausschauend fahren und Reifendruck prüfen',
        paragraphDe:
          'Autofahrer können ihren Kraftstoffverbrauch ohne großen Aufwand um bis zu zwanzig Prozent senken. Wer früh in den nächsthöheren Gang schaltet, vorausschauend fährt, unnötigen Ballast aus dem Kofferraum räumt und regelmäßig den Reifendruck prüft, spart bei jeder Fahrt bares Geld.',
        paragraphAr:
          'يمكن للسائقين خفض استهلاك الوقود بنسبة 20% عبر تغيير السرعة مبكراً والقيادة المتأنية ومراقبة ضغط الإطارات.',
        explanationAr: 'الموكلي: Sprit sparen / richtige Fahrweise ↔ Früh hochschalten, Reifendruck prüfen.',
      },
      {
        origLetter: 'B',
        headingDe: 'Hohe Benzinpreise belasten Pendler',
        headingAr: 'أسعار البنزين المرتفعة ترهق المتنقلين يومياً للعمل',
        motCleHeading: 'Hohe Benzinpreise belasten Pendler',
        motCleText: 'Steigende Kraftstoffkosten an Tankstellen / täglicher Arbeitsweg wird teurer',
        paragraphDe:
          'Für Millionen Berufspendler auf dem Land, die täglich mit dem eigenen Pkw zur Arbeit fahren müssen, werden die steigenden Kraftstoffkosten an den Tankstellen zur großen finanziellen Belastung. Viele bilden nun Fahrgemeinschaften mit Kollegen, um die Ausgaben für den Arbeitsweg zu teilen.',
        paragraphAr:
          'تشكل تكاليف الوقود المرتفعة عبئاً مالياً كبيراً على العاملين الذين يتنقلون يومياً بالسيارة من القرى إلى العمل.',
        explanationAr: 'الموكلي: Hohe Benzinpreise / Pendler ↔ Steigende Kraftstoffkosten / Arbeitsweg teurer.',
      },
      {
        origLetter: 'C',
        headingDe: 'Alternative Antriebe gewinnen Marktanteile',
        headingAr: 'المحركات البديلة تكسب حصة في السوق',
        motCleHeading: 'Alternative Antriebe',
        motCleText: 'Elektroautos, Hybrid und Wasserstoff als Ersatz für Verbrennungsmotoren',
        paragraphDe:
          'Bei den Neuzulassungen auf dem Automarkt zeigt sich ein klarer Trend: Immer mehr Käufer entscheiden sich gegen klassische Verbrennungsmotoren mit Benzin oder Diesel und wählen stattdessen Elektroautos, Hybridmodelle oder Fahrzeuge mit Wasserstoffantrieb.',
        paragraphAr:
          'يتجه المشترون أكثر فأكثر نحو السيارات الكهربائية والهجينة والهيدروجين كبديل لمحركات الاحتراق التقليدية.',
        explanationAr: 'الموكلي: Alternative Antriebe ↔ Elektroautos und Wasserstoff statt Verbrennungsmotoren.',
      },
      {
        origLetter: 'D',
        headingDe: 'Günstiger tanken zur richtigen Uhrzeit',
        headingAr: 'التزود بالوقود بسعر أرخص في التوقيت المناسب',
        motCleHeading: 'Günstiger tanken zur richtigen Uhrzeit',
        motCleText: 'Preisschwankungen im Tagesverlauf / abends zwischen 18 und 20 Uhr am billigsten',
        paragraphDe:
          'Die Preise an den Zapfsäulen ändern sich heute oft mehrmals pro Tag. Auswertungen von Automobilclubs zeigen, dass Tanken morgens im Berufsverkehr am teuersten ist, während Autofahrer am Abend zwischen 18 und 20 Uhr im Durchschnitt am günstigsten wegkommen.',
        paragraphAr:
          'تتغير أسعار الوقود عدة مرات في اليوم، وتُظهر الدراسات أن التزود بالوقود مساءً بين الساعة 18 و20 يكون الأرخص.',
        explanationAr: 'الموكلي: Günstiger tanken / Uhrzeit ↔ abends zwischen 18 und 20 Uhr am billigsten.',
      },
      {
        origLetter: 'E',
        headingDe: 'Biosprit aus Pflanzenresten im Test',
        headingAr: 'وقود حيوي من بقايا النباتات قيد التجربة',
        motCleHeading: 'Biosprit aus Pflanzenresten',
        motCleText: 'Synthetische Kraftstoffe und Ethanol aus Stroh und landwirtschaftlichen Abfällen',
        paragraphDe:
          'Forscher testen derzeit neue Biokraftstoffe der zweiten Generation, die nicht aus Nahrungspflanzen wie Mais, sondern aus Stroh, Holzresten und landwirtschaftlichen Abfällen gewonnen werden. Damit könnten bestehende Motoren klimaschonender betrieben werden, ohne Ackerflächen für Lebensmittel zu verbrauchen.',
        paragraphAr:
          'يختبر الباحثون وقوداً حيوياً جديداً مستخرجاً من القش وبقايا الأخشاب والنفايات الزراعية دون المساس بالمحاصيل الغذائية.',
        explanationAr: 'الموكلي: Biosprit aus Pflanzenresten ↔ Ethanol aus Stroh und Abfällen.',
      },
    ]
  ),

  buildTeil1Topic(
    9,
    'sport-ist-gesund',
    'Sport ist gesund',
    'الرياضة صحية (Sport ist gesund)',
    '🔥 مع تعديلات (Agadir 2026)',
    'قصة الكود HFCAD: الحركة المنتظمة تحمي القلب (H) ⬅ الرياضة في العمل ضد آلام الظهر (F) ⬅ التدريب الجماعي يحفز أكثر (C) ⬅ الحذر من الإجهاد المفرط للمبتدئين (A) ⬅ الحفاظ على اللياقة في سن متقدمة (D).',
    [{ key: 'original', label: 'الأساسي', code: 'HFCAD' }],
    [
      {
        origLetter: 'H',
        headingDe: 'Regelmäßige Bewegung schützt das Herz',
        headingAr: 'الحركة المنتظمة تحمي القلب',
        motCleHeading: 'Bewegung schützt das Herz',
        motCleText: 'Ausdauersport wie Joggen, Schwimmen und Radfahren senkt Blutdruck',
        paragraphDe:
          'Kardiologen betonen, dass schon dreimal dreißig Minuten moderater Ausdauersport pro Woche das Risiko für Herz-Kreislauf-Erkrankungen deutlich reduziert. Sportarten wie zügiges Gehen, Joggen, Schwimmen oder Radfahren stärken den Herzmuskel und senken auf natürliche Weise den Blutdruck.',
        paragraphAr:
          'يؤكد أطباء القلب أن ممارسة رياضات التحمل مثل الجري والسباحة وركوب الدراجة ثلاث مرات أسبوعياً تقوي عضلة القلب وتخفض ضغط الدم.',
        explanationAr: 'الموكلي: schützt das Herz ↔ Ausdauersport senkt Blutdruck / Herz-Kreislauf.',
      },
      {
        origLetter: 'F',
        headingDe: 'Sport am Arbeitsplatz gegen Rückenschmerzen',
        headingAr: 'الرياضة في مكان العمل ضد آلام الظهر',
        motCleHeading: 'Sport am Arbeitsplatz / Rückenschmerzen',
        motCleText: 'Betriebssport und kurze Dehnübungen im Büroalltag entlasten die Wirbelsäule',
        paragraphDe:
          'Wer täglich acht Stunden am Schreibtisch vor dem Monitor sitzt, leidet häufig unter Verspannungen im Nacken und Rückenschmerzen. Immer mehr Unternehmen bieten ihren Beschäftigten deshalb Betriebssportkurse und kurze aktive Bewegungspausen direkt im Büro an.',
        paragraphAr:
          'الجلوس الطويل أمام الحاسوب يسبب آلام الظهر، لذلك توفر الشركات حصصاً رياضية وتمارين تمدد قصيرة في المكتب.',
        explanationAr: 'الموكلي: Sport am Arbeitsplatz / Rückenschmerzen ↔ Betriebssport im Büroalltag.',
      },
      {
        origLetter: 'C',
        headingDe: 'Gemeinsam trainieren motiviert mehr',
        headingAr: 'التدريب الجماعي يحفز أكثر',
        motCleHeading: 'Gemeinsam trainieren motiviert mehr',
        motCleText: 'Sportverein oder feste Laufgruppe hilft gegen den inneren Schweinehund',
        paragraphDe:
          'Alleine auf dem Sofa fällt es nach Feierabend oft schwer, sich noch zum Training aufzuraffen. Wer sich jedoch einer festen Laufgruppe anschließt oder im Sportverein mit Freunden verabredet ist, überwindet den inneren Schweinehund viel leichter und bleibt langfristig am Ball.',
        paragraphAr:
          'الانضمام إلى مجموعة جري أو نادٍ رياضي مع الأصدقاء يساعد على التغلب على الكسل والمداومة على التداريب.',
        explanationAr: 'الموكلي: Gemeinsam trainieren ↔ Sportverein oder Laufgruppe gegen den inneren Schweinehund.',
      },
      {
        origLetter: 'A',
        headingDe: 'Vorsicht vor Überlastung beim Training',
        headingAr: 'الحذر من الإجهاد المفرط أثناء التدريب',
        motCleHeading: 'Vorsicht vor Überlastung',
        motCleText: 'Ruhepausen und gründliches Aufwärmen verhindern Muskelverletzungen bei Anfängern',
        paragraphDe:
          'Gerade Sporteinsteiger machen oft den Fehler, am Anfang zu schnell zu viel zu wollen. Sportmediziner raten dringend zu gründlichem Aufwärmen, langsam gesteigerter Intensität und ausreichenden Ruhepausen zwischen den Trainingstagen, um schmerzhafte Muskel- und Gelenkverletzungen zu vermeiden.',
        paragraphAr:
          'ينصح أطباء الرياضة المبتدئين بالإحماء الجيد والتدرج في التداريب وأخذ فترات راحة كافية لتجنب إصابات العضلات والمفاصل.',
        explanationAr: 'الموكلي: Vorsicht vor Überlastung ↔ Ruhepausen und Aufwärmen verhindern Muskelverletzungen.',
      },
      {
        origLetter: 'D',
        headingDe: 'Fit bleiben auch im hohen Alter',
        headingAr: 'الحفاظ على اللياقة البدنية حتى في سن متقدمة',
        motCleHeading: 'Fit bleiben auch im hohen Alter',
        motCleText: 'Seniorensport, Wassergymnastik und Spaziergänge erhalten Beweglichkeit und Gleichgewicht',
        paragraphDe:
          'Für sportliche Aktivität ist man nie zu alt. Spezielle Kurse für Senioren wie Wassergymnastik, sanftes Krafttraining oder Nordic Walking schonen die Gelenke, fördern den Gleichgewichtssinn gegen Stürze und helfen älteren Menschen, im Alltag lange selbstständig zu bleiben.',
        paragraphAr:
          'تساعد رياضة كبار السن مثل الجمباز المائي والمشي على حماية المفاصل والحفاظ على التوازن والاستقلالية في الحياة اليومية.',
        explanationAr: 'الموكلي: im hohen Alter ↔ Seniorensport, Wassergymnastik erhalten Beweglichkeit.',
      },
    ]
  ),

  buildTeil1Topic(
    10,
    'oesterreich',
    'Österreich',
    'النمسا وأسواقها (Österreich)',
    '🔥 طايح (Agadir 2026)',
    'قصة الكود DFJEA: أسواق فيينا التقليدية (D) ⬅ السياحة الصيفية في جبال الألب (F) ⬅ نجاح الفلاحة البيولوجية في النمسا (J) ⬅ ثقافة مقاهي فيينا كتراث عالمي (E) ⬅ تذكرة سنوية رخيصة للنقل العمومي (A).',
    [{ key: 'original', label: 'الأساسي', code: 'DFJEA' }],
    [
      {
        origLetter: 'D',
        headingDe: 'Traditionelle Märkte in Wien erleben',
        headingAr: 'تجربة الأسواق التقليدية في فيينا',
        motCleHeading: 'Traditionelle Märkte in Wien',
        motCleText: 'Wiener Naschmarkt / regionale Spezialitäten und internationale Gewürze',
        paragraphDe:
          'Ein Bummel über den berühmten Wiener Naschmarkt ist ein Fest für alle Sinne. An über hundert Ständen bieten Händler seit dem 18. Jahrhundert frisches Obst, österreichischen Bergkäse sowie orientalische Gewürze und Spezialitäten aus aller Welt an.',
        paragraphAr:
          'تعتبر الجولة في سوق ناشماركت الشهير في فيينا متعة للحواس، حيث يعرض التجار الفواكه والأجبان النمساوية والتوابل العالمية.',
        explanationAr: 'الموكلي: Märkte in Wien ↔ Wiener Naschmarkt / regionale Spezialitäten.',
      },
      {
        origLetter: 'F',
        headingDe: 'Tourismus in den österreichischen Alpen boomt auch im Sommer',
        headingAr: 'السياحة في جبال الألب النمساوية تزدهر في الصيف أيضاً',
        motCleHeading: 'Alpen boomt auch im Sommer',
        motCleText: 'Wanderurlauber, Bergseen und Mountainbiker in Tirol und Salzburg',
        paragraphDe:
          'Die österreichischen Alpen sind längst nicht mehr nur im Winter bei Skifahrern gefragt. Immer mehr Gäste verbringen ihren Sommerurlaub in Tirol oder Salzburg, um auf markierten Panoramawegen zu wandern, mit dem Mountainbike zu fahren oder in klaren Bergseen zu baden.',
        paragraphAr:
          'لم تعد جبال الألب النمساوية مقتصرة على التزلج شتاءً، بل تجذب في الصيف عشاق المشي الجبلي والدراجات في تيرول وسالزبورغ.',
        explanationAr: 'الموكلي: Alpen im Sommer ↔ Wanderurlauber und Mountainbiker in Tirol und Salzburg.',
      },
      {
        origLetter: 'J',
        headingDe: 'Bio-Landwirtschaft hat in Österreich großen Erfolg',
        headingAr: 'الزراعة البيولوجية تحقق نجاحاً كبيراً في النمسا',
        motCleHeading: 'Bio-Landwirtschaft / Erfolg',
        motCleText: 'Höchster Anteil an Bio-Bauernhöfen in der gesamten Europäischen Union',
        paragraphDe:
          'Nirgendwo in der Europäischen Union wird ein so großer Teil der Ackerflächen und Weiden ökologisch bewirtschaftet wie in Österreich. Mehr als jeder vierte Bauernhof verzichtet auf chemisch-synthetische Dünger und setzt auf artgerechte Tierhaltung und Bio-Qualität.',
        paragraphAr:
          'تتصدر النمسا دول الاتحاد الأوروبي في نسبة الضيعات الفلاحية البيولوجية التي تستغني عن الأسمدة الكيميائية.',
        explanationAr: 'الموكلي: Bio-Landwirtschaft ↔ Höchster Anteil an Bio-Bauernhöfen in der EU.',
      },
      {
        origLetter: 'E',
        headingDe: 'Wiener Kaffeehauskultur als UNESCO-Kulturerbe',
        headingAr: 'ثقافة مقاهي فيينا كتراث ثقافي لليونسكو',
        motCleHeading: 'Wiener Kaffeehauskultur',
        motCleText: 'Melange, Sachertorte und stundenlanges Zeitunglesen am Marmortisch',
        paragraphDe:
          'In einem traditionellen Wiener Kaffeehaus kauft man mit einer Tasse Melange und einem Stück Sachertorte vor allem eines: Zeit. Stundenlang an kleinen Marmortischen zu sitzen, internationale Zeitungen zu lesen oder zu diskutieren, gehört zum immateriellen UNESCO-Kulturerbe.',
        paragraphAr:
          'في مقاهي فيينا التقليدية يمكنك الجلوس لساعات طويلة أمام طاولات الرخام لقراءة الصحف مع قهوة ميلانج وكعكة زآخر.',
        explanationAr: 'الموكلي: Wiener Kaffeehauskultur ↔ Melange, Sachertorte und Zeitunglesen am Marmortisch.',
      },
      {
        origLetter: 'A',
        headingDe: 'Günstiges Jahresticket für alle öffentlichen Verkehrsmittel',
        headingAr: 'تذكرة سنوية مخفضة لجميع وسائل النقل العمومي',
        motCleHeading: 'Günstiges Jahresticket / öffentliche Verkehrsmittel',
        motCleText: 'Klimaticket Österreich / Bahn, Bus und Straßenbahn im ganzen Land nutzen',
        paragraphDe:
          'Mit dem landesweiten Klimaticket können Bürgerinnen und Bürger in ganz Österreich ein Jahr lang sämtliche Züge, Regionalbusse und städtischen Straßenbahnen zum Festpreis nutzen. Das Angebot soll den Umstieg vom eigenen Auto auf den öffentlichen Verkehr attraktiver machen.',
        paragraphAr:
          'تتيح تذكرة المناخ النمساوية (Klimaticket) استعمال جميع القطارات والحافلات والترامواي في كامل البلاد طوال السنة بسعر موحد.',
        explanationAr: 'الموكلي: Jahresticket / öffentliche Verkehrsmittel ↔ Klimaticket Österreich / Bahn und Bus.',
      },
    ]
  ),

  buildTeil1Topic(
    11,
    'impfung',
    'Impfung',
    'التلقيح والمناعة (Impfung)',
    '✅ أساسي + معدل',
    'قصة الكود BCDGE: كيف يدرب اللقاح جهاز المناعة (B) ⬅ لقاحات السفر للخارج (C) ⬅ تذكير رقمي بموعد التلقيح عبر تطبيق (D) ⬅ لقاح الإنفلونزا لكبار السن (G) ⬅ تاريخ أول لقاح ناجح ضد الجدري (E).',
    [{ key: 'original', label: 'الأساسي', code: 'BCDGE' }],
    [
      {
        origLetter: 'B',
        headingDe: 'Wie Impfungen das Immunsystem trainieren',
        headingAr: 'كيف تدرب اللقاحات جهاز المناعة',
        motCleHeading: 'Immunsystem trainieren',
        motCleText: 'Bildung von Antikörpern und Gedächtniszellen gegen Krankheitserreger',
        paragraphDe:
          'Eine Schutzimpfung präsentiert dem Körper abgeschwächte oder inaktivierte Teile eines Krankheitserregers. Dadurch lernt das Immunsystem, gezielt Antikörper und Gedächtniszellen zu bilden, sodass es bei einer späteren echten Infektion blitzschnell reagieren kann.',
        paragraphAr:
          'يقدم اللقاح للجسم أجزاءً مضعفة من الميكروب، فيتعلم جهاز المناعة تكوين أجسام مضادة وخلايا ذاكرة تحميه مستقبلاً.',
        explanationAr: 'الموكلي: Immunsystem trainieren ↔ Bildung von Antikörpern und Gedächtniszellen.',
      },
      {
        origLetter: 'C',
        headingDe: 'Wichtige Reiseimpfungen vor dem Urlaub im Ausland',
        headingAr: 'لقاحات السفر المهمة قبل العطلة في الخارج',
        motCleHeading: 'Reiseimpfungen vor dem Urlaub',
        motCleText: 'Tropenmedizinische Beratung / Schutz vor Gelbfieber, Typhus und Hepatitis',
        paragraphDe:
          'Wer eine Fernreise nach Asien, Afrika oder Südamerika plant, sollte sich mindestens sechs Wochen vor Abflug tropenmedizinisch beraten lassen. Für manche Länder sind spezielle Reiseimpfungen gegen Gelbfieber oder Hepatitis A und B dringend empfohlen oder sogar Pflicht.',
        paragraphAr:
          'من يخطط للسفر إلى آسيا أو إفريقيا أو أمريكا الجنوبية عليه استشارة طبيب طب المناطق الحارة لأخذ لقاحات السفر مثل الحمى الصفراء.',
        explanationAr: 'الموكلي: Reiseimpfungen ↔ Tropenmedizinische Beratung / Gelbfieber und Hepatitis.',
      },
      {
        origLetter: 'D',
        headingDe: 'Digitale Erinnerung an den nächsten Impftermin',
        headingAr: 'تذكير رقمي بموعد التلقيح القادم',
        motCleHeading: 'Digitale Erinnerung / Impftermin',
        motCleText: 'Elektronischer Impfpass per Smartphone-App verhindert vergessene Auffrischungen',
        paragraphDe:
          'Viele Erwachsene wissen gar nicht genau, wann ihre letzte Tetanus-Auffrischung war, weil das gelbe Papierheft in der Schublade verstaubt. Ein elektronischer Impfpass per Smartphone-App speichert alle Daten übersichtlich und erinnert automatisch an fällige Termine.',
        paragraphAr:
          'تطبيق الدفتر الإلكتروني للتلقيح على الهاتف الذكي يحفظ جميع البيانات ويذكر المستخدم تلقائياً بمواعيد الجرعات التذكيرية.',
        explanationAr: 'الموكلي: Digitale Erinnerung ↔ Elektronischer Impfpass per App.',
      },
      {
        origLetter: 'G',
        headingDe: 'Grippeimpfung besonders für Risikogruppen empfohlen',
        headingAr: 'لقاح الإنفلونزا موصى به خاصة للفئات الهشة',
        motCleHeading: 'Grippeimpfung / Risikogruppen',
        motCleText: 'Ältere Menschen ab 60, chronisch Kranke und medizinisches Personal im Herbst schützen',
        paragraphDe:
          'Da sich Grippeviren jedes Jahr verändern, raten Gesundheitsbehörden im Herbst zu einer jährlichen Grippeschutzimpfung. Besonders wichtig ist der Schutz für Menschen ab 60 Jahren, chronisch Kranke sowie Pflegekräfte und medizinisches Personal in Krankenhäusern.',
        paragraphAr:
          'ينصح الأطباء كل خريف بلقاح الإنفلونزا الموسمي خاصة لكبار السن فوق 60 سنة وذوي الأمراض المزمنة والأطقم الطبية.',
        explanationAr: 'الموكلي: Grippeimpfung / Risikogruppen ↔ Ältere Menschen und medizinisches Personal im Herbst.',
      },
      {
        origLetter: 'E',
        headingDe: 'Geschichte der ersten erfolgreichen Schutzimpfung',
        headingAr: 'تاريخ أول تلقيح وقائي ناجح',
        motCleHeading: 'Geschichte der ersten Schutzimpfung',
        motCleText: 'Edward Jenner und der Kampf gegen die gefährlichen Pocken im Jahr 1796',
        paragraphDe:
          'Der englische Landarzt Edward Jenner legte 1796 den Grundstein für die moderne Immunologie: Er beobachtete, dass Melkerinnen, die sich mit harmlosen Kuhpocken infiziert hatten, später nicht an den lebensgefährlichen echten Pocken erkrankten, und entwickelte daraus das erste Impfverfahren.',
        paragraphAr:
          'وضع الطبيب الإنجليزي إدوارد جينر عام 1796 حجر الأساس للتلقيح الحديث في مواجهة مرض الجدري الخطير (Pocken).',
        explanationAr: 'الموكلي: Geschichte der ersten Schutzimpfung ↔ Edward Jenner / Pocken im 18. Jahrhundert.',
      },
    ]
  ),

  buildTeil1Topic(
    12,
    'tanzkurs',
    'Tanzkurs',
    'دروس الرقص (Tanzkurs)',
    '🔥 طايح (Agadir 2026)',
    'قصة الرقص (الأساسي EDFAG | المعدل DJCBE): الرقص يحافظ على شباب الجسم والدماغ (1) ⬅ الرقص الكلاسيكي يعود للموضة عند الشباب (2) ⬅ السالسا والتانغو ضد ضغط العمل (3) ⬅ دروس رقص للعزاب بدون شريك قار (4) ⬅ من هواية إلى مهنة أستاذ رقص (5).',
    [
      { key: 'original', label: 'الأساسي', code: 'EDFAG' },
      { key: 'mod1', label: 'المعدل', code: 'DJCBE', changeNote: 'نسخة معدلة بكود DJCBE مع نفس النصوص الخمسة.' },
    ],
    [
      {
        origLetter: 'E',
        mod1Letter: 'D',
        headingDe: 'Tanzen hält Körper und Gehirn jung',
        headingAr: 'الرقص يحافظ على شباب الجسم والدماغ',
        motCleHeading: 'Körper und Gehirn jung',
        motCleText: 'Koordination von Musik und komplexen Schrittfolgen schützt vor Demenz',
        paragraphDe:
          'Neurowissenschaftler haben herausgefunden, dass regelmäßiges Tanzen nicht nur Muskeln und Ausdauer trainiert, sondern auch das Gehirn optimal fordert. Das gleichzeitige Hören auf den Rhythmus und das Merken komplexer Schrittfolgen bildet neue Nervenverbindungen und senkt das Demenzrisiko.',
        paragraphAr:
          'أثبت علماء الأعصاب أن الرقص المنتظم يدرب العضلات والدماغ معاً عبر تنسيق الموسيقى والخطوات ويحمي من الخرف (Demenz).',
        explanationAr: 'الموكلي: Körper und Gehirn jung ↔ Koordination von Musik und Schrittfolgen schützt vor Demenz.',
      },
      {
        origLetter: 'D',
        mod1Letter: 'J',
        headingDe: 'Klassische Gesellschaftstänze wieder im Trend bei Jugendlichen',
        headingAr: 'الرقصات الكلاسيكية تعود للواجهة لدى الشباب',
        motCleHeading: 'Klassische Gesellschaftstänze / Jugendliche',
        motCleText: 'Walzer, Foxtrott und festlicher Abschlussball in der Tanzschule',
        paragraphDe:
          'Walzer und Foxtrott gelten bei Teenagern längst nicht mehr als verstaubt. Viele Sechzehnjährige melden sich gemeinsam mit ihrer Schulklasse in der Tanzschule an, um für den festlichen Abschlussball im Abendkleid und Anzug die klassischen Gesellschaftstänze zu beherrschen.',
        paragraphAr:
          'يسجل العديد من المراهقين أنفسهم في مدارس الرقص لتعلم الفالس والفوكستروت استعداداً لحفل التخرج.',
        explanationAr: 'الموكلي: Klassische Gesellschaftstänze / Jugendliche ↔ Walzer, Foxtrott und Abschlussball.',
      },
      {
        origLetter: 'F',
        mod1Letter: 'C',
        headingDe: 'Salsa und Tango bringen Urlaubsgefühl in den Feierabend',
        headingAr: 'السالسا والتانغو يجلبان أجواء العطلة بعد العمل',
        motCleHeading: 'Salsa und Tango / Feierabend',
        motCleText: 'Lateinamerikanische Rhythmen helfen gegen Alltagsstress nach der Arbeit',
        paragraphDe:
          'Wer nach einem langen Bürotag den Alltagsstress schnell vergessen möchte, besucht am Abend einen Salsa- oder Tangokurs. Die feurigen lateinamerikanischen Rhythmen sorgen sofort für gute Laune und vermitteln mitten in der Woche ein Gefühl wie im Sommerurlaub.',
        paragraphAr:
          'من يريد نسيان ضغط العمل في المساء يزور دروس السالسا والتانغو ذات الإيقاعات اللاتينية التي تمنح شعوراً بالعطلة.',
        explanationAr: 'الموكلي: Salsa und Tango / Feierabend ↔ Lateinamerikanische Rhythmen gegen Alltagsstress.',
      },
      {
        origLetter: 'A',
        mod1Letter: 'B',
        headingDe: 'Tanzkurse für Singles ohne festen Tanzpartner',
        headingAr: 'دروس رقص للعزاب بدون شريك رقص قار',
        motCleHeading: 'Singles ohne festen Tanzpartner',
        motCleText: 'Regelmäßiger Partnerwechsel im Unterricht / ungezwungen neue Leute kennenlernen',
        paragraphDe:
          'Man muss keinen eigenen Partner mitbringen, um mit dem Tanzen anzufangen. Viele Tanzschulen bieten spezielle Single-Kurse an, bei denen im Unterricht alle paar Minuten der Tanzpartner gewechselt wird – eine ideale Gelegenheit, um ungezwungen neue Menschen kennenzulernen.',
        paragraphAr:
          'لا يشترط إحضار شريك خاص لتعلم الرقص؛ فمدارس الرقص تنظم دروساً للعزاب يتم فيها تبادل الشركاء للتعارف.',
        explanationAr: 'الموكلي: Singles ohne festen Tanzpartner ↔ Partnerwechsel im Unterricht / neue Leute kennenlernen.',
      },
      {
        origLetter: 'G',
        mod1Letter: 'E',
        headingDe: 'Vom Hobby zum Beruf: Ausbildung zum Tanzlehrer',
        headingAr: 'من الهواية إلى المهنة: التكوين كأستاذ رقص',
        motCleHeading: 'Ausbildung zum Tanzlehrer',
        motCleText: 'Dreijährige Berufsausbildung, Musikgefühl und pädagogisches Geschick',
        paragraphDe:
          'Wer seine Leidenschaft für Bewegung zum Beruf machen möchte, kann eine dreijährige Ausbildung zum ADTV-Tanzlehrer absolvieren. Neben perfekter Tanztechnik und Rhythmusgefühl lernen die angehenden Profis dort auch Unterrichtsmethodik, Veranstaltungsorganisation und Betriebswirtschaft.',
        paragraphAr:
          'من يرغب في تحويل شغفه بالرقص إلى مهنة يمكنه متابعة تكوين مهني لمدة 3 سنوات ليصبح أستاذ رقص محترف.',
        explanationAr: 'الموكلي: Ausbildung zum Tanzlehrer ↔ Dreijährige Berufsausbildung und pädagogisches Geschick.',
      },
    ]
  ),

  buildTeil1Topic(
    13,
    'kaffee',
    'Kaffee',
    'القهوة (Kaffee)',
    '🔥 طايح (Agadir 2026)',
    'قصة الكود JBHAF: القهوة المشروب المفضل للألمان (J) ⬅ التجارة العادلة تنصف مزارعي القهوة (B) ⬅ أكواب قابلة لإعادة الاستعمال ضد الأزبال (H) ⬅ الكافيين مفيد للتركيز والدورة الدموية (A) ⬅ المحامص الصغيرة تركز على الجودة (F).',
    [{ key: 'original', label: 'الأساسي', code: 'JBHAF' }],
    [
      {
        origLetter: 'J',
        headingDe: 'Kaffee ist das beliebteste Getränk der Deutschen',
        headingAr: 'القهوة هي المشروب الأكثر شعبية لدى الألمان',
        motCleHeading: 'beliebteste Getränk der Deutschen',
        motCleText: 'Über 160 Liter pro Kopf im Jahr / mehr als Mineralwasser und Bier',
        paragraphDe:
          'Statistiken belegen es jedes Jahr aufs Neue: Mit einem durchschnittlichen Konsum von über 160 Litern pro Kopf und Jahr liegt Bohnenkaffee in Deutschland unangefochten auf Platz eins der beliebtesten Getränke – noch vor Mineralwasser und weit vor Bier.',
        paragraphAr:
          'تثبت الإحصائيات أن الألمان يشربون أكثر من 160 لتراً من القهوة للفرد سنوياً، متفوقة على الماء المعدني.',
        explanationAr: 'الموكلي: beliebteste Getränk ↔ Über 160 Liter pro Kopf im Jahr.',
      },
      {
        origLetter: 'B',
        headingDe: 'Fairer Handel sichert Kaffeebauern ein besseres Einkommen',
        headingAr: 'التجارة العادلة تضمن دخلاً أفضل لمزارعي القهوة',
        motCleHeading: 'Fairer Handel / Kaffeebauern',
        motCleText: 'Fairtrade-Siegel garantiert stabile Mindestpreise in Südamerika und Afrika',
        paragraphDe:
          'Auf dem Weltmarkt schwanken die Rohkaffeepreise stark, worunter vor allem Kleinbauern in Südamerika und Afrika leiden. Produkte mit dem Fairtrade-Siegel garantieren den Erzeugern stabile Mindestpreise sowie Prämien für Schulen und medizinische Versorgung vor Ort.',
        paragraphAr:
          'تضمن علامة التجارة العادلة (Fairtrade) أسعاراً دنيا مستقرة لصغار مزارعي القهوة في أمريكا الجنوبية وإفريقيا.',
        explanationAr: 'الموكلي: Fairer Handel / Kaffeebauern ↔ Fairtrade-Siegel / Mindestpreise.',
      },
      {
        origLetter: 'H',
        headingDe: 'Wiederverwendbare Becher gegen den Müllberg',
        headingAr: 'أكواب قابلة لإعادة الاستخدام لمحاربة جبال النفايات',
        motCleHeading: 'Wiederverwendbare Becher / Müllberg',
        motCleText: 'Pfandsystem für Coffee-to-go-Becher spart Millionen Einwegbecher',
        paragraphDe:
          'Jeden Tag landen in deutschen Städten Millionen Einwegbecher für Coffee-to-go nach wenigen Minuten im Abfalleimer. Ein neues stadtweites Pfandsystem mit stabilen Mehrwegbechern, die man in jedem teilnehmenden Café zurückgeben kann, reduziert diesen Müllberg erheblich.',
        paragraphAr:
          'يقلل نظام الرهن (Pfandsystem) للأكواب القابلة لإعادة الاستخدام من ملايين أكواب القهوة الورقية التي ترمى يومياً.',
        explanationAr: 'الموكلي: Wiederverwendbare Becher ↔ Pfandsystem für Coffee-to-go-Becher.',
      },
      {
        origLetter: 'A',
        headingDe: 'Koffein wirkt positiv auf Konzentration und Kreislauf',
        headingAr: 'الكافيين يؤثر إيجابياً على التركيز والدورة الدموية',
        motCleHeading: 'Koffein wirkt positiv auf Konzentration',
        motCleText: 'Aktuelle Studien widerlegen alte Vorurteile / drei bis vier Tassen gesund',
        paragraphDe:
          'Lange Zeit galt Kaffee als ungesund, doch aktuelle medizinische Studien widerlegen dieses Vorurteil: Drei bis vier Tassen täglich regen durch das enthaltene Koffein nicht nur das Kurzzeitgedächtnis und die Konzentration an, sondern liefern auch wertvolle Antioxidantien.',
        paragraphAr:
          'تنفي الدراسات الطبية الحديثة الأحكام المسبقة القديمة وتؤكد أن 3 إلى 4 فناجين قهوة يومياً تنشط التركيز والذاكرة.',
        explanationAr: 'الموكلي: Koffein wirkt positiv ↔ Studien widerlegen Vorurteile / drei bis vier Tassen.',
      },
      {
        origLetter: 'F',
        headingDe: 'Kleine Röstereien setzen auf Qualität statt Masse',
        headingAr: 'المحامص الصغيرة تراهن على الجودة بدل الكمية',
        motCleHeading: 'Kleine Röstereien / Qualität statt Masse',
        motCleText: 'Schonende handwerkliche Trommelröstung bei niedrigen Temperaturen',
        paragraphDe:
          'Während Großkonzerne Kaffeebohnen oft in wenigen Minuten bei extremer Hitze industriell rösten, arbeiten kleine private Kaffeeröstereien mit dem traditionellen Trommelröstverfahren. Durch die langsame Röstung bei rund 200 Grad entwickeln die Bohnen ein besonders mildes Aroma.',
        paragraphAr:
          'تعتمد محامص القهوة الحرفية الصغيرة على التحميص البطيء في الأسطوانات التقليدية للحصول على نكهة عالية الجودة.',
        explanationAr: 'الموكلي: Kleine Röstereien ↔ Schonende Trommelröstung / Qualität statt Masse.',
      },
    ]
  ),

  buildTeil1Topic(
    14,
    'bonbon',
    'Bonbon',
    'الحلوى والسكاكر (Bonbon)',
    '🔥 طايح (Agadir 2026)',
    'قصة الكود DEICB: حلوى مصنوعة يدوياً بوصفة عائلية (D) ⬅ حلوى الأعشاب ضد التهاب الحلق (E) ⬅ حلويات بدون سكر تحمي الأسنان (I) ⬅ الأغلفة الملونة تؤثر على الشراء عند الصندوق (C) ⬅ تاريخ السكر من سلعة فاخرة إلى استهلاك واسع (B).',
    [{ key: 'original', label: 'الأساسي', code: 'DEICB' }],
    [
      {
        origLetter: 'D',
        headingDe: 'Handgemachte Bonbons nach altem Familienrezept',
        headingAr: 'حلوى مصنوعة يدوياً حسب وصفة عائلية قديمة',
        motCleHeading: 'Handgemachte Bonbons / Familienrezept',
        motCleText: 'Traditionelle Bonbonmanufaktur / Kochen von Zucker im Kupferkessel',
        paragraphDe:
          'In einer kleinen Hamburger Bonbonmanufaktur wird noch wie vor hundert Jahren gearbeitet: Im offenen Kupferkessel kochen die Konditoren nach einem geheimen Familienrezept flüssigen Zucker mit natürlichen Fruchtsäften und ziehen die warme Masse von Hand zu bunten Streifen.',
        paragraphAr:
          'في مصنع حلوى تقليدي صغير يتم طبخ السكر مع عصائر الفواكه الطبيعية في قدور نحاسية حسب وصفة عائلية قديمة.',
        explanationAr: 'الموكلي: Handgemachte Bonbons ↔ Bonbonmanufaktur / Kochen im Kupferkessel.',
      },
      {
        origLetter: 'E',
        headingDe: 'Kräuterbonbons als bewährtes Hausmittel bei Halsschmerzen',
        headingAr: 'حلوى الأعشاب كعلاج منزلي مجرب لآلام الحلق',
        motCleHeading: 'Kräuterbonbons / Halsschmerzen',
        motCleText: 'Salbei, Eukalyptus, Thymian und Honig beruhigen gereizte Atemwege und Husten',
        paragraphDe:
          'Wenn es im Hals kratzt und die Stimme heiser wird, schwören viele auf klassische Kräuterbonbons. Extrakte aus Salbei, Thymian, Eukalyptus und etwas Bienenhonig regen beim Lutschen den Speichelfluss an und legen einen beruhigenden Schutzfilm über die gereizten Schleimhäute.',
        paragraphAr:
          'عند الشعور بآلام الحلق والسعال تساعد حلوى الأعشاب الغنية بالميرمية والأوكالبتوس والعسل على تهدئة المجاري التنفسية.',
        explanationAr: 'الموكلي: Kräuterbonbons / Halsschmerzen ↔ Salbei, Eukalyptus und Honig beruhigen Atemwege.',
      },
      {
        origLetter: 'I',
        headingDe: 'Zuckerfreie Süßigkeiten schonen die Zähne',
        headingAr: 'الحلويات الخالية من السكر تحمي الأسنان',
        motCleHeading: 'Zuckerfreie Süßigkeiten / Zähne',
        motCleText: 'Zuckeraustauschstoffe wie Xylit und Stevia verursachen keine Karies',
        paragraphDe:
          'Naschen muss nicht zwangsläufig zu Zahnschmerzen führen. Moderne zuckerfreie Bonbons und Kaugummis, die mit natürlichen Zuckeraustauschstoffen wie Birkenzucker (Xylit) oder Stevia gesüßt sind, bieten Kariesbakterien im Mund keine Nahrung und schützen so den Zahnschmelz.',
        paragraphAr:
          'الحلويات الخالية من السكر والمحلاة بالزيليتول أو ستيفيا لا تسبب تسوس الأسنان (Karies) وتحمي مينا الأسنان.',
        explanationAr: 'الموكلي: Zuckerfreie Süßigkeiten / Zähne ↔ Xylit und Stevia verursachen keine Karies.',
      },
      {
        origLetter: 'C',
        headingDe: 'Bunte Verpackungen beeinflussen das Kaufverhalten im Supermarkt',
        headingAr: 'الأغلفة الملونة تؤثر على سلوك الشراء في المتجر',
        motCleHeading: 'Bunte Verpackungen / Kaufverhalten',
        motCleText: 'Sogenannte Quengelware an der Supermarktkasse / Comicfiguren für Kinderaugen',
        paragraphDe:
          'Verbraucherschützer kritisieren seit langem die Platzierung von Süßigkeiten direkt im Kassenbereich von Supermärkten. Durch leuchtende Farben und bekannte Comicfiguren auf den Verpackungen wird diese sogenannte Quengelware gezielt auf Augenhöhe von Kleinkindern präsentiert.',
        paragraphAr:
          'ينتقد حماة المستهلك وضع الحلويات الملونة برسوم كرتونية عند صناديق الأداء في المتاجر لجذب انتباه الأطفال.',
        explanationAr: 'الموكلي: Bunte Verpackungen / Supermarkt ↔ Quengelware an der Kasse / Comicfiguren.',
      },
      {
        origLetter: 'B',
        headingDe: 'Vom Luxusgut zur Massenware: Die Geschichte des Zuckers',
        headingAr: 'من سلعة فاخرة إلى منتج واسع الاستهلاك: تاريخ السكر',
        motCleHeading: 'Luxusgut zur Massenware / Geschichte des Zuckers',
        motCleText: 'Im Mittelalter teures Gewürz in Apotheken, heute billiger Rohstoff aus Zuckerrüben',
        paragraphDe:
          'Im Mittelalter war Rohrzucker in Europa so selten und kostbar wie Gold und wurde ausschließlich in Apotheken grammweise an Reiche verkauft. Erst als Wissenschaftler im 18. Jahrhundert entdeckten, wie man Zucker aus heimischen Zuckerrüben gewinnt, wurden Süßwaren für alle erschwinglich.',
        paragraphAr:
          'في العصور الوسطى كان السكر نادراً ويباع بالغرام في الصيدليات للأغنياء فقط، قبل اكتشاف استخراجه من الشمندر السكري.',
        explanationAr: 'الموكلي: Luxusgut zur Massenware ↔ Früher in Apotheken, heute aus Zuckerrüben.',
      },
    ]
  ),

  buildTeil1Topic(
    15,
    'schlafzug',
    'Schlafzug',
    'قطار النوم (Schlafzug)',
    '🔥 طايح (Agadir 2026)',
    'قصة قطار النوم (الأساسي GEBHJ | المعدل GEBJA | Z&K GEBHA): نهضة قطارات الليل في أوروبا (G) ⬅ بديل صديق للمناخ للطائرة (E) ⬅ راحة أكبر في المقصورات الحديثة (B) ⬅ تكاليف وعوائق تقنية عبر الحدود (H/J) ⬅ نصائح لتوفير المال عند حجز التذاكر (J/A).',
    [
      { key: 'original', label: 'الأساسي', code: 'GEBHJ' },
      { key: 'mod1', label: 'المعدل', code: 'GEBJA', changeNote: 'في المعدل النص 4 ولى J والنص 5 ولى A.' },
      { key: 'mod2', label: 'نسخة Z&K', code: 'GEBHA', changeNote: 'النص 5 فقط كيتبدل من J لـ A.' },
    ],
    [
      {
        origLetter: 'G',
        mod1Letter: 'G',
        mod2Letter: 'G',
        headingDe: 'Renaissance der Nachtzüge in Europa',
        headingAr: 'عودة وانتعاش قطارات الليل في أوروبا',
        motCleHeading: 'Renaissance der Nachtzüge in Europa',
        motCleText: 'ÖBB Nightjet und neue direkte Bahnverbindungen zwischen europäischen Metropolen',
        paragraphDe:
          'Nachdem viele Bahngesellschaften ihre Schlafwagen vor einigen Jahren eingestellt hatten, erlebt der Nachtzug in Europa nun ein beeindruckendes Comeback. Neue Direktverbindungen verbinden Berlin, Wien, Zürich, Paris und Rom über Nacht miteinander und sind oft Wochen im Voraus ausgebucht.',
        paragraphAr:
          'بعد أن أوقفت شركات السكك الحديدية عربات النوم سابقاً، يشهد قطار الليل في أوروبا عودة قوية بخطوط مباشرة بين العواصم.',
        explanationAr: 'الموكلي: Renaissance der Nachtzüge ↔ Comeback / neue Verbindungen zwischen Metropolen.',
      },
      {
        origLetter: 'E',
        mod1Letter: 'E',
        mod2Letter: 'E',
        headingDe: 'Klimafreundliche Alternative zum Kurzstreckenflug',
        headingAr: 'بديل صديق للمناخ للرحلات الجوية القصيرة',
        motCleHeading: 'Klimafreundliche Alternative zum Kurzstreckenflug',
        motCleText: 'Im Schlaf reisen und bis zu 90 Prozent CO2 gegenüber dem Flugzeug einsparen',
        paragraphDe:
          'Umweltbewusste Reisende steigen auf Strecken innerhalb Europas immer häufiger vom Flugzeug auf die Schiene um. Eine Fahrt im elektrisch betriebenen Nachtzug verursacht pro Passagier bis zu neunzig Prozent weniger klimaschädliches CO2 als ein vergleichbarer Kurzstreckenflug.',
        paragraphAr:
          'يوفر السفر بقطار الليل الكهربائي ما يصل إلى 90% من انبعاثات الكربون مقارنة بالرحلات الجوية القصيرة.',
        explanationAr: 'الموكلي: Klimafreundliche Alternative zum Flug ↔ 90 Prozent weniger CO2.',
      },
      {
        origLetter: 'B',
        mod1Letter: 'B',
        mod2Letter: 'B',
        headingDe: 'Mehr Komfort in modernen Schlafwagenabteilen',
        headingAr: 'راحة أكبر في مقصورات عربات النوم الحديثة',
        motCleHeading: 'Mehr Komfort in modernen Schlafwagenabteilen',
        motCleText: 'Eigene Dusche und WC, kostenloses WLAN, Frühstück am Platz und leise Waggons',
        paragraphDe:
          'Die Zeiten enger, lauter Abteile sind vorbei: Die neue Generation von Schlafwagen bietet Reisenden den Komfort eines rollenden Boutique-Hotels mit eigenem Bad samt Dusche, kostenlosem WLAN, bequemen Matratzen und einem frisch servierten Frühstück am Morgen.',
        paragraphAr:
          'توفر عربات النوم الجديدة راحة تضاهي الفنادق مع حمام خاص وويفي مجاني وهدوء وفطور ساخن في الصباح.',
        explanationAr: 'الموكلي: Mehr Komfort ↔ Eigene Dusche, WLAN und Frühstück am Platz.',
      },
      {
        origLetter: 'H',
        mod1Letter: 'J',
        mod2Letter: 'H',
        headingDe: 'Hohe Kosten und technische Hürden im grenzüberschreitenden Bahnverkehr',
        headingAr: 'تكاليف مرتفعة وعوائق تقنية في النقل السككي العابر للحدود',
        motCleHeading: 'Hohe Kosten und technische Hürden',
        motCleText: 'Unterschiedliche Stromsysteme, hohe Schienenmaut und Mangel an speziellen Waggons',
        paragraphDe:
          'Trotz der großen Nachfrage ist der Betrieb von Nachtzügen für Bahnunternehmen wirtschaftlich schwierig. Unterschiedliche Strom- und Signalsysteme an den Ländergrenzen, hohe Trassengebühren sowie der aufwendige Umbau der Betten machen den Betrieb deutlich teurer als tagsüber.',
        paragraphAr:
          'رغم الطلب الكبير يواجه تشغيل قطارات الليل صعوبات تقنية وتكاليف مرتفعة بسبب اختلاف أنظمة الكهرباء بين الدول.',
        explanationAr: '⚠️ انتبه: في الأساسي H وفي المعدل J! الموكلي هو unterschiedliche Stromsysteme / technische Hürden.',
      },
      {
        origLetter: 'J',
        mod1Letter: 'A',
        mod2Letter: 'A',
        headingDe: 'Spartipps für die Buchung von Nachtzugtickets',
        headingAr: 'نصائح لتوفير المال عند حجز تذاكر قطار الليل',
        motCleHeading: 'Spartipps für die Buchung',
        motCleText: 'Frühbucherrabatte bis zu sechs Monate im Voraus, Liegewagen für Familien und Interrail',
        paragraphDe:
          'Wer günstig im Schlafzug reisen möchte, sollte seine Fahrkarte möglichst frühzeitig – idealerweise drei bis sechs Monate vor Abfahrt – online reservieren. Besonders Familien und Gruppen sparen viel Geld, wenn sie ein ganzes Liegewagenabteil gemeinsam zum Pauschalpreis buchen.',
        paragraphAr:
          'من يريد السفر بسعر رخيص في قطار النوم عليه الحجز مبكراً قبل 3 إلى 6 أشهر أو حجز مقصورة عائلية كاملة.',
        explanationAr: '⚠️ انتبه: في الأساسي J وفي المعدل A! الموكلي هو Spartipps / Frühbucherrabatte.',
      },
    ]
  ),

  buildTeil1Topic(
    16,
    'programmierer-1',
    'Die Programmierer 1',
    'المبرمجين 1 (Programmierer 1)',
    '✅ كلاسيكي مهم',
    'قصة الكود DFGIJ: تعلم البرمجة في المدرسة (D) ⬅ خصاص كبير في مهندسي المعلوميات (F) ⬅ العمل من المنزل وأوقات مرنة (G) ⬅ تشجيع النساء في المهن التقنية (I) ⬅ الذكاء الاصطناعي يغير كتابة الكود (J).',
    [{ key: 'original', label: 'الأساسي', code: 'DFGIJ' }],
    [
      {
        origLetter: 'D',
        headingDe: 'Programmieren lernen schon in der Schule',
        headingAr: 'تعلم البرمجة منذ سنوات الدراسة',
        motCleHeading: 'Programmieren lernen in der Schule',
        motCleText: 'Informatik als Pflichtfach / Schüler entwickeln eigene kleine Spiele und Apps',
        paragraphDe:
          'Bildungsexperten fordern, dass Kinder nicht nur lernen, wie man digitale Geräte bedient, sondern auch, wie Software funktioniert. In immer mehr Schulen wird Informatik zum Pflichtfach, in dem Jugendliche spielerisch eigene kleine Apps und Webseiten programmieren.',
        paragraphAr:
          'يطالب خبراء التعليم بإدراج المعلوميات كمادة أساسية يتعلم فيها التلاميذ برمجة تطبيقات وألعاب بسيطة.',
        explanationAr: 'الموكلي: Programmieren in der Schule ↔ Informatik als Pflichtfach.',
      },
      {
        origLetter: 'F',
        headingDe: 'Großer Fachkräftemangel in der IT-Branche',
        headingAr: 'خصاص كبير في الكفاءات بقطاع تكنولوجيا المعلومات',
        motCleHeading: 'Fachkräftemangel in der IT-Branche',
        motCleText: 'Zehntausende offene Stellen für Softwareentwickler und IT-Sicherheitsexperten',
        paragraphDe:
          'In der deutschen Wirtschaft sind derzeit über hunderttausend Stellen für Softwareentwickler und IT-Sicherheitsspezialisten unbesetzt. Selbst mittelständische Handwerks- und Industriebetriebe suchen händeringend nach Experten für die Digitalisierung ihrer Prozesse.',
        paragraphAr:
          'توجد عشرات الآلاف من مناصب الشغل الشاغرة لمطوري البرامج وخبراء الأمن المعلوماتي في الشركات الألمانية.',
        explanationAr: 'الموكلي: Fachkräftemangel in der IT ↔ offene Stellen für Softwareentwickler.',
      },
      {
        origLetter: 'G',
        headingDe: 'Homeoffice und flexible Arbeitszeiten für Softwareentwickler',
        headingAr: 'العمل عن بعد وساعات عمل مرنة لمطوري البرامج',
        motCleHeading: 'Homeoffice und flexible Arbeitszeiten',
        motCleText: 'Ortsunabhängiges Arbeiten am Laptop von zu Hause aus ist in der IT Standard',
        paragraphDe:
          'Da Programmierer für ihre Arbeit meist nur einen leistungsfähigen Laptop und eine schnelle Internetverbindung benötigen, ist das Homeoffice in der Tech-Branche längst zum Standard geworden. Flexible Arbeitszeiten ermöglichen eine optimale Vereinbarkeit von Beruf und Privatleben.',
        paragraphAr:
          'بما أن المبرمج يحتاج فقط لحاسوب وإنترنت سريع، فقد أصبح العمل من المنزل (Homeoffice) معياراً أساسياً في هذا القطاع.',
        explanationAr: 'الموكلي: Homeoffice / flexible Arbeitszeiten ↔ Ortsunabhängiges Arbeiten am Laptop.',
      },
      {
        origLetter: 'I',
        headingDe: 'Frauen in technischen Berufen gezielt fördern',
        headingAr: 'تشجيع النساء بشكل موجه في المهن التقنية',
        motCleHeading: 'Frauen in technischen Berufen fördern',
        motCleText: 'Mentoring-Programme und Workshops an Universitäten steigern den Frauenanteil in der Informatik',
        paragraphDe:
          'Noch immer entscheiden sich deutlich weniger junge Frauen als Männer für ein Informatikstudium. Mit speziellen Mentoring-Programmen, Schnuppertagen an Hochschulen und weiblichen Vorbildern aus der Praxis wollen Universitäten und IT-Firmen das ändern.',
        paragraphAr:
          'تسعى الجامعات وشركات التكنولوجيا عبر برامج التوجيه والورشات إلى رفع نسبة النساء في تخصصات المعلوميات.',
        explanationAr: 'الموكلي: Frauen in technischen Berufen ↔ Mentoring-Programme / Informatikstudium.',
      },
      {
        origLetter: 'J',
        headingDe: 'Künstliche Intelligenz verändert das Schreiben von Code',
        headingAr: 'الذكاء الاصطناعي يغير طريقة كتابة الكود البرمجي',
        motCleHeading: 'Künstliche Intelligenz / Schreiben von Code',
        motCleText: 'Intelligente Assistenten schlagen Programmzeilen automatisch vor und finden Fehler',
        paragraphDe:
          'Moderne KI-Werkzeuge unterstützen Softwareentwickler heute direkt beim Tippen: Sie schlagen ganze Programmblöcke automatisch vor, übersetzen zwischen verschiedenen Programmiersprachen und spüren versteckte Sicherheitslücken im Quellcode in Sekundenschnelle auf.',
        paragraphAr:
          'تساعد أدوات الذكاء الاصطناعي الحديثة المبرمجين عبر اقتراح أسطر الكود تلقائياً واكتشاف الأخطاء البرمجية بسرعة.',
        explanationAr: 'الموكلي: Künstliche Intelligenz ↔ KI-Werkzeuge schlagen Programmzeilen vor.',
      },
    ]
  ),

  buildTeil1Topic(
    17,
    'programmierer-2',
    'Die Programmierer 2',
    'المبرمجين 2 (Programmierer 2)',
    '✅ كلاسيكي مهم',
    'قصة الكود DHGBI: نسخة المبرمجين الثانية بنفس المواضيع الخمسة ولكن بترتيب حروف D H G B I.',
    [{ key: 'original', label: 'الأساسي', code: 'DHGBI' }],
    [
      {
        origLetter: 'D',
        headingDe: 'Programmieren als Schlüsselkompetenz im Schulunterricht',
        headingAr: 'البرمجة كمهارة أساسية في التعليم المدرسي',
        motCleHeading: 'Programmieren im Schulunterricht',
        motCleText: 'Schüler lernen frühzeitig algorithmisches Denken und Coding',
        paragraphDe: 'Immer mehr Schulen führen Coding-AGs und Informatikunterricht ein, damit Kinder frühzeitig algorithmisches Denken verstehen und digitale Technik aktiv gestalten.',
        paragraphAr: 'تدرج المدارس دروس البرمجة مبكراً ليتعلم التلاميذ التفكير الخوارزمي وتصميم البرامج.',
        explanationAr: 'الموكلي: Schulunterricht ↔ Schüler lernen frühzeitig Coding.',
      },
      {
        origLetter: 'H',
        headingDe: 'Unternehmen suchen dringend IT-Spezialisten',
        headingAr: 'الشركات تبحث بشكل عاجل عن خبراء المعلوميات',
        motCleHeading: 'suchen dringend IT-Spezialisten',
        motCleText: 'Hohe Gehälter und unbesetzte Stellen für Programmierer',
        paragraphDe: 'Auf dem Arbeitsmarkt herrscht ein enormer Wettbewerb um qualifizierte Programmierer. Firmen locken Bewerber mit hohen Einstiegsgehältern und Weiterbildungsbudgets.',
        paragraphAr: 'يشهد سوق الشغل تنافساً كبيراً على المبرمجين المؤهلين مع رواتب مرتفعة.',
        explanationAr: 'الموكلي: suchen IT-Spezialisten ↔ Wettbewerb um qualifizierte Programmierer.',
      },
      {
        origLetter: 'G',
        headingDe: 'Arbeiten von überall dank digitaler Vernetzung',
        headingAr: 'العمل من أي مكان بفضل الربط الرقمي',
        motCleHeading: 'Arbeiten von überall',
        motCleText: 'Remote-Work und Cloud-Plattformen für Entwicklerteams',
        paragraphDe: 'Entwicklerteams arbeiten heute oft über verschiedene Städte und Zeitzonen verteilt im Homeoffice zusammen und tauschen ihren Code über gemeinsame Cloud-Plattformen aus.',
        paragraphAr: 'تعمل فرق المبرمجين عن بعد من مدن مختلفة عبر منصات السحابة الإلكترونية.',
        explanationAr: 'الموكلي: Arbeiten von überall ↔ Remote-Work im Homeoffice.',
      },
      {
        origLetter: 'B',
        headingDe: 'Mehr Vielfalt und weibliche Talente in der Tech-Welt',
        headingAr: 'تنوع أكبر ومواهب نسائية في عالم التكنولوجيا',
        motCleHeading: 'weibliche Talente in der Tech-Welt',
        motCleText: 'Netzwerke für Programmiererinnen fördern Karrierechancen',
        paragraphDe: 'Spezielle Netzwerke und Programmierkurse für Mädchen und Frauen sorgen dafür, dass gemischte Teams in Softwarefirmen immer häufiger innovative Produkte entwickeln.',
        paragraphAr: 'تساهم الشبكات والدورات الخاصة بالنساء في زيادة حضور المهندسات في شركات البرمجة.',
        explanationAr: 'الموكلي: weibliche Talente ↔ Netzwerke für Programmiererinnen.',
      },
      {
        origLetter: 'I',
        headingDe: 'Automatische Fehlersuche durch moderne Software-Tools',
        headingAr: 'البحث التلقائي عن الأخطاء بواسطة أدوات برمجية حديثة',
        motCleHeading: 'Automatische Fehlersuche',
        motCleText: 'KI-gestützte Analysewerkzeuge prüfen den Quellcode auf Bugs',
        paragraphDe: 'Moderne Analyseprogramme und künstliche Intelligenz nehmen Entwicklern routinemäßige Tests ab und finden Programmierfehler (Bugs), bevor die Software ausgeliefert wird.',
        paragraphAr: 'تقوم برامج التحليل الذكية باكتشاف الأخطاء البرمجية تلقائياً قبل إطلاق البرنامج.',
        explanationAr: 'الموكلي: Automatische Fehlersuche ↔ KI-gestützte Analysewerkzeuge finden Bugs.',
      },
    ]
  ),

  buildTeil1Topic(
    18,
    'programmierer-3',
    'Die Programmierer 3',
    'المبرمجين 3 (Programmierer 3)',
    '✅ أساسي + معدل (مع Krista)',
    'قصة الكود GCDIB: نسخة المبرمجين الثالثة (كتجي مع Krista و Feuerwehr) بكود G C D I B.',
    [{ key: 'original', label: 'الأساسي', code: 'GCDIB' }],
    [
      {
        origLetter: 'G',
        headingDe: 'Spielerischer Einstieg in die Welt der Computercodes für Kinder',
        headingAr: 'مدخل ترفيهي لعالم الأكواد البرمجية للأطفال',
        motCleHeading: 'Einstieg für Kinder',
        motCleText: 'Lernroboter und grafische Programmiersprachen in der Schule',
        paragraphDe: 'Mit kleinen Lernrobotern und bunten Programmierbausteinen lernen schon Zehnjährige, wie man einem Computer präzise Befehle erteilt.',
        paragraphAr: 'يتعلم الأطفال في سن العاشرة إعطاء أوامر دقيقة للحاسوب عبر روبوتات تعليمية.',
        explanationAr: 'الموكلي: für Kinder ↔ Lernroboter in der Schule.',
      },
      {
        origLetter: 'C',
        headingDe: 'Rekordnachfrage nach Software-Ingenieuren in der Industrie',
        headingAr: 'طلب قياسي على مهندسي البرمجيات في الصناعة',
        motCleHeading: 'Rekordnachfrage nach Software-Ingenieuren',
        motCleText: 'Automobilbau und Maschinenbau suchen dringend IT-Fachleute',
        paragraphDe: 'Nicht nur reine Internetfirmen, sondern vor allem der klassische Maschinen- und Automobilbau sucht dringend tausende Software-Ingenieure für moderne Steuerungen.',
        paragraphAr: 'تبحث شركات صناعة السيارات والآلات بشكل عاجل عن آلاف مهندسي البرمجيات.',
        explanationAr: 'الموكلي: Rekordnachfrage ↔ suchen dringend Software-Ingenieure.',
      },
      {
        origLetter: 'D',
        headingDe: 'Gute Work-Life-Balance durch ortsunabhängiges Programmieren',
        headingAr: 'توازن جيد بين العمل والحياة بفضل البرمجة عن بعد',
        motCleHeading: 'Work-Life-Balance / ortsunabhängig',
        motCleText: 'Freie Zeiteinteilung und Homeoffice für IT-Beschäftigte',
        paragraphDe: 'Die Möglichkeit, Projektaufgaben bei freier Zeiteinteilung von zu Hause aus zu erledigen, macht den Beruf des Programmierers für Familien besonders attraktiv.',
        paragraphAr: 'إمكانية إنجاز المهام من المنزل بتوقيت مرن تجعل مهنة المبرمج جذابة جداً للعائلات.',
        explanationAr: 'الموكلي: ortsunabhängig ↔ Freie Zeiteinteilung und Homeoffice.',
      },
      {
        origLetter: 'I',
        headingDe: 'Initiativen begeistern junge Frauen für das Informatikstudium',
        headingAr: 'مبادرات تحفز الشابات على دراسة المعلوميات',
        motCleHeading: 'junge Frauen / Informatikstudium',
        motCleText: 'Stipendien und Programmier-Camps speziell für Studentinnen',
        paragraphDe: 'Durch gezielte Stipendien und Sommer-Camps an Technischen Universitäten steigt die Zahl der Studienanfängerinnen im Fach Informatik kontinuierlich an.',
        paragraphAr: 'بفضل المنح والمخيمات الصيفية بالجامعات التقنية ترتفع نسبة الطالبات في المعلوميات.',
        explanationAr: 'الموكلي: junge Frauen ↔ Studienanfängerinnen im Fach Informatik.',
      },
      {
        origLetter: 'B',
        headingDe: 'Hilfe durch künstliche Intelligenz bei der Softwareentwicklung',
        headingAr: 'مساعدة الذكاء الاصطناعي في تطوير البرمجيات',
        motCleHeading: 'künstliche Intelligenz / Softwareentwicklung',
        motCleText: 'Automatische Code-Generierung beschleunigt die Arbeit der Programmierer',
        paragraphDe: 'Dank moderner KI-Systeme, die Standardfunktionen automatisch generieren, bleibt den Entwicklern mehr Zeit für kreative Architektur und komplexe Problemlösungen.',
        paragraphAr: 'بفضل أنظمة الذكاء الاصطناعي التي تولد الدوال الروتينية، يربح المبرمجون الوقت للحلول الإبداعية.',
        explanationAr: 'الموكلي: künstliche Intelligenz ↔ Automatische Code-Generierung.',
      },
    ]
  ),

  buildTeil1Topic(
    19,
    'kellner-jugend-forscht',
    'Jugend forscht / Kellner',
    'النادل / مسابقة الشباب الباحث (Kellner)',
    '🔥 مع تعديلات (Agadir 2026)',
    'قصة الكود JHBAE: مخترعون شباب في مسابقة (J) ⬅ عمل النادل في نهاية الأسبوع للطلبة (H) ⬅ خصاص في العمال بالمطاعم والمقاهي (B) ⬅ روبوتات تساعد النادل في تقديم الأطباق (A) ⬅ اللباقة وحسن المعاملة تجذب الزبناء (E).',
    [{ key: 'original', label: 'الأساسي', code: 'JHBAE' }],
    [
      {
        origLetter: 'J',
        headingDe: 'Junge Erfinder präsentieren kreative Projekte beim Wettbewerb',
        headingAr: 'مخترعون شباب يقدمون مشاريع إبداعية في المسابقة',
        motCleHeading: 'Junge Erfinder / Wettbewerb',
        motCleText: 'Jugend forscht / Schüler entwickeln Lösungen für Umwelt und Technik',
        paragraphDe: 'Beim bundesweiten Wettbewerb „Jugend forscht“ zeigen Schülerinnen und Schüler jedes Jahr beeindruckende eigene Erfindungen aus Biologie, Physik und Umwelttechnik.',
        paragraphAr: 'في المسابقة الوطنية للشباب الباحث يعرض التلاميذ اختراعاتهم المذهلة في مجالات البيئة والتقنية.',
        explanationAr: 'الموكلي: Junge Erfinder / Wettbewerb ↔ Jugend forscht / eigene Erfindungen.',
      },
      {
        origLetter: 'H',
        headingDe: 'Nebenjob in der Gastronomie beliebt bei Studierenden',
        headingAr: 'العمل الجزئي في المطاعم محبوب لدى الطلبة',
        motCleHeading: 'Nebenjob in der Gastronomie / Studierende',
        motCleText: 'Kellnern am Wochenende und Abend / gutes Trinkgeld und flexible Schichten',
        paragraphDe: 'Für viele Studierende ist das Kellnern in Cafés und Restaurants der ideale Nebenjob: Die Schichten am Abend und Wochenende lassen sich gut mit den Vorlesungen kombinieren und das Trinkgeld bessert das Budget sofort auf.',
        paragraphAr: 'يعتبر العمل كنادل في المقاهي والمطاعم عملاً جزئياً مثالياً للطلبة بفضل الإكراميات (Trinkgeld) وتوقيت المساء.',
        explanationAr: 'الموكلي: Nebenjob / Studierende ↔ Kellnern am Wochenende / Trinkgeld.',
      },
      {
        origLetter: 'B',
        headingDe: 'Personalmangel in Restaurants und Cafés',
        headingAr: 'نقص اليد العاملة في المطاعم والمقاهي',
        motCleHeading: 'Personalmangel in Restaurants',
        motCleText: 'Viele Gastronomiebetriebe müssen Öffnungszeiten verkürzen, weil Servicekräfte fehlen',
        paragraphDe: 'Zahlreiche Gaststätten suchen vergeblich nach ausgebildetem Servicepersonal und Köchen. Aus Personalmangel müssen manche Restaurants bereits zusätzliche Ruhetage einführen.',
        paragraphAr: 'تبحث العديد من المطاعم دون جدوى عن طهاة وندل، مما يضطرها لتقليص ساعات العمل.',
        explanationAr: 'الموكلي: Personalmangel ↔ Öffnungszeiten verkürzen / Servicekräfte fehlen.',
      },
      {
        origLetter: 'A',
        headingDe: 'Roboter unterstützen das Servicepersonal im Restaurant',
        headingAr: 'الروبوتات تدعم طاقم الخدمة في المطعم',
        motCleHeading: 'Roboter unterstützen das Servicepersonal',
        motCleText: 'Moderne Servierroboter fahren schwere Tabletts zur Unterstützung der Kellner zum Tisch',
        paragraphDe: 'In einigen modernen Restaurants rollen bereits autonome Servierroboter durch den Gastraum: Sie transportieren schwere Teller aus der Küche zum Tisch und zurück, damit die Kellner mehr Zeit für die Beratung der Gäste haben.',
        paragraphAr: 'في بعض المطاعم الحديثة تقوم روبوتات الخدمة بنقل الأطباق الثقيلة من المطبخ إلى الطاولة لمساعدة النادل.',
        explanationAr: 'الموكلي: Roboter unterstützen ↔ Servierroboter transportieren Teller.',
      },
      {
        origLetter: 'E',
        headingDe: 'Gute Umgangsformen und Freundlichkeit zahlen sich aus',
        headingAr: 'حسن المعاملة واللباقة يؤتيان ثمارهما',
        motCleHeading: 'Gute Umgangsformen und Freundlichkeit',
        motCleText: 'Schulungen für Servicekräfte / aufmerksame Bedienung sorgt für zufriedene Stammgäste',
        paragraphDe: 'Ein herzliches Lächeln und kompetente Beratung sind durch nichts zu ersetzen. Hotels investieren verstärkt in Kommunikationsschulungen für ihr Personal, denn freundlich bediente Gäste kommen gerne wieder.',
        paragraphAr: 'الابتسامة وحسن الاستقبال لا يعوضان؛ فالمطاعم تستثمر في تكوين موظفيها لأن الزبون الراضي يعود دائماً.',
        explanationAr: 'الموكلي: Freundlichkeit ↔ Schulungen für Servicekräfte / zufriedene Gäste.',
      },
    ]
  ),

  buildTeil1Topic(
    20,
    'alpen',
    'In den Alpen (1 & 2 & 3)',
    'جبال الألب (In den Alpen)',
    '🔥 الألب المعدل (Agadir 2026)',
    'قصة الألب (الأساسي FDBAE | المعدل 1 HDBAE | المعدل 2 DGEHI): ذوبان الجليد بسبب المناخ (1) ⬅ نصائح السلامة للمتجولين في الجبال (2) ⬅ الحياة في المراعي الجبلية صيفاً (3) ⬅ الحماية من الانهيارات الثلجية شتاءً (4) ⬅ خطوط قطار وأنفاق جديدة عبر الألب (5).',
    [
      { key: 'original', label: 'الأساسي', code: 'FDBAE' },
      { key: 'mod1', label: 'المعدل 1', code: 'HDBAE', changeNote: 'النص 1 فقط كيتبدل من F لـ H!' },
      { key: 'mod2', label: 'المعدل 2', code: 'DGEHI', changeNote: 'نسخة معدلة ثانية بكود DGEHI.' },
    ],
    [
      {
        origLetter: 'F',
        mod1Letter: 'H',
        mod2Letter: 'D',
        headingDe: 'Klimawandel lässt Gletscher in den Alpen schmelzen',
        headingAr: 'التغير المناخي يذيب الأنهار الجليدية في جبال الألب',
        motCleHeading: 'Gletscher schmelzen',
        motCleText: 'Steigende Temperaturen im Hochgebirge / Rückgang des ewigen Eises',
        paragraphDe: 'Durch die steigenden Durchschnittstemperaturen im Hochgebirge verlieren die Alpengletscher jedes Jahr dramatisch an Volumen. Wo früher dickes ewiges Eis lag, sind heute oft nur noch graue Geröllfelder zu sehen.',
        paragraphAr: 'بسبب ارتفاع درجات الحرارة تفقد الأنهار الجليدية في جبال الألب حجمها بسرعة كبيرة كل عام.',
        explanationAr: 'الموكلي: Gletscher schmelzen ↔ Rückgang des ewigen Eises im Hochgebirge.',
      },
      {
        origLetter: 'D',
        mod1Letter: 'D',
        mod2Letter: 'G',
        headingDe: 'Sicherheitstipps für Bergwanderer',
        headingAr: 'نصائح السلامة لمتسلقي ومتجولي الجبال',
        motCleHeading: 'Sicherheitstipps für Bergwanderer',
        motCleText: 'Feste Wanderschuhe, Wetterbericht prüfen und eigene Kondition nicht überschätzen',
        paragraphDe: 'Die Bergwacht muss im Sommer oft unvorbereitete Touristen retten. Wer in den Alpen wandert, sollte feste Bergschuhe tragen, Regenkleidung einpacken und vor dem Start unbedingt den aktuellen Wetterbericht prüfen.',
        paragraphAr: 'تنصح فرق الإنقاذ الجبلي بارتداء أحذية متينة ومراقبة حالة الطقس قبل الانطلاق في جولات جبال الألب.',
        explanationAr: 'الموكلي: Sicherheitstipps ↔ Feste Bergschuhe und Wetterbericht prüfen.',
      },
      {
        origLetter: 'B',
        mod1Letter: 'B',
        mod2Letter: 'E',
        headingDe: 'Traditionelles Leben auf der Alm im Sommer',
        headingAr: 'الحياة التقليدية في المراعي الجبلية خلال الصيف',
        motCleHeading: 'Leben auf der Alm im Sommer',
        motCleText: 'Sennerinnen betreuen Kühe auf den Bergwiesen und stellen Almkäse her',
        paragraphDe: 'Von Juni bis September ziehen Hirten und Sennerinnen mit ihren Kühen hinauf auf die saftigen Bergwiesen. Fernab vom Tal melken sie die Tiere täglich und verarbeiten die frische Milch direkt auf der Hütte zu würzigem Almkäse.',
        paragraphAr: 'من يونيو إلى شتنبر يصعد الرعاة بالأبقار إلى المراعي الجبلية العالية لصنع جبن الألب الطبيعي.',
        explanationAr: 'الموكلي: Leben auf der Alm ↔ Kühe auf Bergwiesen und Almkäse.',
      },
      {
        origLetter: 'A',
        mod1Letter: 'A',
        mod2Letter: 'H',
        headingDe: 'Schutz vor Lawinen im Winter',
        headingAr: 'الحماية من الانهيارات الثلجية في الشتاء',
        motCleHeading: 'Schutz vor Lawinen im Winter',
        motCleText: 'Schutzwälder, Lawinenverbauungen und Warndienste für Skifahrer',
        paragraphDe: 'Nach starkem Schneefall steigt im Winter die Gefahr von Schneebrettern. Stabile Schutzwälder, Stahlnetze am Berghang und tägliche Lawinenwarnberichte schützen Bergdörfer und Wintersportler.',
        paragraphAr: 'تحمي الغابات الجبلية والحواجز الفولاذية ونشرات الإنذار القرى والمتزلجين من خطر الانهيارات الثلجية.',
        explanationAr: 'الموكلي: Schutz vor Lawinen ↔ Schutzwälder und Lawinenwarnberichte.',
      },
      {
        origLetter: 'E',
        mod1Letter: 'E',
        mod2Letter: 'I',
        headingDe: 'Neue Zug- und Tunnelverbindungen durch die Alpen',
        headingAr: 'خطوط قطار وأنفاق جديدة عبر جبال الألب',
        motCleHeading: 'Zug- und Tunnelverbindungen',
        motCleText: 'Moderne Eisenbahntunnel verlagern den Lkw-Güterverkehr von der Straße auf die Schiene',
        paragraphDe: 'Mit neuen tiefen Eisenbahntunneln wie dem Brenner- und Gotthard-Basistunnel soll der schwere Lkw-Güterverkehr zwischen Nord- und Südeuropa künftig schneller und umweltschonender auf die Schiene verlagert werden.',
        paragraphAr: 'تهدف أنفاق السكك الحديدية الجديدة عبر الألب إلى نقل حركة الشاحنات الثقيلة من الطرق إلى القطارات.',
        explanationAr: 'الموكلي: Tunnelverbindungen ↔ Eisenbahntunnel verlagern Güterverkehr auf die Schiene.',
      },
    ]
  ),

  buildTeil1Topic(
    21,
    'kartoffeln',
    'Kartoffeln',
    'البطاطا (Kartoffeln)',
    '🔥 طايح جوج مرات (Agadir 2026)',
    'قصة البطاطا (الأساسي DGBHI | المعدل CFBGI): كيف وصلت البطاطا من أمريكا الجنوبية لأوروبا (1) ⬅ غذاء صحي قليل السعرات وغني بالفيتامينات (2) ⬅ عودة الأصناف القديمة للبطاطا (3) ⬅ التخزين الصحيح في قبو مظلم وبارد (4) ⬅ أطباق البطاطا المحبوبة (5).',
    [
      { key: 'original', label: 'الأساسي', code: 'DGBHI' },
      { key: 'mod1', label: 'المعدل', code: 'CFBGI', changeNote: 'تغيير حروف 1 و 2 و 4 مع بقاء نفس النصوص (3=B و 5=I بقاو نفسهم!).' },
    ],
    [
      {
        origLetter: 'D',
        mod1Letter: 'C',
        headingDe: 'Wie die Kartoffel aus Südamerika nach Europa kam',
        headingAr: 'كيف وصلت البطاطا من أمريكا الجنوبية إلى أوروبا',
        motCleHeading: 'aus Südamerika nach Europa',
        motCleText: 'Ursprung in den Anden / Friedrich der Große machte die Knolle in Preußen bekannt',
        paragraphDe: 'Ursprünglich stammt die Kartoffel aus den südamerikanischen Anden. Als sie im 16. Jahrhundert nach Europa kam, hielt man sie wegen ihrer schönen Blüten zunächst für eine Zierpflanze, bevor König Friedrich der Große ihren Anbau gegen Hungersnöte befahl.',
        paragraphAr: 'يعود أصل البطاطا إلى جبال الأنديز بأمريكا الجنوبية، قبل أن يأمر الملك فريدريش الكبير بزراعتها في بروسيا لمحاربة المجاعة.',
        explanationAr: 'الموكلي: Südamerika nach Europa ↔ Anden / Friedrich der Große in Preußen.',
      },
      {
        origLetter: 'G',
        mod1Letter: 'F',
        headingDe: 'Gesundes Nahrungsmittel mit wenig Kalorien und vielen Vitaminen',
        headingAr: 'غذاء صحي قليل السعرات الحرارية وغني بالفيتامينات',
        motCleHeading: 'wenig Kalorien und viele Vitamine',
        motCleText: 'Kein Dickmacher: Gekochte Kartoffeln enthalten kaum Fett, aber Kalium und Vitamin C',
        paragraphDe: 'Zu Unrecht gilt die Kartoffel als Dickmacher. Gekochte Salzkartoffeln bestehen zu fast achtzig Prozent aus Wasser, enthalten kaum Fett, machen lange satt und liefern hochwertiges Eiweiß, Kalium sowie Vitamin C.',
        paragraphAr: 'البطاطا المسلوقة ليست مسببة للسمنة كما يعتقد البعض؛ فهي قليلة الدهون وغنية بالبوتاسيوم وفيتامين C.',
        explanationAr: 'الموكلي: wenig Kalorien / Vitamine ↔ kaum Fett, Kalium und Vitamin C.',
      },
      {
        origLetter: 'B',
        mod1Letter: 'B',
        headingDe: 'Alte Kartoffelsorten feiern ein Comeback',
        headingAr: 'أصناف البطاطا القديمة تحتفل بعودتها',
        motCleHeading: 'Alte Kartoffelsorten / Comeback',
        motCleText: 'Blaue, violette und rotschalige Knollen auf Wochenmärkten wieder gefragt',
        paragraphDe: 'Auf Wochenmärkten und in der Spitzengastronomie sind fast vergessene historische Kartoffelsorten mit violettem, blauem oder rötlichem Fleisch und nussigem Geschmack wieder sehr gefragt.',
        paragraphAr: 'عادت أصناف البطاطا التاريخية القديمة ذات اللون البنفسجي والأحمر والمذاق المميز بقوة إلى الأسواق.',
        explanationAr: 'الموكلي: Alte Kartoffelsorten ↔ violette und blaue Knollen auf Wochenmärkten.',
      },
      {
        origLetter: 'H',
        mod1Letter: 'G',
        headingDe: 'Richtige Lagerung im dunklen und kühlen Keller',
        headingAr: 'التخزين الصحيح في قبو مظلم وبارد',
        motCleHeading: 'Richtige Lagerung / Keller',
        motCleText: 'Kühl, luftig und vor Licht geschützt aufbewahren, damit keine grünen Stellen entstehen',
        paragraphDe: 'Damit Kartoffeln zu Hause über Wochen frisch bleiben und nicht keimen, sollten sie an einem dunklen, luftigen und kühlen Ort bei etwa sechs bis zehn Grad gelagert werden, da sie bei Licht giftiges Solanin bilden.',
        paragraphAr: 'للحفاظ على البطاطا طازجة لأسابيع يجب تخزينها في مكان مظلم وبارد ومهوى حتى لا تنبت أو تخضر.',
        explanationAr: 'الموكلي: Richtige Lagerung ↔ dunkel, luftig und kühl lagern.',
      },
      {
        origLetter: 'I',
        mod1Letter: 'I',
        headingDe: 'Beliebte Kartoffelgerichte von Pommes bis Kartoffelsalat',
        headingAr: 'أطباق البطاطا المحبوبة من البطاطس المقلية إلى سلطة البطاطا',
        motCleHeading: 'Beliebte Kartoffelgerichte',
        motCleText: 'Vielseitige Zubereitung in der Küche: Bratkartoffeln, Püree, Klöße und Pommes frites',
        paragraphDe: 'Kaum ein anderes Lebensmittel lässt sich in der Küche so vielseitig zubereiten: Ob als knusprige Bratkartoffeln, cremiges Püree, Klöße am Sonntag oder Pommes frites – jeder hat sein eigenes Lieblingsgericht.',
        paragraphAr: 'نادراً ما نجد غذاءً متنوع التحضير في المطبخ مثل البطاطا سواء كسلطة أو مهروسة أو مقلية.',
        explanationAr: 'الموكلي: Beliebte Kartoffelgerichte ↔ Bratkartoffeln, Püree, Pommes.',
      },
    ]
  ),

  buildTeil1Topic(
    22,
    'gedaechtnis',
    'Gedächtnis (Alpha Special)',
    'الذاكرة والدماغ (Gedächtnis)',
    '🔥 نسخة Alpha 2026',
    'قصة الكود AICHE: كيف تخزن الذاكرة المعلومات (A) ⬅ النوم ضروري للتعلم (I) ⬅ تقنيات أبطال العالم في الذاكرة (C) ⬅ التوتر وتعدد المهام يضران بالتركيز (H) ⬅ التغذية والرياضة تنشطان الدماغ (E).',
    [{ key: 'original', label: 'الأساسي', code: 'AICHE' }],
    [
      {
        origLetter: 'A',
        headingDe: 'Wie das menschliche Gedächtnis Informationen speichert',
        headingAr: 'كيف تخزن الذاكرة البشرية المعلومات',
        motCleHeading: 'Informationen speichert',
        motCleText: 'Zusammenspiel von Kurzzeit- und Langzeitgedächtnis über Synapsen im Gehirn',
        paragraphDe: 'Jede Sekunde nimmt unser Gehirn unzählige Sinneseindrücke auf, doch nur ein Bruchteil gelangt vom Kurzzeit- in das Langzeitgedächtnis, wo Informationen durch feste Verbindungen zwischen den Nervenzellen (Synapsen) dauerhaft gespeichert werden.',
        paragraphAr: 'يستقبل دماغنا آلاف الإشارات كل ثانية، ولا ينتقل من الذاكرة القصيرة إلى الطويلة إلا ما يرتبط عبر المشابك العصبية.',
        explanationAr: 'الموكلي: Informationen speichert ↔ Kurzzeit- und Langzeitgedächtnis / Synapsen.',
      },
      {
        origLetter: 'I',
        headingDe: 'Schlaf ist entscheidend für das Lernen',
        headingAr: 'النوم حاسم لعملية التعلم',
        motCleHeading: 'Schlaf ist entscheidend für das Lernen',
        motCleText: 'Im Tiefschlaf sortiert und festigt das Gehirn neu gelernte Vokabeln und Fakten',
        paragraphDe: 'Wer vor einer wichtigen Prüfung die ganze Nacht durchlernt, schadet seinem Gedächtnis: Erst während der nächtlichen Tiefschlafphasen wiederholt, sortiert und verankert das Gehirn den am Tag gelernten Stoff.',
        paragraphAr: 'أثناء مراحل النوم العميق ليلاً يقوم الدماغ بترتيب وتثبيت الكلمات والمعلومات التي تعلمها الإنسان خلال النهار.',
        explanationAr: 'الموكلي: Schlaf / Lernen ↔ Im Tiefschlaf sortiert und festigt das Gehirn Lernstoff.',
      },
      {
        origLetter: 'C',
        headingDe: 'Merktechniken der Gedächtnisweltmeister',
        headingAr: 'تقنيات الحفظ لدى أبطال العالم في الذاكرة',
        motCleHeading: 'Merktechniken der Gedächtnisweltmeister',
        motCleText: 'Loci-Methode / Zahlen und Wörter mit lebendigen Bildern im Kopf verknüpfen',
        paragraphDe: 'Gedächtnissportler können sich in wenigen Minuten hunderte Zufallszahlen merken. Ihr Geheimnis ist die sogenannte Loci-Methode, bei der abstrakte Begriffe mit lustigen Bildern an einem bekannten Spazierweg im Kopf verknüpft werden.',
        paragraphAr: 'يعتمد أبطال الذاكرة على تقنية قصر الذاكرة (Loci-Methode) عبر ربط الأرقام والكلمات بصور ذهنية حية.',
        explanationAr: 'الموكلي: Merktechniken ↔ Loci-Methode / Zahlen mit Bildern verknüpfen.',
      },
      {
        origLetter: 'H',
        headingDe: 'Stress und Multitasking schaden der Konzentration',
        headingAr: 'التوتر وتعدد المهام يضران بالتركيز',
        motCleHeading: 'Stress und Multitasking schaden',
        motCleText: 'Das Stresshormon Cortisol blockiert das Abrufen von gespeichertem Wissen',
        paragraphDe: 'Ständiges Wechseln zwischen E-Mails, Telefonaten und Texten überfordert unsere Aufmerksamkeit. Zudem sorgt dauerhafter Zeitdruck dafür, dass das Stresshormon Cortisol den Zugriff auf gespeichertes Wissen blockiert.',
        paragraphAr: 'التنقل المستمر بين عدة مهام والتوتر يؤديان لإفراز هرمون الكورتيزول الذي يعيق استرجاع المعلومات.',
        explanationAr: 'الموكلي: Stress und Multitasking ↔ Stresshormon Cortisol blockiert Wissen.',
      },
      {
        origLetter: 'E',
        headingDe: 'Ernährung und Bewegung fördern die geistige Fitness',
        headingAr: 'التغذية والحركة تعززان اللياقة الذهنية',
        motCleHeading: 'Ernährung und Bewegung / geistige Fitness',
        motCleText: 'Nüsse, Beeren, ausreichend Wasser und Ausdauersport versorgen das Gehirn mit Sauerstoff',
        paragraphDe: 'Ein leistungsfähiges Gehirn braucht guten Treibstoff: Ausreichend Wasser, Omega-3-Fettsäuren aus Nüssen sowie regelmäßige Bewegung an der frischen Luft fördern die Durchblutung und halten den Geist wach.',
        paragraphAr: 'شرب الماء الكافي وتناول المكسرات وممارسة الرياضة في الهواء الطلق ينشط الدورة الدموية في الدماغ.',
        explanationAr: 'الموكلي: Ernährung und Bewegung ↔ Nüsse, Wasser und Ausdauersport für Durchblutung.',
      },
    ]
  ),

  buildTeil1Topic(
    23,
    'bienen',
    'Bienen',
    'النحل (Bienen)',
    '✅ كلاسيكي مهم',
    'قصة الكود BDFCI: حماية النحل البري في الحديقة (B) ⬅ العسل كمضاد حيوي طبيعي (D) ⬅ خطر الطفيليات والمبيدات (F) ⬅ تجربة تربية النحل للمبتدئين (C) ⬅ لغة رقص النحل للتواصل (I).',
    [{ key: 'original', label: 'الأساسي', code: 'BDFCI' }],
    [
      {
        origLetter: 'B',
        headingDe: 'Wildbienen im eigenen Garten schützen',
        headingAr: 'حماية النحل البري في الحديقة الخاصة',
        motCleHeading: 'Wildbienen im Garten schützen',
        motCleText: 'Insektenhotels und heimische Wildblumen statt sterilem Schottergarten',
        paragraphDe: 'Mit heimischen Wildblumen und kleinen Insektenhotels aus Holz kann jeder Gartenbesitzer bedrohten Wildbienen wertvolle Nistplätze und Nahrung bieten.',
        paragraphAr: 'عبر زراعة الأزهار البرية ووضع فنادق خشبية للحشرات يمكن لكل صاحب حديقة حماية النحل البري.',
        explanationAr: 'الموكلي: Wildbienen im Garten ↔ Insektenhotels und Wildblumen.',
      },
      {
        origLetter: 'D',
        headingDe: 'Honig als natürliches Heilmittel',
        headingAr: 'العسل كعلاج ومضاد طبيعي',
        motCleHeading: 'Honig als natürliches Heilmittel',
        motCleText: 'Entzündungshemmende Enzyme im Bienenhonig helfen bei Wunden und Erkältung',
        paragraphDe: 'Schon in der Antike wurde naturbelassener Bienenhonig wegen seiner antibakteriellen und entzündungshemmenden Enzyme zur Wundpflege und bei Husten eingesetzt.',
        paragraphAr: 'استعمل العسل الطبيعي منذ القدم بفضل إنزيماته المضادة للبكتيريا والالتهابات لعلاج الجروح والسعال.',
        explanationAr: 'الموكلي: Honig als Heilmittel ↔ antibakterielle Enzyme bei Wunden und Husten.',
      },
      {
        origLetter: 'F',
        headingDe: 'Krankheiten und Pestizide gefährden Bienenvölker',
        headingAr: 'الأمراض والمبيدات تهدد خلايا النحل',
        motCleHeading: 'Krankheiten und Pestizide',
        motCleText: 'Die eingeschleppte Varroamilbe und Pflanzenschutzmittel schwächen die Bienen',
        paragraphDe: 'Imker kämpfen weltweit gegen den Verlust ganzer Völker: Vor allem die parasitäre Varroamilbe und chemische Pflanzenschutzmittel setzen den Honigbienen stark zu.',
        paragraphAr: 'يعاني مربو النحل من موت الخلايا بسبب طفيل الفاروا والمبيدات الكيميائية.',
        explanationAr: 'الموكلي: Krankheiten und Pestizide ↔ Varroamilbe und Pflanzenschutzmittel.',
      },
      {
        origLetter: 'C',
        headingDe: 'Imkern auf Probe für Einsteiger',
        headingAr: 'تجربة تربية النحل للمبتدئين',
        motCleText: 'Imkervereine bieten einjährige Schnupperkurse mit eigenem Pflegevolk an',
        motCleHeading: 'Imkern auf Probe',
        paragraphDe: 'Viele lokale Imkervereine bieten ein „Imkern auf Probe“ an, bei dem Neulinge ein Jahr lang unter Anleitung erfahrener Paten ein Bienenvolk betreuen lernen.',
        paragraphAr: 'تقدم جمعيات مربي النحل دورات تجريبية لمدة سنة يتعلم فيها المبتدئون العناية بخلية نحل.',
        explanationAr: 'الموكلي: Imkern auf Probe ↔ Schnupperkurse im Imkerverein.',
      },
      {
        origLetter: 'I',
        headingDe: 'Die faszinierende Tanzsprache der Bienen',
        headingAr: 'لغة الرقص المذهلة لدى النحل',
        motCleHeading: 'Tanzsprache der Bienen',
        motCleText: 'Durch den Schwänzeltanz im Stock zeigen Sammlerinnen Richtung und Entfernung von Blüten',
        paragraphDe: 'Um ihren Artgenossinnen im dunklen Bienenstock genau mitzuteilen, in welcher Richtung und Entfernung eine reiche Blumenwiese liegt, führen Bienen einen präzisen Schwänzeltanz auf.',
        paragraphAr: 'لتحديد اتجاه ومسافة الأزهار لباقي الخلية، تؤدي النحلات رقصة اهتزازية دقيقة (Schwänzeltanz).',
        explanationAr: 'الموكلي: Tanzsprache ↔ Schwänzeltanz zeigt Richtung und Entfernung.',
      },
    ]
  ),

  buildTeil1Topic(
    24,
    'schulen-einschulung',
    'Schulen / Einschulung',
    'الدخول المدرسي (Einschulung)',
    '✅ كلاسيكي مهم',
    'قصة الكود FEBGH: تقليد قمع الحلوى المدرسي (F) ⬅ طريق آمن للمدرسة (E) ⬅ مدارس اليوم الكامل تساعد الآباء العاملين (B) ⬅ المحفظة المناسبة تحمي الظهر (G) ⬅ التعلم بدون ضغط النقط (H).',
    [{ key: 'original', label: 'الأساسي', code: 'FEBGH' }],
    [
      {
        origLetter: 'F',
        headingDe: 'Die Schultüte hat eine lange Tradition',
        headingAr: 'قمع الحلوى المدرسي (Schultüte) له تقليد طويل',
        motCleHeading: 'Schultüte / Tradition',
        motCleText: 'Seit dem 19. Jahrhundert bekommen Erstklässler am ersten Schultag eine gefüllte Zuckertüte',
        paragraphDe: 'In Deutschland gehört die bunte Schultüte seit über zweihundert Jahren zum ersten Schultag dazu. Gefüllt mit Stiften, kleinen Geschenken und Süßigkeiten versüßt sie den Schulanfängern den großen Tag.',
        paragraphAr: 'في ألمانيا يعد قمع الحلوى الملون تقليداً منذ قرنين يفرح به تلاميذ السنة الأولى في أول يوم دراسي.',
        explanationAr: 'الموكلي: Schultüte / Tradition ↔ Zuckertüte am ersten Schultag.',
      },
      {
        origLetter: 'E',
        headingDe: 'Sicherer Schulweg für Erstklässler',
        headingAr: 'طريق آمن إلى المدرسة لتلاميذ السنة الأولى',
        motCleHeading: 'Sicherer Schulweg',
        motCleText: 'Eltern sollten die Strecke vorab üben / helle Kleidung und Verzicht auf Elterntaxis',
        paragraphDe: 'Polizei und Verkehrswacht raten Eltern, den Schulweg schon vor der Einschulung mehrfach zu Fuß mit dem Kind zu üben und auf das gefährliche Vorfahren mit dem Auto („Elterntaxi“) direkt vor das Schultor zu verzichten.',
        paragraphAr: 'تنصح الشرطة الآباء بالتدرب مع الطفل على طريق المدرسة سيراً على الأقدام وتجنب الازدحام بالسيارات أمام الباب.',
        explanationAr: 'الموكلي: Sicherer Schulweg ↔ Strecke zu Fuß üben / Verkehrswacht.',
      },
      {
        origLetter: 'B',
        headingDe: 'Ganztagsschulen entlasten berufstätige Eltern',
        headingAr: 'مدارس اليوم الكامل تخفف العبء عن الآباء العاملين',
        motCleHeading: 'Ganztagsschulen / berufstätige Eltern',
        motCleText: 'Warmes Mittagessen, Hausaufgabenbetreuung und Nachmittagsangebote bis 16 Uhr',
        paragraphDe: 'Durch den Ausbau von Ganztagsschulen mit warmem Mittagessen, betreuter Lernzeit und Sport-AGs am Nachmittag können Mütter und Väter Familie und Vollzeitberuf deutlich besser vereinbaren.',
        paragraphAr: 'بفضل مدارس اليوم الكامل التي توفر الغداء ومرافقة الواجبات حتى الرابعة عصراً، يسهل على الآباء التوفيق بين العمل والأسرة.',
        explanationAr: 'الموكلي: Ganztagsschulen ↔ Mittagessen und Betreuung am Nachmittag.',
      },
      {
        origLetter: 'G',
        headingDe: 'Der richtige Schulranzen schont den Kinderrücken',
        headingAr: 'المحفظة المدرسية المناسبة تحمي ظهر الطفل',
        motCleHeading: 'Schulranzen schont den Rücken',
        motCleText: 'Ergonomische Polsterung, geringes Eigengewicht und Reflektoren beim Ranzenkauf',
        paragraphDe: 'Beim Kauf des ersten Schulranzens sollten Eltern auf ein geringes Eigengewicht, gepolsterte Tragegurte und leuchtende Reflektoren achten, damit die Wirbelsäule der Kinder nicht überlastet wird.',
        paragraphAr: 'عند شراء المحفظة المدرسية يجب الانتباه لخفة وزنها وأحزمتها المبطنة لحماية العمود الفقري للطفل.',
        explanationAr: 'الموكلي: Schulranzen / Rücken ↔ Ergonomische Polsterung und geringes Gewicht.',
      },
      {
        origLetter: 'H',
        headingDe: 'Lernen ohne Notendruck in den ersten Schuljahren',
        headingAr: 'التعلم بدون ضغط النقط في السنوات الدراسية الأولى',
        motCleHeading: 'ohne Notendruck',
        motCleText: 'Schriftliche Lernentwicklungsberichte statt klassischer Ziffernnoten von 1 bis 6',
        paragraphDe: 'In den ersten beiden Grundschuljahren verzichten viele Schulen auf klassische Ziffernnoten. Stattdessen erhalten die Kinder ermutigende Berichte, die ihre individuellen Fortschritte beschreiben.',
        paragraphAr: 'تستغني العديد من المدارس في السنتين الأوليين عن النقط الرقمية وتستبدلها بتقارير تشجيعية تصف تطور الطفل.',
        explanationAr: 'الموكلي: ohne Notendruck ↔ Verzicht auf Ziffernnoten.',
      },
    ]
  ),

  buildTeil1Topic(
    25,
    'kinder-handy',
    'Kinder Handy',
    'هواتف الأطفال (Kinder Handy)',
    '✅ كلاسيكي مهم',
    'قصة الكود CFEBJ: السن المناسب لأول هاتف (C) ⬅ قواعد واضحة لوقت الشاشة (F) ⬅ مخاطر التنمر الإلكتروني ومصاريف الألعاب (E) ⬅ تطبيقات التعلم المفيدة (B) ⬅ قدوة الآباء في استعمال الهاتف (J).',
    [{ key: 'original', label: 'الأساسي', code: 'CFEBJ' }],
    [
      {
        origLetter: 'C',
        headingDe: 'Ab welchem Alter ist das erste Smartphone sinnvoll?',
        headingAr: 'ابتداءً من أي سن يصبح أول هاتف ذكي منطقياً؟',
        motCleHeading: 'Ab welchem Alter / erstes Smartphone',
        motCleText: 'Meist beim Wechsel auf die weiterführende Schule mit etwa zehn bis elf Jahren',
        paragraphDe: 'Medienpädagogen empfehlen ein eigenes internetfähiges Smartphone meist erst ab dem Wechsel auf die weiterführende Schule im Alter von zehn oder elf Jahren.',
        paragraphAr: 'ينصح خبراء التربية بإعطاء الهاتف الذكي المتصل بالإنترنت عند الانتقال للإعدادي في سن 10 أو 11 سنة.',
        explanationAr: 'الموكلي: Ab welchem Alter ↔ zehn bis elf Jahren.',
      },
      {
        origLetter: 'F',
        headingDe: 'Klare Regeln für die tägliche Bildschirmzeit vereinbaren',
        headingAr: 'الاتفاق على قواعد واضحة لوقت الشاشة اليومي',
        motCleHeading: 'Klare Regeln / Bildschirmzeit',
        motCleText: 'Mediennutzungsvertrag zwischen Eltern und Kindern legt handyfreie Zeiten fest',
        paragraphDe: 'Ein gemeinsam unterschriebener Mediennutzungsvertrag hilft Familien, feste Zeitlimits pro Tag sowie handyfreie Zonen beim Abendessen und vor dem Schlafengehen einzuhalten.',
        paragraphAr: 'يساعد الاتفاق المكتوب بين الآباء والأبناء على تحديد ساعات استعمال الهاتف ومنعه أثناء الأكل وقبل النوم.',
        explanationAr: 'الموكلي: Klare Regeln / Bildschirmzeit ↔ Mediennutzungsvertrag.',
      },
      {
        origLetter: 'E',
        headingDe: 'Gefahren durch Cybermobbing und versteckte Kostenfallen',
        headingAr: 'مخاطر التنمر الإلكتروني وفخاخ المصاريف الخفية',
        motCleHeading: 'Cybermobbing und Kostenfallen',
        motCleText: 'Beleidigungen in Klassenchats und teure In-App-Käufe in kostenlosen Handyspielen',
        paragraphDe: 'In WhatsApp-Klassenchats kommt es oft zu Ausgrenzung und Cybermobbing, während vermeintlich kostenlose Spiele durch In-App-Käufe schnell hohe Rechnungen verursachen.',
        paragraphAr: 'تشكل مجموعات الدردشة خطر التنمر الإلكتروني، كما قد تتسبب المشتريات داخل الألعاب في فواتير باهظة.',
        explanationAr: 'الموكلي: Cybermobbing / Kostenfallen ↔ Klassenchats und In-App-Käufe.',
      },
      {
        origLetter: 'B',
        headingDe: 'Lern-Apps sinnvoll für die Schule nutzen',
        headingAr: 'استغلال تطبيقات التعلم بشكل مفيد للمدرسة',
        motCleHeading: 'Lern-Apps sinnvoll nutzen',
        motCleText: 'Vokabeltrainer und Mathe-Quizze auf dem Handy fördern die Motivation beim Üben',
        paragraphDe: 'Richtig eingesetzt ist das Smartphone ein tolles Lernwerkzeug: Interaktive Vokabeltrainer und Mathe-Apps motivieren Kinder durch spielerische Punkte zum täglichen Üben.',
        paragraphAr: 'عند استعماله بشكل صحيح يصبح الهاتف أداة رائعة لحفظ المفردات وتمارين الرياضيات التفاعلية.',
        explanationAr: 'الموكلي: Lern-Apps ↔ Vokabeltrainer und Mathe-Apps.',
      },
      {
        origLetter: 'J',
        headingDe: 'Vorbildfunktion der Eltern beim eigenen Medienkonsum',
        headingAr: 'دور القدوة لدى الآباء في استهلاكهم الخاص لوسائل الإعلام',
        motCleHeading: 'Vorbildfunktion der Eltern',
        motCleText: 'Kinder ahmen das Verhalten von Mutter und Vater am Esstisch und auf dem Spielplatz nach',
        paragraphDe: 'Kinder orientieren sich stark am Verhalten der Erwachsenen: Wer von seinem Kind verlangt, das Handy wegzulegen, sollte auch selbst beim Gespräch nicht ständig auf das Display blicken.',
        paragraphAr: 'يقلد الأطفال سلوك الكبار؛ لذلك يجب على الآباء أن يكونوا قدوة حسنة وعدم الانشغال بالهاتف أثناء الحديث مع أطفالهم.',
        explanationAr: 'الموكلي: Vorbildfunktion der Eltern ↔ Verhalten der Erwachsenen nachahmen.',
      },
    ]
  ),

  buildTeil1Topic(
    26,
    'trampoline',
    'Trampoline',
    'الترامبولين (Trampoline)',
    '🔥 طايح (Agadir 2026)',
    'قصة الكود IFEJB: تمرين كامل للجسم يحمي المفاصل (I) ⬅ تجنب خطر الحوادث في الحديقة (F) ⬅ قاعات الترامبولين وجهة رائعة عند المطر (E) ⬅ أصل رياضة الترامبولين لدى بهلوانيي السيرك (J) ⬅ نصائح مهمة عند شراء الترامبولين (B).',
    [{ key: 'original', label: 'الأساسي', code: 'IFEJB' }],
    [
      {
        origLetter: 'I',
        headingDe: 'Gelenkschonendes Ganzkörpertraining auf dem Trampolin',
        headingAr: 'تمرين شامل للجسم ولطيف على المفاصل فوق الترامبولين',
        motCleHeading: 'Gelenkschonendes Ganzkörpertraining',
        motCleText: 'Fitness-Trampolin stärkt Tiefenmuskulatur, Ausdauer und verbrennt viele Kalorien',
        paragraphDe: 'Schwingen und Springen auf dem Fitness-Trampolin beansprucht über vierhundert Muskeln gleichzeitig, verbrennt effektiv Kalorien und schont dank der elastischen Federung die Kniegelenke.',
        paragraphAr: 'القفز على الترامبولين الرياضي يحرك أكثر من 400 عضلة ويحرق السعرات الحرارية مع حماية مفاصل الركبة.',
        explanationAr: 'الموكلي: Gelenkschonendes Ganzkörpertraining ↔ 400 Muskeln und elastische Federung.',
      },
      {
        origLetter: 'F',
        headingDe: 'Unfallgefahr auf dem Gartentrampolin vermeiden',
        headingAr: 'تجنب خطر الحوادث على ترامبولين الحديقة',
        motCleHeading: 'Unfallgefahr im Garten vermeiden',
        motCleText: 'Kinderärzte warnen vor Zusammenstößen: Immer nur eine Person gleichzeitig springen lassen',
        paragraphDe: 'Unfallchirurgen behandeln im Sommer viele Knochenbrüche, weil mehrere Kinder gleichzeitig auf dem Gartentrampolin hüpfen. Wichtigste Sicherheitsregel: Ein stabiles Sicherheitsnetz und immer nur ein Springer zur selben Zeit.',
        paragraphAr: 'يحذر الأطباء من قفز عدة أطفال في نفس الوقت لتجنب الاصطدامات والكسور، مع ضرورة وجود شبكة أمان.',
        explanationAr: 'الموكلي: Unfallgefahr vermeiden ↔ Sicherheitsnetz und nur eine Person gleichzeitig.',
      },
      {
        origLetter: 'E',
        headingDe: 'Trampolinhallen als beliebtes Ausflugsziel bei Regenwetter',
        headingAr: 'قاعات الترامبولين كوجهة ترفيهية مفضلة في الطقس الممطر',
        motCleHeading: 'Trampolinhallen / Regenwetter',
        motCleText: 'Riesige Indoor-Sprungparks mit Schaumstoffgruben für Kindergeburtstage und Familien',
        paragraphDe: 'Wenn es draußen regnet, bieten große Indoor-Trampolinhallen mit Dutzenden verbundenen Sprungflächen und weichen Schaumstoffgruben actionreichen Spaß für Familien und Kindergeburtstage.',
        paragraphAr: 'عندما تمطر في الخارج توفر قاعات الترامبولين المغطاة متعة كبيرة للعائلات وأعياد ميلاد الأطفال.',
        explanationAr: 'الموكلي: Trampolinhallen / Regenwetter ↔ Indoor-Sprungparks für Familien.',
      },
      {
        origLetter: 'J',
        headingDe: 'Ursprung des Trampolinsports bei Zirkusakrobaten',
        headingAr: 'أصل رياضة الترامبولين لدى بهلوانيي السيرك',
        motCleHeading: 'Ursprung bei Zirkusakrobaten',
        motCleText: 'George Nissen ließ sich 1930 von den Sicherheitsnetzen der Trapez-Künstler im Zirkus inspirieren',
        paragraphDe: 'Der Amerikaner George Nissen beobachtete in den 1930er Jahren Trapez-Akrobaten im Zirkus, die aus ihren Sicherheitsnetzen federnd in die Luft sprangen, und baute daraufhin in seiner Garage das erste moderne Trampolin.',
        paragraphAr: 'استوحى الأمريكي جورج نيسن عام 1930 فكرة أول ترامبولين حديث من شباك الأمان لبهلوانيي السيرك.',
        explanationAr: 'الموكلي: Ursprung / Zirkusakrobaten ↔ George Nissen und Sicherheitsnetze im Zirkus.',
      },
      {
        origLetter: 'B',
        headingDe: 'Worauf man beim Kauf eines Trampolins achten sollte',
        headingAr: 'ما يجب الانتباه إليه عند شراء الترامبولين',
        motCleHeading: 'beim Kauf achten',
        motCleText: 'TÜV-Prüfsiegel, gepolsterte Randabdeckung über den Stahlfedern und stabiler Rahmen',
        paragraphDe: 'Vor dem Kauf sollten Verbraucher unbedingt auf das TÜV/GS-Prüfsiegel, einen rostfreien Stahlrahmen und eine dick gepolsterte Randabdeckung über den Federn achten.',
        paragraphAr: 'قبل الشراء يجب التأكد من شهادة الجودة TÜV ووجود إطار فولاذي متين وغطاء مبطن فوق النوابض.',
        explanationAr: 'الموكلي: beim Kauf achten ↔ TÜV-Prüfsiegel und gepolsterte Randabdeckung.',
      },
    ]
  ),

  buildTeil1Topic(
    27,
    'farben',
    'Farben',
    'الألوان وتأثيرها (Farben)',
    '🔥 طايح (Agadir 2026)',
    'قصة الكود GABCJ: كيف تتحكم الألوان في مشاعرنا وقرارات الشراء (G) ⬅ ألوان الجدران تجعل الغرف تبدو أكبر أو أدفأ (A) ⬅ الأصباغ الطبيعية من النباتات والمعادن (B) ⬅ لماذا يرى بعض الناس الألوان بشكل مختلف / عمى الألوان (C) ⬅ دلالة الألوان في الثقافات المختلفة (J).',
    [{ key: 'original', label: 'الأساسي', code: 'GABCJ' }],
    [
      {
        origLetter: 'G',
        headingDe: 'Wie Farben unsere Gefühle und Kaufentscheidungen steuern',
        headingAr: 'كيف توجه الألوان مشاعرنا وقرارات الشراء لدينا',
        motCleHeading: 'Gefühle und Kaufentscheidungen',
        motCleText: 'Farbpsychologie in der Werbung: Rot weckt Aufmerksamkeit, Blau schafft Vertrauen',
        paragraphDe: 'Werbepsychologen nutzen gezielt die Wirkung von Farben: Während Rot im Supermarkt Aufmerksamkeit für Sonderangebote weckt, setzen Banken und Versicherungen auf beruhigendes Blau, das Seriosität und Vertrauen ausstrahlt.',
        paragraphAr: 'يستغل خبراء الإعلان علم نفس الألوان؛ فالأحمر يجذب الانتباه للتخفيضات بينما يوحي الأزرق بالثقة والجدية.',
        explanationAr: 'الموكلي: Gefühle und Kaufentscheidungen ↔ Farbpsychologie in der Werbung.',
      },
      {
        origLetter: 'A',
        headingDe: 'Wandfarben lassen Räume größer oder gemütlicher wirken',
        headingAr: 'ألوان الجدران تجعل الغرف تبدو أكبر أو أكثر دفئاً',
        motCleHeading: 'Wandfarben / Räume größer',
        motCleText: 'Innenarchitektur: Helle Pastelltöne weiten kleine Zimmer, warme Erdtöne schaffen Gemütlichkeit',
        paragraphDe: 'Mit dem richtigen Farbanstrich lässt sich die Wirkung eines Zimmers komplett verändern: Helle Blau- und Weißtöne lassen kleine Räume optisch weiter wirken, während warme Gelb- und Erdtöne große Wohnzimmer gemütlich machen.',
        paragraphAr: 'تجعل الألوان الفاتحة الغرف الصغيرة تبدو أوسع بصرياً، بينما تمنح الألوان الترابية الدافئة جواً مريحاً.',
        explanationAr: 'الموكلي: Wandfarben / Räume ↔ Helle Töne weiten kleine Zimmer.',
      },
      {
        origLetter: 'B',
        headingDe: 'Natürliche Farbstoffe aus Pflanzen und Mineralien',
        headingAr: 'أصباغ طبيعية مستخرجة من النباتات والمعادن',
        motCleHeading: 'Natürliche Farbstoffe aus Pflanzen',
        motCleText: 'Ökologische Textilfärbung mit Indigo, Krappwurzel, Kurkuma und Ockererde',
        paragraphDe: 'Vor der Erfindung synthetischer Chemie-Farben wurden Textilien und Gemälde ausschließlich mit Pigmenten aus der Natur gefärbt – etwa mit blauem Indigo, gelbem Kurkuma oder mineralischer Ockererde.',
        paragraphAr: 'قبل اختراع الألوان الكيميائية كانت الأقمشة واللوحات تصبغ بمواد طبيعية من النباتات مثل النيلة والكركم والمعادن.',
        explanationAr: 'الموكلي: Natürliche Farbstoffe ↔ Indigo, Kurkuma und Ockererde.',
      },
      {
        origLetter: 'C',
        headingDe: 'Warum manche Menschen Farben anders sehen',
        headingAr: 'لماذا يرى بعض الناس الألوان بطريقة مختلفة',
        motCleHeading: 'Farben anders sehen',
        motCleText: 'Angeborene Rot-Grün-Sehschwäche betrifft vor allem Männer / Zapfen auf der Netzhaut',
        paragraphDe: 'Rund acht Prozent aller Männer, aber nur knapp ein halbes Prozent der Frauen haben eine angeborene Rot-Grün-Sehschwäche, weil bestimmte Sinneszellen auf der Netzhaut des Auges anders reagieren.',
        paragraphAr: 'يعاني حوالي 8% من الرجال من ضعف خلقي في التمييز بين اللونين الأحمر والأخضر بسبب خلايا شبكية العين.',
        explanationAr: 'الموكلي: Farben anders sehen ↔ Rot-Grün-Sehschwäche / Netzhaut.',
      },
      {
        origLetter: 'J',
        headingDe: 'Unterschiedliche Bedeutung von Farben in verschiedenen Kulturen',
        headingAr: 'اختلاف دلالة الألوان باختلاف الثقافات',
        motCleHeading: 'Bedeutung in verschiedenen Kulturen',
        motCleText: 'Schwarz steht in Europa für Trauer, während in Teilen Asiens Weiß die Trauerfarbe ist',
        paragraphDe: 'Die Symbolik einer Farbe ist keineswegs überall auf der Welt gleich: Während in Europa Schwarz als Farbe der Trauer gilt, tragen Menschen in vielen asiatischen Ländern bei Beerdigungen weiße Kleidung.',
        paragraphAr: 'تختلف رمزية الألوان بين الشعوب؛ فبينما يرمز الأسود للحزن في أوروبا، يرتدي الناس الأبيض في الجنازات بآسيا.',
        explanationAr: 'الموكلي: verschiedene Kulturen ↔ Schwarz in Europa vs. Weiß in Asien.',
      },
    ]
  ),

  buildTeil1Topic(
    28,
    'sandfisch',
    'Fische / Sandfisch (NEU 2026)',
    'الأسماك وسمكة الرمل (Sandfisch NEU 2026)',
    '🆕 جديد NEU THEMA 2026',
    'قصة الكود BFIJH: سحلية سمكة الرمل كنموذج للتقنية الحديثة (B) ⬅ وقف الصيد الجائر في المحيطات (F) ⬅ تربية الأسماك المستدامة (I) ⬅ دهون أوميغا 3 الصحية في سمك البحر (J) ⬅ الشعاب المرجانية مهددة كحاضنة للبحار (H).',
    [{ key: 'original', label: 'الأساسي', code: 'BFIJH' }],
    [
      {
        origLetter: 'B',
        headingDe: 'Der Sandfisch als Vorbild für moderne Technik',
        headingAr: 'سمكة الرمل كنموذج ملهم للتكنولوجيا الحديثة',
        motCleHeading: 'Sandfisch als Vorbild für Technik',
        motCleText: 'Bionik in der Wüste: Extrem glatte Schuppen der Wüstenechse inspirieren abriebfeste Oberflächen',
        paragraphDe: 'Der sogenannte Sandfisch ist eigentlich eine kleine Echse in der Sahara, die sich blitzschnell wie ein Fisch durch den heißen Wüstensand bewegt. Bionik-Forscher untersuchen ihre extrem reibungsarmen Schuppen, um kratzfeste Industriebeschichtungen zu entwickeln.',
        paragraphAr: 'سمكة الرمل هي في الحقيقة سحلية صحراوية تغوص في الرمال كالسمكة، ويدرس العلماء حراشفها الملساء لتطوير أسطح صناعية مقاومة للاحتكاك.',
        explanationAr: 'الموكلي: Sandfisch / Vorbild für Technik ↔ Bionik in der Wüste / Schuppen.',
      },
      {
        origLetter: 'F',
        headingDe: 'Überfischung der Weltmeere durch Fangquoten stoppen',
        headingAr: 'وقف الصيد الجائر في محيطات العالم عبر حصص الصيد',
        motCleHeading: 'Überfischung der Weltmeere stoppen',
        motCleText: 'Internationale Schutzgebiete und strenge Fangobergrenzen sichern das Überleben der Fischbestände',
        paragraphDe: 'Viele Speisefischarten sind durch riesige Fangflotten akut bedroht. Meeresbiologen fordern größere Schutzgebiete und strenge Fangquoten, damit sich die Bestände erholen können.',
        paragraphAr: 'يطالب علماء الأحياء البحرية بمحميات بحرية وحصص صيد صارمة لوقف الصيد الجائر في المحيطات.',
        explanationAr: 'الموكلي: Überfischung stoppen ↔ Schutzgebiete und Fangquoten.',
      },
      {
        origLetter: 'I',
        headingDe: 'Aquakultur und nachhaltige Fischzucht an Land',
        headingAr: 'الاستزراع المائي وتربية الأسماك المستدامة',
        motCleHeading: 'Aquakultur und nachhaltige Fischzucht',
        motCleText: 'Geschlossene Kreislaufanlagen züchten Speisefische ohne Antibiotika und Meeresverschmutzung',
        paragraphDe: 'Moderne Aquakultur-Anlagen mit geschlossenen Wasserkreisläufen ermöglichen heute eine nachhaltige Fischzucht ganz ohne Antibiotika und schonen dabei die natürlichen Wildbestände.',
        paragraphAr: 'تتيح أحواض الاستزراع المائي الحديثة تربية الأسماك بشكل مستدام وبدون مضادات حيوية.',
        explanationAr: 'الموكلي: Aquakultur / Fischzucht ↔ Geschlossene Kreislaufanlagen.',
      },
      {
        origLetter: 'J',
        headingDe: 'Gesunde Omega-3-Fettsäuren aus Seefisch',
        headingAr: 'أحماض أوميغا 3 الدهنية الصحية من أسماك البحر',
        motCleHeading: 'Omega-3-Fettsäuren aus Seefisch',
        motCleText: 'Lachs, Makrele und Hering liefern Jod, Eiweiß und wichtige Fettsäuren für Herz und Gehirn',
        paragraphDe: 'Ernährungsgesellschaften empfehlen ein- bis zweimal pro Woche Seefisch wie Lachs, Hering oder Makrele zu essen, da dieser reich an Jod und wertvollen Omega-3-Fettsäuren ist.',
        paragraphAr: 'ينصح خبراء التغذية بتناول أسماك البحر مثل السلمون والماكريل مرتين أسبوعياً لغناها باليود وأوميغا 3.',
        explanationAr: 'الموكلي: Omega-3-Fettsäuren ↔ Lachs, Makrele und Hering.',
      },
      {
        origLetter: 'H',
        headingDe: 'Korallenriffe als Kinderstube der Meere bedroht',
        headingAr: 'الشعاب المرجانية مهددة باعتبارها حاضنة البحار',
        motCleHeading: 'Korallenriffe bedroht',
        motCleText: 'Erwärmung des Meerwassers führt zur Korallenbleiche und zerstört den Lebensraum junger Fische',
        paragraphDe: 'Tropische Korallenriffe bieten einem Viertel aller Meeresfische Schutz zur Aufzucht ihrer Jungen, doch die steigende Wassertemperatur führt weltweit zu einer dramatischen Korallenbleiche.',
        paragraphAr: 'توفر الشعاب المرجانية المأوى لربع أسماك البحر، لكن ارتفاع حرارة المياه يهددها بابيضاض المرجان.',
        explanationAr: 'الموكلي: Korallenriffe bedroht ↔ Korallenbleiche / Kinderstube der Meere.',
      },
    ]
  ),

  buildTeil1Topic(
    29,
    'kleinkindern-fernsehen',
    'Medizin / Kleinkindern Fernsehen (NEU 2026)',
    'الأطفال الصغار والتلفاز (Kleinkindern Fernsehen NEU 2026)',
    '🆕 جديد NEU THEMA 2026',
    'قصة الكود HADEI: كثرة التلفاز تضر بنمو اللغة عند الصغار (H) ⬅ قراءة القصص تنمي الخيال والرصيد اللغوي (A) ⬅ أطباء الأطفال ينصحون بوقت بدون شاشة قبل النوم (D) ⬅ المشاهدة المشتركة ومناقشة المحتوى مع الطفل (E) ⬅ اللعب في الهواء الطلق يقي من قصر النظر (I).',
    [{ key: 'original', label: 'الأساسي', code: 'HADEI' }],
    [
      {
        origLetter: 'H',
        headingDe: 'Zu viel Fernsehen schadet der Sprachentwicklung von Kleinkindern',
        headingAr: 'كثرة مشاهدة التلفاز تضر بنمو اللغة لدى الأطفال الصغار',
        motCleHeading: 'schadet der Sprachentwicklung',
        motCleText: 'Passiver Bildschirmkonsum unter drei Jahren verzögert das Sprechenlernen',
        paragraphDe: 'Kinderärzte warnen davor, Kleinkinder unter drei Jahren vor dem Fernseher oder Tablet zu parken: Ohne echtes Gespräch mit Bezugspersonen verzögert sich der aktive Spracherwerb deutlich.',
        paragraphAr: 'يحذر أطباء الأطفال من ترك الصغار دون سن الثالثة أمام التلفاز لأن ذلك يؤخر تعلمهم للنطق والكلام.',
        explanationAr: 'الموكلي: schadet der Sprachentwicklung ↔ verzögert das Sprechenlernen.',
      },
      {
        origLetter: 'A',
        headingDe: 'Vorlesen fördert Fantasie und Wortschatz',
        headingAr: 'قراءة القصص بصوت عالٍ تنمي الخيال والرصيد اللغوي',
        motCleHeading: 'Vorlesen fördert Fantasie und Wortschatz',
        motCleText: 'Gemeinsames Anschauen von Bilderbüchern bereitet optimal auf die Schule vor',
        paragraphDe: 'Schon fünfzehn Minuten tägliches Vorlesen aus altersgerechten Bilderbüchern erweitert den Wortschatz von Vorschulkindern enorm und regt ihre eigene Vorstellungskraft an.',
        paragraphAr: 'قراءة القصص المصورة للأطفال لمدة 15 دقيقة يومياً توسع رصيدهم اللغوي وتنمي خيالهم.',
        explanationAr: 'الموكلي: Vorlesen / Wortschatz ↔ Bilderbücher anschauen.',
      },
      {
        origLetter: 'D',
        headingDe: 'Kinderärzte empfehlen bildschirmfreie Zeiten vor dem Schlafen',
        headingAr: 'أطباء الأطفال يوصون بأوقات خالية من الشاشات قبل النوم',
        motCleHeading: 'bildschirmfreie Zeiten vor dem Schlafen',
        motCleText: 'Mindestens eine Stunde vor dem Zubettgehen Fernseher und Tablet ausschalten',
        paragraphDe: 'Schnelle Bildwechsel und spannende Cartoons am Abend wühlen Kinder emotional auf. Experten raten, mindestens eine Stunde vor dem Schlafengehen alle Bildschirme auszuschalten.',
        paragraphAr: 'الرسوم المتحركة السريعة في المساء تزعج نوم الأطفال، لذا ينصح بإطفاء الشاشات ساعة قبل النوم.',
        explanationAr: 'الموكلي: vor dem Schlafen ↔ eine Stunde vor dem Zubettgehen ausschalten.',
      },
      {
        origLetter: 'E',
        headingDe: 'Gemeinsam schauen und über die Inhalte sprechen',
        headingAr: 'المشاهدة المشتركة والتحدث حول المضامين',
        motCleHeading: 'Gemeinsam schauen / sprechen',
        motCleText: 'Eltern sollten Kinder beim Fernsehen begleiten und Fragen zur Sendung beantworten',
        paragraphDe: 'Wenn Kindergartenkinder eine kurze Sendung anschauen, sollten Eltern dabeibleiben, gemeinsam über das Gesehene sprechen und unverständliche oder gruselige Szenen sofort erklären.',
        paragraphAr: 'عندما يشاهد الطفل برنامجاً قصيراً يجب أن يرافقه الوالدان لمناقشة ما شاهده والإجابة عن أسئلته.',
        explanationAr: 'الموكلي: Gemeinsam schauen ↔ Eltern begleiten und über Gesehene sprechen.',
      },
      {
        origLetter: 'I',
        headingDe: 'Bewegung im Freien beugt Kurzsichtigkeit bei Kindern vor',
        headingAr: 'الحركة في الهواء الطلق تقي الأطفال من قصر النظر',
        motCleHeading: 'Kurzsichtigkeit vorbeugen',
        motCleText: 'Tageslicht und der Blick in die Ferne beim Spielen draußen schützen die Augen',
        paragraphDe: 'Augenärzte beobachten weltweit eine Zunahme von Kurzsichtigkeit bei Kindern durch langes Starren auf nahe Bildschirme. Mindestens zwei Stunden Spielen im Freien bei Tageslicht schützt das wachsende Auge.',
        paragraphAr: 'اللعب في الهواء الطلق وضوء النهار لمدة ساعتين يومياً يحمي عيون الأطفال من قصر النظر الناتج عن الشاشات.',
        explanationAr: 'الموكلي: Kurzsichtigkeit vorbeugen ↔ Augenärzte / Spielen im Freien.',
      },
    ]
  ),

  buildTeil1Topic(
    30,
    'baeder',
    'Bäder (NEU 2026)',
    'المسابح والحمامات المعدنية (Bäder NEU 2026)',
    '🆕 جديد NEU THEMA 2026',
    'قصة الكود BAFDI: الحمامات الحرارية ذات التاريخ الطويل (B) ⬅ المسابح المكشوفة تعاني من تكاليف الطاقة ونقص الموظفين (A) ⬅ تعلم السباحة ينقذ الأرواح (F) ⬅ الساونا تقوي المناعة في الشتاء (D) ⬅ بحيرات السباحة الطبيعية بتصفية بيولوجية بدون كلور (I).',
    [{ key: 'original', label: 'الأساسي', code: 'BAFDI' }],
    [
      {
        origLetter: 'B',
        headingDe: 'Thermalbäder und Heilquellen mit jahrhundertealter Geschichte',
        headingAr: 'الحمامات الحرارية والينابيع العلاجية ذات التاريخ الممتد لقرون',
        motCleHeading: 'Thermalbäder / Geschichte',
        motCleText: 'Schon die Römer nutzten warme Mineralquellen in Kurorten wie Baden-Baden',
        paragraphDe: 'Schon die alten Römer schätzten die heilende Wirkung heißer Mineralquellen und bauten prächtige Thermen in Kurorten wie Baden-Baden oder Aachen.',
        paragraphAr: 'عرف الرومان القدامى الفوائد العلاجية للينابيع المعدنية الساخنة وشيدوا حمامات تاريخية في بادن-بادن.',
        explanationAr: 'الموكلي: Thermalbäder / Geschichte ↔ Römer und heiße Mineralquellen.',
      },
      {
        origLetter: 'A',
        headingDe: 'Kommunale Freibäder kämpfen mit hohen Energiekosten und Personalmangel',
        headingAr: 'المسابح البلدية تعاني من ارتفاع تكاليف الطاقة ونقص الموظفين',
        motCleHeading: 'Freibäder / Energiekosten und Personalmangel',
        motCleText: 'Städte suchen dringend Rettungsschwimmer und Bademeister / teure Wasserheizung',
        paragraphDe: 'Viele städtische Schwimmbäder schreiben rote Zahlen, weil das Beheizen der Becken immer teurer wird und im Sommer ausgebildete Bademeister und Rettungsschwimmer fehlen.',
        paragraphAr: 'تعاني المسابح العمومية من ارتفاع فاتورة تسخين المياه ونقص معلمي السباحة والمنقذين.',
        explanationAr: 'الموكلي: Energiekosten / Personalmangel ↔ Bademeister fehlen.',
      },
      {
        origLetter: 'F',
        headingDe: 'Frühzeitige Schwimmkurse retten Kinderleben',
        headingAr: 'دروس السباحة المبكرة تنقذ حياة الأطفال',
        motCleHeading: 'Schwimmkurse retten Leben',
        motCleText: 'DLRG fordert verpflichtenden Schwimmunterricht ab dem Vorschulalter gegen Badeunfälle',
        paragraphDe: 'Immer mehr Grundschulkinder können nicht sicher schwimmen. Wasserrettungsorganisationen wie die DLRG fordern flächendeckende Schwimmkurse, um tragische Badeunfälle im Sommer zu verhindern.',
        paragraphAr: 'تطالب هيئات الإنقاذ المائي بتعميم دروس السباحة للأطفال منذ الصغر لمنع حوادث الغرق في الصيف.',
        explanationAr: 'الموكلي: Schwimmkurse retten Leben ↔ DLRG gegen Badeunfälle.',
      },
      {
        origLetter: 'D',
        headingDe: 'Regelmäßiger Saunabesuch stärkt das Immunsystem im Winter',
        headingAr: 'الزيارة المنتظمة للساونا تقوي جهاز المناعة في الشتاء',
        motCleHeading: 'Saunabesuch / Immunsystem',
        motCleText: 'Wechsel zwischen heißem Dampf und kaltem Tauchbecken trainiert die Blutgefäße',
        paragraphDe: 'Der Wechsel zwischen neunzig Grad heißer Saunaluft und dem anschließenden kalten Tauchbad trainiert die Blutgefäße und härtet den Körper wirksam gegen winterliche Erkältungen ab.',
        paragraphAr: 'التناوب بين هواء الساونا الساخن والماء البارد يدرب الأوعية الدموية ويقوي مناعة الجسم في الشتاء.',
        explanationAr: 'الموكلي: Saunabesuch ↔ Wechsel zwischen Hitze und Kälte.',
      },
      {
        origLetter: 'I',
        headingDe: 'Naturbadeseen mit biologischer Wasserreinigung ganz ohne Chlor',
        headingAr: 'بحيرات سباحة طبيعية بتصفية بيولوجية للمياه بدون كلور',
        motCleHeading: 'biologische Wasserreinigung ohne Chlor',
        motCleText: 'Wasserpflanzen und Kiesfilter reinigen das Badewasser für Menschen mit empfindlicher Haut',
        paragraphDe: 'In modernen Naturbädern übernehmen spezielle Schilfpflanzen und Kiesfilter die Reinigung des Wassers komplett biologisch – ein großer Vorteil für Badegäste, die auf Chlor mit gereizten Augen reagieren.',
        paragraphAr: 'في المسابح الطبيعية الحديثة تقوم النباتات المائية ومصافي الحصى بتطهير المياه بيولوجياً بدون كلور.',
        explanationAr: 'الموكلي: ohne Chlor ↔ Wasserpflanzen und Kiesfilter.',
      },
    ]
  ),

  buildTeil1Topic(
    31,
    'frauen-arbeitsmarkt',
    'Frauen im Arbeitsmarkt (NEU 2026)',
    'المرأة في سوق الشغل (Frauen im Arbeitsmarkt NEU 2026)',
    '🆕 جديد NEU THEMA 2026',
    'قصة الكود ABHDE: نساء أكثر في مناصب القيادة بفضل نماذج العمل المرنة (A) ⬅ فجوة الأجور بين الجنسين تتقلص ببطء (B) ⬅ التوفيق بين الأسرة والمهنة عبر توسيع دور الحضانة (H) ⬅ جعل مهن الهندسة والعلوم جذابة للشابات (D) ⬅ العودة الناجحة للعمل بعد إجازة الأمومة (E).',
    [{ key: 'original', label: 'الأساسي', code: 'ABHDE' }],
    [
      {
        origLetter: 'A',
        headingDe: 'Mehr Frauen in Führungspositionen durch flexible Arbeitsmodelle',
        headingAr: 'نساء أكثر في المناصب القيادية بفضل نماذج العمل المرنة',
        motCleHeading: 'Führungspositionen / flexible Arbeitsmodelle',
        motCleText: 'Jobsharing und Führen in Teilzeit ermöglichen Karriere auf Chefetagen',
        paragraphDe: 'Moderne Konzepte wie das „Führen in Teilzeit“ oder Jobsharing, bei dem sich zwei Managerinnen eine Chefunternehmensstelle teilen, bringen immer mehr Frauen in die Vorstandsetagen.',
        paragraphAr: 'تسمح النماذج الحديثة مثل تقاسم المنصب القيادي (Jobsharing) بوصول المزيد من النساء إلى مواقع الإدارة العليا.',
        explanationAr: 'الموكلي: Führungspositionen ↔ Jobsharing und Führen in Teilzeit.',
      },
      {
        origLetter: 'B',
        headingDe: 'Lohnlücke zwischen Männern und Frauen schließt sich nur langsam',
        headingAr: 'فجوة الأجور بين الرجال والنساء تتقلص ببطء فقط',
        motCleHeading: 'Lohnlücke / Männern und Frauen',
        motCleText: 'Gender Pay Gap: Neue Gesetze zur Gehaltstransparenz sollen gleichen Lohn für gleiche Arbeit sichern',
        paragraphDe: 'Noch immer verdienen Frauen im Durchschnitt weniger pro Stunde als ihre männlichen Kollegen. Neue Richtlinien zur Gehaltstransparenz verpflichten Firmen nun, ihre Vergütungsstrukturen offenzulegen.',
        paragraphAr: 'لا تزال النساء يتقاضين في المتوسط أجراً أقل من الرجال، وتلزم القوانين الجديدة الشركات بشفافية الأجور.',
        explanationAr: 'الموكلي: Lohnlücke ↔ Gender Pay Gap / Gehaltstransparenz.',
      },
      {
        origLetter: 'H',
        headingDe: 'Vereinbarkeit von Familie und Karriere durch besseren Kita-Ausbau',
        headingAr: 'التوفيق بين الأسرة والمسار المهني عبر تطوير دور الحضانة',
        motCleHeading: 'Familie und Karriere / Kita-Ausbau',
        motCleText: 'Verlässliche Kinderbetreuung am Nachmittag ist Voraussetzung für Vollzeitbeschäftigung',
        paragraphDe: 'Viele gut ausgebildete Mütter arbeiten unfreiwillig nur in Teilzeit, weil vor Ort Betreuungsplätze fehlen. Ein Ausbau verlässlicher Kitas gilt als wichtigster Schlüssel gegen den Fachkräftemangel.',
        paragraphAr: 'يعد توفير دور حضانة موثوقة طوال اليوم المفتاح الأساسي لتمكين الأمهات المؤهلات من العمل بدوام كامل.',
        explanationAr: 'الموكلي: Kita-Ausbau ↔ Verlässliche Kinderbetreuung.',
      },
      {
        origLetter: 'D',
        headingDe: 'MINT-Berufe gezielt für junge Frauen attraktiver machen',
        headingAr: 'جعل المهن العلمية والهندسية (MINT) أكثر جاذبية للشابات',
        motCleHeading: 'MINT-Berufe / junge Frauen',
        motCleText: 'Aktionstage in Technik, Mathematik und Ingenieurwesen bauen alte Rollenklischees ab',
        paragraphDe: 'In Mathematik, Informatik, Naturwissenschaften und Technik (MINT) bieten sich hervorragende Berufschancen. Aktionstage wie der „Girls’ Day“ helfen Schülerinnen, technische Berufe ohne Klischees kennenzulernen.',
        paragraphAr: 'تساعد الأيام المفتوحة في مجالات الرياضيات والهندسة والتكنولوجيا على كسر الصور النمطية وتشجيع الفتيات.',
        explanationAr: 'الموكلي: MINT-Berufe ↔ Mathematik, Naturwissenschaften und Technik.',
      },
      {
        origLetter: 'E',
        headingDe: 'Wiedereinstieg nach der Elternzeit erfolgreich gestalten',
        headingAr: 'تنظيم العودة الناجحة إلى العمل بعد إجازة الأبوة/الأمومة',
        motCleHeading: 'Wiedereinstieg nach der Elternzeit',
        motCleText: 'Weiterbildungskurse und Coaching während der Babypause erleichtern die Rückkehr in den Job',
        paragraphDe: 'Damit nach einer mehrjährigen Familienpause der Anschluss im Beruf gelingt, bieten Arbeitsagenturen und Arbeitgeber spezielle Weiterbildungen und digitale Kontaktprogramme schon während der Elternzeit an.',
        paragraphAr: 'لتسهيل العودة إلى الشغل بعد عطلة رعاية الطفل، توفر الشركات دورات تكوينية ومواكبة مهنية مستمرة.',
        explanationAr: 'الموكلي: Wiedereinstieg nach der Elternzeit ↔ Rückkehr nach der Babypause.',
      },
    ]
  ),

  // Remaining 11 topics (32..42) to complete all 42 Lesen Teil 1 Topics!
  buildTeil1Topic(
    32,
    'auf-dem-weg-tauchen',
    'Auf dem Weg / Tauchen',
    'الغوص وفي الطريق (Auf dem Weg / Tauchen)',
    '✅ كلاسيكي',
    'قصة الكود CADIJ: الغوص في البحيرات والبحار (C) ⬅ معدات السلامة تحت الماء (A) ⬅ حماية الشعاب البحرية (D) ⬅ تصوير العالم المائي (I) ⬅ دورات الغوص للمبتدئين (J).',
    [{ key: 'original', label: 'الأساسي', code: 'CADIJ' }],
    [
      { origLetter: 'C', headingDe: 'Faszination Unterwasserwelt beim Sporttauchen', headingAr: 'سحر العالم تحت المائي في رياضة الغوص', motCleHeading: 'Unterwasserwelt / Sporttauchen', motCleText: 'Schwerelosigkeit und bunte Fische unter der Wasseroberfläche erleben', paragraphDe: 'Beim Sporttauchen erleben Menschen das Gefühl völliger Schwerelosigkeit und entdecken verborgene Riffe und Schiffswracks.', paragraphAr: 'يمنح الغوص الرياضي شعوراً بانعدام الوزن واكتشاف الشعاب وحطام السفن.', explanationAr: 'الموكلي: Sporttauchen ↔ Schwerelosigkeit unter Wasser.' },
      { origLetter: 'A', headingDe: 'Sicherheitscheck der Tauchausrüstung vor jedem Tauchgang', headingAr: 'فحص سلامة معدات الغوص قبل كل غطسة', motCleHeading: 'Sicherheitscheck / Tauchausrüstung', motCleText: 'Atemregler, Druckluftflasche und Tauchcomputer gemeinsam mit dem Partner prüfen', paragraphDe: 'Beim Tauchen gilt das Buddy-Prinzip: Vor dem Sprung ins Wasser kontrollieren zwei Taucher gegenseitig Druckluftflasche, Atemregler und Tauchcomputer.', paragraphAr: 'قبل الغطس يفحص كل غواص مع زميله قارورة الأكسجين والمنظم وحاسوب الغوص.', explanationAr: 'الموكلي: Tauchausrüstung ↔ Druckluftflasche und Atemregler prüfen.' },
      { origLetter: 'D', headingDe: 'Sanfter Tauchtourismus zum Schutz empfindlicher Meeresgebiete', headingAr: 'سياحة غوص مسؤولة لحماية المناطق البحرية الحساسة', motCleHeading: 'Sanfter Tauchtourismus', motCleText: 'Nichts berühren oder abbrechen: Umweltregeln für Taucher am Riff', paragraphDe: 'Verantwortungsbewusste Tauchbasen achten streng darauf, dass Urlauber mit ihren Flossen keine empfindlichen Korallen berühren oder abbrechen.', paragraphAr: 'تحرص مراكز الغوص المسؤولة على عدم لمس أو كسر المرجان بالزعانف.', explanationAr: 'الموكلي: Sanfter Tauchtourismus ↔ Korallen nicht berühren.' },
      { origLetter: 'I', headingDe: 'Spezielle Kameras für beeindruckende Unterwasserfotos', headingAr: 'كاميرات خاصة لالتقاط صور مذهلة تحت الماء', motCleHeading: 'Unterwasserfotos / Kameras', motCleText: 'Wasserdichte Gehäuse und Blitzlicht gleichen den Farbverlust in der Tiefe aus', paragraphDe: 'Mit wasserdichten Kameragehäusen und speziellen Unterwasserblitzen gelingen heute auch Hobbytauchern gestochen scharfe Aufnahmen in großer Tiefe.', paragraphAr: 'بفضل الأغطية العازلة للماء والفلاش الخاص يلتقط الغواصون صوراً رائعة في الأعماق.', explanationAr: 'الموكلي: Unterwasserfotos ↔ Wasserdichte Kameragehäuse.' },
      { origLetter: 'J', headingDe: 'Vom Schwimmbad ins offene Meer: Tauchkurse für Anfänger', headingAr: 'من المسبح إلى البحر المفتوح: دروس الغوص للمبتدئين', motCleHeading: 'Tauchkurse für Anfänger', motCleText: 'Erste Atemübungen im flachen Becken vor dem internationalen Tauchschein', paragraphDe: 'In zertifizierten Tauchschulen üben Anfänger die ersten Atemzüge unter Wasser zunächst ganz entspannt im flachen Schwimmbecken.', paragraphAr: 'يتدرب المبتدئون في مدارس الغوص أولاً في مسبح ضحل قبل النزول للبحر.', explanationAr: 'الموكلي: Tauchkurse für Anfänger ↔ Übungen im Schwimmbecken.' },
    ]
  ),

  buildTeil1Topic(
    33,
    'keine-zeit-partner',
    'Keine Zeit / Partner',
    'ضيق الوقت والشريك (Keine Zeit / Partner)',
    '✅ كلاسيكي',
    'قصة الكود JBCFI: ضيق الوقت يرهق العلاقات الزوجية (J) ⬅ أمسيات مخصصة للشريك بدون هاتف (B) ⬅ الهوايات المشتركة تقرب بين الزوجين (C) ⬅ تقسيم عادل للأشغال المنزلية (F) ⬅ التواصل الصريح يحل الخلافات اليومية (I).',
    [{ key: 'original', label: 'الأساسي', code: 'JBCFI' }],
    [
      { origLetter: 'J', headingDe: 'Beruflicher Zeitmangel belastet moderne Partnerschaften', headingAr: 'ضيق الوقت المهني يثقل كاهل العلاقات الحديثة', motCleHeading: 'Zeitmangel / Partnerschaften', motCleText: 'Überstunden und volle Terminkalender lassen Paaren kaum gemeinsame Ruhephasen', paragraphDe: 'Zwischen Überstunden im Job, Kinderbetreuung und Haushalt bleibt vielen Paaren im Alltag kaum noch Zeit für ruhige Gespräche zu zweit.', paragraphAr: 'بين ساعات العمل الإضافية والأشغال المنزلية لا يجد الأزواج وقتاً كافياً للحديث الهادئ.', explanationAr: 'الموكلي: Zeitmangel ↔ Überstunden und volle Terminkalender.' },
      { origLetter: 'B', headingDe: 'Feste Paar-Abende ohne Smartphone reservieren', headingAr: 'تخصيص أمسيات ثابتة للزوجين بدون هاتف ذكي', motCleHeading: 'Paar-Abende ohne Smartphone', motCleText: 'Bewusste Verabredungen zu zweit wie am Anfang der Beziehung einplanen', paragraphDe: 'Beziehungsexperten raten Paaren, einmal pro Woche einen festen Abend nur für sich im Kalender einzutragen und dabei alle Handys auszuschalten.', paragraphAr: 'ينصح خبراء العلاقات بتخصيص أمسية أسبوعية ثابتة للزوجين مع إغلاق الهواتف.', explanationAr: 'الموكلي: Paar-Abende ↔ einmal pro Woche festen Abend reservieren.' },
      { origLetter: 'C', headingDe: 'Gemeinsame Hobbys schweißen Partner enger zusammen', headingAr: 'الهوايات المشتركة تقوي الرابطة بين الشريكين', motCleHeading: 'Gemeinsame Hobbys', motCleText: 'Zusammen kochen, wandern oder eine Sprache lernen schafft neue Erlebnisse', paragraphDe: 'Ob ein gemeinsamer Kochkurs, Wandern am Wochenende oder das Erlernen einer Fremdsprache: Neue gemeinsame Erlebnisse bringen frischen Wind in lange Beziehungen.', paragraphAr: 'ممارسة هواية مشتركة كالطبخ أو المشي الجبلي تجدد الحيوية في العلاقة.', explanationAr: 'الموكلي: Gemeinsame Hobbys ↔ Kochkurs oder Wandern zu zweit.' },
      { origLetter: 'F', headingDe: 'Faire Aufteilung der Hausarbeit vermeidet Streit', headingAr: 'التقسيم العادل للأشغال المنزلية يجنب الخلافات', motCleHeading: 'Aufteilung der Hausarbeit', motCleText: 'Klare Absprachen beim Putzen, Einkaufen und Kochen entlasten beide Seiten', paragraphDe: 'Ein häufiger Streitpunkt in Wohnungen ist der Haushalt. Ein klarer Wochenplan für Einkauf, Wäsche und Küche sorgt für Gerechtigkeit.', paragraphAr: 'الاتفاق الواضح على تقسيم مهام التنظيف والتسوق والطبخ يمنع الشجار اليومي.', explanationAr: 'الموكلي: Hausarbeit ↔ Wochenplan für Einkauf und Wäsche.' },
      { origLetter: 'I', headingDe: 'Offene Kommunikation hilft bei Konflikten im Alltag', headingAr: 'التواصل الصريح يساعد في حل الخلافات اليومية', motCleHeading: 'Offene Kommunikation / Konflikte', motCleText: 'Wünsche direkt aussprechen und dem anderen aktiv zuhören statt zu schweigen', paragraphDe: 'Statt Ärger herunterzuschlucken, sollten Partner ihre Wünsche ruhig in Ich-Botschaften formulieren und dem Gegenüber aufmerksam zuhören.', paragraphAr: 'التعبير الهادئ عن الرغبات والإنصات للشريك يحل المشاكل قبل تفاقمها.', explanationAr: 'الموكلي: Offene Kommunikation ↔ Wünsche aussprechen und zuhören.' },
    ]
  ),

  buildTeil1Topic(
    34,
    'alte-spiele',
    'Alte Spiele / Spielzeug',
    'الألعاب القديمة واللوحية (Alte Spiele)',
    '✅ كلاسيكي',
    'قصة الكود FDBAH: عودة ألعاب الطاولة الكلاسيكية (F) ⬅ الألعاب الخشبية تدوم لأجيال (D) ⬅ مقاهي الألعاب في المدن (B) ⬅ اللعب الجماعي ينمي المهارات الاجتماعية للأطفال (A) ⬅ هواة جمع الألعاب القديمة في المعارض (H).',
    [{ key: 'original', label: 'الأساسي', code: 'FDBAH' }],
    [
      { origLetter: 'F', headingDe: 'Klassische Brettspiele feiern im digitalen Zeitalter ein Comeback', headingAr: 'ألعاب الطاولة الكلاسيكية تعود بقوة في العصر الرقمي', motCleHeading: 'Brettspiele / Comeback', motCleText: 'Familien und junge Erwachsene treffen sich wieder zum analogen Spieleabend mit Würfeln und Karten', paragraphDe: 'Trotz Videospielen verzeichnen Verlage für analoge Brett- und Kartenspiele Rekordumsätze, weil Menschen das echte Zusammensitzen am Tisch schätzen.', paragraphAr: 'رغم ألعاب الفيديو تحقق ألعاب الطاولة والورق مبيعات قياسية لأن الناس يحبون الاجتماع الحقيقي حول الطاولة.', explanationAr: 'الموكلي: Brettspiele Comeback ↔ analoger Spieleabend.' },
      { origLetter: 'D', headingDe: 'Nachhaltiges Holzspielzeug hält über Generationen', headingAr: 'الألعاب الخشبية المستدامة تدوم عبر الأجيال', motCleHeading: 'Holzspielzeug / Generationen', motCleText: 'Robuste Bauklötze und Eisenbahnen aus heimischem Holz statt billigem Plastik', paragraphDe: 'Bauklötze, Puppenhäuser und Holzeisenbahnen gehen kaum kaputt, sind frei von Weichmachern und werden oft von den Eltern an die eigenen Kinder weitergegeben.', paragraphAr: 'المكعبات والقطارات الخشبية متينة وصحية وتورث من جيل لآخر.', explanationAr: 'الموكلي: Holzspielzeug ↔ Bauklötze aus Holz statt Plastik.' },
      { origLetter: 'B', headingDe: 'Spielecafés als neuer Treffpunkt in den Innenstädten', headingAr: 'مقاهي الألعاب كنقطة التقاء جديدة في وسط المدن', motCleHeading: 'Spielecafés / Treffpunkt', motCleText: 'Hunderte Gesellschaftsspiele vor Ort ausleihen und von Spieleerklärern lernen', paragraphDe: 'In modernen Brettspielcafés können Gäste aus Hunderten Spielen im Regal wählen, während geschulte Mitarbeiter die Spielregeln direkt am Tisch erklären.', paragraphAr: 'في مقاهي الألعاب يمكن للزوار اختيار أي لعبة من بين مئات الألعاب مع شرح القواعد.', explanationAr: 'الموكلي: Spielecafés ↔ Gesellschaftsspiele im Café ausleihen.' },
      { origLetter: 'A', headingDe: 'Gemeinsames Spielen fördert soziale Kompetenzen bei Kindern', headingAr: 'اللعب الجماعي ينمي المهارات الاجتماعية لدى الأطفال', motCleHeading: 'soziale Kompetenzen bei Kindern', motCleText: 'Regeln einhalten, geduldig warten und auch das Verlieren lernen', paragraphDe: 'Beim Würfel- oder Gedächtnisspiel lernen Kinder spielerisch, sich an gemeinsame Regeln zu halten, abzuwarten und auch mit einer Niederlage fair umzugehen.', paragraphAr: 'يتعلم الأطفال عبر اللعب الجماعي احترام القواعد والصبر وتقبل الخسارة بروح رياضية.', explanationAr: 'الموكلي: soziale Kompetenzen ↔ Regeln einhalten und Verlieren lernen.' },
      { origLetter: 'H', headingDe: 'Sammler zahlen hohe Preise für historisches Blechspielzeug', headingAr: 'هواة الجمع يدفعون أسعاراً مرتفعة مقابل الألعاب المعدنية التاريخية', motCleHeading: 'Sammler / historisches Blechspielzeug', motCleText: 'Alte Aufzieheisenbahnen und Puppen auf Auktionen und im Spielzeugmuseum begehrt', paragraphDe: 'Auf Spezialauktionen erzielen gut erhaltene Blecheisenbahnen und Teddybären aus dem frühen 20. Jahrhundert im Originalkarton oft tausende Euro.', paragraphAr: 'تباع القطارات المعدنية القديمة والدمى النادرة في المزادات بآلاف الأوروهات.', explanationAr: 'الموكلي: Sammler / Blechspielzeug ↔ Spezialauktionen.' },
    ]
  ),

  buildTeil1Topic(
    35,
    'russland-wahlrecht',
    'Russland / Wahlrecht (المرأة الروسية)',
    'المرأة الروسية وحق التصويت (Russland / Wahlrecht)',
    '🔥 طايح (Agadir 2026)',
    'قصة الكود CDFGI: كفاح النساء من أجل حق التصويت (C) ⬅ فتح الجامعات أمام الطالبات الأوائل (D) ⬅ عمل النساء في المصانع خلال الحرب (F) ⬅ رائدات في العلوم والفضاء (G) ⬅ المساواة القانونية وتحديات الواقع اليومي (I).',
    [{ key: 'original', label: 'الأساسي', code: 'CDFGI' }],
    [
      { origLetter: 'C', headingDe: 'Historischer Kampf für das Frauenwahlrecht im Jahr 1917', headingAr: 'النضال التاريخي من أجل حق المرأة في التصويت عام 1917', motCleHeading: 'Frauenwahlrecht 1917', motCleText: 'Große Demonstrationen in Petrograd führten zur Einführung des aktiven und passiven Wahlrechts', paragraphDe: 'Nach großen Demonstrationen von Textilarbeiterinnen und Bürgerrechtlerinnen im Frühjahr 1917 erhielten Frauen in Russland noch vor vielen westlichen Staaten das offizielle Wahlrecht.', paragraphAr: 'بعد مظاهرات كبرى في عام 1917 حصلت النساء في روسيا على حق التصويت الرسمي قبل العديد من الدول.', explanationAr: 'الموكلي: Frauenwahlrecht ↔ Demonstrationen 1917.' },
      { origLetter: 'D', headingDe: 'Die ersten Studentinnen erobern die Universitäten', headingAr: 'الطالبات الأوائل يقتحمن الجامعات', motCleHeading: 'erste Studentinnen / Universitäten', motCleText: 'Höhere Frauenkurse in Medizin und Mathematik eröffneten den Zugang zur Wissenschaft', paragraphDe: 'Ende des 19. Jahrhunderts ermöglichten spezielle höhere Bildungskurse in Sankt Petersburg und Moskau jungen Frauen erstmals das Studium der Medizin und Mathematik.', paragraphAr: 'مكّنت الدورات الجامعية العليا في سانت بطرسبرغ وموسكو الشابات من دراسة الطب والرياضيات لأول مرة.', explanationAr: 'الموكلي: Studentinnen / Universitäten ↔ Studium der Medizin und Mathematik.' },
      { origLetter: 'F', headingDe: 'Frauen übernehmen schwere Industriearbeit in Krisenzeiten', headingAr: 'النساء يتحملن العمل الصناعي الشاق في أوقات الأزمات', motCleHeading: 'schwere Industriearbeit', motCleText: 'Einsatz in Fabriken, im Straßenbahnbetrieb und in der Landwirtschaft', paragraphDe: 'Während der Kriegsjahre hielten Millionen Frauen den Betrieb in Stahlwerken, Fabriken, Krankenhäusern und auf den Feldern unter schwierigsten Bedingungen aufrecht.', paragraphAr: 'خلال سنوات الحرب أدارت ملايين النساء المصانع والمستشفيات والحقول في ظروف صعبة.', explanationAr: 'الموكلي: Industriearbeit ↔ Fabriken und Stahlwerke.' },
      { origLetter: 'G', headingDe: 'Weibliche Pionierinnen in Naturwissenschaft und Raumfahrt', headingAr: 'رائدات في العلوم الطبيعية والفضاء', motCleHeading: 'Pionierinnen in Raumfahrt', motCleText: 'Walentina Tereschkowa flog 1963 als erste Frau der Welt ins Weltall', paragraphDe: 'Mit Walentina Tereschkowa startete 1963 die erste Frau der Menschheitsgeschichte in einem Raumschiff ins Weltall und wurde zum Vorbild für viele Ingenieurinnen.', paragraphAr: 'في عام 1963 انطلقت فالنتينا تيريشكوفا كأول امرأة في تاريخ البشرية إلى الفضاء.', explanationAr: 'الموكلي: Raumfahrt ↔ Walentina Tereschkowa im Weltall.' },
      { origLetter: 'I', headingDe: 'Doppelbelastung zwischen Vollzeitberuf und Familienalltag', headingAr: 'العبء المزدوج بين العمل بدوام كامل والحياة الأسرية', motCleHeading: 'Doppelbelastung / Familienalltag', motCleText: 'Trotz hoher Erwerbsquote blieb die Hausarbeit und Kindererziehung meist an den Müttern hängen', paragraphDe: 'Obwohl fast alle Frauen ganztags berufstätig waren, trugen sie im Alltag meist zusätzlich die alleinige Verantwortung für Einkauf, Kochen und Kindererziehung.', paragraphAr: 'رغم عمل النساء بدوام كامل، بقيت مسؤولية البيت وتربية الأطفال ملقاة على عاتقهن كعبء مزدوج.', explanationAr: 'الموكلي: Doppelbelastung ↔ Vollzeitberuf und Hausarbeit.' },
    ]
  ),

  buildTeil1Topic(
    36,
    'geruch',
    'Geruch (حاسة الشم)',
    'حاسة الشم والعطور (Geruch)',
    '✅ كلاسيكي',
    'قصة الكود HBEJI: الروائح توقظ ذكريات الطفولة فوراً (H) ⬅ كلاب الشرطة المدربة تكشف المخدرات والمتفجرات (B) ⬅ التسويق بالروائح في المتاجر والفنادق (E) ⬅ فقدان حاسة الشم كعلامة مبكرة للأمراض (J) ⬅ فن صناعة العطور الطبيعية (I).',
    [{ key: 'original', label: 'الأساسي', code: 'HBEJI' }],
    [
      { origLetter: 'H', headingDe: 'Düfte wecken unmittelbare Erinnerungen an die Kindheit', headingAr: 'الروائح توقظ ذكريات فورية من الطفولة', motCleHeading: 'Düfte wecken Erinnerungen', motCleText: 'Der Geruchssinn ist im Gehirn direkt mit dem Zentrum für Gefühle und Gedächtnis verbunden', paragraphDe: 'Ein bestimmter Duft nach frisch gebackenem Kuchen oder Sommerregen kann uns sofort in die Kindheit zurückversetzen, weil Riechnerven direkt im Gefühlszentrum des Gehirns enden.', paragraphAr: 'رائحة كعكة طازجة أو مطر الصيف تعيدنا فوراً للطفولة لأن عصب الشم مرتبط مباشرة بمركز المشاعر والذاكرة.', explanationAr: 'الموكلي: Erinnerungen ↔ Gefühlszentrum im Gehirn.' },
      { origLetter: 'B', headingDe: 'Spürhunde helfen Polizei und Zoll mit ihrem feinen Geruchssinn', headingAr: 'كلاب الأثر تساعد الشرطة والجمارك بحاسة شمها الدقيقة', motCleHeading: 'Spürhunde / Polizei und Zoll', motCleText: 'Hundenase riecht millionenfach besser als der Mensch und findet Drogen oder Vermisste', paragraphDe: 'Mit bis zu dreihundert Millionen Riechzellen erschnüffeln ausgebildete Polizeihunde am Flughafen selbst kleinste Mengen an Drogen, Bargeld oder Sprengstoff.', paragraphAr: 'تستطيع كلاب الشرطة المدربة في المطارات كشف أدق كميات المخدرات أو المتفجرات بفضل خلايا الشم لديها.', explanationAr: 'الموكلي: Spürhunde ↔ Polizeihunde finden Drogen am Flughafen.' },
      { origLetter: 'E', headingDe: 'Gezieltes Duftmarketing in Geschäften und Hotels', headingAr: 'التسويق الموجه بالروائح في المتاجر والفنادق', motCleHeading: 'Duftmarketing in Geschäften', motCleText: 'Künstlicher Kaffeeduft oder Vanille sorgt dafür, dass Kunden länger im Laden bleiben', paragraphDe: 'Viele Kaufhäuser und Bäckereien setzen dezente Raumbeduftung mit Vanille-, Leder- oder Kaffeearoma ein, damit sich Kunden wohlfühlen und länger verweilen.', paragraphAr: 'تستعمل المتاجر الكبرى روائح الفانيلا والقهوة لجعل الزبناء يشعرون بالراحة ويبقون فترة أطول للتسوق.', explanationAr: 'الموكلي: Duftmarketing ↔ Raumbeduftung in Kaufhäusern.' },
      { origLetter: 'J', headingDe: 'Verlust des Geruchssinns als medizinisches Warnsignal', headingAr: 'فقدان حاسة الشم كإشارة تحذير طبية', motCleHeading: 'Verlust des Geruchssinns', motCleText: 'Riechstörungen nach Virusinfektionen lassen sich durch gezieltes Riechtraining behandeln', paragraphDe: 'Nach Virusinfektionen verlieren manche Patienten vorübergehend ihren Geruchs- und Geschmackssinn; HNO-Ärzte empfehlen dann ein tägliches Riechtraining mit vier intensiven Düften.', paragraphAr: 'بعد العدوى الفيروسية يفقد البعض حاسة الشم، وينصح الأطباء بتدريب يومي للأنف بأربع روائح قوية.', explanationAr: 'الموكلي: Verlust des Geruchssinns ↔ Riechtraining bei HNO-Ärzten.' },
      { origLetter: 'I', headingDe: 'Die hohe Kunst der Parfümherstellung', headingAr: 'الفن الراقي لصناعة العطور', motCleHeading: 'Kunst der Parfümherstellung', motCleText: 'Parfümeure komponieren aus hunderten Blütenessenzen Kopf-, Herz- und Basisnote', paragraphDe: 'Ein erfahrener Parfümeur – in der Branche „Nase“ genannt – kann Tausende Duftstoffe unterscheiden und komponiert daraus edle Parfüms wie ein Musikstück.', paragraphAr: 'يستطيع خبير العطور التمييز بين آلاف الروائح ومزج خلاصات الزهور لابتكار عطر متناغم.', explanationAr: 'الموكلي: Parfümherstellung ↔ Parfümeur komponiert Blütenessenzen.' },
    ]
  ),

  buildTeil1Topic(
    37,
    'loewen',
    'Löwen (الأسود)',
    'الأسود وحمايتها (Löwen)',
    '✅ كلاسيكي (كود متسلسل)',
    'قصة الكود ABCDE (أسهل كود متسلسل 12345): الحياة الاجتماعية في قطيع الأسود (A) ⬅ اللبؤات هن الصيادات الحقيقيات في السافانا (B) ⬅ تراجع أعداد الأسود بسبب تقلص الموائل (C) ⬅ مشاريع حماية الأسود مع السكان المحليين (D) ⬅ الأسد كرمز للقوة في التاريخ والشعارات (E).',
    [{ key: 'original', label: 'الأساسي', code: 'ABCDE' }],
    [
      { origLetter: 'A', headingDe: 'Einzigartiges Sozialverhalten im Löwenrudel', headingAr: 'سلوك اجتماعي فريد داخل قطيع الأسود', motCleHeading: 'Sozialverhalten im Löwenrudel', motCleText: 'Als einzige Großkatzen leben Löwen in festen Familiengruppen statt als Einzelgänger', paragraphDe: 'Im Gegensatz zu Tigern oder Leoparden, die als Einzelgänger durch ihr Revier streifen, leben afrikanische Löwen in geselligen Familienrudeln.', paragraphAr: 'على عكس النمور والفهود الانفرادية، تعيش الأسود الإفريقية في مجموعات عائلية متماسكة.', explanationAr: 'الموكلي: Löwenrudel ↔ Familienrudel statt Einzelgänger.' },
      { origLetter: 'B', headingDe: 'Löwinnen leisten die Hauptarbeit bei der Jagd', headingAr: 'اللبؤات يقمن بالعمل الأساسي في الصيد', motCleHeading: 'Löwinnen / Hauptarbeit bei der Jagd', motCleText: 'Weibchen jagen gemeinsam in der Dämmerung, während das Männchen das Territorium verteidigt', paragraphDe: 'Während das männliche Tier mit seiner auffälligen Mähne vor allem das Revier gegen Rivalen verteidigt, übernehmen die wendigeren Löwinnen im Team die Jagd.', paragraphAr: 'بينما يدافع الأسد الذكر عن المنطقة، تتولى اللبؤات الرشيقات مهمة الصيد الجماعي.', explanationAr: 'الموكلي: Löwinnen bei der Jagd ↔ Weibchen jagen im Team.' },
      { origLetter: 'C', headingDe: 'Schrumpfender Lebensraum bedroht den König der Tiere', headingAr: 'تقلص الموائل الطبيعية يهدد ملك الغابة', motCleHeading: 'Schrumpfender Lebensraum', motCleText: 'Zahl der wildlebenden Löwen in Afrika hat sich in wenigen Jahrzehnten halbiert', paragraphDe: 'Durch die Ausdehnung von Siedlungen und Viehweiden ist der Bestand wildlebender Löwen in Afrika in den letzten Jahrzehnten dramatisch zurückgegangen.', paragraphAr: 'بسبب توسع التجمعات السكنية والمراعي تراجعت أعداد الأسود البرية في إفريقيا إلى النصف.', explanationAr: 'الموكلي: Schrumpfender Lebensraum ↔ Bestand dramatisch zurückgegangen.' },
      { origLetter: 'D', headingDe: 'Erfolgreicher Artenschutz gemeinsam mit der lokalen Bevölkerung', headingAr: 'نجاح حماية الأنواع بالتعاون مع السكان المحليين', motCleHeading: 'Artenschutz / lokale Bevölkerung', motCleText: 'Sichere Viehkral-Zäune und Ökotourismus verhindern Konflikte mit Hirten', paragraphDe: 'Moderne Naturschutzprojekte unterstützen Hirten beim Bau löwensicherer Ställe und beteiligen die Dörfer an den Einnahmen aus dem Foto-Tourismus.', paragraphAr: 'تدعم مشاريع حماية الطبيعة الرعاة ببناء حظائر آمنة وإشراك القرى في عائدات السياحة البيئية.', explanationAr: 'الموكلي: lokale Bevölkerung ↔ Hirten und Ökotourismus.' },
      { origLetter: 'E', headingDe: 'Der Löwe als Symbol für Mut und Stärke in der Kulturgeschichte', headingAr: 'الأسد كرمز للشجاعة والقوة في التاريخ الثقافي', motCleHeading: 'Symbol für Mut und Stärke', motCleText: 'Wappentier von Städten und Königen seit der Antike', paragraphDe: 'Ob auf mittelalterlichen Ritterwappen, Stadtsiegeln oder steinernen Tempeltoren: Seit Jahrtausenden steht der Löwe weltweit für Mut und königliche Macht.', paragraphAr: 'منذ آلاف السنين يظهر الأسد في شعارات المدن والملوك رمزاً للشجاعة والقوة.', explanationAr: 'الموكلي: Symbol für Mut ↔ Wappentier von Städten und Königen.' },
    ]
  ),

  buildTeil1Topic(
    38,
    'wetter-zk',
    'Wetter (Z&K)',
    'الطقس والأرصاد الجوية (Wetter)',
    '✅ Z&K',
    'قصة الكود ADBCI: توقعات الطقس الدقيقة بالحواسيب الفائقة (A) ⬅ تأثير الطقس على صحة الإنسان (D) ⬅ الظواهر الجوية المتطرفة تتزايد (B) ⬅ الطاقة الشمسية والريحية مرتبطة بالطقس (C) ⬅ قواعد الفلاحين الشعبية حول الطقس (I).',
    [{ key: 'original', label: 'الأساسي', code: 'ADBCI' }],
    [
      { origLetter: 'A', headingDe: 'Moderne Supercomputer verbessern die Wettervorhersage', headingAr: 'الحواسيب الفائقة الحديثة تحسن توقعات الطقس', motCleHeading: 'Supercomputer / Wettervorhersage', motCleText: 'Satellitendaten und Wetterballons ermöglichen präzise Drei-Tages-Prognosen', paragraphDe: 'Dank moderner Wettersatelliten und leistungsstarker Supercomputer liegt die Trefferquote der Drei-Tages-Vorhersage heute bei über neunzig Prozent.', paragraphAr: 'بفضل الأقمار الصناعية والحواسيب الفائقة تتجاوز دقة توقعات الطقس لثلاثة أيام 90%.', explanationAr: 'الموكلي: Supercomputer ↔ Drei-Tages-Vorhersage.' },
      { origLetter: 'D', headingDe: 'Wenn Wetterumschwünge Kopfschmerzen und Müdigkeit auslösen', headingAr: 'عندما تسبب تقلبات الطقس الصداع والتعب', motCleHeading: 'Wetterumschwünge / Kopfschmerzen', motCleText: 'Biowetter und Föhnwind belasten wetterfühlige Menschen im Alltag', paragraphDe: 'Bei schnellen Temperaturstürzen oder warmem Föhnwind klagen viele wetterfühlige Menschen über Migräne, Kreislaufprobleme und Gelenkschmerzen.', paragraphAr: 'عند التغير المفاجئ في الحرارة يعاني الأشخاص الحساسون للطقس من الصداع ومشاكل الدورة الدموية.', explanationAr: 'الموكلي: Kopfschmerzen ↔ wetterfühlige Menschen / Biowetter.' },
      { origLetter: 'B', headingDe: 'Zunahme von extremen Unwettern und Starkregen', headingAr: 'تزايد العواصف الشديدة والأمطار الغزيرة', motCleHeading: 'extreme Unwetter und Starkregen', motCleText: 'Warnsysteme per Smartphone-App informieren Bürger rechtzeitig vor Sturm und Hochwasser', paragraphDe: 'Meteorologen registrieren häufiger heftige Sommergewitter mit Starkregen und Hagel; Warn-Apps auf dem Smartphone helfen, Schäden frühzeitig zu begrenzen.', paragraphAr: 'يسجل خبراء الأرصاد تزايد العواصف الصيفية والأمطار الغزيرة، وتساعد تطبيقات الإنذار على الحماية.', explanationAr: 'الموكلي: Unwetter / Starkregen ↔ Sommergewitter und Warn-Apps.' },
      { origLetter: 'C', headingDe: 'Wetterabhängige Stromerzeugung durch Wind und Sonne', headingAr: 'إنتاج الكهرباء المرتبط بالطقس عبر الرياح والشمس', motCleHeading: 'Wind und Sonne / Stromerzeugung', motCleText: 'Energiemeteorologen berechnen im Voraus, wie viel Ökostrom ins Netz fließt', paragraphDe: 'Für die Steuerung der Stromnetze spielen Energiemeteorologen eine Schlüsselrolle, da sie genau berechnen, wie viel Solar- und Windstrom am nächsten Tag erzeugt wird.', paragraphAr: 'يلعب خبراء أرصاد الطاقة دوراً أساسياً في حساب كمية الكهرباء المنتجة من الشمس والرياح.', explanationAr: 'الموكلي: Wind und Sonne ↔ Energiemeteorologen.' },
      { origLetter: 'I', headingDe: 'Was hinter alten Bauernregeln über das Wetter steckt', headingAr: 'ما وراء الأمثال الفلاحية القديمة حول الطقس', motCleHeading: 'alte Bauernregeln', motCleText: 'Jahrhundertelange Naturbeobachtung auf dem Land trifft oft erstaunlich oft ins Schwarze', paragraphDe: 'Viele überlieferte Bauernregeln beruhen auf jahrhundertelanger Beobachtung von Wolken und Windrichtungen und haben laut Statistik oft einen wahren Kern.', paragraphAr: 'تستند العديد من القواعد الفلاحية الشعبية إلى مراقبة الطبيعة لقرون وغالباً ما تكون صحيحة إحصائياً.', explanationAr: 'الموكلي: Bauernregeln ↔ Naturbeobachtung auf dem Land.' },
    ]
  ),

  buildTeil1Topic(
    39,
    'computer-zk',
    'Computer (Z&K)',
    'الحاسوب والرقمنة (Computer)',
    '✅ Z&K',
    'قصة الكود HEJAD: تاريخ أول الحواسيب العملاقة (H) ⬅ حماية البيانات وكلمات السر القوية (E) ⬅ دورات الحاسوب لكبار السن (J) ⬅ إعادة تدوير النفايات الإلكترونية (A) ⬅ صحة العيون والجلوس السليم أمام الشاشة (D).',
    [{ key: 'original', label: 'الأساسي', code: 'HEJAD' }],
    [
      { origLetter: 'H', headingDe: 'Von raumfüllenden Rechenmaschinen zum leichten Laptop', headingAr: 'من الآلات الحاسبة بحجم الغرفة إلى الحاسوب المحمول الخفيف', motCleHeading: 'raumfüllende Rechenmaschinen', motCleText: 'Konrad Zuse und die rasante Entwicklung der Mikrochips seit den 1940er Jahren', paragraphDe: 'Während die ersten Computer der 1940er Jahre noch ganze Turnhallen füllten, steckt heute in jedem flachen Notebook ein Vielfaches an Rechenleistung.', paragraphAr: 'بينما كانت الحواسيب الأولى في الأربعينيات تملأ قاعات كاملة، يمتلك أي حاسوب محمول اليوم قوة مضاعفة.', explanationAr: 'الموكلي: raumfüllende Rechenmaschinen ↔ Entwicklung seit den 1940er Jahren.' },
      { origLetter: 'E', headingDe: 'Sichere Passwörter schützen vor Datendiebstahl im Netz', headingAr: 'كلمات المرور الآمنة تحمي من سرقة البيانات على الإنترنت', motCleHeading: 'Sichere Passwörter / Datendiebstahl', motCleText: 'Zwei-Faktor-Authentifizierung und regelmäßige Sicherheitsupdates gegen Hackerangriffe', paragraphDe: 'IT-Sicherheitsexperten raten dringend davon ab, dasselbe einfache Passwort für mehrere Konten zu nutzen, und empfehlen die Zwei-Faktor-Authentifizierung.', paragraphAr: 'ينصح خبراء الأمن المعلوماتي بعدم تكرار نفس كلمة المرور وتفعيل المصادقة الثنائية.', explanationAr: 'الموكلي: Sichere Passwörter ↔ Zwei-Faktor-Authentifizierung.' },
      { origLetter: 'J', headingDe: 'Computerkurse machen Senioren fit für das digitale Leben', headingAr: 'دورات الحاسوب تؤهل كبار السن للحياة الرقمية', motCleHeading: 'Computerkurse für Senioren', motCleText: 'Videoanrufe mit den Enkeln, Online-Banking und digitale Behördengänge leicht erklärt', paragraphDe: 'In speziellen Seniorenkursen an Volkshochschulen lernen ältere Menschen Schritt für Schritt, wie sie per Video mit ihren Enkeln telefonieren und sicher im Netz surfen.', paragraphAr: 'يتعلم كبار السن في دورات خاصة كيفية إجراء مكالمات فيديو مع أحفادهم واستعمال الإنترنت بأمان.', explanationAr: 'الموكلي: Computerkurse für Senioren ↔ Videoanrufe mit den Enkeln.' },
      { origLetter: 'A', headingDe: 'Wertvolle Rohstoffe aus alten Computern zurückgewinnen', headingAr: 'استرجاع المواد الخام الثمينة من الحواسيب القديمة', motCleHeading: 'Rohstoffe zurückgewinnen', motCleText: 'Fachgerechtes Recycling von Elektroschrott rettet Gold, Kupfer und seltene Erden', paragraphDe: 'Auf den Platinen ausrangierter PCs und Smartphones befinden sich Gold, Silber und Kupfer, die durch fachgerechtes Elektroschrott-Recycling zurückgewonnen werden.', paragraphAr: 'تحتوي لوحات الحواسيب القديمة على الذهب والنحاس الذي يمكن استرجاعه عبر إعادة التدوير.', explanationAr: 'الموكلي: Rohstoffe zurückgewinnen ↔ Elektroschrott-Recycling.' },
      { origLetter: 'D', headingDe: 'Ergonomie am Bildschirmarbeitsplatz schont Augen und Nacken', headingAr: 'بيئة العمل المريحة أمام الشاشة تحمي العيون والرقبة', motCleHeading: 'Ergonomie am Bildschirmarbeitsplatz', motCleText: 'Richtige Monitorhöhe, blendfreies Licht und kurze Blickpausen ins Grüne', paragraphDe: 'Um trockene Augen und Nackenverspannungen im Büro zu vermeiden, sollte die Oberkante des Monitors auf Augenhöhe liegen und der Blick regelmäßig in die Ferne schweifen.', paragraphAr: 'لتجنب إجهاد العين والرقبة يجب ضبط ارتفاع الشاشة في مستوى النظر وأخذ استراحات بصرية.', explanationAr: 'الموكلي: Ergonomie am Bildschirm ↔ Monitorhöhe und Augen.' },
    ]
  ),

  buildTeil1Topic(
    40,
    'nordsee-autos-evolution',
    'Nordsee / Autos / Evolution (Z&K)',
    'بحر الشمال والسيارات والتطور (Nordsee Z&K)',
    '✅ Z&K',
    'قصة الكود IJAGF (بحر الشمال): المشي في المسطحات الطينية ببحر الشمال (I) ⬅ طاقة الرياح البحرية (J) ⬅ حماية الفقمة والطيور المهاجرة (A) ⬅ السياحة العلاجية بهواء البحر (G) ⬅ الحماية الساحلية بالسدود ضد العواصف (F).',
    [
      { key: 'original', label: 'Nordsee (IJAGF)', code: 'IJAGF' },
      { key: 'mod1', label: 'Autos (IFCEA)', code: 'IFCEA', changeNote: 'كود موضوع السيارات Z&K هو IFCEA.' },
      { key: 'mod2', label: 'Evolution (FCIGA)', code: 'FCIGA', changeNote: 'كود موضوع التطور Z&K هو FCIGA.' },
    ],
    [
      { origLetter: 'I', mod1Letter: 'I', mod2Letter: 'F', headingDe: 'Geführte Wattwanderungen im Rhythmus von Ebbe und Flut', headingAr: 'جولات مصحوبة بمرشدين في المسطحات الطينية حسب المد والجزر', motCleHeading: 'Wattwanderungen / Ebbe und Flut', motCleText: 'Nur mit erfahrenem Wattführer bei Niedrigwasser über den Meeresboden laufen', paragraphDe: 'Bei Ebbe zieht sich das Wasser der Nordsee kilometerweit zurück, sodass Urlauber gemeinsam mit erfahrenen Wattführern direkt auf dem Meeresboden wandern können.', paragraphAr: 'عند الجزر ينحسر ماء بحر الشمال لكيلومترات مما يتيح المشي فوق قاع البحر رفقة مرشد خبير.', explanationAr: 'الموكلي: Wattwanderungen ↔ Ebbe und Flut.' },
      { origLetter: 'J', mod1Letter: 'F', mod2Letter: 'C', headingDe: 'Offshore-Windparks auf hoher See liefern grünen Strom', headingAr: 'مزارع الرياح البحرية في عرض البحر توفر كهرباء خضراء', motCleHeading: 'Offshore-Windparks', motCleText: 'Stetiger Seewind treibt riesige Windräder vor der Nordseeküste an', paragraphDe: 'Weit vor der Küste drehen sich Hunderte riesige Offshore-Windräder im stetigen Seewind und versorgen Millionen Haushalte auf dem Festland mit sauberem Strom.', paragraphAr: 'في عرض بحر الشمال تدور مئات توربينات الرياح البحرية لتزويد ملايين المنازل بالكهرباء النظيفة.', explanationAr: 'الموكلي: Offshore-Windparks ↔ Windräder auf hoher See.' },
      { origLetter: 'A', mod1Letter: 'C', mod2Letter: 'I', headingDe: 'Schutzstationen kümmern sich um verwaiste junge Seehunde', headingAr: 'محطات حماية تعتني بصغار الفقمة اليتيمة', motCleHeading: 'Seehunde / Schutzstationen', motCleText: 'Tierpfleger ziehen geschwächte Heuler auf, bis sie zurück ins Meer können', paragraphDe: 'In den Seehundstationen an der Küste werden im Sommer junge Robben („Heuler“), die durch Stürme von ihren Müttern getrennt wurden, aufgepäppelt und später ausgewildert.', paragraphAr: 'تعتني محطات حماية الفقمة بصغار الفقمة التي انفصلت عن أمهاتها بسبب العواصف قبل إعادتها للبحر.', explanationAr: 'الموكلي: Seehunde ↔ Heuler in Seehundstationen.' },
      { origLetter: 'G', mod1Letter: 'E', mod2Letter: 'G', headingDe: 'Gesundes Reizklima an der Küste hilft bei Atemwegserkrankungen', headingAr: 'المناخ البحري الصحي على الساحل يساعد في علاج أمراض الجهاز التنفسي', motCleHeading: 'Reizklima / Atemwegserkrankungen', motCleText: 'Salzhaltige Meeresluft und feine Aerosole wirken wohltuend auf Lunge und Haut', paragraphDe: 'Die salz- und jodhaltige Nordseeluft wirkt wie ein natürliches Inhalationsgerät und bringt Menschen mit Asthma, Allergien oder Hautproblemen rasche Linderung.', paragraphAr: 'يعمل هواء بحر الشمال الغني بالملح واليود كجهاز استنشاق طبيعي يريح مرضى الربو والحساسية.', explanationAr: 'الموكلي: Reizklima ↔ Salzhaltige Nordseeluft bei Asthma.' },
      { origLetter: 'F', mod1Letter: 'A', mod2Letter: 'A', headingDe: 'Moderne Deiche schützen das flache Küstenland vor Sturmfluten', headingAr: 'السدود الحديثة تحمي الأراضي الساحلية المنخفضة من العواصف البحرية', motCleHeading: 'Deiche / Sturmfluten', motCleText: 'Küstenschutz erhöht und verstärkt Dämme angesichts des steigenden Meeresspiegels', paragraphDe: 'Ohne kilometerlange, begrünte Deiche und Sperrwerke wären weite Teile der flachen Nordseeküste bei herbstlichen Sturmfluten schutzlos dem Meer ausgeliefert.', paragraphAr: 'تحمي السدود الساحلية العالية المناطق المنخفضة على ساحل بحر الشمال من الفيضانات والعواصف.', explanationAr: 'الموكلي: Deiche / Sturmfluten ↔ Küstenschutz.' },
    ]
  ),

  buildTeil1Topic(
    41,
    'wohnen-zk',
    'Wohnen (Z&K)',
    'السكن المشترك والحديث (Wohnen)',
    '✅ Z&K',
    'قصة الكود BJGFA: السكن المشترك بين الأجيال (B) ⬅ المنازل الصغيرة المتنقلة Tiny Houses (J) ⬅ السكن الذكي يوفر الطاقة (G) ⬅ التعاونيات السكنية تحمي من غلاء الكراء (F) ⬅ حدائق فوق أسطح العمارات (A).',
    [{ key: 'original', label: 'الأساسي', code: 'BJGFA' }],
    [
      { origLetter: 'B', headingDe: 'Mehrgenerationenhäuser verbinden Jung und Alt unter einem Dach', headingAr: 'منازل الأجيال المتعددة تجمع الشباب وكبار السن تحت سقف واحد', motCleHeading: 'Mehrgenerationenhäuser / Jung und Alt', motCleText: 'Senioren und junge Familien helfen sich im Alltag gegenseitig', paragraphDe: 'In Mehrgenerationenhäusern wohnen Studierende, Familien und Senioren Tür an Tür und unterstützen sich gegenseitig beim Babysitten und Einkaufen.', paragraphAr: 'في منازل الأجيال المتعددة يسكن الطلبة والعائلات وكبار السن جنباً إلى جنب ويتعاونون يومياً.', explanationAr: 'الموكلي: Mehrgenerationenhäuser ↔ Jung und Alt Tür an Tür.' },
      { origLetter: 'J', headingDe: 'Minimalistisch leben auf wenigen Quadratmetern im Tiny House', headingAr: 'العيش البسيط على بضعة أمتار مربعة في المنازل المصغرة (Tiny House)', motCleHeading: 'Tiny House / wenige Quadratmeter', motCleText: 'Holzhäuser auf Rädern bieten clevere Stauraumlösungen für Menschen mit wenig Besitz', paragraphDe: 'Immer mehr Menschen verkleinern ihren Wohnraum bewusst und ziehen in ein nachhaltiges Tiny House aus Holz, in dem auf zwanzig Quadratmetern alles Platz findet.', paragraphAr: 'يختار الكثيرون العيش البسيط في منازل خشبية صغيرة لا تتجاوز مساحتها 20 متراً مربعاً.', explanationAr: 'الموكلي: Tiny House ↔ zwanzig Quadratmeter.' },
      { origLetter: 'G', headingDe: 'Intelligente Haustechnik steuert Heizung und Beleuchtung automatisch', headingAr: 'التقنية المنزلية الذكية تتحكم في التدفئة والإضاءة تلقائياً', motCleHeading: 'Intelligente Haustechnik', motCleText: 'Smart-Home-Sensoren senken den Energieverbrauch, wenn niemand zu Hause ist', paragraphDe: 'Vernetzte Smart-Home-Thermostate regeln die Heizung automatisch herunter, sobald ein Fenster geöffnet wird oder der letzte Bewohner das Haus verlässt.', paragraphAr: 'تخفض أجهزة المنزل الذكي التدفئة تلقائياً عند فتح النافذة أو مغادرة البيت.', explanationAr: 'الموكلي: Intelligente Haustechnik ↔ Smart-Home-Thermostate.' },
      { origLetter: 'F', headingDe: 'Wohnungsbaugenossenschaften bieten bezahlbare Mieten in der Stadt', headingAr: 'التعاونيات السكنية توفر إيجارات معقولة في المدينة', motCleHeading: 'Wohnungsbaugenossenschaften / bezahlbare Mieten', motCleText: 'Mitglieder sind Miteigentümer und vor spekulativen Mieterhöhungen geschützt', paragraphDe: 'Bei einer Wohnungsbaugenossenschaft kaufen Mieter Geschäftsanteile, erhalten lebenslanges Wohnrecht und profitieren von dauerhaft fairen Mietpreisen.', paragraphAr: 'في التعاونيات السكنية يتمتع الأعضاء بحق سكن دائم وإيجارات عادلة ومستقرة.', explanationAr: 'الموكلي: Wohnungsbaugenossenschaften ↔ faire Mietpreise.' },
      { origLetter: 'A', headingDe: 'Gemeinschaftsgärten auf dem Hausdach bringen Natur in die Stadt', headingAr: 'الحدائق المشتركة فوق سطح المبنى تجلب الطبيعة إلى المدينة', motCleHeading: 'Gemeinschaftsgärten auf dem Hausdach', motCleText: 'Mieter bauen auf begrünten Flachdächern gemeinsam Tomaten und Kräuter an', paragraphDe: 'Auf ungenutzten Flachdächern von Mietshäusern entstehen grüne Oasen, in denen Nachbarn gemeinsam in Hochbeeten Gemüse und Kräuter ernten.', paragraphAr: 'تتحول أسطح العمارات إلى واحات خضراء يزرع فيها الجيران الخضر والأعشاب.', explanationAr: 'الموكلي: auf dem Hausdach ↔ Flachdächer und Hochbeete.' },
    ]
  ),

  buildTeil1Topic(
    42,
    'plastik-recycling',
    'Plastik / Recycling',
    'البلاستيك وإعادة التدوير (Plastik)',
    '✅ كلاسيكي',
    'قصة الكود ECIAG: الجسيمات البلاستيكية الدقيقة في البحار (E) ⬅ نظام الرهن الألماني للقنينات Pfand (C) ⬅ البلاستيك الحيوي القابل للتحلل (I) ⬅ منع الأكياس والشفاطات البلاستيكية في أوروبا (A) ⬅ الفرز الصحيح للنفايات في المنزل (G).',
    [{ key: 'original', label: 'الأساسي', code: 'ECIAG' }],
    [
      { origLetter: 'E', headingDe: 'Unsichtbares Mikroplastik verschmutzt Flüsse und Weltmeere', headingAr: 'اللدائن الدقيقة غير المرئية تلوث الأنهار والمحيطات', motCleHeading: 'Mikroplastik / Weltmeere', motCleText: 'Winzige Kunststoffpartikel aus Reifenabrieb und Synthetikkleidung gelangen in die Nahrungskette', paragraphDe: 'Durch den Abrieb von Autoreifen und das Waschen von Fleece-Pullovern gelangen täglich winzige Mikroplastik-Partikel ins Abwasser und schließlich in die Meere.', paragraphAr: 'بسبب تآكل إطارات السيارات وغسل الملابس الصناعية تصل جزيئات الميكروبلاستيك الدقيقة إلى المحيطات.', explanationAr: 'الموكلي: Mikroplastik ↔ winzige Kunststoffpartikel im Meer.' },
      { origLetter: 'C', headingDe: 'Erfolgsmodell Pfandsystem: Fast alle Getränkeflaschen kehren zurück', headingAr: 'النموذج الناجح لنظام الرهن: عودة جميع قنينات المشروبات تقريباً', motCleHeading: 'Pfandsystem / Getränkeflaschen', motCleText: 'Rückgabeautomaten im Supermarkt sorgen für eine Recyclingquote von über 95 Prozent', paragraphDe: 'Dank des Einweg- und Mehrwegpfands von 25 bzw. 15 Cent werden in Deutschland über 95 Prozent aller Plastikflaschen und Getränkedosen am Automaten zurückgegeben.', paragraphAr: 'بفضل نظام الرهن المالي في ألمانيا تعود أكثر من 95% من القنينات البلاستيكية إلى آلات الاسترجاع.', explanationAr: 'الموكلي: Pfandsystem ↔ Rückgabeautomaten im Supermarkt.' },
      { origLetter: 'I', headingDe: 'Biokunststoffe aus Maisstärke als kompostierbare Alternative', headingAr: 'البلاستيك الحيوي من نشا الذرة كبديل قابل للتحلل', motCleHeading: 'Biokunststoffe aus Maisstärke', motCleText: 'Folien und Becher aus nachwachsenden Rohstoffen bauen sich biologisch ab', paragraphDe: 'Forscher entwickeln Folien aus Maisstärke, Zellulose und Milchsäure, die herkömmliches Erdöl-Plastik bei Verpackungen ersetzen können.', paragraphAr: 'يطور الباحثون أغلفة من نشا الذرة والسليلوز قابلة للتحلل كبديل للبلاستيك البترولي.', explanationAr: 'الموكلي: Biokunststoffe ↔ Maisstärke und nachwachsende Rohstoffe.' },
      { origLetter: 'A', headingDe: 'EU-Verbot für Einwegplastik wie Trinkhalme und Plastikgeschirr', headingAr: 'حظر الاتحاد الأوروبي للبلاستيك أحادي الاستخدام كالشفاطات والأواني', motCleHeading: 'EU-Verbot für Einwegplastik', motCleText: 'Strohhalme, Besteck und Wattestäbchen aus Kunststoff dürfen nicht mehr verkauft werden', paragraphDe: 'Seit Inkrafttreten der EU-Richtlinie sind Einweg-Plastikbesteck, Trinkhalme und To-go-Boxen aus Styropor aus den Regalen verschwunden und durch Holz oder Papier ersetzt worden.', paragraphAr: 'منذ دخول قانون الاتحاد الأوروبي حيز التنفيذ تم منع بيع الشفاطات والملاعق البلاستيكية أحادية الاستعمال.', explanationAr: 'الموكلي: EU-Verbot ↔ Trinkhalme und Plastikbesteck verboten.' },
      { origLetter: 'G', headingDe: 'Richtige Mülltrennung im Haushalt ist Voraussetzung für gutes Recycling', headingAr: 'الفرز الصحيح للنفايات في المنزل شرط أساسي لإعادة تدوير جيدة', motCleHeading: 'Richtige Mülltrennung im Haushalt', motCleText: 'Gelber Sack nur für Verpackungen / Joghurtbecher und Aludeckel voneinander trennen', paragraphDe: 'Recyclinganlagen arbeiten nur dann effizient, wenn Verbraucher im Alltag Verpackungen sauber im Gelben Sack entsorgen und Aludeckel vom Joghurtbecher abziehen.', paragraphAr: 'لا تنجح مصانع إعادة التدوير إلا إذا قام المواطنون بفرز الأغلفة جيداً وفصل أغطية الألمنيوم عن علب الياغورت.', explanationAr: 'الموكلي: Mülltrennung ↔ Gelber Sack und Joghurtbecher.' },
    ]
  ),
];
