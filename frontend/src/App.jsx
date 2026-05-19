import { useState } from 'react'
import './App.css'
import PlansPage from './pages/PlansPage';
import PlanForm from './pages/PlanForm';
import ChatPage from './pages/ChatPage';

function App() {
  //const [selectedPlan, setSelectedPlan] = useState(null)

  return (
    <div>
      <h1>Make Plan Class</h1>
      <PlanForm />
      {/* <PlansPage/> */}
    </div>
  )
}

export default App