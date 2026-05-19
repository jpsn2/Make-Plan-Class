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
    const [aiLoading, setAiLoading] = useState(false)
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

    function handleSelectPlan(plan) {
        setErro(null)
        setSuccess(null)
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
                setPlans(prev => prev.map(p =>
                    p.plan_id === updatedPlan.plan_id ? updatedPlan : p
                ))
                setSuccess('Plano atualizado com sucesso!')
                setSaving(false)
            })
            .catch(() => {
                setErro('Erro ao atualizar plano.')
                setSaving(false)
            })
    }

    function handleDelete() {
        if (!selectedPlan) return
        if (!window.confirm(`Deletar o plano "${selectedPlan.title}"?`)) return

        setSaving(true)
        setErro(null)
        setSuccess(null)

        client.delete(`/plans/${encodeURIComponent(selectedPlan.title)}`)
            .then(() => {
                setPlans(prev => prev.filter(p => p.plan_id !== selectedPlan.plan_id))
                setSelectedPlan(null)
                setForm(EMPTY_FORM)
                setSuccess('Plano deletado com sucesso!')
                setSaving(false)
            })
            .catch(() => {
                setErro('Erro ao deletar plano.')
                setSaving(false)
            })
    }

    function handleAi() {
        if (!selectedPlan) return
        setAiLoading(true)
        setErro(null)

        client.get('/recommendations', {
            params: { title: selectedPlan.title }
        })
            .then(res => {
                setForm(prev => ({ ...prev, content: res.data.response }))
                setAiLoading(false)
            })
            .catch(() => {
                setErro('Erro ao gerar recomendações.')
                setAiLoading(false)
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

    if (loading) return (
        <div className="card">
            <p className="empty-state">Carregando planos...</p>
        </div>
    )

    return (
        <div className="card">
            <h2>📚 Planos de Aula</h2>

            {erro && <p className="alert alert-error">{erro}</p>}
            {success && <p className="alert alert-success">{success}</p>}

            <input
                className="plans-filter"
                type="text"
                placeholder="🔍 Filtrar por título..."
                value={filter}
                onChange={e => {
                    setFilter(e.target.value)
                    setPage(1)
                }}
            />

            {plansOfPage.length === 0
                ? <p className="empty-state">Nenhum plano encontrado.</p>
                : (
                    <ul className="plans-list">
                        {plansOfPage.map(plan => (
                            <li
                                className={`plan-item ${selectedPlan?.plan_id === plan.plan_id ? 'plan-item--active' : ''}`}
                                key={plan.plan_id}
                                onClick={() => handleSelectPlan(plan)}
                            >
                                <span className="plan-item-dot" />
                                <strong>{plan.title}</strong>
                                <span>{plan.discipline}</span>
                            </li>
                        ))}
                    </ul>
                )
            }

            <div className="pagination">
                <button className="btn-page" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
                    ← Anterior
                </button>
                <span>Página {currentPage} de {totalPages}</span>
                <button className="btn-page" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>
                    Próxima →
                </button>
            </div>

            {selectedPlan && (
                <div className="plan-detail">
                    <h3>✏️ Editando: {selectedPlan.title}</h3>

                    <div className="form-group">
                        <label>Título</label>
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
                        <label>Resumo / Ementa</label>
                        <textarea name="resume" value={form.resume} onChange={handleChange} rows={3} />
                    </div>

                    <div className="form-group">
                        <label>Data Prevista</label>
                        <input name="pre_data" type="date" value={form.pre_data} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Conteúdo</label>
                        <textarea name="content" value={form.content} onChange={handleChange} rows={10} />
                    </div>

                    <div className="form-group">
                        <label>Recursos de Apoio</label>
                        <input name="resources" value={form.resources} onChange={handleChange} />
                    </div>

                    <button className="btn btn-ai" type="button" onClick={handleAi} disabled={aiLoading}>
                        {aiLoading ? '🤖 Gerando recomendações...' : '✨ Gerar Nova Recomendação com IA'}
                    </button>

                    <div className="plan-actions">
                        <button className="btn btn-primary" type="button" onClick={handleUpdate} disabled={saving}>
                            {saving ? 'Salvando...' : '💾 Atualizar'}
                        </button>
                        <button className="btn btn-danger" type="button" onClick={handleDelete} disabled={saving}>
                            {saving ? 'Aguarde...' : '🗑️ Deletar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PlansPage
