import { AskAiContextItem, SavedWordItem } from '../data/verbatimTypes';

export interface WordLookupResult {
  word: string;
  cleanWord: string;
  meaningAr: string;
  category: string;
  grammarTipAr: string;
  contextSentence?: string;
}

export interface SprachGrammarExplanation {
  gapNum: number;
  correctLetter: string;
  correctWord: string;
  ruleCategoryAr: string;
  explanationDarija: string;
}

export type AiPromptType = 'why_correct' | 'compare_traps' | 'mod_and_negation' | 'extract_b2_vocab';

/**
 * Embedded High-Frequency TELC B2 Vocabulary Dictionary (Nouns, Verbs, Adjectives, Connectors, Prepositions)
 */
const B2_DICTIONARY: Record<string, { ar: string; cat: string; tip: string }> = {
  // Connectors & Prepositions (Sprachbausteine & Lesen Core)
  obwohl: { ar: 'بالرغم من أن (تناقض)', cat: 'أداة ربط (Konzessiv)', tip: 'كتصيفط الفعل المصرف لآخر الجملة (Nebensatz) وكتعبر على التناقض.' },
  trotzdem: { ar: 'رغم ذلك / مع ذلك', cat: 'رابط (Adverb)', tip: 'كيجي موراه الفعل مباشرة فالمرتبة التانية (Position 2).' },
  dennoch: { ar: 'ومع ذلك / بالرغم من هذا', cat: 'رابط B2 (Konzessiv)', tip: 'كيتستعمل بزاف فـ Sprachbausteine 2 بمعنى trotzdem.' },
  weil: { ar: 'لأن (السبب)', cat: 'أداة ربط (Kausal)', tip: 'كتصيفط الفعل المصرف للخر ديال الجملة.' },
  da: { ar: 'بما أن / لأن (السبب)', cat: 'أداة ربط (Kausal)', tip: 'بحال weil، كتعطي السبب وكتصيفط الفعل لآخر الجملة.' },
  sodass: { ar: 'بحيث أن / لدرجة أن (النتيجة)', cat: 'أداة ربط (Konsekutiv)', tip: 'كتعبر على النتيجة المباشرة وكتصيفط الفعل للخر.' },
  damit: { ar: 'لكي / من أجل أن (الهدف)', cat: 'أداة ربط (Final)', tip: 'كتستعمل للهدف ملي يكون الفاعل مختلف فالجملتين.' },
  um: { ar: 'لكي (um ... zu + Infinitiv)', cat: 'حرف جر / هدف', tip: 'ملي كيكون نفس الفاعل كنستعملو um ... zu + الفعل فـ Infinitiv.' },
  anstatt: { ar: 'بدلاً من (anstatt ... zu / + Genitiv)', cat: 'حرف جر / رابط', tip: 'كيجي معاه Genitiv أو zu + Infinitiv.' },
  statt: { ar: 'بدلاً من', cat: 'حرف جر / رابط', tip: 'كيعني فبلاصة هاد الشي (بديل).' },
  während: { ar: 'بينما / أثناء (+ Genitiv)', cat: 'أداة ربط / حرف جر', tip: 'كتعني في نفس الوقت أو للمقارنة بين جوج حوايج.' },
  falls: { ar: 'في حالة ما إذا (شرط)', cat: 'أداة ربط (Konditional)', tip: 'شرطية بحال wenn: إيلا وقع هاد الشي.' },
  sofern: { ar: 'شريطة أن / إذا ما', cat: 'أداة ربط B2 (Konditional)', tip: 'كتجي بزاف فـ Sprachbausteine 2 بمعنى falls / wenn.' },
  indem: { ar: 'من خلال / عن طريق (الوسيلة)', cat: 'أداة ربط (Modal)', tip: 'كتشرح كيفاش درنا واحد الحاجة (الطريقة).' },
  dadurch: { ar: 'من خلال ذلك (dadurch, dass)', cat: 'ظرف / وسيلة', tip: 'كتعبر على الوسيلة أو السبب.' },
  sondern: { ar: 'بل / وإنما (بعد النفي nicht/kein)', cat: 'أداة عطف', tip: 'ضروري يكون قبلها نفي (nicht / kein)، وكتجي فـ nicht nur ... sondern auch.' },
  sowohl: { ar: 'كل من ... و (sowohl ... als auch)', cat: 'رابط مزدوج', tip: 'الرابط المزدوج الشهير: sowohl A als auch B.' },
  weder: { ar: 'لا ... ولا (weder ... noch)', cat: 'رابط نفي مزدوج', tip: 'نفي مزدوج: weder A noch B (لا هادي ولا هاديك).' },
  je: { ar: 'كلما ... كلما (je + مقارن ... desto/umso)', cat: 'رابط تناسب', tip: 'القاعدة الذهبية: Je mehr ..., desto/umso besser.' },
  desto: { ar: 'كلما (الجواب ديال je)', cat: 'رابط تناسب', tip: 'كيجي موراه صيغة المقارنة (Komparativ) ثم الفعل مباشرة.' },
  umso: { ar: 'كلما / بقدر ما (مع je)', cat: 'رابط تناسب', tip: 'بديل ديال desto فـ je ... umso.' },
  kaum: { ar: 'بالكاد / قلما (نفي ضمني!)', cat: 'ظرف (نفي B2)', tip: 'رد بالك فالامتحان! kaum كتعني تقريباً لا (نفي ماشي إيجاب).' },
  fast: { ar: 'تقريباً', cat: 'ظرف', tip: 'كتبدل المعنى فـ Lesen Teil 2 بين الكل وتقريباً الكل.' },
  bereits: { ar: 'بالفعل / مسبقاً (= schon)', cat: 'ظرف زمان', tip: 'مرادف رسمي لكلمة schon فـ B2.' },
  bisher: { ar: 'حتى الآن', cat: 'ظرف زمان', tip: 'كتعني من الماضي تال دابا.' },
  inzwischen: { ar: 'في هذه الأثناء / حالياً', cat: 'ظرف زمان', tip: 'كتعني دابا تبدلات الأمور.' },
  allerdings: { ar: 'غير أن / لكن في الحقيقة', cat: 'ظرف استدراك', tip: 'كتحط قيد أو استثناء على الجملة اللي قبل.' },
  außerdem: { ar: 'علاوة على ذلك / بالإضافة لذلك', cat: 'ظرف إضافة', tip: 'كتزيد معلومة جديدة.' },
  deshalb: { ar: 'لذلك / لهذا السبب', cat: 'ظرف سبب', tip: 'كيجي موراها الفعل مباشرة فالمرتبة الثانية.' },
  deswegen: { ar: 'لهذا السبب / لذلك', cat: 'ظرف سبب', tip: 'مرادف ديال deshalb / darum.' },
  trotz: { ar: 'بالرغم من (+ Genitiv)', cat: 'حرف جر', tip: 'حرف جر كيتبعو Genitiv (مثلاً trotz des Regens).' },
  wegen: { ar: 'بسبب (+ Genitiv)', cat: 'حرف جر', tip: 'حرف جر ديال السبب كيتبعو Genitiv.' },
  innerhalb: { ar: 'في غضون / داخل (+ Genitiv)', cat: 'حرف جر', tip: 'كيتبعو Genitiv أو von + Dativ.' },
  außerhalb: { ar: 'خارج (+ Genitiv / von)', cat: 'حرف جر', tip: 'عكس innerhalb (خارج الوقت أو المكان).' },
  stattdessen: { ar: 'بدلاً من ذلك', cat: 'ظرف', tip: 'كتعوض جملة كاملة بمعنى فبلاصة هاد الشي.' },
  sogar: { ar: 'حتى / بل وحتى (للتأكيد)', cat: 'أداة تركيز', tip: 'كتجي بزاف فـ Sprachbausteine 2 باش تبرز شي حاجة غير متوقعة.' },
  besonders: { ar: 'خصوصاً / بشكل خاص', cat: 'ظرف', tip: 'كتعطي أهمية خاصة لواحد العنصر.' },
  nämlich: { ar: 'وذلك لأن / أي أن', cat: 'ظرف تفسير', tip: 'كتشرح السبب ديال الجملة اللي سبقات.' },
  hingegen: { ar: 'في المقابل / على العكس من ذلك', cat: 'ظرف مقارنة', tip: 'كتقارن بين جوج وضعيات متعاكسة.' },
  zwar: { ar: 'صحيح أن ... ولكن (zwar ... aber)', cat: 'رابط مزدوج', tip: 'ديما كتجي مع aber باش تعترف بحاجة وتستدرك عليها.' },
  denen: { ar: 'الذين / اللواتي (ضمير وصل جمع Dativ)', cat: 'ضمير وصل (Relativpronomen)', tip: 'جمع Dativ فـ Relativsatz (مثلاً: die Kinder, mit denen...).' },
  dessen: { ar: 'الذي ...ـه (ملكية مذكر/محايد)', cat: 'ضمير وصل (Genitiv)', tip: 'ضمير وصل ديال الملكية للمذكر والمحايد.' },
  deren: { ar: 'التي ...ـها / الذين ...ـهم (ملكية مؤنث/جمع)', cat: 'ضمير وصل (Genitiv)', tip: 'ضمير وصل ديال الملكية للمؤنث والجمع.' },
  wäre: { ar: 'سيكون / لو كان (Konjunktiv II من sein)', cat: 'فعل (Konjunktiv II)', tip: 'صيغة التمني أو الافتراض غير الواقعي.' },
  hätte: { ar: 'سيملك / لو كان لديه (Konjunktiv II من haben)', cat: 'فعل (Konjunktiv II)', tip: 'صيغة التمني أو الشرط مع haben.' },
  würde: { ar: 'سوف / لو (Konjunktiv II)', cat: 'فعل مساعد (Konjunktiv II)', tip: 'كيجي مع Infinitiv فآخر الجملة.' },
  könnte: { ar: 'يمكنه / ربما يستطيع (Konjunktiv II)', cat: 'فعل Modal (Konjunktiv II)', tip: 'كتستعمل للاقتراح المؤدب أو الاحتمال.' },
  sollte: { ar: 'ينبغي عليه (نصيحة Konjunktiv II)', cat: 'فعل Modal', tip: 'كتستعمل لإعطاء نصيحة.' },

  // High-Frequency Exam Topics & Nouns (from the 210 Verbatim Modules)
  inseln: { ar: 'جزر (جمع Insel)', cat: 'اسم جمع (die Inseln)', tip: 'موضوع شهير فـ Teil 1: الجزر الألمانية (Sylt, Rügen...).' },
  insel: { ar: 'جزيرة', cat: 'اسم مؤنث (die Insel)', tip: 'جمعها die Inseln.' },
  insekten: { ar: 'حشرات', cat: 'اسم جمع (die Insekten)', tip: 'موضوع الحشرات كغذاء للمستقبل (Nahrungsmittel der Zukunft).' },
  kaffee: { ar: 'قهوة', cat: 'اسم مذكر (der Kaffee)', tip: 'موضوع القهوة وتأثيرها الصحي.' },
  schlafzug: { ar: 'قطار ليلي / قطار النوم (= Nachtzug)', cat: 'اسم مذكر (der Schlafzug)', tip: 'المرادف ديالها فالعناوين هو Nachtzug / über Nacht.' },
  nachtzug: { ar: 'قطار ليلي', cat: 'اسم مذكر (der Nachtzug)', tip: 'مرادف Schlafzug فامتحان السفر بالقطار.' },
  grundschule: { ar: 'مدرسة ابتدائية', cat: 'اسم مؤنث (die Grundschule)', tip: 'موضوع الرياضة والحركة فـ Grundschule.' },
  tanzkurs: { ar: 'دورة تعليم الرقص', cat: 'اسم مذكر (der Tanzkurs)', tip: 'موضوع Krista Mardt فـ Lesen Teil 2.' },
  kellner: { ar: 'نادل (سرباي فالمطعم)', cat: 'اسم مذكر (der Kellner)', tip: 'موضوع Franz Schier نادل فمطعم الفندق.' },
  programmierer: { ar: 'مبرمج المعلوميات', cat: 'اسم مذكر (der Programmierer)', tip: 'موضوع المبرمجين (Programmierer 1, 2, 3).' },
  kartoffeln: { ar: 'بطاطس', cat: 'اسم جمع (die Kartoffeln)', tip: 'موضوع تاريخ وزراعة البطاطس فـ أوروبا.' },
  sandfisch: { ar: 'سمكة الرمال (سحلية الصحراء)', cat: 'اسم مذكر (der Sandfisch)', tip: 'موضوع علمي فـ Teil 2 على جلد سمكة الرمال والتقنية.' },
  alpen: { ar: 'جبال الألب', cat: 'اسم جمع (die Alpen)', tip: 'موضوع السياحة والطبيعة فجبال الألب.' },
  bonbon: { ar: 'حلوى (بونبون)', cat: 'اسم محايد/مذكر (das Bonbon)', tip: 'موضوع مصنع الحلوى.' },
  limonade: { ar: 'مشروب غازي / ليموناضة', cat: 'اسم مؤنث (die Limonade)', tip: 'موضوع Bionade / Limonade.' },
  bilder: { ar: 'صور / لوحات (جمع Bild)', cat: 'اسم جمع (die Bilder)', tip: 'موضوع الصور والدماغ.' },
  sport: { ar: 'رياضة', cat: 'اسم مذكر (der Sport)', tip: 'Sport treiben = ممارسة الرياضة.' },
  gesund: { ar: 'صحي / بصحة جيدة', cat: 'صفة (Adjektiv)', tip: 'الاسم منها هو die Gesundheit (الصحة).' },
  gesundheit: { ar: 'الصحة', cat: 'اسم مؤنث (die Gesundheit)', tip: 'كلمة مفتاحية كتتعاود فـ Teil 1 و Teil 3.' },
  ernährung: { ar: 'التغذية', cat: 'اسم مؤنث (die Ernährung)', tip: 'gesunde Ernährung = تغذية صحية.' },
  umwelt: { ar: 'البيئة', cat: 'اسم مؤنث (die Umwelt)', tip: 'Umweltschutz = حماية البيئة.' },
  klima: { ar: 'المناخ', cat: 'اسم محايد (das Klima)', tip: 'Klimawandel = تغير المناخ.' },
  forschung: { ar: 'البحث العلمي', cat: 'اسم مؤنث (die Forschung)', tip: 'Forscher / Wissenschaftler = باحث / عالِم.' },
  wissenschaftler: { ar: 'علماء / باحثون', cat: 'اسم مذكر/جمع', tip: 'مرادف Forscher / Experten فالامتحان.' },
  studie: { ar: 'دراسة علمية', cat: 'اسم مؤنث (die Studie)', tip: 'مرادف Untersuchung (بحث/دراسة).' },
  untersuchung: { ar: 'فحص / دراسة علمية', cat: 'اسم مؤنث', tip: 'كتجي بزاف كمرادف لـ Studie فـ Lesen Teil 1.' },
  ergebnis: { ar: 'نتيجة', cat: 'اسم محايد (das Ergebnis)', tip: 'جمعها Ergebnisse (نتائج).' },
  entwicklung: { ar: 'تطور / تطوير', cat: 'اسم مؤنث (die Entwicklung)', tip: 'من الفعل entwickeln (طوّر).' },
  zukunft: { ar: 'المستقبل', cat: 'اسم مؤنث (die Zukunft)', tip: 'in Zukunft = في المستقبل.' },
  vergangenheit: { ar: 'الماضي', cat: 'اسم مؤنث (die Vergangenheit)', tip: 'عكس المستقبل (Zukunft).' },
  erfahrung: { ar: 'تجربة / خبرة', cat: 'اسم مؤنث (die Erfahrung)', tip: 'Erfahrungen sammeln = اكتساب خبرات.' },
  angebot: { ar: 'عرض', cat: 'اسم محايد (das Angebot)', tip: 'جمعها Angebote (عروض فـ الإعلانات Teil 3).' },
  kostenlos: { ar: 'مجاني / بدون مقابل (= gratis / gebührenfrei)', cat: 'صفة', tip: 'مرادف مهم فـ Teil 3: gratis = umsonst = kostenfrei.' },
  gebühr: { ar: 'رسوم / واجب الأداء', cat: 'اسم مؤنث (die Gebühr)', tip: 'Teilnahmegebühr = رسوم المشاركة.' },
  anmeldung: { ar: 'التسجيل', cat: 'اسم مؤنث (die Anmeldung)', tip: 'sich anmelden = تسجل فدورة أو رحلة.' },
  jugendliche: { ar: 'الشباب / اليافعون', cat: 'اسم جمع', tip: 'مرادف junge Menschen / Teenager.' },
  kinder: { ar: 'أطفال', cat: 'اسم جمع (die Kinder)', tip: 'مرادف Nachwuchs / Kleinkinder.' },
  eltern: { ar: 'الوالدين (الأب والأم)', cat: 'اسم جمع (die Eltern)', tip: 'ديما كتجي فـ الجمع.' },
  unternehmen: { ar: 'شركة / مقاولة (= Firma / Betrieb)', cat: 'اسم محايد (das Unternehmen)', tip: 'مرادف Firma و Betrieb.' },
  arbeitgeber: { ar: 'المُشغّل / رب العمل', cat: 'اسم مذكر', tip: 'عكس Arbeitnehmer (الأجير/الموظف).' },
  mitarbeiter: { ar: 'موظف / مستخدم', cat: 'اسم مذكر/جمع', tip: 'مرادف Angestellte / Personal.' },
  beruf: { ar: 'مهنة / حرفة', cat: 'اسم مذكر (der Beruf)', tip: 'beruflich = مهني.' },
  ausbildung: { ar: 'تكوين مهني / تعليم', cat: 'اسم مؤنث (die Ausbildung)', tip: 'كتجي بزاف فإعلانات Teil 3.' },
  studium: { ar: 'الدراسة الجامعية', cat: 'اسم محايد (das Studium)', tip: 'studieren = الدراسة فالجامعة.' },
  urlaub: { ar: 'عطلة', cat: 'اسم مذكر (der Urlaub)', tip: 'Ferien / Freizeit.' },
  reise: { ar: 'رحلة / سفر', cat: 'اسم مؤنث (die Reise)', tip: 'reisen = سافر.' },
  gäste: { ar: 'ضيوف / زبناء الفندق أو المطعم', cat: 'اسم جمع (die Gäste)', tip: 'مفردها der Gast.' },
  kunden: { ar: 'زبناء / عملاء', cat: 'اسم جمع (die Kunden)', tip: 'مفردها der Kunde.' },
  vorteil: { ar: 'ميزة / فائدة', cat: 'اسم مذكر (der Vorteil)', tip: 'عكسها der Nachteil (عيب / سلبيات).' },
  nachteil: { ar: 'عيب / ضرر / سلبية', cat: 'اسم مذكر (der Nachteil)', tip: 'Vor- und Nachteile = الإيجابيات والسلبيات.' },
  gefahr: { ar: 'خطر (= Risiko)', cat: 'اسم مؤنث (die Gefahr)', tip: 'gefährlich = خطير.' },
  schutz: { ar: 'حماية / وقاية', cat: 'اسم مذكر (der Schutz)', tip: 'schützen vor + Dativ = حمى من.' },
  lösung: { ar: 'حل', cat: 'اسم مؤنث (die Lösung)', tip: 'ein Problem lösen = حل مشكلة.' },
  möglichkeit: { ar: 'إمكانية / فرصة', cat: 'اسم مؤنث (die Möglichkeit)', tip: 'مرادف Chance / Gelegenheit.' },
  entscheidung: { ar: 'قرار', cat: 'اسم مؤنث (die Entscheidung)', tip: 'eine Entscheidung treffen = اتخاذ قرار.' },
  unterstützung: { ar: 'دعم / مساعدة (= Hilfe)', cat: 'اسم مؤنث', tip: 'unterstützen = دعم / ساند.' },
  bedingung: { ar: 'شرط / ظرف', cat: 'اسم مؤنث (die Bedingung)', tip: 'Arbeitsbedingungen = ظروف العمل.' },
  regel: { ar: 'قاعدة / قانون', cat: 'اسم مؤنث (die Regel)', tip: 'in der Regel = في الغالب / عادةً.' },
  verbot: { ar: 'منع / حظر', cat: 'اسم محايد (das Verbot)', tip: 'verboten = ممنوع.' },
  erlaubt: { ar: 'مسموح به (= gestattet)', cat: 'صفة', tip: 'عكس verboten.' },
  empfehlen: { ar: 'ينصح بـ / يوصي بـ', cat: 'فعل (Verb)', tip: 'الاسم منها die Empfehlung (توصية / نصيحة).' },
  verzichten: { ar: 'يتخلى عن / يستغني عن (verzichten auf + Akk)', cat: 'فعل B2', tip: 'كيجي ديما مع حرف الجر auf + Akkusativ.' },
  teilnehmen: { ar: 'يشارك في (teilnehmen an + Dat)', cat: 'فعل منفصل', tip: 'كيجي ديما مع حرف الجر an + Dativ.' },
  bestehen: { ar: 'ينجح في امتحان / يتكون من (bestehen aus)', cat: 'فعل B2', tip: 'bestehen aus = يتكون من؛ Prüfung bestehen = ينجح فالامتحان.' },
  abhängen: { ar: 'يعتمد على / يتوقف على (abhängen von + Dat)', cat: 'فعل منفصل', tip: 'كيجي مع von + Dativ.' },
  beitragen: { ar: 'يساهم في (beitragen zu + Dat)', cat: 'فعل منفصل B2', tip: 'كيجي ديما مع zu + Dativ.' },
  sorgen: { ar: 'يهتم بـ / يحرص على (sorgen für + Akk)', cat: 'فعل', tip: 'sorgen für = يحرص على توفير؛ sich Sorgen machen = يقلق.' },
  erinnern: { ar: 'يتذكر / يذكّر بـ (sich erinnern an + Akk)', cat: 'فعل', tip: 'مع حرف الجر an + Akkusativ.' },
  interessieren: { ar: 'يهتم بـ (sich interessieren für + Akk)', cat: 'فعل انعكاسي', tip: 'كيجي مع für + Akkusativ.' },
  beschäftigen: { ar: 'ينشغل بـ / يوظف (sich beschäftigen mit)', cat: 'فعل B2', tip: 'مع mit + Dativ.' },
  entscheiden: { ar: 'يقرر (sich entscheiden für/gegen)', cat: 'فعل انعكاسي', tip: 'مع für + Akkusativ.' },
  vermeiden: { ar: 'يتجنب / يتفادى', cat: 'فعل B2', tip: 'فعل أساسي فـ النصوص الصحية والبيئية.' },
  verbessern: { ar: 'يحسّن / يطوّر', cat: 'فعل', tip: 'الاسم: die Verbesserung.' },
  verändern: { ar: 'يغيّر / يتغير', cat: 'فعل', tip: 'الاسم: die Veränderung (تغيير).' },
  steigen: { ar: 'يرتفع / يزداد (= zunehmen / wachsen)', cat: 'فعل', tip: 'عكسها sinken / abnehmen (ينخفض).' },
  sinken: { ar: 'ينخفض / يتراجع', cat: 'فعل', tip: 'مرادف abnehmen / zurückgehen.' },
  fördern: { ar: 'يدعم / يشجع / يعزز', cat: 'فعل B2', tip: 'كلمة ذهبية فـ B2: Förderung = دعم وتشجيع.' },
  fordern: { ar: 'يطالب بـ / يتطلب (بدون النقط فوق o)', cat: 'فعل B2', tip: 'رد بالك للفرق بين fördern (يدعم) و fordern (يطالب بـ)!' },
};

