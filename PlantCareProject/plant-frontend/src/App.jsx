import { useState } from 'react'
import Dashboard from './Dashboard'
import './Dashboard.css'
import './App.css'

function App() {
  return (
    <>
      <div className="app-container">
        <header className="app-header">
          <h1>Plant Care System</h1>
        </header>
        <main>
          <Dashboard />
        </main>
        <footer className="app-footer">
          <p>Plant Care Monitoring System © 2025</p>
        </footer>
      </div>
    </>
  )
}

export default App