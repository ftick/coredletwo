// import { DEBUG_ENABLED } from '../constants/settings'
const DEBUG_ENABLED = true

export function debuglog(...data: any) {
  if (DEBUG_ENABLED) {
    console.log(...data)
  }
}
