import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { DatePickerModal } from './components/modals/DatePickerModal'
import { InfoModal } from './components/modals/InfoModal'
import { StatsModal } from './components/modals/StatsModal'
import { SettingsModal } from './components/modals/SettingsModal'
import {
  WIN_MESSAGES,
  GAME_COPIED_MESSAGE,
  NOT_ENOUGH_LETTERS_MESSAGE,
  WORD_NOT_FOUND_MESSAGE,
  CORRECT_WORD_MESSAGE,
  HARD_MODE_ALERT_MESSAGE,
  DISCOURAGE_INAPP_BROWSER_TEXT,
} from './constants/strings'
import {
  DATE_LOCALE,
  maxChallenges,
  MAX_WORD_LENGTH,
  ALERT_TIME_MS,
  REVEAL_TIME_MS,
  GAME_LOST_INFO_DELAY,
  WELCOME_INFO_MODAL_MS,
  DISCOURAGE_INAPP_BROWSERS,
} from './constants/settings'
import {
  isWordInWordList,
  isWinningWord,
  solution,
  // findFirstUnusedReveal,
  getIndex,
  getGameDate,
  getIsLatestGame,
  solutionGameDate,
  setGameDate,
  // THE_USUAL,
  // getURLBase,
  // LENGTH_OVERRIDE,
} from './lib/words'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  setStoredIsHighContrastMode,
  getStoredIsHighContrastMode,
  loadStatsFromLocalStorage,
} from './lib/localStorage'

import './App.css'
import { AlertContainer } from './components/alerts/AlertContainer'
import { useAlert } from './context/AlertContext'
import { isInAppBrowser } from './lib/browser'
import { MigrateStatsModal } from './components/modals/MigrateStatsModal'
import { Navbar } from './components/navbar/Navbar'
import { debuglog } from './lib/log'
import { ClockIcon } from '@heroicons/react/outline'

