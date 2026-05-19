import { useState } from 'react'
import './App.css'
import PlanForm from './pages/PlanForm';
import PlansPage from './pages/PlansPage';

function App() {
  const [plansReloadKey, setPlansReloadKey] = useState(0)

  function handlePlanCreated() {
    setPlansReloadKey(key => key + 1)
  }

  return (
    <div>
      <h1>Make Plan Class</h1>
      <PlanForm onPlanCreated={handlePlanCreated} />
      <PlansPage reloadKey={plansReloadKey} />
    </div>
  )
}

export default App
