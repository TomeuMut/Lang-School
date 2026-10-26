import { levels } from '../../utils/practice'
import { grammarExercises, readingExercises } from './builders'
import { catalanGrammar } from './grammar-ca'
import { englishGrammar } from './grammar-en'
import { catalanReading } from './reading-ca'
import { englishReading } from './reading-en'
import { productionExercises, readingBand } from './production'

export const expandedExercises = (['ca', 'en'] as const).flatMap(language => levels.flatMap(level => [
  ...grammarExercises(language, level, (language === 'ca' ? catalanGrammar : englishGrammar)[level]),
  ...readingExercises(language, level, (language === 'ca' ? catalanReading : englishReading)[readingBand(level)]),
  ...productionExercises(language, level),
]))
