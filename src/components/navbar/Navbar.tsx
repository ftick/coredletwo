// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faInfinity } from '@fortawesome/free-solid-svg-icons'
import {
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline'
import { GAME_TITLE } from '../../constants/strings'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelopeOpen } from '@fortawesome/free-regular-svg-icons'
// import { getURLBase } from '../../lib/words'

type Props = {
  isInfinite: boolean
  dayDisplay: number | string
  isHardMode: boolean
  isDarkMode: boolean
  setIsInfoModalOpen: (value: boolean) => void
  setIsStatsModalOpen: (value: boolean) => void
  setIsDatePickerModalOpen: (value: boolean) => void
  setIsSettingsModalOpen: (value: boolean) => void
}

export const Navbar = ({
  isInfinite,
  dayDisplay,
  isHardMode,
  isDarkMode,
  setIsInfoModalOpen,
  setIsStatsModalOpen,
  setIsDatePickerModalOpen,
  setIsSettingsModalOpen,
}: Props) => {
  // if (isInfinite) {
  //   return (
  //     <div className="navbar">
  //       <div className="navbar-content px-5 short:h-auto">
  //         <div className="flex">
  //           <InformationCircleIcon
  //             className="h-6 w-6 mr-2 cursor-pointer dark:stroke-white"
  //             onClick={() => setIsInfoModalOpen(true)}
  //           />
  //           <CalendarIcon
  //             className="ml-3 h-6 w-6 cursor-pointer dark:stroke-white"
  //             onClick={() => setIsDatePickerModalOpen(true)}
  //           />
  //         </div>
  //         <p className="text-xl font-bold dark:text-white">{GAME_TITLE}</p>
  //         <div className="flex">
  //           <h1 className="text-xl ml-2.5 grow font-bold dark:text-white">
  //             {GAME_TITLE} ∞ {isHardMode ? '😺🎀' : ''}
  //           </h1>
  //         </div>
  //         <div className="right-icons">
  //           <CalendarIcon
  //             className="h-6 w-6 mr-2 cursor-pointer dark:stroke-white"
  //             onClick={() => {
  //               window.open(getURLBase(), '_self')
  //             }}
  //           />
  //           <ChartBarIcon
  //             className="h-6 w-6 mr-3 cursor-pointer dark:stroke-white"
  //             onClick={() => setIsStatsModalOpen(true)}
  //           />
  //           <CogIcon
  //             className="h-6 w-6 mr-3 cursor-pointer dark:stroke-white"
  //             onClick={() => setIsSettingsModalOpen(true)}
  //           />
  //         </div>
  //       </div>
  //       <hr></hr>
  //     </div>
  //   )
  // }
  return (
    <div className="navbar">
      <div className="navbar-content px-5 short:h-auto">
        <div className="flex">
          <InformationCircleIcon
            className="h-6 w-6 mr-2 cursor-pointer dark:stroke-white"
            onClick={() => setIsInfoModalOpen(true)}
          />
          <CalendarIcon
            className="ml-3 h-6 w-6 cursor-pointer dark:stroke-white"
            onClick={() => setIsDatePickerModalOpen(true)}
          />
        </div>
        <div className="flex">
          <h1 className="text-xl ml-2.5 grow font-bold dark:text-white">
            {GAME_TITLE} {dayDisplay}
            {isHardMode ? '😺🎀' : ''}
          </h1>
        </div>
        <div className="right-icons">
          {/* <FontAwesomeIcon
            className="h-6 w-6 mr-2 cursor-pointer dark:stroke-white"
            icon={faInfinity}
            inverse={isDarkMode}
            onClick={() => {
              window.open(getURLBase() + '/infinite', '_self')
            }}
          /> */}
          <FontAwesomeIcon
            icon={faEnvelopeOpen}
            className="h-6 w-6 mr-3 cursor-pointer dark:stroke-white"
            onClick={() => {
              window.open('https://forms.gle/TWNPkzyToyigTzi1A', '')
            }}
          />
          <ChartBarIcon
            className="h-6 w-6 mr-3 cursor-pointer dark:stroke-white"
            onClick={() => setIsStatsModalOpen(true)}
          />
          <CogIcon
            className="h-6 w-6 mr-3 cursor-pointer dark:stroke-white"
            onClick={() => setIsSettingsModalOpen(true)}
          />
        </div>
      </div>
      <hr></hr>
    </div>
  )
}
