import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './Components/Home/Home.jsx'
import AuthProvider from './Components/AuthProvider/AuthProvider.jsx'
import HomeCont from './Components/HomeCont/HomeCont.jsx'
import Login from './Components/Login/Login.jsx'

const router = createBrowserRouter(
  [
    {
      path : '/',
      element : <Home></Home>,
      children : [
        {
          path : '/',
          element : <HomeCont></HomeCont>
        },
        {
          path : '/login',
          element : <Login></Login>
          
        }
      ]
    }
  ]
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <RouterProvider router={router}> </RouterProvider>
    </AuthProvider>
  </StrictMode>,
)
