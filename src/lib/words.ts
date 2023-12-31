import {
  addDays,
  differenceInDays,
  formatISO,
  parseISO,
  startOfDay,
} from 'date-fns'
import queryString from 'query-string'

import { getWordsByGame, WORDS } from '../constants/wordlist'
import { VALID_GUESSES } from '../constants/validGuesses'
import { VALID_OMEGA } from '../constants/validGuessesOmega'

import { WRONG_SPOT_MESSAGE, NOT_CONTAINED_MESSAGE } from '../constants/strings'
// import { ENABLE_ARCHIVED_GAMES } from '../constants/settings'
import { getGuessStatuses } from './statuses'
// import {
//   loadUnlimitedStatsFromLocalStorage,
//   saveUnlimitedStatsToLocalStorage,
// } from './localStorage'
import { debuglog } from './log'
import { default as GraphemeSplitter } from 'grapheme-splitter'
import { getToday } from './dateutils'

// function getUrlVars() {
//   var parts = window.location.href.split('/');
//   debuglog(parts)
//   var dict = new Map<string, string>();

//   parts.forEach((part: string) => {
//     if(part.includes('=')) {
//       var equals_index = parts.indexOf(part)
//       var key = part.substring(0,equals_index)
//       dict.set(key,part.substring(equals_index+1))
//     }
//   })
//   return dict;
// }

// function getUrlParam(parameter: string, defaultvalue: any){
//   var urlparameter = defaultvalue;
//   if(window.location.href.indexOf(parameter) > -1){
//       urlparameter = getUrlVars().get(parameter);
//       }
//   return urlparameter;
// }

function getURLParts() {
  var parts = window.location.href.replace('&', '').split('/')
  return parts
}

export function getURLBase() {
  var parts = getURLParts()
  return parts[0] + '//' + parts[2]
}

export function getURLFirst() {
  var parts = getURLParts()
  return parts[3]
}

export function getUrlOverrides() {
  var parts = getURLParts()
  parts = parts.splice(3)
  debuglog(parts)
  var dict = new Map<string, number>()
  if (parts[0]) dict.set('daily', parseInt(parts[0]) - 1)
  dict.set('max', parseInt(parts[1]))
  return dict
}

// Set up overrides
const OVERRIDES = getUrlOverrides()
export const DAY_OVERRIDE = OVERRIDES.get('daily')

// December 1, 2023 Game Epoch
const epoch = new Date(2023, 11, 0)
const start = new Date(epoch)
const today = new Date()
export const firstGameDate = new Date(2023, 11)
export const periodInDays = 1
today.setHours(0, 0, 0, 0)
let index = 0
while (start < today) {
  index++
  start.setDate(start.getDate() + 1)
}
export const THE_USUAL = index

export const isWordInWordList = (word: string, override = false) => {
  const WORD_LENGTH = word.length
  return (
    getWordsByGame(override).includes(word.toLowerCase()) ||
    VALID_GUESSES[WORD_LENGTH].includes(word.toLowerCase()) ||
    VALID_OMEGA.includes(word.toLowerCase())
  )
}

export const isWinningWord = (word: string) => {
  return solution === word
}

// build a set of previously revealed letters - present and correct
// guess must use correct letters in that space and any other revealed letters
export const findFirstUnusedReveal = (word: string, guesses: string[]) => {
  if (guesses.length === 0) {
    return false
  }

  const lettersLeftArray = new Array<string>()
  const guess = guesses[guesses.length - 1]
  const statuses = getGuessStatuses(solution, guess)
  const splitWord = unicodeSplit(word)
  const splitGuess = unicodeSplit(guess)

  for (let i = 0; i < splitGuess.length; i++) {
    if (statuses[i] === 'correct' || statuses[i] === 'present') {
      lettersLeftArray.push(splitGuess[i])
    }
    if (statuses[i] === 'correct' && splitWord[i] !== splitGuess[i]) {
      return WRONG_SPOT_MESSAGE(splitGuess[i], i + 1)
    }
  }

  // check for the first unused letter, taking duplicate letters
  // into account - see issue #198
  let n
  for (const letter of splitWord) {
    n = lettersLeftArray.indexOf(letter)
    if (n !== -1) {
      lettersLeftArray.splice(n, 1)
    }
  }

  if (lettersLeftArray.length > 0) {
    return NOT_CONTAINED_MESSAGE(lettersLeftArray[0])
  }
  return false
}

export const unicodeSplit = (word: string) => {
  return new GraphemeSplitter().splitGraphemes(word)
}

// export const getDayIndex = () => {
//   if (DAY_OVERRIDE || DAY_OVERRIDE === 0) {
//     if (DAY_OVERRIDE < 0 || DAY_OVERRIDE >= THE_USUAL) return THE_USUAL
//     return DAY_OVERRIDE
//   }
//   return THE_USUAL
// }

// export const getWordDaily = () => {
//   var index = getDayIndex()
//   // const nextday = (THE_USUAL + 1) * msInDay + epochMs
//   const nextDay = new Date(today)
//   nextDay.setDate(today.getDate() + 1)

