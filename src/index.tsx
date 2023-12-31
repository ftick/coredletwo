import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
// import AppInf from './AppInf'
// import { getURLFirst } from './lib/words'
// import { debuglog } from './lib/log'
import reportWebVitals from './reportWebVitals'
import { AlertProvider } from './context/AlertContext'
import App from './App'
import { Analytics } from '@vercel/analytics/react'

// const IS_INFINITE = getURLFirst().includes('infinite')
// if (IS_INFINITE) {
//   ReactDOM.render(
//     <React.StrictMode>
//       <AlertProvider>
//         <AppInf />
//         <Analytics />
//       </AlertProvider>
//     </React.StrictMode>,
//     document.getElementById('root')
//   )
// } else {
ReactDOM.render(
  <React.StrictMode>
    <AlertProvider>
      <App />
      <Analytics />
    </AlertProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
// }

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
