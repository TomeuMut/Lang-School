# Expanded practice bank

## Scope

For each of Catalan and English, and each A1-C2 level, grammar/vocabulary, reading, writing and speaking each have five tests containing ten activities: 240 tests, with 2,400 scoped activity records. Mixed practice additionally assembles five grammar and five reading activities; it is not additional unique content.

- Grammar: ten rule groups per language/level, each with five authored examples. Every test takes one example of each rule. Answer positions rotate independently of content; a permutation is never counted as another question.
- Reading: ten texts per language/learning band, each with five questions. Each test contains two complete texts. A1/A2 share a foundation band, B1/B2 an intermediate band, and C1/C2 an advanced band; the same reading questions therefore occur at adjacent levels. Scope counts do not imply 600 independently authored reading questions. Answer explanations quote the relevant sentence of the original practice passage.
- Writing/speaking: five scenario contexts per learning band, with ten level-specific communicative tasks per scenario and skill. Activities have different purposes, such as asking for information, comparing alternatives, responding to an objection and synthesising a discussion. Context is intentionally shared within a test. Each writing task has an indicative word range; ten tasks can require a long session. Oral tasks have no recording or automatic assessment.

Material is original practice content with indicative CEFR labels, pending teacher review. It does not reproduce an official exam. Self-assessment is not an objective mark. Reading bands should eventually be split into independently reviewed level-specific banks.

## Selection and persistence

`selectPracticeTest` chooses the test with the oldest last-displayed activity, preferring untouched tests and then test number. Thus opening test 1 and starting another practice moves to test 2 even if test 1 was not completed. Once five tests have been opened, the least recently opened one is recycled. Reading, grammar, writing and speaking have independent rotations. Mixed practice takes five questions of each objective skill from a selected test number.

Only a displayed activity changes its `seen` timestamp; unseen questions are not falsely marked completed. Monotonic timestamps keep rotation deterministic even when the device clock repeats or moves backwards. Completing or abandoning a practice does not erase previous attempts.

The current workspace persists all ten activity IDs, current position, answer, writing draft, checklist and checked state. Reload restores it, and **Continuar sesión** resumes it. **Hacer otro test** retains the completed session's skill. Starting another session still asks before replacing unfinished work.

No database migration is required: existing account progress stores the same versioned document. The 72 starter IDs remain in the combined index with `retired: true` so old history and saved sessions still resolve; they are excluded from new selection and current-bank coverage. Historical attempts remain visible in history and accuracy statistics.

## Verification

Automated checks require 50 distinct passage/prompt pairs per language, level and skill, exactly ten per test, valid answer indices and unique options. Selection tests cover a full five-test cycle in every scope, immediate restart and independent skill rotation. Persistence checks cover question nine, ten-task completion and legacy drafts/history. Browser smoke tests complete ten grammar questions, reload midway and start test 2 on desktop and mobile.

The production build succeeds, with a Vite warning that the main client chunk now exceeds 500 kB (about 579 kB minified, 189 kB gzip in this build). The bank is currently bundled for synchronous selection and history recovery; future per-scope loading should preserve those guarantees.

For linguistic review, prioritise answer uniqueness, idiomatic prompts, plausibility of distractors, reading evidence and actual CEFR difficulty. Automated integrity checks do not establish linguistic or pedagogical correctness.

Authoring references include the IEC's [essential Catalan grammar on conditional constructions](https://geiec.iec.cat/text/27.2.2) and its [grammar updates covering concessive constructions](https://giec.iec.cat/assets/documents/AGIEC_2022_Web.pdf). These references support rule review, not certification of the complete activity bank.
