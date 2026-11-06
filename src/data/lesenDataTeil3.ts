import { Teil3Topic, Teil3Situation, Teil3Anzeige, VariantCodeInfo } from './lesenTypes';

interface CustomSitSpec {
  num: number; // 11..20
  sitDe: string;
  sitAr: string;
  motCleSit: string;
  motCleAnz: string;
  anzTitleDe?: string;
  anzBodyDe?: string;
  anzBodyAr?: string;
}

const AD_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

function buildTeil3Topic(
  number: number,
  id: string,
  titleDe: string,
  titleAr: string,
  linkedWith: string,
  frequencyBadge: string,
  variants: VariantCodeInfo[],
  customSituations?: CustomSitSpec[]
): Teil3Topic {
  const origCode = variants[0].code.replace(/\s+/g, '');
  const mod1Code = variants[1]?.code.replace(/\s+/g, '');
  const mod2Code = variants[2]?.code.replace(/\s+/g, '');

  const customMap = new Map<number, CustomSitSpec>();
  if (customSituations) {
    customSituations.forEach((c) => customMap.set(c.num, c));
  }

  const adMap = new Map<string, { titleDe: string; bodyDe: string; arabic: string; motCle: string }>();

  const situations: Teil3Situation[] = Array.from({ length: 10 }, (_, idx) => {
    const sNum = 11 + idx;
    const origLetter = origCode[idx] || 'X';
    const mod1Letter = mod1Code ? mod1Code[idx] : undefined;
    const mod2Letter = mod2Code ? mod2Code[idx] : undefined;

    const correctMap: Record<string, string> = { original: origLetter };
    if (mod1Letter) correctMap.mod1 = mod1Letter;
    if (mod2Letter) correctMap.mod2 = mod2Letter;

    const custom = customMap.get(sNum);
    const isX = origLetter === 'X';

    const sitDe =
      custom?.sitDe ||
      (isX
        ? `Situation ${sNum}: Sie suchen im Bereich „${titleDe.split('/')[0].trim()}“ ein ganz spezielles Angebot mit kostenlosem 24-Stunden-Sofortservice am Feiertag.`
        : `Situation ${sNum}: Sie interessieren sich im Bereich „${titleDe.split('/')[0].trim()}“ für ein passendes Angebot (Schlüsselbegriff ${sNum} -> Anzeige ${origLetter}).`);

    const sitAr =
      custom?.sitAr ||
      (isX
        ? `الحالة ${sNum}: تبحث في موضوع «${titleAr}» عن عرض خاص جداً غير متوفر في أي إعلان (الجواب هو X = لا يوجد إعلان مناسب!).`
        : `الحالة ${sNum}: تبحث في موضوع «${titleAr}» عن العرض المطابق للإعلان (${origLetter}).`);

    const motCleSit =
      custom?.motCleSit ||
      (isX ? `Kein passendes Angebot / 24-Stunden-Feiertagsservice` : `Schlüsselbegriff ${sNum} (${titleDe.split('/')[0].trim()})`);

    const motCleAnz =
      custom?.motCleAnz ||
      (isX
        ? `X — Keine passende Anzeige (فخ: الإعلانات الأخرى فيها شروط مخالفة أو نفي)`
        : `Angebot ${origLetter}: ${custom?.motCleSit || `Spezialangebot für Situation ${sNum}`}`);

    if (!isX && AD_LETTERS.includes(origLetter)) {
      adMap.set(origLetter, {
        titleDe: custom?.anzTitleDe || `Anzeige ${origLetter} — ${titleDe.split('/')[0].trim()} Spezial`,
        bodyDe:
          custom?.anzBodyDe ||
          `Unser Angebot in Anzeige ${origLetter}: ${motCleAnz}. Wir bieten Ihnen professionelle Beratung, flexible Termine und geprüfte Qualität rund um ${titleDe}.`,
        arabic:
          custom?.anzBodyAr ||
          `الإعلان ${origLetter} (جواب الحالة ${sNum}): يوفر ${motCleSit} بشروط مناسبة تماماً لما تبحث عنه.`,
        motCle: motCleAnz,
      });
    }

    return {
      situationNumber: sNum,
      situationDe: sitDe,
      situationAr: sitAr,
      correctLetterByVariant: correctMap,
      motCleSituation: motCleSit,
      motCleAnzeige: motCleAnz,
      explanationAr: isX
        ? `⚠️ انتبه لفخ X في السؤال ${sNum}! هذا الطلب (${motCleSit}) لا يوجد له أي إعلان مطابق في A–L، لذلك الجواب الصحيح هو X.`
        : `الحالة ${sNum} كتقلب على «${motCleSit}»، وفي الإعلان (${origLetter}) كنلقاو الموكلي المطابق «${motCleAnz}».`,
      trapWarningAr:
        mod1Letter && mod1Letter !== origLetter
          ? `⚠️ تنبيه التعديل: في النسخة الأساسية الجواب هو ${origLetter}، وفي المعدل كيرجع ${mod1Letter}!`
          : isX
          ? `🚨 رد بالك: السؤال ${sNum} جوابو هو X (لا يوجد إعلان مناسب)!`
          : undefined,
    };
  });

  const anzeigen: Teil3Anzeige[] = AD_LETTERS.map((letter) => {
    const existing = adMap.get(letter);
    if (existing) {
      return {
        letter,
        titleDe: existing.titleDe,
        bodyDe: existing.bodyDe,
        arabicTranslation: existing.arabic,
        motCle: existing.motCle,
      };
    }
    return {
      letter,
      titleDe: `Anzeige ${letter} — ${titleDe.split('/')[0].trim()} Info & Service`,
      bodyDe: `Allgemeines Informationsangebot zum Thema ${titleDe}. Hinweis: Dieses Angebot gilt leider nicht am Wochenende oder nur für Großunternehmen (Typische TELC-Falle / Distraktor).`,
      arabicTranslation: `الإعلان ${letter}: إعلان فخ (Distraktor) يحتوي على شروط غير مطابقة (مثلاً خاص بالشركات فقط أو غير متاح في نهاية الأسبوع).`,
      motCle: `nur für Großunternehmen / nicht am Wochenende`,
    };
  });

  return {
    id,
    number,
    titleDe,
    titleAr,
    linkedWith,
    frequencyBadge,
    variants,
    situations,
    anzeigen,
  };
}

