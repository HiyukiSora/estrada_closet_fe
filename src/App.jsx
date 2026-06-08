import React from 'react'
import { Router } from './router'
import { ToastContainer, Zoom } from 'react-toastify';

import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  return (
    <React.Fragment>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop
        limit={1}
        transition={Zoom}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover={false}
        theme="light"
      />
      <Router />
    </React.Fragment>
  )
}