//   debuglog('daily #', index)

//   var solutionToBe = WORDS[index % WORDS.length].toUpperCase()

//   debuglog(solutionToBe)

//   return {
//     solution: solutionToBe,
//     solutionIndex: index,
//     // tomorrow: nextday,
//     tomorrow: nextDay.valueOf(),
//   }
// }

// export const getWordUnlimited = () => {
//   const WORDS_BYGAME = getWordsByGame()
//   var index = Math.floor(Math.random() * WORDS_BYGAME.length)
//   // const nextday = (THE_USUAL + 1) * msInDay + epochMs
//   const nextDay = new Date(today)
//   nextDay.setDate(today.getDate() + 1)

//   debuglog('unlimited mode')

//   var solutionToBe = WORDS_BYGAME[index % WORDS_BYGAME.length].toUpperCase()

//   var loaded = loadUnlimitedStatsFromLocalStorage()
//   var loaded_array = loaded?.pastSolutions

//   if (loaded && loaded_array && loaded_array.length === WORDS_BYGAME.length) {
//     saveUnlimitedStatsToLocalStorage({
//       winDistribution: loaded?.winDistribution,
//       gamesFailed: loaded?.gamesFailed,
//       currentStreak: loaded?.currentStreak,
//       bestStreak: loaded?.bestStreak,
//       totalGames: loaded?.totalGames,
//       successRate: loaded?.successRate,
//       pastSolutions: [],
//     })
//   }

//   while (
//     loadUnlimitedStatsFromLocalStorage()?.pastSolutions.includes(solutionToBe)
//   ) {
//     index = Math.floor(Math.random() * WORDS_BYGAME.length)
//     solutionToBe = WORDS_BYGAME[index % WORDS_BYGAME.length].toUpperCase()
//   }

//   debuglog('soln:', solutionToBe)

//   return {
//     solution: solutionToBe,
//     solutionIndex: index,
//     // tomorrow: nextday,
//     tomorrow: nextDay.valueOf(),
//   }
// }

// export const getWord = () => {
//   if (DAY_OVERRIDE === undefined) return getWordDaily()
//   if (getURLFirst() === 'infinite') return getWordUnlimited()
//   return getWordDaily()
// }

// export const { solution, solutionIndex, tomorrow } = getWord()

///////

export const localeAwareLowerCase = (text: string) => {
  return process.env.REACT_APP_LOCALE_STRING
    ? text.toLocaleLowerCase(process.env.REACT_APP_LOCALE_STRING)
    : text.toLowerCase()
}

export const localeAwareUpperCase = (text: string) => {
  return process.env.REACT_APP_LOCALE_STRING
    ? text.toLocaleUpperCase(process.env.REACT_APP_LOCALE_STRING)
    : text.toUpperCase()
}

export const getLastGameDate = (today: Date) => {
  const t = startOfDay(today)
  let daysSinceLastGame = differenceInDays(firstGameDate, t) % periodInDays
  return addDays(t, -daysSinceLastGame)
}

export const getNextGameDate = (today: Date) => {
  return addDays(getLastGameDate(today), periodInDays)
}

export const isValidGameDate = (date: Date) => {
  if (date < firstGameDate || date > getToday()) {
    return false
  }

  return differenceInDays(firstGameDate, date) % periodInDays === 0
}

export const getIndex = (gameDate: Date) => {
  let start = firstGameDate
  let index = -1
  do {
    index++
    start = addDays(start, periodInDays)
  } while (start <= gameDate)

  return index
}

export const getWordOfDay = (index: number) => {
  if (index < 0) {
    throw new Error('Invalid index')
  }

  return localeAwareUpperCase(WORDS[index % WORDS.length])
}

export const getSolution = (gameDate: Date) => {
  const nextGameDate = getNextGameDate(gameDate)
  const index = getIndex(gameDate)
  const wordOfTheDay = getWordOfDay(index)
  return {
    solution: wordOfTheDay,
    solutionGameDate: gameDate,
    solutionIndex: index,
    tomorrow: nextGameDate.valueOf(),
  }
}

export const getGameDate = () => {
  if (getIsLatestGame()) {
    return getToday()
  }

  const parsed = queryString.parse(window.location.search)
  try {
    const d = startOfDay(parseISO(parsed.d!.toString()))
    if (d >= getToday() || d < firstGameDate) {
      setGameDate(getToday())
    }
    return d
  } catch (e) {
    console.log(e)
    return getToday()
  }
}

export const setGameDate = (d: Date) => {
  try {
    if (d < getToday()) {
      window.location.href = '/?d=' + formatISO(d, { representation: 'date' })
      return
    }
  } catch (e) {
    console.log(e)
  }
  window.location.href = '/'
}

export const getIsLatestGame = () => {
  // return true

  const parsed = queryString.parse(window.location.search)
  return parsed === null || !('d' in parsed)
}

export const { solution, solutionGameDate, solutionIndex, tomorrow } =
  getSolution(getGameDate())
