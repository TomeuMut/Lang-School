import type { Exercise, Language, Level } from '../../utils/practice'

export const TEST_COUNT = 5
export const ACTIVITIES_PER_TEST = 10

export interface GrammarRule {
  topic: string
  options: string[]
  explanation: string
  examples: [string, number][]
}

export function rule(topic: string, options: string[], explanation: string, examples: string[]): GrammarRule {
  return { topic, options, explanation, examples: examples.map(example => {
    const separator = example.indexOf('|')
    return [example.slice(separator + 1), Number(example.slice(0, separator))]
  }) }
}

export function grammarExercises(language: Language, level: Level, rules: GrammarRule[]): Exercise[] {
  if (rules.length !== 10 || rules.some(rule => rule.examples.length !== 5)) throw new Error(`Incomplete grammar bank: ${language} ${level}`)
  return rules.flatMap((rule, ruleIndex) => rule.examples.map(([prompt, answer], variant) => {
    // Each test contains one example of each rule, rather than ten repetitions
    // of the same construction. Rotate option positions without changing meaning.
    const shift = (ruleIndex + variant) % rule.options.length
    const options = [...rule.options.slice(shift), ...rule.options.slice(0, shift)]
    return {
      id: `${language}-${level}-grammar-test${variant + 1}-q${ruleIndex + 1}`,
      language, level, skill: 'grammar', testNumber: variant + 1,
      title: rule.topic, prompt, options,
      answer: (answer - shift + options.length) % options.length,
      explanation: rule.explanation,
    }
  }))
}

export interface ReadingText {
  title: string
  passage: string
  questions: [string, string, string, string, string][]
}

export function text(title: string, sentences: string[], questions: [string, string, string, string][]): ReadingText {
  if (sentences.length !== 5 || questions.length !== 5) throw new Error(`Incomplete reading text: ${title}`)
  return { title, passage: sentences.join(' '), questions: questions.map((question, index) => [...question, sentences[index]!] as [string, string, string, string, string]) }
}

export function readingExercises(language: Language, level: Level, texts: ReadingText[]): Exercise[] {
  if (texts.length !== 10 || texts.some(text => text.questions.length !== 5)) throw new Error(`Incomplete reading bank: ${language} ${level}`)
  return texts.flatMap((text, textIndex) => text.questions.map(([prompt, correct, wrongA, wrongB, explanation], index) => {
    const answers = [correct, wrongA, wrongB]
    const shift = (textIndex + index) % 3
    return {
      id: `${language}-${level}-reading-test${Math.floor(textIndex / 2) + 1}-text${textIndex % 2 + 1}-q${index + 1}`,
      language, level, skill: 'reading', testNumber: Math.floor(textIndex / 2) + 1,
      title: text.title, passage: text.passage, prompt,
      options: [...answers.slice(shift), ...answers.slice(0, shift)], answer: (3 - shift) % 3, explanation,
    }
  }))
}
