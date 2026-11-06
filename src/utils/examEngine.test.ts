import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VERBATIM_DB } from '../data/verbatimTypes';
import {
  buildTeil1SpeedDrill,
  buildTeil2SpeedDrill,
  buildTeil3SpeedDrill,
  calculatePruefungScore,
  extractGermanKeywords,
  getTeil1AnswerKey,
  getTeil2AnswerKey,
  getTeil3AnswerKey,
  parseSb1Options,
  parseSb2WordBox,
  searchRadarModules,
  splitTextWithHighlights,
} from './examEngine';

describe('SAHLA B2 & TELCFREE PRO 2026 — Verbatim Database & Engine Tests', () => {
  it('loads all 210 verbatim exam modules with exact counts', () => {
    assert.equal(VERBATIM_DB.pruefungen.length, 34, 'Should have 34 Prüfungen');
    assert.equal(VERBATIM_DB.teil1.length, 45, 'Should have 45 Lesen Teil 1 topics');
    assert.equal(VERBATIM_DB.teil2.length, 28, 'Should have 28 Lesen Teil 2 topics');
    assert.equal(VERBATIM_DB.teil3.length, 32, 'Should have 32 Lesen Teil 3 topics');
    assert.equal(VERBATIM_DB.sb1.length, 35, 'Should have 35 Sprachbausteine 1 topics');
    assert.equal(VERBATIM_DB.sb2.length, 36, 'Should have 36 Sprachbausteine 2 topics');

    const total =
      VERBATIM_DB.pruefungen.length +
      VERBATIM_DB.teil1.length +
      VERBATIM_DB.teil2.length +
      VERBATIM_DB.teil3.length +
      VERBATIM_DB.sb1.length +
      VERBATIM_DB.sb2.length;
    assert.equal(total, 210, 'Total modules across all categories must equal 210');
  });

  it('validates that all 34 Prüfungen link to existing Teil 1, Teil 2, Teil 3, SB1, and SB2 modules', () => {
    const t1Ids = new Set(VERBATIM_DB.teil1.map((x) => x.id));
    const t2Ids = new Set(VERBATIM_DB.teil2.map((x) => x.id));
    const t3Ids = new Set(VERBATIM_DB.teil3.map((x) => x.id));
    const sb1Ids = new Set(VERBATIM_DB.sb1.map((x) => x.id));
    const sb2Ids = new Set(VERBATIM_DB.sb2.map((x) => x.id));

    for (const p of VERBATIM_DB.pruefungen) {
      assert.ok(t1Ids.has(p.t1), `Prüfung ${p.id} missing t1=${p.t1}`);
      assert.ok(t2Ids.has(p.t2), `Prüfung ${p.id} missing t2=${p.t2}`);
      if (p.t2_alt) assert.ok(t2Ids.has(p.t2_alt), `Prüfung ${p.id} missing t2_alt=${p.t2_alt}`);
      assert.ok(t3Ids.has(p.t3), `Prüfung ${p.id} missing t3=${p.t3}`);
      if (p.t3_alt) assert.ok(t3Ids.has(p.t3_alt), `Prüfung ${p.id} missing t3_alt=${p.t3_alt}`);
      assert.ok(sb1Ids.has(p.sb1), `Prüfung ${p.id} missing sb1=${p.sb1}`);
      if (p.sb1_alt) assert.ok(sb1Ids.has(p.sb1_alt), `Prüfung ${p.id} missing sb1_alt=${p.sb1_alt}`);
      assert.ok(sb2Ids.has(p.sb2), `Prüfung ${p.id} missing sb2=${p.sb2}`);
      if (p.sb2_alt) assert.ok(sb2Ids.has(p.sb2_alt), `Prüfung ${p.id} missing sb2_alt=${p.sb2_alt}`);
    }
  });

  it('switches correctly between Base, Mod1, and Mod2 answer keys', () => {
    const t1 = VERBATIM_DB.teil1[0];
    assert.deepEqual(getTeil1AnswerKey(t1, 'base'), t1.ansBase);
    if (t1.ansMod1) {
      assert.deepEqual(getTeil1AnswerKey(t1, 'mod1'), t1.ansMod1);
    }

    const t2 = VERBATIM_DB.teil2[0];
    assert.deepEqual(getTeil2AnswerKey(t2, 'base'), t2.ansBase);
    if (t2.ansMod1) {
      assert.deepEqual(getTeil2AnswerKey(t2, 'mod1'), t2.ansMod1);
    }

    const t3 = VERBATIM_DB.teil3[0];
    assert.deepEqual(getTeil3AnswerKey(t3, 'base'), t3.ansBase);
    if (t3.ansMod1) {
      assert.deepEqual(getTeil3AnswerKey(t3, 'mod1'), t3.ansMod1);
    }
  });

  it('calculates the 105-point TELC B2 score and 63-point pass threshold accurately', () => {
    const perfect = calculatePruefungScore({
      t1User: { 1: 'E', 2: 'B', 3: 'I', 4: 'C', 5: 'J' },
      t1Correct: ['E', 'B', 'I', 'C', 'J'],
      t2User: { 6: 'B', 7: 'B', 8: 'A', 9: 'C', 10: 'A' },
      t2Correct: ['B', 'B', 'A', 'C', 'A'],
      t3User: { 11: 'A', 12: 'G', 13: 'B', 14: 'C', 15: 'H', 16: 'E', 17: 'J', 18: 'L', 19: 'X', 20: 'D' },
      t3Correct: ['A', 'G', 'B', 'C', 'H', 'E', 'J', 'L', 'X', 'D'],
      sb1User: { 21: 'C', 22: 'C', 23: 'C', 24: 'A', 25: 'A', 26: 'A', 27: 'B', 28: 'B', 29: 'A', 30: 'A' },
      sb1Correct: ['C', 'C', 'C', 'A', 'A', 'A', 'B', 'B', 'A', 'A'],
      sb2User: { 31: 'K', 32: 'B', 33: 'E', 34: 'D', 35: 'M', 36: 'L', 37: 'O', 38: 'F', 39: 'A', 40: 'N' },
      sb2Correct: ['K', 'B', 'E', 'D', 'M', 'L', 'O', 'F', 'A', 'N'],
    });
    assert.equal(perfect.totalScore, 105);
    assert.equal(perfect.passed, true);
    assert.equal(perfect.percentage, 100);

    const borderlineFail = calculatePruefungScore({
      t1User: { 1: 'E', 2: 'B', 3: 'I', 4: 'C', 5: 'J' }, // 25
      t1Correct: ['E', 'B', 'I', 'C', 'J'],
      t2User: { 6: 'B', 7: 'B', 8: 'A', 9: 'C', 10: 'A' }, // 25
      t2Correct: ['B', 'B', 'A', 'C', 'A'],
      t3User: { 11: 'A', 12: 'G', 13: 'B', 14: 'C' }, // 10 -> total 60
      t3Correct: ['A', 'G', 'B', 'C', 'H', 'E', 'J', 'L', 'X', 'D'],
      sb1User: {},
      sb1Correct: ['C', 'C', 'C', 'A', 'A', 'A', 'B', 'B', 'A', 'A'],
      sb2User: {},
      sb2Correct: ['K', 'B', 'E', 'D', 'M', 'L', 'O', 'F', 'A', 'N'],
    });
    assert.equal(borderlineFail.totalScore, 60);
    assert.equal(borderlineFail.passed, false);
  });

  it('highlights Mot-Clé trigger words without altering verbatim German text', () => {
    const sampleText = VERBATIM_DB.teil1[0].texts['1'];
    const trig = VERBATIM_DB.teil1[0].codatTriggers?.['1'];
    const keywords = extractGermanKeywords([trig?.tKey || '', trig?.hKey || '']);
    const segments = splitTextWithHighlights(sampleText, keywords);
    const reconstructed = segments.map((s) => s.text).join('');
    assert.equal(reconstructed, sampleText, 'Reconstructed text must be 100% identical to verbatim text');
    assert.ok(segments.some((s) => s.highlighted), 'At least one Mot-Clé segment should be highlighted');
  });

  it('parses all 35 SB1 optionsRaw/parsedOptions and 36 SB2 wordBoxRaw/parsedWordBox cleanly', () => {
    for (const s1 of VERBATIM_DB.sb1) {
      const parsed = parseSb1Options(s1.optionsRaw, s1.ansBase, s1.parsedOptions);
      assert.ok(parsed[21] && parsed[30], `SB1 ${s1.id} should parse gaps 21..30`);
      assert.ok(parsed[21].A.length > 0 && parsed[21].B.length > 0 && parsed[21].C.length > 0);
    }
    for (const s2 of VERBATIM_DB.sb2) {
      const parsed = parseSb2WordBox(s2.wordBoxRaw, s2.parsedWordBox);
      assert.equal(Object.keys(parsed).length, 15, `SB2 ${s2.id} should parse all 15 words A..O`);
    }
  });

  it('builds letterless 4-option Speed-Drill items for Sub-View 3 and searches all 210 Radar rows', () => {
    const t1Drills = buildTeil1SpeedDrill(VERBATIM_DB.teil1[0], 'base');
    assert.equal(t1Drills.length, 5);
    assert.equal(t1Drills[0].choices.length, 4);
    assert.ok(t1Drills[0].choices.includes(t1Drills[0].correctText));

    const t2Drills = buildTeil2SpeedDrill(VERBATIM_DB.teil2[0], 'base');
    assert.equal(t2Drills.length, 5);
    assert.ok(t2Drills[0].promptDe.length > 0, 'Teil 2 drill promptDe should be populated from stem/q');

    const t3Drills = buildTeil3SpeedDrill(VERBATIM_DB.teil3[0], 'base');
    assert.equal(t3Drills.length, 10);

    const allRadar = searchRadarModules('');
    assert.equal(allRadar.length, 210);
    const inselnHits = searchRadarModules('EBICJ');
    assert.ok(inselnHits.length >= 1);
  });

  it('provides instant German-Arabic dictionary lookup, B2 grammar explainer, and Local AI Tutor responses', async () => {
    const {
      lookupGermanWord,
      explainSprachGapGrammar,
      generateLocalAiTutorResponse,
      translateGermanTextToArabic,
    } = await import('./b2StudyEngine');

    const wordObwohl = lookupGermanWord('Obwohl,');
    assert.equal(wordObwohl.cleanWord, 'Obwohl');
    assert.ok(wordObwohl.meaningAr.includes('بالرغم'));

    const grammarExp = explainSprachGapGrammar(22, 'B', 'weil', 'Ich komme heute nicht, ___22___ ich krank bin.', 'sb1');
    assert.equal(grammarExp.gapNum, 22);
    assert.ok(grammarExp.explanationDarija.includes('weil'));

    const translation = translateGermanTextToArabic('Die Wissenschaftler haben kaum Zeit für eine neue Studie.');
    assert.ok(translation.length > 10);
    assert.ok(translation.includes('نفي'));

    const tutorRes = generateLocalAiTutorResponse(
      {
        moduleType: 'teil1',
        moduleTitle: 'Inseln',
        itemLabel: 'Text 1',
        questionNum: 1,
        textDe: VERBATIM_DB.teil1[0].texts['1'],
        correctLetter: 'E',
        correctTextDe: VERBATIM_DB.teil1[0].headings['E'],
        tKey: 'Tourismus',
        hKey: 'Urlaub',
        baseAnswer: 'E',
        mod1Answer: 'H',
      },
      'mod_and_negation'
    );
    assert.ok(tutorRes.sections.length >= 2);
  });
});