function App() {
  const isLatestGame = getIsLatestGame()
  const gameDate = getGameDate()

  const DAY_INDEX = getIndex(getGameDate())
  debuglog('day:', DAY_INDEX)

  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches

  const { showError: showErrorAlert, showSuccess: showSuccessAlert } =
    useAlert()
  const [currentGuess, setCurrentGuess] = useState('')
  const [isGameWon, setIsGameWon] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false)
  const [isMigrateStatsModalOpen, setIsMigrateStatsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [currentRowClass, setCurrentRowClass] = useState('')
  const [isGameLost, setIsGameLost] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme')
      ? localStorage.getItem('theme') === 'dark'
      : prefersDarkMode
      ? true
      : false
  )
  const [isHighContrastMode, setIsHighContrastMode] = useState(
    getStoredIsHighContrastMode()
  )
  const [isRevealing, setIsRevealing] = useState(false)
  const [isHardMode, setIsHardMode] = useState(
    localStorage.getItem('gameMode')
      ? localStorage.getItem('gameMode') === 'hard'
      : false
  )
  const [guesses, setGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage(isLatestGame)
    if (loaded?.solution !== solution) {
      return []
    }
    if (loaded) {
      const gameWasWon = loaded.guesses.includes(solution)
      if (gameWasWon) {
        setIsGameWon(true)
        return loaded.guesses
      }
      if (loaded.guesses.length > maxChallenges(isHardMode)) {
        setIsHardMode(false)
      }
      if (loaded.guesses.length === maxChallenges(isHardMode) && !gameWasWon) {
        setIsGameLost(true)
        showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
          persist: true,
        })
      }
      const statsObj = loadStatsFromLocalStorage()
      if (statsObj?.lastAttempted) {
        if (statsObj.lastAttempted === DAY_INDEX) {
          setIsGameLost(true)
          showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
            persist: true,
          })
        }
      }

      return loaded.guesses
    }
    return []
  })

  const [stats, setStats] = useState(() => loadStats())

  useEffect(() => {
    // if no game state on load,
    // show the user the how-to info modal
    if (!loadGameStateFromLocalStorage(true)) {
      setTimeout(() => {
        setIsInfoModalOpen(true)
      }, WELCOME_INFO_MODAL_MS)
    }
  }, [])

  useEffect(() => {
    DISCOURAGE_INAPP_BROWSERS &&
      isInAppBrowser() &&
      showErrorAlert(DISCOURAGE_INAPP_BROWSER_TEXT, {
        persist: false,
        durationMs: 7000,
      })
  }, [showErrorAlert])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (isHighContrastMode) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [isDarkMode, isHighContrastMode])

  const handleDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  const handleHardMode = (isHard: boolean) => {
    if (guesses.length >= 3) {
      showErrorAlert(HARD_MODE_ALERT_MESSAGE)
      return
    }
    setIsHardMode(isHard)
    localStorage.setItem('gameMode', isHard ? 'hard' : 'normal')
  }

  const handleHighContrastMode = (isHighContrast: boolean) => {
    setIsHighContrastMode(isHighContrast)
    setStoredIsHighContrastMode(isHighContrast)
  }

  useEffect(() => {
    saveGameStateToLocalStorage(getIsLatestGame(), { guesses, solution })
  }, [guesses])

  useEffect(() => {
    if (isGameWon) {
      const winMessage =
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      const delayMs = REVEAL_TIME_MS * MAX_WORD_LENGTH // LENGTH_OVERRIDE

      showSuccessAlert(winMessage, {
        delayMs,
        onClose: () => setIsStatsModalOpen(true),
      })
    }

    if (isGameLost) {
      setTimeout(() => {
        setIsStatsModalOpen(true)
      }, GAME_LOST_INFO_DELAY)
    }
  }, [isGameWon, isGameLost, showSuccessAlert])

  const onChar = (value: string) => {
    if (
      currentGuess.length < MAX_WORD_LENGTH && // LENGTH_OVERRIDE &&
      guesses.length < maxChallenges(isHardMode) &&
      !isGameWon
    ) {
      setCurrentGuess(`${currentGuess}${value}`)
    }
  }

  const onDelete = () => {
    setCurrentGuess(currentGuess.slice(0, -1))
  }

  const onEnter = () => {
    if (isGameWon || isGameLost) {
      return
    }
    if (!(currentGuess.length === MAX_WORD_LENGTH)) {
      // LENGTH_OVERRIDE)) {
      showErrorAlert(NOT_ENOUGH_LETTERS_MESSAGE)
      setCurrentRowClass('jiggle')
      return setTimeout(() => {
        setCurrentRowClass('')
      }, ALERT_TIME_MS)
    }

    if (!isWordInWordList(currentGuess, true)) {
      showErrorAlert(WORD_NOT_FOUND_MESSAGE)
      setCurrentRowClass('jiggle')
      return setTimeout(() => {
        setCurrentRowClass('')
      }, ALERT_TIME_MS)
    }

    setIsRevealing(true)
    // turn this back off after all
    // chars have been revealed
    setTimeout(() => {
      setIsRevealing(false)
    }, REVEAL_TIME_MS * MAX_WORD_LENGTH) // LENGTH_OVERRIDE)

    const winningWord = isWinningWord(currentGuess)

    if (
      currentGuess.length === MAX_WORD_LENGTH && // LENGTH_OVERRIDE &&
      guesses.length < maxChallenges(isHardMode) &&
      !isGameWon
    ) {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess('')

      if (winningWord) {
        if (isLatestGame) {
          setStats(addStatsForCompletedGame(stats, guesses.length, isHardMode))
        }
        return setIsGameWon(true)
      }

      if (guesses.length === maxChallenges(isHardMode) - 1) {
        if (isLatestGame) {
          setStats(
            addStatsForCompletedGame(stats, guesses.length + 1, isHardMode)
          )
        }
        setIsGameLost(true)
        showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
          persist: true,
          delayMs: REVEAL_TIME_MS * MAX_WORD_LENGTH + 1, //LENGTH_OVERRIDE + 1,
        })
      }
    }
  }

  const DAY_DISPLAY = DAY_INDEX === 9 ? 'Ω' : DAY_INDEX+1

  // console.log(DAY_INDEX)
  return (
    <div className="flex h-full flex-col">
      <Navbar
        isInfinite={false}
        dayDisplay={DAY_DISPLAY}
        isHardMode={isHardMode}
        isDarkMode={isDarkMode}
        setIsInfoModalOpen={() => setIsInfoModalOpen(true)}
        setIsSettingsModalOpen={() => setIsSettingsModalOpen(true)}
        setIsStatsModalOpen={() => setIsStatsModalOpen(true)}
        setIsDatePickerModalOpen={setIsDatePickerModalOpen}
      />
      {!isLatestGame && (
        <div className="flex items-center justify-center">
          <ClockIcon className="h-6 w-6 stroke-gray-600 dark:stroke-gray-300" />
          <p className="text-base text-gray-600 dark:text-gray-300">
            {format(gameDate, 'd MMMM yyyy', { locale: DATE_LOCALE })}
          </p>
        </div>
      )}
      <Grid
        solution={solution}
        guesses={guesses}
        currentGuess={currentGuess}
        isHard={isHardMode}
        isRevealing={isRevealing}
        currentRowClassName={currentRowClass}
      />
      <div className="h-48"></div>
      <Keyboard
        onChar={onChar}
        onDelete={onDelete}
        onEnter={onEnter}
        guesses={guesses}
        isRevealing={isRevealing}
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        handleClose={() => setIsInfoModalOpen(false)}
      />
      <StatsModal
        isOpen={isStatsModalOpen}
        handleClose={() => setIsStatsModalOpen(false)}
        solution={solution}
        guesses={guesses}
        gameStats={stats}
        isLatestGame={isLatestGame}
        isGameLost={isGameLost}
        isGameWon={isGameWon}
        handleShareToClipboard={() => showSuccessAlert(GAME_COPIED_MESSAGE)}
        handleMigrateStatsButton={() => {
          setIsStatsModalOpen(false)
          setIsMigrateStatsModalOpen(true)
        }}
        isHardMode={isHardMode}
        isDarkMode={isDarkMode}
        isHighContrastMode={isHighContrastMode}
        numberOfGuessesMade={guesses.length}
      />
      <DatePickerModal
        isOpen={isDatePickerModalOpen}
        initialDate={solutionGameDate}
        handleSelectDate={(d: Date) => {
          setIsDatePickerModalOpen(false)
          setGameDate(d)
        }}
        handleClose={() => setIsDatePickerModalOpen(false)}
      />
      <MigrateStatsModal
        isOpen={isMigrateStatsModalOpen}
        handleClose={() => setIsMigrateStatsModalOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        handleClose={() => setIsSettingsModalOpen(false)}
        isHardMode={isHardMode}
        handleHardMode={handleHardMode}
        isDarkMode={isDarkMode}
        handleDarkMode={handleDarkMode}
        isHighContrastMode={isHighContrastMode}
        handleHighContrastMode={handleHighContrastMode}
      />

      <AlertContainer />
    </div>
  )
}
// }

export default App
