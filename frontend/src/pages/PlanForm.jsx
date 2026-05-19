import { useState } from 'react'
import client from '../api/client'

function PlanForm({ onPlanCreated }) {
    const [form, setForm] = useState({
        title: '',
        objective: '',
        resume: '',
        pre_data: '',
        discipline: '',
        content: '',
        resources: '',
    })

    const [errors, setErrors] = useState({})
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState(null)

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    function handleAi() {
        if (!selectedPlan) {
            setErrors({ geral: 'Crie um plano antes de gerar recomendacoes.' })
            return
        }

        setErrors({})
        setLoading(true)

        client.get('/recommendations', {
            data: { title: selectedPlan.title },
            params: { title: selectedPlan.title },
        })
            .then(res => {
                const updatedPlan = res.data.plan

                setSelectedPlan(updatedPlan)
                setForm(prev => ({ ...prev, content: updatedPlan.content }))
                setLoading(false)
            })
            .catch(() => {
                setErrors({ geral: 'Erro ao gerar recomendacoes.' })
                setLoading(false)
            })
    }

    function validate() {
        const newErrors = {}

        if (!form.title) newErrors.title = 'Titulo e obrigatorio'
        if (!form.resume) newErrors.resume = 'Resumo e obrigatorio'
        if (!form.discipline) newErrors.discipline = 'Disciplina e obrigatoria'

        return newErrors
    }

    function handleSubmit(e) {
        e.preventDefault()

        const newErrors = validate()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setErrors({})
        setLoading(true)
        setSuccess(false)

        client.post('/create_plan', form)
            .then(res => {
                setSelectedPlan(res.data.plan)
                onPlanCreated?.(res.data.plan)
                setSuccess(true)
                setLoading(false)
            })
            .catch(() => {
                setErrors({ geral: 'Erro ao criar plano. Tente novamente.' })
                setLoading(false)
            })
    }

    return (
        <div className="card">
            <h2>Novo Plano de Aula</h2>

            {success && <p>Plano criado com sucesso!</p>}
            {errors.geral && <p>{errors.geral}</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Titulo</label>
                    <input name="title" value={form.title} onChange={handleChange} />
                    {errors.title && <span>{errors.title}</span>}
                </div>

                <div className="form-group">
                    <label>Disciplina</label>
                    <input name="discipline" value={form.discipline} onChange={handleChange} />
                    {errors.discipline && <span>{errors.discipline}</span>}
                </div>

                <div className="form-group">
                    <label>Objetivo</label>
                    <input name="objective" value={form.objective} onChange={handleChange} />
                    {errors.objective && <span>{errors.objective}</span>}
                </div>

                <div className="form-group">
                    <label>Resumo</label>
                    <input name="resume" value={form.resume} onChange={handleChange} />
                    {errors.resume && <span>{errors.resume}</span>}
                </div>

                <div className="form-group">
                    <label>Data prevista</label>
                    <input name="pre_data" value={form.pre_data} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Conteudo</label>
                    <textarea name="content" value={form.content} onChange={handleChange} rows={10} />
                </div>

                <div className="form-group">
                    <label>Recursos</label>
                    <input name="resources" value={form.resources} onChange={handleChange} />
                </div>

                <button className="btn btn-submit" type="submit" disabled={loading}>
                    {loading ? 'Criando...' : 'Criar Plano'}
                </button>

                {selectedPlan && (
                    <button className="btn btn-ai" type="button" onClick={handleAi} disabled={loading}>
                        {loading ? 'Gerando...' : 'Gerar recomendacao'}
                    </button>
                )}

            </form>
        </div>
    )
}

export default PlanForm
