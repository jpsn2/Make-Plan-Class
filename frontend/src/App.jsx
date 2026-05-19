import { useState } from 'react'
import './App.css'
import PlanForm from './pages/PlanForm'
import PlansPage from './pages/PlansPage'

function App() {
  const [plansReloadKey, setPlansReloadKey] = useState(0)

  function handlePlanCreated() {
    setPlansReloadKey(key => key + 1)
  }

  return (
    <>
      <header className="app-header">
        <h1>Make Plan Class</h1>
        <p>Gerencie seus planos de aula com inteligência</p>
      </header>
      <main className="app-main">
        <PlanForm onPlanCreated={handlePlanCreated} />
        <PlansPage reloadKey={plansReloadKey} />
      </main>
    </>
  )
}

export default App
