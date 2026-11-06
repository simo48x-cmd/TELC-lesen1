import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRUEFUNGEN_PACKAGES,
  TEIL1_TOPICS,
  TEIL2_TOPICS,
  TEIL3_TOPICS,
  SPRACHBAUSTEINE_TOPICS,
} from '../data/lesenData';
import {
  calculatePruefungScore,
  resolveVariantAnswer,
  searchExamRadar,
  splitTextByKeywords,
} from './examEngine';

test('Database completeness: 26 Prüfungen, 42 Teil 1, 27 Teil 2, 28 Teil 3', () => {
  assert.equal(PRUEFUNGEN_PACKAGES.length, 26, 'Should have all 26 Prüfungen packages');
  assert.equal(TEIL1_TOPICS.length, 42, 'Should have all 42 Lesen Teil 1 topics');
  assert.equal(TEIL2_TOPICS.length, 27, 'Should have all 27 Lesen Teil 2 topics');
  assert.equal(TEIL3_TOPICS.length, 28, 'Should have all 28 Lesen Teil 3 topics');
  assert.ok(SPRACHBAUSTEINE_TOPICS.length >= 7, 'Should have linked Sprachbausteine topics');
});

test('All 26 Prüfungen link to valid Teil 1, Teil 2, Teil 3, SB1, and SB2 IDs', () => {
  for (const pkg of PRUEFUNGEN_PACKAGES) {
    const t1 = TEIL1_TOPICS.find((t) => t.id === pkg.teil1Id);
    const t2 = TEIL2_TOPICS.find((t) => t.id === pkg.teil2Id);
    const t3 = TEIL3_TOPICS.find((t) => t.id === pkg.teil3Id);
    const sb1 = SPRACHBAUSTEINE_TOPICS.find((s) => s.id === pkg.sb1Id);
    const sb2 = SPRACHBAUSTEINE_TOPICS.find((s) => s.id === pkg.sb2Id);

    assert.ok(t1, `Package ${pkg.id} missing Teil 1 ID: ${pkg.teil1Id}`);
    assert.ok(t2, `Package ${pkg.id} missing Teil 2 ID: ${pkg.teil2Id}`);
    assert.ok(t3, `Package ${pkg.id} missing Teil 3 ID: ${pkg.teil3Id}`);
    assert.ok(sb1, `Package ${pkg.id} missing SB1 ID: ${pkg.sb1Id}`);
    assert.ok(sb2, `Package ${pkg.id} missing SB2 ID: ${pkg.sb2Id}`);
  }
});

test('TELC B2 105-point scoring and 63-point (60%) pass threshold work accurately', () => {
  const fullScore = calculatePruefungScore({
    teil1CorrectCount: 5,
    teil2CorrectCount: 5,
    teil3CorrectCount: 10,
    sb1CorrectCount: 10,
    sb2CorrectCount: 10,
  });
  assert.equal(fullScore.totalPoints, 105);
  assert.equal(fullScore.percentage, 100);
  assert.equal(fullScore.passed, true);

  const exactPass = calculatePruefungScore({
    teil1CorrectCount: 4, // 20
    teil2CorrectCount: 4, // 20
    teil3CorrectCount: 4, // 10
    sb1CorrectCount: 5,   // 7.5
    sb2CorrectCount: 4,   // 6.0 -> sum = 63.5
  });
  assert.equal(exactPass.totalPoints, 63.5);
  assert.equal(exactPass.passed, true);

  const failScore = calculatePruefungScore({
    teil1CorrectCount: 2, // 10
    teil2CorrectCount: 2, // 10
    teil3CorrectCount: 4, // 10
    sb1CorrectCount: 2,   // 3
    sb2CorrectCount: 2,   // 3 -> sum = 36
  });
  assert.equal(failScore.totalPoints, 36);
  assert.equal(failScore.passed, false);
});

test('Exam-Day Radar finds Inseln, Krista, EBICJ, and Insekten variants accurately', () => {
  const byCode = searchExamRadar('EBICJ');
  assert.ok(byCode.teil1Matches.some((t) => t.id === 'inseln'));
  assert.ok(byCode.packages.some((p) => p.id === 'P1'));

  const byKrista = searchExamRadar('Kinobetreiber');
  assert.ok(byKrista.teil2Matches.some((t) => t.id === 'krista'));

  const byInsekten = searchExamRadar('IHBEC');
  assert.ok(byInsekten.teil1Matches.some((t) => t.id === 'insekten'));
});

test('Variant resolution switches between original and modified answers', () => {
  const insekten = TEIL1_TOPICS.find((t) => t.id === 'insekten')!;
  assert.equal(resolveVariantAnswer(insekten.items[0].correctLetterByVariant, 'original'), 'C');
  assert.equal(resolveVariantAnswer(insekten.items[0].correctLetterByVariant, 'mod1'), 'I');

  const segments = splitTextByKeywords('Er war früher Kinobetreiber in der Stadt.', ['Kinobetreiber']);
  assert.ok(segments.some((s) => s.highlighted && s.text.toLowerCase() === 'kinobetreiber'));
});
