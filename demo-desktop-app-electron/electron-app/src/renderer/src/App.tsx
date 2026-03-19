import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'
import AppShell from './components/AppShell'

export default function App() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:templateId" element={<ProjectPage />} />
        </Routes>
      </AppShell>
    </HashRouter>
  )
}
