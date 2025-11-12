import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import LostItemForm from './components/LostItemForm'
import FoundItemForm from './components/FoundItemForm'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lost-item" element={<LostItemForm />} />
        <Route path="/found-item" element={<FoundItemForm />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App