export const TEIL3_TOPICS: Teil3Topic[] = [
  buildTeil3Topic(
    1,
    'film-fernsehprogramm',
    'Film / Fernsehprogramm',
    'الأفلام والبرنامج التلفزيوني (Film)',
    'Inseln (أ) / Tanzkurs / Programmierer 1',
    '🔥 طايح بزاف (LIBHXEADFX / LIBHXEADFG)',
    [
      { key: 'original', label: 'النسخة 1 (الأساسي)', code: 'LIBHXEADFX' },
      {
        key: 'mod1',
        label: 'النسخة 2 (المعدل)',
        code: 'LIBHXEADFG',
        changeNote: '⚠️ غير السؤال 20 في اللخر كيتبدل من X لـ G! أما 15 كيبقى ديما X.',
      },
    ],
    [
      {
        num: 11,
        sitDe: 'Ihr Geschichtslehrer möchte mit seiner Klasse einen historischen Dokumentarfilm über das Leben im Mittelalter anschauen.',
        sitAr: 'أستاذ التاريخ يريد مشاهدة فيلم وثائقي تاريخي حول الحياة في العصور الوسطى.',
        motCleSit: 'historischer Dokumentarfilm über das Mittelalter',
        motCleAnz: 'Dokumentation: Ritter, Burgen und das Leben im Mittelalter',
        anzTitleDe: 'Anzeige L — Kulturkanal: Zeitreise ins Mittelalter',
        anzBodyDe: 'Große historische Dokumentation über Ritter, Burgen und den Alltag der Bauern im europäischen Mittelalter mit Experteninterviews.',
        anzBodyAr: 'الإعلان L: فيلم وثائقي تاريخي كبير حول الفرسان والقلاع والحياة اليومية في العصور الوسطى.',
      },
      {
        num: 12,
        sitDe: 'Ihre Nachbarin liebt spannende Kriminalfilme und sucht einen Krimi am späten Abend.',
        sitAr: 'جارتك تحب أفلام الجريمة المشوقة وتبحث عن فيلم بوليسي في وقت متأخر من المساء.',
        motCleSit: 'Spannender Krimi am späten Abend',
        motCleAnz: 'Spätprogramm 22:45 Uhr: Spannender Thriller & Kriminalfilm',
        anzTitleDe: 'Anzeige I — Nachtkrimi: Spuren im Nebel (22:45 Uhr)',
        anzBodyDe: 'Spannender Kriminalfilm am späten Abend: Kommissar Berger ermittelt in einem rätselhaften Kunstdiebstahl in Hamburg.',
        anzBodyAr: 'الإعلان I: فيلم بوليسي مشوق في السهرة (22:45) حول التحقيق في سرقة لوحة فنية.',
      },
      {
        num: 13,
        sitDe: 'Sie suchen für Ihre sechsjährige Tochter ein gewaltfreies Kinderprogramm am Sonntagmorgen ohne Werbung.',
        sitAr: 'تبحث لابنتك ذات الست سنوات عن برنامج أطفال صباح الأحد بدون إعلانات تجارية.',
        motCleSit: 'Kinderprogramm am Sonntagmorgen ohne Werbung',
        motCleAnz: 'Sonntag 8:00 Uhr: Kinderfernsehen komplett werbefrei',
        anzTitleDe: 'Anzeige B — Sonntagmorgen für Entdecker (ab 6 Jahren)',
        anzBodyDe: 'Jeden Sonntagmorgen von 7 bis 10 Uhr zeigen wir liebevolle Zeichentrickgeschichten und Märchen komplett ohne Werbung.',
        anzBodyAr: 'الإعلان B: كل صباح أحد نعرض رسوماً متحركة وقصصاً للأطفال بدون أي إعلانات تجارية.',
      },
      {
        num: 14,
        sitDe: 'Ein Freund möchte lernen, wie man schnelle vegetarische Gerichte zubereitet, und sucht eine passende Kochshow.',
        sitAr: 'صديقك يريد تعلم تحضير أطباق نباتية سريعة ويبحث عن برنامج طبخ مناسب.',
        motCleSit: 'Kochshow mit schnellen vegetarischen Rezepten',
        motCleAnz: 'Grüne Küche: Vegetarische Gerichte in 20 Minuten',
        anzTitleDe: 'Anzeige H — TV-Studio: Grüne Küche leicht gemacht',
        anzBodyDe: 'In unserer täglichen Kochshow zeigen Spitzenköche schnelle vegetarische Rezepte mit frischem Marktgemüse in unter 20 Minuten.',
        anzBodyAr: 'الإعلان H: برنامج طبخ يومي يقدم وصفات نباتية سريعة التحضير في أقل من 20 دقيقة.',
      },
      {
        num: 15,
        sitDe: 'Ihr Bruder möchte heute Abend unbedingt die Live-Übertragung eines internationalen Fußballspiels im freien Fernsehen verfolgen.',
        sitAr: 'أخوك يريد مشاهدة بث مباشر لمباراة كرة قدم دولية الليلة مجاناً.',
        motCleSit: 'Live-Übertragung eines Fußballspiels',
        motCleAnz: 'X — Keine passende Anzeige (توجد فقط ملخصات مسجلة غداً وليس بثاً مباشراً)',
      },
      {
        num: 16,
        sitDe: 'Sie planen eine Urlaubsreise und möchten eine Reisereportage über Natur und Kultur in Südamerika sehen.',
        sitAr: 'تخطط لعطلة وتريد مشاهدة ربورتاج سفر حول الطبيعة والثقافة في أمريكا الجنوبية.',
        motCleSit: 'Reisereportage über Südamerika',
        motCleAnz: 'Fernweh-Magazin: Von den Anden bis zum Amazonas in Südamerika',
        anzTitleDe: 'Anzeige E — Fernweh-Reportage: Zauberhaftes Südamerika',
        anzBodyDe: 'Unsere Reisereportage führt Sie durch Peru, Chile und Brasilien – von den Gipfeln der Anden bis in den Regenwald Südamerikas.',
        anzBodyAr: 'الإعلان E: ربورتاج سياحي يأخذكم عبر جبال الأنديز وغابات الأمازون في أمريكا الجنوبية.',
      },
      {
        num: 17,
        sitDe: 'Für einen gemütlichen Abend zu zweit suchen Sie eine humorvolle Liebeskomödie aus Frankreich.',
        sitAr: 'لقضاء أمسية هادئة تبحث عن فيلم كوميدي رومانسي من فرنسا.',
        motCleSit: 'Liebeskomödie aus Frankreich',
        motCleAnz: 'Französische Kino-Komödie: Verliebt in Paris',
        anzTitleDe: 'Anzeige A — Kino am Abend: Verliebt an der Seine',
        anzBodyDe: 'Charmante Liebeskomödie aus Frankreich über einen Pariser Buchhändler und eine Musikerin, die sich zufällig im Zug begegnen.',
        anzBodyAr: 'الإعلان A: فيلم كوميدي رومانسي فرنسي حول بائع كتب في باريس يلتقي عازفة موسيقى.',
      },
      {
        num: 18,
        sitDe: 'Ihr Neffe interessiert sich für Astronomie und sucht ein Wissenschaftsmagazin über moderne Raumfahrt und Planeten.',
        sitAr: 'ابن أخيك مهتم بعلم الفلك ويبحث عن برنامج علمي حول الفضاء والكواكب.',
        motCleSit: 'Wissenschaftsmagazin über Raumfahrt und Planeten',
        motCleAnz: 'Kosmos Aktuell: Neue Missionen zum Mars und moderne Raumfahrt',
        anzTitleDe: 'Anzeige D — Wissenschaftsmagazin: Kosmos & Raumfahrt',
        anzBodyDe: 'Astronomen erklären aktuelle Bilder des Weltraumteleskops und berichten über neue Missionen der modernen Raumfahrt zum Mars.',
        anzBodyAr: 'الإعلان D: مجلة علمية يشرح فيها علماء الفلك أحدث صور الفضاء والرحلات نحو المريخ.',
      },
      {
        num: 19,
        sitDe: 'Ihre Mutter besitzt einen großen Balkon und möchte im Fernsehen praktische Tipps für Gartenfreunde und Blumenpflege sehen.',
        sitAr: 'والدتك تملك شرفة كبيرة وتريد مشاهدة برنامج يقدم نصائح لعشاق الحدائق والأزهار.',
        motCleSit: 'Ratgeber für Gartenfreunde und Blumenpflege',
        motCleAnz: 'Gartenzeit: Praktische Tipps für Balkonpflanzen, Obstbäume und Blumen',
        anzTitleDe: 'Anzeige F — Ratgeber: Blühender Balkon & Gartenfreunde',
        anzBodyDe: 'Unser Gärtnermeister gibt jede Woche wertvolle Tipps für Gartenfreunde zum richtigen Schneiden, Düngen und Pflegen von Blumen.',
        anzBodyAr: 'الإعلان F: برنامج إرشادي لعشاق الحدائق يقدم نصائح عملية للعناية بالأزهار ونباتات الشرفة.',
      },
      {
        num: 20,
        sitDe: 'Ihr Großvater liebt klassische Musik und möchte ein Konzert aus einer berühmten Oper im Fernsehen erleben.',
        sitAr: 'جدك يحب الموسيقى الكلاسيكية ويريد مشاهدة حفل موسيقي من دار أوبرا شهيرة.',
        motCleSit: 'Klassisches Konzert aus der Oper',
        motCleAnz: 'Festkonzert aus der Staatsoper (في الأساسي X وفي المعدل G!)',
        anzTitleDe: 'Anzeige G — Festabend aus der Staatsoper',
        anzBodyDe: 'Übertragung des großen klassischen Galakonzerts mit dem Symphonieorchester direkt aus der historischen Oper.',
        anzBodyAr: 'الإعلان G: بث لحفل موسيقي كلاسيكي مع الأوركسترا السيمفونية من دار الأوبرا (جواب 20 في النسخة المعدلة).',
      },
    ]
  ),

  buildTeil3Topic(
    2,
    'hund',
    'Hund / Hunde',
    'الكلاب وتربيتها (Hund)',
    'Inseln (النسخة ب)',
    '🔥 طايح بزاف (BLFCXGHXIA)',
    [{ key: 'original', label: 'الأساسي', code: 'BLFCXGHXIA' }],
    [
      { num: 11, sitDe: 'Sie haben einen zehn Wochen alten Hund bekommen und suchen eine Welpenschule am Wochenende.', sitAr: 'حصلت على جرو صغير وتبحث عن مدرسة لتدريب الجراء في نهاية الأسبوع.', motCleSit: 'Welpenschule für junge Hunde am Wochenende', motCleAnz: 'Spielend lernen in unserer Welpengruppe jeden Samstag und Sonntag', anzTitleDe: 'Anzeige B — Hundezentrum: Welpenschule am Wochenende' },
      { num: 12, sitDe: 'Sie müssen beruflich für eine Woche verreisen und suchen eine zuverlässige Hundepension mit Familienanschluss.', sitAr: 'ستسافر لمدة أسبوع وتبحث عن فندق/إقامة موثوقة للكلاب أثناء العطلة.', motCleSit: 'Hundepension während des Urlaubs', motCleAnz: 'Liebevolle Urlaubsbetreuung in unserer Hundepension mit großem Garten', anzTitleDe: 'Anzeige L — Hundepension Pfotenparadies' },
      { num: 13, sitDe: 'Ein älteres Ehepaar möchte einem ruhigen, älteren Hund aus dem Tierheim ein neues Zuhause geben.', sitAr: 'زوجان مسنان يرغبان في تبني كلب هادئ وكبير السن من ملجأ الحيوانات.', motCleSit: 'Ruhiger älterer Hund für Senioren aus dem Tierheim', motCleAnz: 'Tierheim vermittelt liebe, ruhige Hunde-Senioren an ältere Menschen', anzTitleDe: 'Anzeige F — Tierheim: Zweite Chance für ältere Hunde' },
      { num: 14, sitDe: 'Ihr langhaariger Hund braucht im Sommer dringend einen Haarschnitt beim Hundefriseur.', sitAr: 'كلبك ذو الشعر الطويل يحتاج إلى حلاقة وعناية عند حلاق الكلاب.', motCleSit: 'Hundefriseur für langhaarige Rassen', motCleAnz: 'Hundesalon: Waschen, Schneiden und Fellpflege für langhaarige Hunde', anzTitleDe: 'Anzeige C — Hundesalon & Fellpflege' },
      { num: 15, sitDe: 'Ihr Hund hat sich sonntags um Mitternacht verletzt und Sie suchen einen Tierarzt mit 24-Stunden-Notdienst.', sitAr: 'أصيب كلبك منتصف الليل وتبحث عن طبيب بيطري للمداومة الليلية (الجواب X!).', motCleSit: 'Tierarzt mit Notdienst mitten in der Nacht', motCleAnz: 'X — Keine passende Anzeige' },
      { num: 16, sitDe: 'Ihr Hund verträgt kein normales Futter und Sie suchen spezielles Hundefutter bei Allergien.', sitAr: 'كلبك يعاني من حساسية غذائية وتبحث عن طعام خاص للكلاب ضد الحساسية.', motCleSit: 'Spezielles Hundefutter bei Allergien', motCleAnz: 'Getreidefreies Spezialfutter für empfindliche Hunde mit Allergien', anzTitleDe: 'Anzeige G — Naturkost & Spezialfutter für Allergiker-Hunde' },
      { num: 17, sitDe: 'Ihr Hund bellt im Straßenverkehr jedes Fahrzeug an; Sie suchen Einzeltraining gegen Angst vor Autos.', sitAr: 'كلبك يخاف وينبح على السيارات وتبحث عن تدريب خاص للتغلب على الخوف من السيارات.', motCleSit: 'Hundeschule gegen Angst vor Autos im Straßenverkehr', motCleAnz: 'Verhaltenstraining für unsichere Hunde bei Angst vor Autos und Lärm', anzTitleDe: 'Anzeige H — Mobiles Verhaltenstraining im Stadtverkehr' },
      { num: 18, sitDe: 'Sie suchen für den Sommerurlaub ein Hotel mit eigenem Hundestrand direkt am Mittelmeer.', sitAr: 'تبحث لعطلة الصيف عن فندق بشاطئ خاص للكلاب على البحر الأبيض المتوسط (الجواب X!).', motCleSit: 'Hundestrand am Mittelmeer', motCleAnz: 'X — Keine passende Anzeige' },
      { num: 19, sitDe: 'Sie möchten sich über die Ausbildung von Hunden zum Blindenführhund informieren.', sitAr: 'تريد الاستعلام حول تكوين وتدريب الكلاب المرافقة للمكفوفين.', motCleSit: 'Ausbildung zum Blindenführhund', motCleAnz: 'Führhundschule bildet Assistenz- und Blindenführhunde aus', anzTitleDe: 'Anzeige I — Zentrum für Assistenz- und Blindenführhunde' },
      { num: 20, sitDe: 'Sie suchen eine günstige Haftpflicht- und Krankenversicherung für Hundehalter.', sitAr: 'تبحث عن تأمين مناسب للمسؤولية المدنية والعلاج لأصحاب الكلاب.', motCleSit: 'Versicherung für Hundehalter', motCleAnz: 'Rundum-Schutz: Hundehaftpflicht und OP-Versicherung zu fairen Tarifen', anzTitleDe: 'Anzeige A — Tierversicherung Direkt' },
    ]
  ),

  buildTeil3Topic(
    3,
    'ausfluege',
    'Ausflüge / الرحلات',
    'الرحلات والنزهات (Ausflüge)',
    'Bilder / Fotografie',
    '🔥 طايح بزاف (DXFCJKXAHL)',
    [{ key: 'original', label: 'الأساسي', code: 'DXFCJKXAHL' }],
    [
      { num: 11, sitDe: 'Sie möchten am Samstagabend eine romantische Schifffahrt auf dem Rhein mit warmem Abendessen machen.', sitAr: 'تريد القيام بجولة مسائية بالسفينة في نهر الراين مع وجبة عشاء.', motCleSit: 'Schifffahrt auf dem Rhein mit Abendessen', motCleAnz: 'Abendliche Panoramafahrt auf dem Rhein inklusive Drei-Gänge-Menü', anzTitleDe: 'Anzeige D — Rheinschifffahrt am Abend' },
      { num: 12, sitDe: 'Sie planen eine einwöchige Radtour mit täglichem Gepäcktransport von Hotel zu Hotel.', sitAr: 'تخطط لجولة بالدراجة لمدة أسبوع مع نقل الأمتعة بين الفنادق (الجواب X!).', motCleSit: 'Mehrtägige Radtour mit Gepäcktransport', motCleAnz: 'X — Keine passende Anzeige' },
      { num: 13, sitDe: 'Ein Lehrer sucht für seine Schulklasse eine spannende Burgführung mit Schauspielern im Mittelalter-Kostüm.', sitAr: 'أستاذ يبحث لقسمه عن جولة داخل قلعة تاريخية بأزياء العصور الوسطى.', motCleSit: 'Burgführung für Schulklassen im Mittelalter-Kostüm', motCleAnz: 'Erlebnisführung auf der Ritterburg für Schulklassen in historischen Gewändern', anzTitleDe: 'Anzeige F — Lebendige Ritterburg für Schulen' },
      { num: 14, sitDe: 'Sie suchen einen sicheren Kletterwald für Familien mit Kindern ab acht Jahren.', sitAr: 'تبحث عن غابة تسلق آمنة للعائلات مع أطفال ابتداءً من 8 سنوات.', motCleSit: 'Kletterwald für Familien mit Kindern ab 8 Jahren', motCleAnz: 'Abenteuer-Kletterpark in den Baumwipfeln für Kinder ab 8 Jahren', anzTitleDe: 'Anzeige C — Familien-Kletterwald im Grünen' },
      { num: 15, sitDe: 'Sie möchten an einer geführten Nachtwanderung durch den Nationalpark teilnehmen.', sitAr: 'تريد المشاركة في جولة مشي ليلية مصحوبة بمرشد داخل المنتزه الوطني.', motCleSit: 'Geführte Nachtwanderung durch den Nationalpark', motCleAnz: 'Mit dem Ranger bei Vollmond auf Nachtwanderung durch den Nationalpark', anzTitleDe: 'Anzeige J — Nationalpark bei Nacht erleben' },
      { num: 16, sitDe: 'Für ein verregnetes Wochenende suchen Sie ein interaktives Technikmuseum, in dem man Experimente selbst ausprobieren kann.', sitAr: 'لعطلة نهاية أسبوع ممطرة تبحث عن متحف تقني تفاعلي للتجارب.', motCleSit: 'Besuch im Technikmuseum bei Regenwetter', motCleAnz: 'Ideales Programm bei Regen: Interaktives Technikmuseum zum Mitmachen', anzTitleDe: 'Anzeige K — Experimentier- & Technikmuseum' },
      { num: 17, sitDe: 'Sie möchten Ihrer Frau zum Geburtstag eine Heißluftballonfahrt über die Alpen schenken.', sitAr: 'تريد إهداء زوجتك رحلة بالمنطاد الهوائي فوق جبال الألب (الجواب X!).', motCleSit: 'Ballonfahrt über die Alpen', motCleAnz: 'X — Keine passende Anzeige' },
      { num: 18, sitDe: 'Sie suchen für einen Ausflug mit Ihrer Großmutter im Rollstuhl einen barrierefreien botanischen Garten.', sitAr: 'تبحث لنزهة مع جدتك على كرسي متحرك عن حديقة نباتية مجهزة لذوي الاحتياجات الخاصة.', motCleSit: 'Barrierefreier botanischer Garten für Rollstuhlfahrer', motCleAnz: 'Stufenlose Wege im Botanischen Garten – ideal für Rollstuhlfahrer', anzTitleDe: 'Anzeige A — Botanischer Garten Barrierefrei' },
      { num: 19, sitDe: 'Ihre Kinder möchten auf einem Bauernhof zusehen, wie aus frischer Milch Käse hergestellt wird.', sitAr: 'يريد أطفالك زيارة مزرعة لمشاهدة كيفية صنع الجبن من الحليب الطازج.', motCleSit: 'Bauernhof erleben mit Käseherstellung', motCleAnz: 'Schaubauernhof: Tiere füttern und traditionelle Käseherstellung erleben', anzTitleDe: 'Anzeige H — Bio-Erlebnisbauernhof & Hofkäserei' },
      { num: 20, sitDe: 'Sie bekommen Besuch aus dem Ausland und suchen eine Stadtrundfahrt im offenen Doppeldeckerbus mit Audioguide.', sitAr: 'لديك ضيوف من الخارج وتبحث عن جولة سياحية في المدينة بحافلة ذات طابقين مكشوفة.', motCleSit: 'Stadtrundfahrt im offenen Doppeldeckerbus', motCleAnz: 'Hop-on-Hop-off Stadtrundfahrt im roten Doppeldeckerbus in 10 Sprachen', anzTitleDe: 'Anzeige L — City-Tour im Doppeldeckerbus' },
    ]
  ),

  buildTeil3Topic(
    4,
    'musik',
    'Musik / الموسيقى',
    'الموسيقى والمعاهد الموسيقية (Musik)',
    'Limonade N',
    '🔥 طايح بزاف (LCBEXIGDXK)',
    [{ key: 'original', label: 'الأساسي', code: 'LCBEXIGDXK' }],
    [
      { num: 11, sitDe: 'Sie sind berufstätig und suchen Klavierunterricht für erwachsene Anfänger am Abend.', sitAr: 'أنت موظف وتبحث عن دروس بيانو للمبتدئين الكبار في المساء.', motCleSit: 'Klavierunterricht für erwachsene Anfänger am Abend', motCleAnz: 'Klavierschule bietet Abendkurse ab 19 Uhr speziell für Berufstätige und Späteinsteiger', anzTitleDe: 'Anzeige L — Klavierstudio für Erwachsene' },
      { num: 12, sitDe: 'Ihr Sohn möchte Schlagzeug spielen lernen und Sie möchten ein gebrauchtes Schlagzeug günstig kaufen.', sitAr: 'ابنك يريد تعلم العزف على الطبول وتريد شراء آلة درامز مستعملة بثمن مناسب.', motCleSit: 'Gebrauchtes Schlagzeug günstig kaufen', motCleAnz: 'An- und Verkauf von geprüften gebrauchten Schlagzeugen zu kleinen Preisen', anzTitleDe: 'Anzeige C — Drum-Shop: Gebrauchte Instrumente' },
      { num: 13, sitDe: 'Ihre siebenjährige Tochter singt gerne und Sie suchen einen Kinderchor ab 6 Jahren.', sitAr: 'ابنتك تحب الغناء وتبحث عن جوقة أطفال ابتداءً من 6 سنوات.', motCleSit: 'Kinderchor sucht neue Mitglieder ab 6 Jahren', motCleAnz: 'Fröhlicher Kinderchor lädt Mädchen und Jungen ab 6 Jahren zum Mitsingen ein', anzTitleDe: 'Anzeige B — Städtischer Kinderchor' },
      { num: 14, sitDe: 'Sie möchten am Sonntag mit Freunden ein Open-Air-Jazzfestival im Stadtpark besuchen.', sitAr: 'تريد حضور مهرجان جاز في الهواء الطلق بالحديقة العمومية يوم الأحد.', motCleSit: 'Open-Air-Jazzfestival im Stadtpark', motCleAnz: 'Jazz im Grünen: Großes Open-Air-Festival auf der Waldbühne im Stadtpark', anzTitleDe: 'Anzeige E — Sommer-Jazz im Stadtpark' },
      { num: 15, sitDe: 'Ihre Band möchte für eine Woche ein professionelles Tonstudio für eine CD-Aufnahme mieten.', sitAr: 'فرقتك الموسيقية تريد كراء استوديو تسجيل احترافي لتسجيل ألبوم (الجواب X!).', motCleSit: 'Tonstudio für professionelle CD-Aufnahme mieten', motCleAnz: 'X — Keine passende Anzeige' },
      { num: 16, sitDe: 'Ihr vierzehnjähriger Sohn sucht einen einwöchigen Gitarrenkurs in den Sommerferien.', sitAr: 'ابنك المراهق يبحث عن دورة لتعلم الغيتار خلال عطلة الصيف.', motCleSit: 'Gitarrenkurs in den Sommerferien', motCleAnz: 'Ferien-Workshop: Akustik- und E-Gitarre lernen in den Sommerferien', anzTitleDe: 'Anzeige I — Sommer-Gitarrencamp für Jugendliche' },
      { num: 17, sitDe: 'Sie haben auf dem Dachboden eine alte Geige gefunden und suchen eine Werkstatt zur Reparatur von Streichinstrumenten.', sitAr: 'وجدت كماناً قديماً وتبحث عن ورشة لإصلاح الآلات الوترية القديمة.', motCleSit: 'Reparatur von historischen Streichinstrumenten (Geige)', motCleAnz: 'Geigenbaumeister übernimmt Restaurierung und Reparatur von Geigen und Celli', anzTitleDe: 'Anzeige G — Meisterwerkstatt für Geigenbau' },
      { num: 18, sitDe: 'Eine junge Schülerband sucht einen schallisolierten Proberaum am Wochenende.', sitAr: 'فرقة موسيقية شابة تبحث عن قاعة تدريب عازلة للصوت في نهاية الأسبوع.', motCleSit: 'Proberaum für junge Rockband am Wochenende', motCleAnz: 'Günstige schallisolierte Proberäume im Jugendzentrum samstags und sonntags frei', anzTitleDe: 'Anzeige D — Musikbunker: Proberäume für Bands' },
      { num: 19, sitDe: 'Als Student suchen Sie kostenlose Restkarten für klassische Konzerte an der Abendkasse.', sitAr: 'كطالب تبحث عن تذاكر مجانية للحفلات الكلاسيكية في شباك المساء (الجواب X!).', motCleSit: 'Kostenlose Konzertkarten für Studierende', motCleAnz: 'X — Keine passende Anzeige' },
      { num: 20, sitDe: 'Nach einer stressigen Arbeitswoche suchen Sie einen Kurs für Musiktherapie und Klangentspannung.', sitAr: 'بعد أسبوع عمل مرهق تبحث عن حصة للعلاج بالموسيقى والاسترخاء الصوتي.', motCleSit: 'Musiktherapie zur Entspannung', motCleAnz: 'Klangschalen und sanfte Musiktherapie zum Stressabbau und zur Entspannung', anzTitleDe: 'Anzeige K — Praxis für Klang & Musiktherapie' },
    ]
  ),

  buildTeil3Topic(
    5,
    'urlaub-silberhochzeit',
    'Urlaub / Silberhochzeit',
    'العطلة وعيد الزواج الفضي (Urlaub / Silberhochzeit)',
    'Grundschule',
    '🔥 طايح بزاف (ABCGDHIJXX — جوج X في 19 و 20!)',
    [{ key: 'original', label: 'الأساسي', code: 'ABCGDHIJXX' }],
    [
      { num: 11, sitDe: 'Ihre Eltern feiern Silberhochzeit und suchen ein romantisches Schlosshotel für ein Wochenende.', sitAr: 'والداك يحتفلان بمرور 25 سنة على زواجهما ويبحثان عن فندق قصر رومانسي.', motCleSit: 'Silberhochzeit im romantischen Schlosshotel', motCleAnz: 'Feiern Sie Ihre Silberhochzeit bei Kerzenschein im historischen Schlosshotel', anzTitleDe: 'Anzeige A — Romantik-Schlosshotel am See' },
      { num: 12, sitDe: 'Eine Familie mit drei Kindern sucht Urlaub auf dem Bauernhof mit Ponyreiten.', sitAr: 'عائلة بثلاثة أطفال تبحث عن عطلة في مزرعة مع ركوب الخيول الصغيرة.', motCleSit: 'Urlaub auf dem Bauernhof mit Ponyreiten', motCleAnz: 'Familienfreundlicher Ferienhof mit Kühen, Katzen und kostenlosem Ponyreiten', anzTitleDe: 'Anzeige B — Ferienbauernhof Sonnenschein' },
      { num: 19, sitDe: 'Sie suchen eine Last-Minute-Kreuzfahrt in die Karibik inklusive Hin- und Rückflug unter 500 Euro.', sitAr: 'تبحث عن رحلة بحرية للكاريبي شاملة الطيران بأقل من 500 أورو (الجواب X!).', motCleSit: 'Kreuzfahrt in die Karibik unter 500 Euro', motCleAnz: 'X — Keine passende Anzeige' },
      { num: 20, sitDe: 'Sie möchten im Winter ein einsames Blockhaus in Lappland direkt unter dem Polarlicht mieten.', sitAr: 'تريد كراء كوخ خشبي في لابلاند تحت الشفق القطبي في الشتاء (الجواب X!).', motCleSit: 'Blockhaus in Lappland im Winter', motCleAnz: 'X — Keine passende Anzeige' },
    ]
  ),

  buildTeil3Topic(
    6,
    'tiere-schraenke',
    'Tiere / Schränke (الضوء)',
    'الحيوانات الأليفة والخزانات (Tiere / Schränke)',
    'Das Licht',
    '✅ أساسي + معدل (AJEBLXGXDI)',
    [{ key: 'original', label: 'الأساسي', code: 'AJEBLXGXDI' }]
  ),

  buildTeil3Topic(
    7,
    'tierwelt-tierdokumentationen',
    'Tierwelt / Tierdokumentationen',
    'عالم الحيوان والوثائقيات (Tierwelt)',
    'Die Umwelt',
    '🔥 طايح (CXGEAIFXBK)',
    [{ key: 'original', label: 'الأساسي', code: 'CXGEAIFXBK' }]
  ),

  buildTeil3Topic(
    8,
    'krankheiten-allergie',
    'Krankheiten / حساسية',
    'الأمراض والحساسية والوقاية (Krankheiten)',
    'Benzin',
    '🔥 طايح (JKAELICXGF)',
    [{ key: 'original', label: 'الأساسي', code: 'JKAELICXGF' }]
  ),

  buildTeil3Topic(
    9,
    'rechtsanwalt-wohnen',
    'Rechtsanwalt / Wohnen',
    'المحامي والسكن (Rechtsanwalt / Wohnen)',
    'Insekten (النسخة أ)',
    '🔥 رقم 1 في التسريبات (KEXACHFJBG)',
    [
      { key: 'original', label: 'النسخة 1 (Rechtsanwalt)', code: 'KEXACHFJBG' },
      { key: 'mod1', label: 'النسخة 2 (Wohnen 2)', code: 'GCIAXKJFEB', changeNote: 'نسخة السكن الثانية بكود GCIAXKJFEB (X في 15).' },
    ]
  ),

  buildTeil3Topic(
    10,
    'au-pair-maedchen',
    'Au-pair-Mädchen / Übersetzungen',
    'فتيات الأوبير والترجمة (Au-pair-Mädchen)',
    'Insekten (النسخة ب)',
    '🔥 رقم 1 في التسريبات (XCXGFDHEAB)',
    [{ key: 'original', label: 'الأساسي', code: 'XCXGFDHEAB' }]
  ),

  buildTeil3Topic(
    11,
    'koerpersprache',
    'Körpersprache',
    'لغة الجسد والتواصل (Körpersprache — 3 نسخ)',
    'Sport ist gesund & Österreich',
    '🔥 مع تعديلات (3 نسخ)',
    [
      { key: 'original', label: 'النسخة 1', code: 'XLXBHICXXE' },
      { key: 'mod1', label: 'النسخة 2', code: 'ALXBXHICKE', changeNote: 'في النسخة 2 السؤال 11 هو A والسؤال 19 هو K.' },
      { key: 'mod2', label: 'النسخة 3', code: 'XLXBAHICKE', changeNote: 'في النسخة 3 السؤال 11 هو X والسؤال 15 هو A.' },
    ]
  ),

  buildTeil3Topic(
    12,
    'weihnachten',
    'Weihnachten',
    'عيد الميلاد والهدايا (Weihnachten — 3 نسخ)',
    'Sport ist gesund (ب)',
    '🔥 مع تعديلات (3 نسخ)',
    [
      { key: 'original', label: 'النسخة 1', code: 'EJLIABFXHK' },
      { key: 'mod1', label: 'النسخة 2', code: 'EJXIABFXHK', changeNote: 'غير السؤال 13 كيتبدل من L لـ X!' },
      { key: 'mod2', label: 'النسخة 3', code: 'HAFIJBLXEK', changeNote: 'نسخة ثالثة بكود HAFIJBLXEK.' },
    ]
  ),

  buildTeil3Topic(
    13,
    'schwanger-1',
    'Schwanger 1 (المرأة الحامل 1)',
    'المرأة الحامل والاستعداد للولادة 1 (Schwanger 1)',
    'Impfung & Programmierer 2',
    '🔥 طايح (AXDHLGIKXF)',
    [{ key: 'original', label: 'الأساسي', code: 'AXDHLGIKXF' }]
  ),

  buildTeil3Topic(
    14,
    'schwanger-2',
    'Schwanger 2 (المرأة الحامل 2)',
    'المرأة الحامل والرضيع 2 (Schwanger 2)',
    'Kaffee',
    '🔥 طايح (XDLCEXGKAI)',
    [{ key: 'original', label: 'الأساسي', code: 'XDLCEXGKAI' }]
  ),

  buildTeil3Topic(
    15,
    'fotokurs',
    'Fotokurs',
    'دروس ومعدات التصوير (Fotokurs)',
    'Bonbon',
    '🔥 طايح (DHJXFBEXAC)',
    [{ key: 'original', label: 'الأساسي', code: 'DHJXFBEXAC' }]
  ),

  buildTeil3Topic(
    16,
    'berlin-schlafzug',
    'Berlin / قطار النوم',
    'برلين والسفر بقطار النوم (Berlin)',
    'Schlafzug',
    '🔥 طايح (FDXXKLJAIC)',
    [{ key: 'original', label: 'الأساسي', code: 'FDXXKLJAIC' }]
  ),

  buildTeil3Topic(
    17,
    'feuerwehr',
    'Feuerwehr / الرياضة والمطافئ',
    'رجال المطافئ والرياضة (Feuerwehr)',
    'Programmierer 3',
    '✅ أساسي + معدل',
    [
      { key: 'original', label: 'الأساسي', code: 'HGAJXEKCXL' },
      { key: 'mod1', label: 'المعدل', code: 'CXGAEJKXLH', changeNote: 'نسخة معدلة بكود CXGAEJKXLH (X في 12 و 18).' },
    ]
  ),

  buildTeil3Topic(
    18,
    'umzug',
    'Umzug / تعلم',
    'الرحيل والانتقال لمنزل جديد (Umzug)',
    'Kellner / Jugend forscht',
    '🔥 طايح (LHDBIJXEGX)',
    [{ key: 'original', label: 'الأساسي', code: 'LHDBIJXEGX' }]
  ),

  buildTeil3Topic(
    19,
    'kurort',
    'Kurort / الاستجمام',
    'منتجع الاستجمام والعلاج الطبيعي (Kurort)',
    'In den Alpen',
    '🔥 طايح مع الألب (FEKIGXCBXH)',
    [{ key: 'original', label: 'الأساسي', code: 'FEKIGXCBXH' }]
  ),

  buildTeil3Topic(
    20,
    'gaerten-der-welt',
    'Gärten der Welt',
    'حدائق العالم (Gärten der Welt)',
    'Kartoffeln',
    '🔥 طايح مع البطاطا (BFXICJEDLA)',
    [{ key: 'original', label: 'الأساسي', code: 'BFXICJEDLA' }]
  ),

  buildTeil3Topic(
    21,
    'haushaltshilfe',
    'Haushaltshilfe',
    'المساعدة المنزلية (Haushaltshilfe)',
    'Trampoline / Farben',
    '🔥 طايح (HFAIGEXKBC)',
    [{ key: 'original', label: 'الأساسي', code: 'HFAIGEXKBC' }]
  ),

  buildTeil3Topic(
    22,
    'kursprogramm',
    'Kursprogramm / Auf dem Weg',
    'برنامج الدورات التكوينية (Kursprogramm)',
    'Auf dem Weg',
    '✅ أساسي + معدل',
    [
      { key: 'original', label: 'الأساسي', code: 'JFEBKCHXLA' },
      { key: 'mod1', label: 'المعدل', code: 'GXEBJCFKLA', changeNote: 'في المعدل X كاين في 12 عوض 18!' },
    ]
  ),

  buildTeil3Topic(
    23,
    'bankkaufmann',
    'Bankkaufmann / Finanzen',
    'موظف البنك والتمويل (Bankkaufmann)',
    'Klassiker',
    '✅ أساسي + معدل',
    [
      { key: 'original', label: 'الأساسي', code: 'EGDCAFXILB' },
      { key: 'mod1', label: 'المعدل', code: 'HGDCAFXILE', changeNote: 'السؤال 11 ولى H والسؤال 20 ولى E.' },
    ]
  ),

  buildTeil3Topic(
    24,
    'weinbau-insekten',
    'Weinbau & Insekten',
    'زراعة الكروم والحشرات (Weinbau)',
    'Insekten / Umwelt',
    '✅ كلاسيكي (KJIGXCEHBA)',
    [{ key: 'original', label: 'الأساسي', code: 'KJIGXCEHBA' }]
  ),

  buildTeil3Topic(
    25,
    'stadtfuehrer',
    'Stadtführer',
    'المرشد السياحي وجولات المدن (Stadtführer)',
    'Trampoline / Russland',
    '🔥 طايح (FGJEXHBLAC)',
    [{ key: 'original', label: 'الأساسي', code: 'FGJEXHBLAC' }]
  ),

  buildTeil3Topic(
    26,
    'schnelle-wasserfahrzeuge',
    'Schnelle Wasserfahrzeuge',
    'القوارب والمركبات المائية السريعة (Wasserfahrzeuge)',
    'Tauchen / Nordsee',
    '✅ كلاسيكي (LGCJBXDAIH)',
    [{ key: 'original', label: 'الأساسي', code: 'LGCJBXDAIH' }]
  ),

  buildTeil3Topic(
    27,
    'auswanderung-tv',
    'Auswanderung TV / Kontakte (NEU 2026)',
    'برامج الهجرة والتعارف (Auswanderung TV NEU 2026)',
    'Sandfisch / Kleinkindern Fernsehen',
    '🆕 جديد NEU THEMA 2026 (IGFEADKXBC)',
    [
      { key: 'original', label: 'Auswanderung TV', code: 'IGFEADKXBC' },
      { key: 'mod1', label: 'Kontakte', code: 'FEIXCAGJKL', changeNote: 'كود موضوع Kontakte هو FEIXCAGJKL.' },
    ]
  ),

  buildTeil3Topic(
    28,
    'moebel-neu',
    'Möbel / الأثاث (NEU 2026)',
    'الأثاث والديكور المنزلي (Möbel NEU 2026)',
    'Sandfisch / Bäder (NEU 2026)',
    '🆕 جديد NEU THEMA 2026 (EHKBGJCFAD)',
    [{ key: 'original', label: 'الأساسي', code: 'EHKBGJCFAD' }]
  ),
];
