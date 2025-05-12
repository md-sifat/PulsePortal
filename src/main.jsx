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
import ProfileC from './Components/CustomerDashboard/dashboardComponents/ProfileC.jsx'
import Analytics from './Components/CustomerDashboard/dashboardComponents/Analytics.jsx'
import RegisteredCamp from './Components/CustomerDashboard/dashboardComponents/RegisteredCamp.jsx'
import PaymentHistory from './Components/CustomerDashboard/dashboardComponents/PaymentHistory.jsx'
import CustomerDashboard from './Components/CustomerDashboard/CustomerDashboard.jsx'

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
        },
        {
          path: '/customer-dashboard',
          element: <Private> <CustomerDashboard> </CustomerDashboard> </Private>,
          children: [
            {
              path: '/customer-dashboard/profile-c',
              element: <Private> <ProfileC> </ProfileC> </Private>
            },
            {
              path: '/customer-dashboard/analytics',
              element: <Private> <Analytics> </Analytics> </Private>
            },
            {
              path: '/customer-dashboard/regcamp',
              element: <Private> <RegisteredCamp> </RegisteredCamp> </Private>
            },
            {
              path: '/customer-dashboard/histrory',
              element: <Private> <PaymentHistory> </PaymentHistory> </Private>
            },
          ]
        },

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
