import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Home from './Components/Home/Home.jsx'
import AuthProvider from './Components/AuthProvider/AuthProvider.jsx'
import HomeCont from './Components/HomeCont/HomeCont.jsx'
import Login from './Components/Login/Login.jsx'
import Register from './Components/Register/Register.jsx'
import Private from './Components/Private/Private.jsx'
import AdminDashboard from './Components/AdminDashboard/AdminDashboard.jsx'
import Profile_a from './Components/AdminDashboard/dashboardComponents/ProfileA.jsx'
import AddCamp from './Components/AdminDashboard/dashboardComponents/AddCamp.jsx'
import ProfileA from './Components/AdminDashboard/dashboardComponents/ProfileA.jsx'
import ManageCamp from './Components/AdminDashboard/dashboardComponents/ManageCamp.jsx'
import ManageRcamp from './Components/AdminDashboard/dashboardComponents/ManageRcamp.jsx'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home></Home>,
      children: [
        {
          path: '/',
          element: <HomeCont></HomeCont>
        },
        {
          path: '/login',
          element: <Login></Login>

        },
        {
          path: '/register',
          element: <Register></Register>

        },
        {
          path: '/admin-dashboard',
          element: <Private> <AdminDashboard> </AdminDashboard> </Private>,
          children: [
            {
              path: '/admin-dashboard/profile-a',
              element: <Private> <ProfileA> </ProfileA> </Private>
            },
            {
              path: '/admin-dashboard/add-camp',
              element: <Private> <AddCamp> </AddCamp> </Private>
            },
            {
              path: '/admin-dashboard/manage-camp',
              element: <Private> <ManageCamp> </ManageCamp> </Private>
            },
            {
              path: '/admin-dashboard/manage-rcamp',
              element: <Private> <ManageRcamp> </ManageRcamp> </Private>
            },
          ]
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
