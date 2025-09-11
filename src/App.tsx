/*eslint-disable */

import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

import AppRoutes from "./components/routes/Routes";
import 'react-toastify/dist/ReactToastify.css';


function App() {

  return (
    <BrowserRouter>
      <AppRoutes />
< ToastContainer
position = "top-right"
autoClose = {
    5000
}
hideProgressBar = {
    false
}
newestOnTop = {
    false
}
closeOnClick
rtl = {
    false
}
pauseOnFocusLoss
draggable
pauseOnHover
theme = "light"
/>

    </BrowserRouter>
  );
}

export default App;
