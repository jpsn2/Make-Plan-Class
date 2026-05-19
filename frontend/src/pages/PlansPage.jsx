import { useState, useEffect } from 'react'
import client from '../api/client'

const ITEMS_POR_PAGINA = 5
const EMPTY_FORM = {
    title: '',
    objective: '',
    resume: '',
    pre_data: '',
    discipline: '',
    content: '',
    resources: '',
}

function PlansPage({ reloadKey }) {
    const [plans, setPlans] = useState([])
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [filter, setFilter] = useState('')
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [erro, setErro] = useState(null)
    const [success, setSuccess] = useState(null)

    useEffect(() => {
        loadPlans()
    }, [reloadKey])

    function loadPlans() {
        setLoading(true)
        setErro(null)

        client.get('/plans')
            .then(res => {
                setPlans(res.data.plans)
                setLoading(false)
            })
            .catch(() => {
                setErro('Erro ao carregar planos.')
                setLoading(false)
            })
    }

    function handleSelectPlan(planId) {
        setErro(null)
        setSuccess(null)

        client.get(`/plans/${planId}`)
            .then(res => {
                const plan = res.data.plan
                setSelectedPlan(plan)
                setForm({
                    title: plan.title || '',
                    objective: plan.objective || '',
                    resume: plan.resume || '',
                    pre_data: plan.pre_data || '',
                    discipline: plan.discipline || '',
                    content: plan.content || '',
                    resources: plan.resources || '',
                })
            })
            .catch(() => {
                setErro('Erro ao carregar detalhes do plano.')
            })
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    function handleUpdate() {
        if (!selectedPlan) return

        setSaving(true)
        setErro(null)
        setSuccess(null)

        client.put(`/plans/${selectedPlan.plan_id}`, form)
            .then(res => {
                const updatedPlan = res.data.plan
                setSelectedPlan(updatedPlan)
                setPlans(prev => prev.map(plan => (
                    plan.plan_id === updatedPlan.plan_id ? updatedPlan : plan
                )))
                setSuccess('Plano atualizado com sucesso.')
                setSaving(false)
            })
            .catch(() => {
                setErro('Erro ao atualizar plano.')
                setSaving(false)
            })
    }

    function handleDelete() {
        if (!selectedPlan) return

        const shouldDelete = window.confirm(`Deletar o plano "${selectedPlan.title}"?`)
        if (!shouldDelete) return

        setSaving(true)
        setErro(null)
        setSuccess(null)

        client.delete(`/plans/${encodeURIComponent(selectedPlan.title)}`)
            .then(() => {
                setPlans(prev => prev.filter(plan => plan.plan_id !== selectedPlan.plan_id))
                setSelectedPlan(null)
                setForm(EMPTY_FORM)
                setSuccess('Plano deletado com sucesso.')
                setSaving(false)
            })
            .catch(() => {
                setErro('Erro ao deletar plano.')
                setSaving(false)
            })
    }

    const filteredPlans = plans.filter(plan =>
        plan.title.toLowerCase().includes(filter.toLowerCase())
    )

    const totalPages = Math.max(1, Math.ceil(filteredPlans.length / ITEMS_POR_PAGINA))
    const currentPage = Math.min(page, totalPages)

    const plansOfPage = filteredPlans.slice(
        (currentPage - 1) * ITEMS_POR_PAGINA,
        currentPage * ITEMS_POR_PAGINA
    )

    if (loading) return <p>Carregando...</p>

    return (
        <div className="card">
            <h2>Planos</h2>

            {erro && <p className="alert alert-error">{erro}</p>}
            {success && <p className="alert alert-success">{success}</p>}

            <input
                className="plans-filter"
                type="text"
                placeholder="Filtrar por titulo"
                value={filter}
                onChange={e => {
                    setFilter(e.target.value)
                    setPage(1)
                }}
            />

            {plansOfPage.length === 0 && <p className="empty-state">Nenhum plano encontrado.</p>}

            <ul className="plans-list">
                {plansOfPage.map(plan => (
                    <li
                        className="plan-item"
                        key={plan.plan_id}
                        onClick={() => handleSelectPlan(plan.plan_id)}
                    >
                        <span className="plan-item-dot" />
                        <strong>{plan.title}</strong>
                        <span>{plan.discipline}</span>
                    </li>
                ))}
            </ul>

            <div className="pagination">
                <button
                    className="btn-page"
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Anterior
                </button>
                <span>Pagina {currentPage} de {totalPages}</span>
                <button
                    className="btn-page"
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Proxima
                </button>
            </div>

            {selectedPlan && (
                <div className="plan-detail">
                    <h3>Plano selecionado</h3>

                    <div className="form-group">
                        <label>Titulo</label>
                        <input name="title" value={form.title} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Disciplina</label>
                        <input name="discipline" value={form.discipline} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Objetivo</label>
                        <input name="objective" value={form.objective} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Resumo</label>
                        <textarea name="resume" value={form.resume} onChange={handleChange} rows={4} />
                    </div>

                    <div className="form-group">
                        <label>Data prevista</label>
                        <input name="pre_data" value={form.pre_data} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Conteudo</label>
                        <textarea name="content" value={form.content} onChange={handleChange} rows={8} />
                    </div>

                    <div className="form-group">
                        <label>Recursos</label>
                        <input name="resources" value={form.resources} onChange={handleChange} />
                    </div>

                    <div className="plan-actions">
                        <button className="btn btn-primary" type="button" onClick={handleUpdate} disabled={saving}>
                            {saving ? 'Salvando...' : 'Atualizar'}
                        </button>
                        <button className="btn btn-danger" type="button" onClick={handleDelete} disabled={saving}>
                            {saving ? 'Aguarde...' : 'Deletar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PlansPage
