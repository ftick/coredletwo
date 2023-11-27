import { startOfToday, startOfYesterday } from 'date-fns'

export const removeTime = (d: Date) => {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export const getToday = () => startOfToday()
export const getYesterday = () => startOfYesterday()