/**
 * Default seed words for "قاموسي الشخصي" if the user hasn't saved words yet
 */
export const DEFAULT_SAVED_WORDS: SavedWordItem[] = [
  {
    word: 'obwohl',
    cleanWord: 'obwohl',
    meaningAr: 'بالرغم من أن (تناقض — الفعل فآخر الجملة)',
    category: 'أداة ربط B2 (Konzessiv)',
    grammarTipAr: 'كتصيفط الفعل المصرف لآخر الجملة، ومرادفها فـ الحرف الجر هو trotz + Genitiv.',
    contextSentence: 'Obwohl das Wetter schlecht war, gingen wir spazieren.',
    addedAt: 1700000001000,
  },
  {
    word: 'fördern',
    cleanWord: 'fördern',
    meaningAr: 'يدعم / يعزز / يشجع',
    category: 'فعل أساسي B2',
    grammarTipAr: 'فرق بين fördern (يدعم/يشجع) و fordern (يطالب بـ)!',
    contextSentence: 'Sport in der Grundschule fördert die Konzentration der Kinder.',
    addedAt: 1700000002000,
  },
  {
    word: 'kaum',
    cleanWord: 'kaum',
    meaningAr: 'بالكاد / قلما (نفي ضمني خطير فالامتحان!)',
    category: 'ظرف نفي B2',
    grammarTipAr: 'رد بالك! kaum كتعني تقريباً لا (ماشي إيجاب)، وكتجي بزاف فـ فخاخ Lesen Teil 2.',
    contextSentence: 'Er hatte kaum Zeit für seine Familie.',
    addedAt: 1700000003000,
  },
  {
    word: 'sodass',
    cleanWord: 'sodass',
    meaningAr: 'بحيث أن / لدرجة أن (النتيجة)',
    category: 'أداة ربط B2 (Konsekutiv)',
    grammarTipAr: 'كتجي بزاف فـ Sprachbausteine 1 & 2 باش تعبر على النتيجة المباشرة.',
    contextSentence: 'Es regnete stark, sodass die Straße gesperrt wurde.',
    addedAt: 1700000004000,
  },
];

