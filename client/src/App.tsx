// import { useState } from 'react'
import { Routes, Route, Navigate } from "react-router";
// import { HomePage } from './pages/home/HomePage'
import { Login } from './pages/RegisterPages/Login'
import { Register } from "./pages/RegisterPages/Register";
import { Dashboard } from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import { PageNotFound } from "./pages/PageNotFound/PageNotFound";
import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path='/' element={<Navigate to={"/login"}/>} />

      <Route path='/login' element={<GuestRoute><Login /></GuestRoute>} />

      <Route path='/register' element={<GuestRoute><Register /></GuestRoute>} />

      <Route path='/dashboard' element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<PageNotFound/>} />
      
    </Routes>
  )
}

export default App
