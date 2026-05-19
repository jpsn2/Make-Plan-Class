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
    const [aiLoading, setAiLoading] = useState(false)
    const [createdPlan, setCreatedPlan] = useState(null)

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    function handleAi() {
        if (!createdPlan) {
            setErrors({ geral: 'Crie o plano primeiro para gerar recomendações.' })
            return
        }

        setErrors({})
        setAiLoading(true)

        client.get('/recommendations', {
            params: { title: createdPlan.title }
        })
            .then(res => {
                setForm(prev => ({ ...prev, content: res.data.response }))
                setAiLoading(false)
            })
            .catch(() => {
                setErrors({ geral: 'Erro ao gerar recomendações.' })
                setAiLoading(false)
            })
    }

    function validate() {
        const newErrors = {}
        if (!form.title) newErrors.title = 'Título é obrigatório'
        if (!form.resume) newErrors.resume = 'Resumo é obrigatório'
        if (!form.discipline) newErrors.discipline = 'Disciplina é obrigatória'
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
                setCreatedPlan(res.data.plan)
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
            <h2>✏️ Novo Plano de Aula</h2>

            {success && <p className="alert alert-success">Plano criado com sucesso!</p>}
            {errors.geral && <p className="alert alert-error">{errors.geral}</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Título</label>
                    <input name="title" value={form.title} onChange={handleChange} placeholder="Ex: Introdução à Álgebra Linear" />
                    {errors.title && <span className="error-msg">{errors.title}</span>}
                </div>

                <div className="form-group">
                    <label>Disciplina</label>
                    <input name="discipline" value={form.discipline} onChange={handleChange} placeholder="Ex: Matemática" />
                    {errors.discipline && <span className="error-msg">{errors.discipline}</span>}
                </div>

                <div className="form-group">
                    <label>Objetivo</label>
                    <input name="objective" value={form.objective} onChange={handleChange} placeholder="O que o aluno deve aprender?" />
                </div>

                <div className="form-group">
                    <label>Resumo / Ementa</label>
                    <input name="resume" value={form.resume} onChange={handleChange} placeholder="Descreva brevemente o conteúdo da aula" />
                    {errors.resume && <span className="error-msg">{errors.resume}</span>}
                </div>

                <div className="form-group">
                    <label>Data Prevista</label>
                    <input name="pre_data" type="date" value={form.pre_data} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Conteúdo</label>
                    <textarea name="content" value={form.content} onChange={handleChange} rows={10} placeholder="Detalhamento do conteúdo da aula..." />
                </div>

                <div className="form-group">
                    <label>Recursos de Apoio</label>
                    <input name="resources" value={form.resources} onChange={handleChange} placeholder="Ex: slides, vídeos, apostilas..." />
                </div>

                <button className="btn btn-submit" type="submit" disabled={loading}>
                    {loading ? 'Criando...' : '💾 Criar Plano'}
                </button>

                {createdPlan && (
                    <button className="btn btn-ai" type="button" onClick={handleAi} disabled={aiLoading}>
                        {aiLoading ? '🤖 Gerando recomendações...' : '✨ Gerar Recomendações com IA'}
                    </button>
                )}
            </form>
        </div>
    )
}

export default PlanForm
