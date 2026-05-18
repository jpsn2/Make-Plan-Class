import { useState, useEffect } from 'react'
import client from '../api/client'

const ITEMS_POR_PAGINA = 5

function PlansPage() {
    const [plans, setPlans] = useState([])
    const [filter, setfilter] = useState('')
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        client.get('/plans')
            .then(res => {
                setPlans(res.data.plans)
                setLoading(false)
        })
        .catch(() => {
            setErro('Erro ao carregar planos.')
            setLoading(false)
        })
    }, [])

    const filteredPlans = plans.filter(p =>
        p.title.toLowerCase().includes(filter.toLowerCase())
    )

    const totalPages = Math.ceil(filteredPlans.length / ITEMS_POR_PAGINA)

    const plansOfPage = filteredPlans.slice(
        (page - 1) * ITEMS_POR_PAGINA,
        page * ITEMS_POR_PAGINA
    )

    if (loading) return <p>Carregando...</p>
    if (erro) return <p>{erro}</p>

    return (
        <div>
            <h2>Planos</h2>

            <input
                type="text"
                placeholder="Filtrar por título"
                value={filter}
                onChange={e => {
                    setfilter(e.target.value)
                    setPage(1)
                }}
            />

            {plansOfPage.length === 0 && <p>Nenhum plano encontrado!</p>}

            <ul>
                {plansOfPage.map(plan => (
                    <li key={plan.plan_id}>
                        <strong>{plan.title}</strong> - {plan.discipline}
                    </li>
                ))}
            </ul>

            <div>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                    Anterior
                </button>
                <span> Página {page} de {totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                    Próxima
                </button>
            </div>
        </div>
    )
}

export default PlansPage