/**
 * Looks up any clicked German word and provides an instant Arabic/Darija meaning + B2 grammar analysis.
 */
export function lookupGermanWord(rawWord: string, contextSentence?: string): WordLookupResult {
  const cleaned = rawWord
    .replace(/^[.,!?;:()"'«»„“”[\]0-9\-–—]+|[.,!?;:()"'«»„“”[\]0-9\-–—]+$/g, '')
    .trim();

  const lower = cleaned.toLowerCase();
  if (!cleaned) {
    return {
      word: rawWord,
      cleanWord: rawWord,
      meaningAr: 'كلمة ألمانية في النص',
      category: 'مفردة B2',
      grammarTipAr: 'اضغط على زر النطق للاستماع إليها باللكنة الألمانية.',
      contextSentence,
    };
  }

  // 1. Direct match in B2 dictionary
  if (B2_DICTIONARY[lower]) {
    const entry = B2_DICTIONARY[lower];
    return {
      word: rawWord,
      cleanWord: cleaned,
      meaningAr: entry.ar,
      category: entry.cat,
      grammarTipAr: entry.tip,
      contextSentence,
    };
  }

  // 2. Inflection stripping (e.g. plural -en, -n, -e, -er, -s or verb endings -t, -te, -ten)
  const suffixes = ['ungen', 'ung', 'keiten', 'keit', 'heiten', 'heit', 'ischen', 'ische', 'isch', 'lichen', 'liche', 'lich', 'en', 'ern', 'er', 'es', 'em', 'e', 'n', 's', 'te', 'ten', 't'];
  for (const suf of suffixes) {
    if (lower.endsWith(suf) && lower.length - suf.length >= 3) {
      const stem = lower.slice(0, lower.length - suf.length);
      if (B2_DICTIONARY[stem]) {
        const entry = B2_DICTIONARY[stem];
        return {
          word: rawWord,
          cleanWord: cleaned,
          meaningAr: `${entry.ar} (صيغة مشتقة من: ${stem})`,
          category: entry.cat,
          grammarTipAr: entry.tip,
          contextSentence,
        };
      }
      if (B2_DICTIONARY[stem + 'en']) {
        const entry = B2_DICTIONARY[stem + 'en'];
        return {
          word: rawWord,
          cleanWord: cleaned,
          meaningAr: `${entry.ar} (من الفعل: ${stem}en)`,
          category: entry.cat,
          grammarTipAr: entry.tip,
          contextSentence,
        };
      }
    }
  }

  // 3. Compound word analyzer (Zusammengesetzte Nomen) — checks if any known B2 root is inside the compound word
  const matchedRoots: string[] = [];
  for (const [key, val] of Object.entries(B2_DICTIONARY)) {
    if (key.length >= 4 && lower.includes(key) && lower !== key) {
      matchedRoots.push(`${key} (${val.ar})`);
    }
  }

  const isCapitalized = /^[A-ZÄÖÜ]/.test(cleaned);
  if (matchedRoots.length > 0) {
    return {
      word: rawWord,
      cleanWord: cleaned,
      meaningAr: `كلمة مركبة (Kompositum) تضم: ${matchedRoots.slice(0, 2).join(' + ')}`,
      category: isCapitalized ? 'اسم مركب B2 (Nomen)' : 'مفردة مركبة B2',
      grammarTipAr: 'فالألمانية B2، الكلمات المركبة كتاخد ديما أداة التعريف (der/die/das) ديال الكلمة الأخيرة فـ التركيب!',
      contextSentence,
    };
  }

  // 4. Smart grammatical classification fallback
  if (cleaned.endsWith('ung') || cleaned.endsWith('keit') || cleaned.endsWith('heit') || cleaned.endsWith('schaft') || cleaned.endsWith('tion')) {
    return {
      word: rawWord,
      cleanWord: cleaned,
      meaningAr: `مصدر / اسم مؤنث (die ${cleaned}) في سياق النص`,
      category: 'اسم مؤنث (die -ung/-keit/-heit)',
      grammarTipAr: 'قاعدة ذهبية فـ B2: جميع الأسماء المنتهية بـ -ung, -heit, -keit, -schaft, -tion هي دائماً مؤنثة (die) وجمعها بـ -en!',
      contextSentence,
    };
  }

  if (isCapitalized) {
    return {
      word: rawWord,
      cleanWord: cleaned,
      meaningAr: `اسم ألماني (${cleaned}) — مفتاح مهم فهاد الفقرة`,
      category: 'اسم (Substantiv / Nomen)',
      grammarTipAr: 'الأسماء فالألمانية كتكتب ديما بحرف كبير (Großschreibung) وكتكون غالباً هي الموكلي (Mot-Clé) فأسئلة Lesen.',
      contextSentence,
    };
  }

  if (lower.endsWith('ieren') || lower.endsWith('en')) {
    return {
      word: rawWord,
      cleanWord: cleaned,
      meaningAr: `فعل ألماني (${cleaned}) في سياق الجملة`,
      category: 'فعل (Verb)',
      grammarTipAr: 'رد بالك لمعنى الفعل فالجملة واش منفي بـ nicht/kaum ولا مثبت.',
      contextSentence,
    };
  }

  return {
    word: rawWord,
    cleanWord: cleaned,
    meaningAr: `مفردة ألمانية (${cleaned}) ضمن سياق B2`,
    category: 'مفردة / صفة (Wortschatz B2)',
    grammarTipAr: 'اضغط على 🔊 للاستماع للنطق الصحيح أو ⭐ لحفظها في قاموسك الشخصي للمراجعة.',
    contextSentence,
  };
}

/**
 * Generates an inline Arabic/Darija translation for any German sentence/paragraph/heading/question.
 * Combines curated Darija triggers with automatic clause & vocabulary translation.
 */
export function translateGermanTextToArabic(
  textDe: string,
  curatedAr?: string,
  contextPrefixAr?: string
): string {
  if (!textDe) return '';

  // Extract recognized vocabulary meanings from the German text
  const words = textDe
    .replace(/[.,!?;:()"'«»„“”[\]]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  const translatedTerms: string[] = [];
  const seen = new Set<string>();

  for (const w of words) {
    const low = w.toLowerCase();
    if (seen.has(low)) continue;
    const direct = B2_DICTIONARY[low];
    if (direct) {
      seen.add(low);
      const shortAr = direct.ar.split('(')[0].trim();
      translatedTerms.push(`${w}: ${shortAr}`);
    } else if (low.length >= 5) {
      for (const [k, v] of Object.entries(B2_DICTIONARY)) {
        if (k.length >= 5 && low.startsWith(k.slice(0, 5))) {
          seen.add(low);
          const shortAr = v.ar.split('(')[0].trim();
          translatedTerms.push(`${w}: ${shortAr}`);
          break;
        }
      }
    }
    if (translatedTerms.length >= 6) break;
  }

  // Detect negation or condition in the German text
  const hasNegation = /\b(nicht|kein|keine|keinen|keiner|kaum|niemals|nie|ohne|weder)\b/i.test(textDe);
  const negationNote = hasNegation ? ' ⚠️ [انتبه: الجملة تحتوي على أداة نفي/استثناء]' : '';

  if (curatedAr && curatedAr.trim().length > 0) {
    const vocabSuffix =
      translatedTerms.length > 0
        ? ` — الكلمات المفتاحية: (${translatedTerms.slice(0, 4).join(' • ')})`
        : '';
    return `${contextPrefixAr ? `${contextPrefixAr}: ` : ''}${curatedAr}${negationNote}${vocabSuffix}`;
  }

  if (translatedTerms.length > 0) {
    return `${
      contextPrefixAr ? `${contextPrefixAr} — ` : 'الترجمة والمعنى العام: '
    }المفردات الأساسية في هذه العبارة: ${translatedTerms.join(' | ')}${negationNote}`;
  }

  return `${
    contextPrefixAr ? `${contextPrefixAr}: ` : 'المعنى السياقي: '
  }عبارة ألمانية رسمية في الامتحان (${textDe.slice(0, 55)}${textDe.length > 55 ? '...' : ''}) — اضغط على أي كلمة فيها لترجمتها فوراً!${negationNote}`;
}

/**
 * Smart B2 Grammar Explainer for Sprachbausteine Teil 1 (21-30) & Teil 2 (31-40).
 * Automatically detects the exact grammatical rule of the gap and explains it in Moroccan Darija!
 */
export function explainSprachGapGrammar(
  gapNum: number,
  correctLetter: string,
  correctWord: string,
  contextDe: string,
  mode: 'sb1' | 'sb2'
): SprachGrammarExplanation {
  const w = (correctWord || '').trim().toLowerCase();

  // 1. Subordinating Connectors (Nebensatz-Konnektoren)
  if (['obwohl', 'obgleich', 'wenngleich'].includes(w)) {
    return {
      gapNum,
      correctLetter,
      correctWord,
      ruleCategoryAr: 'أداة ربط التناقض (Konzessivsatz — obwohl)',
      explanationDarija: `اختارينا «${correctWord}» (${correctLetter}) حيت كاين تناقض بين الجملتين (بالرغم من أن...)، والفعل المصرف كيمشي لآخر الجملة!`,
    };
  }

  if (['weil', 'da', 'zumal'].includes(w)) {
    return {
      gapNum,
      correctLetter,
      correctWord,
      ruleCategoryAr: 'أداة ربط السبب (Kausalsatz — weil / da)',
      explanationDarija: `اختارينا «${correctWord}» (${correctLetter}) حيت الجملة كتعطي السبب (لأن / بما أن) والفعل كيرجع للخر ديال الجملة.`,
    };
  }

  if (['sodass', 'so dass'].includes(w)) {
    return {
      gapNum,
      correctLetter,
      correctWord,
      ruleCategoryAr: 'أداة النتيجة (Konsekutivsatz — sodass)',
      explanationDarija: `اختارينا «${correctWord}» (${correctLetter}) حيت الجملة التانية كتعطي النتيجة المباشرة (بحيث أن / لدرجة أن) ديال الحدث الأول.`,
    };
  }

  if (['damit', 'um'].includes(w)) {
    return {
      gapNum,
      correctLetter,
      correctWord,
      ruleCategoryAr: 'أداة الهدف والغاية (Finalsatz — damit / um ... zu)',
      explanationDarija:
        w === 'um'
          ? `اختارينا «${correctWord}» (${correctLetter}) حيت كاينة «zu + Infinitiv» فآخر الجملة (القاعدة: um ... zu = من أجل أن).`
          : `اختارينا «${correctWord}» (${correctLetter}) باش نعبرو على الهدف (لكي) والفعل كيتصرف فآخر الجملة.`,
    };
  }

  if (['falls', 'sofern', 'wenn', 'solange', 'sobald'].includes(w)) {
    return {
      gapNum,
      correctLetter,
      correctWord,
      ruleCategoryAr: 'أداة الشرط / الزمان (Konditional / Temporal)',
      explanationDarija: `اختارينا «${correctWord}» (${correctLetter}) حيت الجملة شرطية (في حالة ما إذا / شريطة أن) مع إرسال الفعل لآخر الجملة.`,
    };
  }

  if (['während', 'indem', 'anstatt', 'statt', 'ohne'].includes(w)) {
    return {
      gapNum,
      correctLetter,
      correctWord,
      ruleCategoryAr: 'روابط وحروف جر B2 (während / indem / anstatt)',
      explanationDarija: `اختارينا «${correctWord}» (${correctLetter}) حيت كتجي يا إما مع (zu + Infinitiv / Genitiv) أو كتربط جملتين لتوضيح الكيفية/التزامن.`,
    };
  }

  if (['dass', 'ob'].includes(w)) {
    return {
      gapNum,
      correctLetter,
      correctWord,
      ruleCategoryAr: 'أداة ربط (Ergänzungssatz — dass / ob)',
      explanationDarija:
        w === 'ob'
          ? `اختارينا «${correctWord}» (${correctLetter}) بمعنى «ما إذا كان / واش» حيت كاين شك أو سؤال غير مباشر.`
          : `اختارينا «${correctWord}» (${correctLetter}) بمعنى «أنَّ» بعد أفعال القول أو التفكير أو الشعور.`,
    };
  }

  // 2. Double Connectors & Coordinating / Adverbial Connectors
  if (['sondern', 'aber', 'dennoch', 'trotzdem', 'jedoch', 'allerdings', 'hingegen'].includes(w)) {
    return {
      gapNum,
      correctLetter,
      correctWord,
      ruleCategoryAr: 'روابط الاستدراك والتناقض (Gegensatz)',
      explanationDarija:
        w === 'sondern'
          ? `اختارينا «${correctWord}» (${correctLetter}) بمعنى «بل / وإنما» حيت قبلها كاين نفي (nicht / kein) أو التركيب (nicht nur ... sondern auch)!`
          : `اختارينا «${correctWord}» (${correctLetter}) للاستدراك والتناقض (ومع ذلك / لكن) فوسط السياق.`,
    };
  }

  if (['sowohl', 'als', 'wie', 'weder', 'noch', 'je', 'desto', 'umso', 'zwar'].includes(w)) {
    return {
      gapNum,
      correctLetter,
      correctWord,
      ruleCategoryAr: 'الروابط المزدوجة (Doppelkonnektoren B2)',
      explanationDarija: `اختارينا «${correctWord}» (${correctLetter}) حيت كتكمّل الرابط المزدوج فالجملة (sowohl...als auch / weder...noch / je...desto / zwar...aber)!`,
    };
  }

  // 3. Relative Pronouns (denen, dessen, deren, was, wo)
  if (['denen', 'dessen', 'deren', 'welchem', 'welcher', 'was', 'wo', 'wofür', 'worüber', 'womit', 'worauf', 'davon', 'dafür', 'darüber', 'damit', 'daran', 'darauf'].includes(w)) {
    return {
      gapNum,
      correctLetter,
      correctWord,
      ruleCategoryAr: 'ضمائر الوصل والضمائر الظرفية (Relativ- & Pronominaladverbien)',
      explanationDarija: `اختارينا «${correctWord}» (${correctLetter}) حيت كترجع على الاسم أو الجملة اللي قبلها مع احترام حرف الجر والـ Kasus (Dativ/Genitiv/Akkusativ).`,
    };
  }

  // 4. Konjunktiv II & Auxiliary / Modal Verbs
  if (['wäre', 'wären', 'hätte', 'hätten', 'würde', 'würden', 'könnte', 'könnten', 'sollte', 'sollten', 'müsste', 'müssten'].includes(w)) {
    return {
      gapNum,
      correctLetter,
      correctWord,
      ruleCategoryAr: 'صيغة التمني والطلب المؤدب (Konjunktiv II)',
      explanationDarija: `اختارينا «${correctWord}» (${correctLetter}) حيت الجملة فيها طلب مؤدب، نصيحة، أو شرط غير واقعي فـ Konjunktiv II.`,
    };
  }

  // 5. Prepositions (aus, von, mit, auf, für, an, in, bei, nach, zu, über, um, durch, gegen, trotz, wegen)
  if (['aus', 'von', 'vom', 'mit', 'auf', 'für', 'an', 'am', 'in', 'im', 'bei', 'beim', 'nach', 'zu', 'zum', 'zur', 'über', 'unter', 'vor', 'durch', 'gegen', 'trotz', 'wegen', 'innerhalb', 'außerhalb'].includes(w)) {
    return {
      gapNum,
      correctLetter,
      correctWord,
      ruleCategoryAr: 'حروف الجر وأفعال مع حروف الجر (Präpositionen / Verben mit Präposition)',
      explanationDarija: `اختارينا حرف الجر «${correctWord}» (${correctLetter}) حيت الفعل أو الاسم اللي معاه فالجملة كيطلب هاد حرف الجر بالضبط (Rektion der Verben/Nomen).`,
    };
  }

  // Default smart contextual explanation
  return {
    gapNum,
    correctLetter,
    correctWord,
    ruleCategoryAr: mode === 'sb1' ? 'قواعد وسياق الرسالة (Grammatik & Kontext SB1)' : 'أدوات الربط والمفردات (Wortschatz & Struktur SB2)',
    explanationDarija: `في الفراغ [${gapNum}]، الكلمة الصحيحة هي «${correctWord}» (${correctLetter}) لأنها تكمل المعنى والتركيب النحوي للجملة (${contextDe.slice(0, 65)}...).`,
  };
}

/**
 * Generates the 4 interactive Local AI Tutor responses for any Text, Question, Situation, or Sprachbausteine item.
 */
export function generateLocalAiTutorResponse(
  ctx: AskAiContextItem,
  promptType: AiPromptType
): {
  titleAr: string;
  badgeText: string;
  sections: { heading: string; body: string; highlightPill?: string }[];
} {
  const negationsFound = (ctx.textDe.match(/\b(nicht|kein|keine|keinen|keinem|keiner|kaum|nie|niemals|ohne|weder|niemand|nichts)\b/gi) || []);
  const uniqueNegations = Array.from(new Set(negationsFound.map((n) => n.toLowerCase())));

  if (promptType === 'why_correct') {
    return {
      titleAr: '1️⃣ لماذا هذا العنوان/الجواب هو الأصح؟ (تحليل الموكلي الذهبي)',
      badgeText: `الحل الصحيح: ${ctx.correctLetter}`,
      sections: [
        {
          heading: '🎯 الجواب الرسمي الحرفي (100% Verbatim):',
          body: `${ctx.correctLetter}: ${ctx.correctTextDe}`,
          highlightPill: `${ctx.questionNum} ➔ ${ctx.correctLetter}`,
        },
        {
          heading: '🔑 الربط المباشر بين الموكلي في النص والموكلي في الجواب:',
          body:
            ctx.tKey || ctx.hKey
              ? `فاش كتقرا فالنص العبارة المفتاحية «${ctx.tKey || ctx.hKey}»، غادي تلقاها كتعني نفس الفكرة بالضبط فالعنوان/الجواب (${ctx.correctLetter}): «${ctx.hKey || ctx.correctTextDe}». هاد التطابق فالمعنى (Synonym / Paraphrase) هو علاش ${ctx.correctLetter} صحيح 100%.`
              : `النص كيدور بشكل أساسي حول الفكرة الموجودة في الاختيار (${ctx.correctLetter}): «${ctx.correctTextDe}».`,
          highlightPill: ctx.tKey ? `${ctx.tKey} ➔ ${ctx.hKey || ctx.correctLetter}` : undefined,
        },
        {
          heading: '💡 الفهم السريع بالدارجة المغربية:',
          body:
            ctx.arSummary ||
            translateGermanTextToArabic(ctx.correctTextDe, undefined, 'الخلاصة بالدارجة'),
        },
      ],
    };
  }

  if (promptType === 'compare_traps') {
    const sampleDistractors = (ctx.distractors || []).slice(0, 3);
    const distractorAnalysis =
      sampleDistractors.length > 0
        ? sampleDistractors
            .map(
              (d) =>
                `• الاختيار (${d.letter}) «${d.text.slice(0, 70)}»: فخ شائع! يستعمل كلمات قريبة من الموضوع العام ولكنها لا تطابق الشرط الدقيق أو الفكرة الرئيسية في هذا السؤال.`
            )
            .join('\n')
        : '• الاختيارات الأخرى تستعمل كلمات مألوفة من النص (نفس الحقل الدلالي) لكنها إما تعمم أكثر من اللازم أو تعكس المعنى.';

    return {
      titleAr: '2️⃣ مقارنة الجواب الصحيح مع عناوين واختيارات الفخاخ (Distraktoren)',
      badgeText: 'كشف فخاخ TELC B2',
      sections: [
        {
          heading: '⚠️ كيفاش كيبني امتحان TELC B2 الفخاخ؟',
          body: 'في TELC B2، واضعو الامتحان يضعون كلمة موجودة حرفياً في النص داخل عنوان خاطئ (فخ لفظي)، بينما العنوان الصحيح يستعمل مرادفاً ذكياً (Synonym) للفكرة الحقيقية!',
        },
        {
          heading: '🚫 لماذا الاختيارات الأخرى خاطئة؟',
          body: distractorAnalysis,
        },
        {
          heading: '✅ القاعدة الذهبية باش ما تطيحش فالفخ:',
          body: `ركز ديما على المعنى الكامل للموكلي (${ctx.tKey || ctx.correctTextDe.slice(0, 40)}) وما تختارش غير حيت شفتي كلمة وحدة متشابهة بلا ما تقرا الجملة كاملة!`,
        },
      ],
    };
  }

  if (promptType === 'mod_and_negation') {
    const hasModDiff =
      (ctx.mod1Answer && ctx.mod1Answer !== ctx.baseAnswer) ||
      (ctx.mod2Answer && ctx.mod2Answer !== ctx.baseAnswer);

    return {
      titleAr: '3️⃣ فخ التعديل (الأساسي vs المعدل) وقاعدة النفي (nicht / kein / kaum)',
      badgeText: hasModDiff ? '🔄 يتغير في المعدل!' : '✅ ثابت بين الأساسي والمعدل',
      sections: [
        {
          heading: '🔄 واش هاد السؤال كيتبدل بين الأساسي والمعدل؟',
          body: hasModDiff
            ? `رد بالك مزيان نهار الامتحان! هاد السؤال (${ctx.questionNum}) كيتبدل الكود ديالو بين النسخ:\n• فـ الأساسي (Base): ${ctx.baseAnswer || ctx.correctLetter}\n• فـ المعدل 1 (Mod 1): ${ctx.mod1Answer || '—'}\n${ctx.mod2Answer ? `• فـ المعدل 2 (Mod 2): ${ctx.mod2Answer}` : ''}\nلذلك حفظ الجملة الألمانية والموكلي ماشي غير الحرف بوحدو!`
            : `بشرى سارة! فهاد الموضوع، السؤال (${ctx.questionNum}) كيبقى عندو نفس المنطق، ولكن ديما تأكد من قراءة الكلمات المفتاحية بالأصفر.`,
          highlightPill: `Base: ${ctx.baseAnswer || ctx.correctLetter}${ctx.mod1Answer ? ` | Mod1: ${ctx.mod1Answer}` : ''}`,
        },
        {
          heading: '🔍 رادار النفي والاستثناء داخل هذه الفقرة (Negations-Check):',
          body:
            uniqueNegations.length > 0
              ? `لقينا فهاد النص أدوات نفي/تقليل خطيرة: 【 ${uniqueNegations.join(' ، ')} 】!\nفـ TELC B2، كلمة وحدة بحال «nicht» أو «kaum» أو «ohne» كتقلب الجواب من A لـ B. انتبه ليها مزيان!`
              : 'هاد المقطع ما فيهش نفي مباشر بـ nicht/kein، يعني الفكرة فيه مثبتة ومباشرة.',
          highlightPill: uniqueNegations.length > 0 ? `أدوات النفي: ${uniqueNegations.join(', ')}` : 'لا يوجد نفي خفي',
        },
      ],
    };
  }

  // 4. extract_b2_vocab
  const words = ctx.textDe
    .replace(/[.,!?;:()"'«»„“”[\]0-9]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4);

  const extractedList: string[] = [];
  const seen = new Set<string>();

  for (const w of words) {
    const low = w.toLowerCase();
    if (seen.has(low)) continue;
    if (B2_DICTIONARY[low]) {
      seen.add(low);
      extractedList.push(`• ${w}: ${B2_DICTIONARY[low].ar} [${B2_DICTIONARY[low].cat}]`);
    } else if (/^[A-ZÄÖÜ]/.test(w) && w.length >= 6) {
      seen.add(low);
      const info = lookupGermanWord(w);
      extractedList.push(`• ${w}: ${info.meaningAr}`);
    }
    if (extractedList.length >= 7) break;
  }

  return {
    titleAr: '4️⃣ أهم كلمات وقواعد B2 المستخرجة من هذه الفقرة',
    badgeText: 'قاموس B2 المركز',
    sections: [
      {
        heading: '📚 المفردات والروابط المهمة في هذا النص:',
        body:
          extractedList.length > 0
            ? extractedList.join('\n')
            : `• ${ctx.correctTextDe}: العبارة المفتاحية الأساسية في هذا السؤال.\n• نصيحة: اضغط على أي كلمة ألمانية داخل النص لفتح نافذة الترجمة الفورية وحفظها في قاموسك!`,
      },
      {
        heading: '🎓 نصيحة أستاذ B2 للحفظ السريع:',
        body: 'يمكنك النقر على أي كلمة ألمانية في النص لترجمتها فوراً وسماع نطقها وحفظها في «📚 قاموسي وأخطائي» في أعلى الصفحة!',
      },
    ],
  };
}

/**
 * Native German Text-to-Speech (Web Speech API `de-DE`) with configurable speed (1.0x or 0.8x).
 */
export function speakGermanText(text: string, rate: number = 1.0, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return false;
  }
  try {
    window.speechSynthesis.cancel();
    const cleaned = text.replace(/_{2,}/g, ' Lücke ').trim();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'de-DE';
    utterance.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    const germanVoice = voices.find((v) => v.lang.toLowerCase().startsWith('de'));
    if (germanVoice) {
      utterance.voice = germanVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    if (onEnd) onEnd();
    return false;
  }
}

export function stopGermanSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
