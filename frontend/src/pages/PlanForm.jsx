import { useState} from 'react'
import client from '../api/client'

function PlanForm() {
    const [form, setForm] = useState({
        user_id: '',
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

    function handleChange(e){
        setForm({ ...form, [e.target.name]: e.target.value})
    }

    function handleAi(){
        setLoading(true)

        client.post(`/users/${form.user_id}/plans/${form.title}/chat`, {
            message: {
                discipline: form.discipline,
                resume: form.resume,
                title: form.title,
                user_id: form.user_id,
            }
        })
        .then(res => {
            setForm(prev => ({ ...prev, content: res.data.response }))
            setLoading(false)
        })
        .catch(() => {
            setErrors({ geral:'Erro ao gerar recomendações.'})
            setLoading(false)
        })
    }

    function validate() {
        const newErrors = {}

        if (!form.user_id) newErrors.user_id = 'Usuário é obrigatório'
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

        client.post('/create_plan', form)
            .then(() => {
                setSuccess(true)
                setLoading(false)
                setForm({
                    user_id: '',
                    title: '',
                    objective: '',
                    resume: '',
                    pre_data: '',
                    discipline: '',
                    content: '',
                    resources: '',
                })
            })
            .catch(() => {
                setErrors({ geral: 'Erro ao criar plano. Tente novamente.' })
                setLoading(false)
            })
    }

    return (
        <div>
            <h2>Novo Plano de Aula</h2>

            {success && <p>Plano criado com sucesso!</p>}
            {errors.geral && <p>{errors.geral}</p>}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>User ID</label>
                    <input name="user_id" value={form.user_id} onChange={handleChange} />
                    {errors.user_id && <span>{errors.user_id}</span>}
                </div>

                <div>
                    <label>Título</label>
                    <input name="title" value={form.title} onChange={handleChange} />
                    {errors.title && <span>{errors.title}</span>}
                </div>

                <div>
                    <label>Disciplina</label>
                    <input name="discipline" value={form.discipline} onChange={handleChange} />
                    {errors.discipline && <span>{errors.discipline}</span>}
                </div>

                <div>
                    <label>Objetivo</label>
                    <input name="objective" value={form.objective} onChange={handleChange} />
                    {errors.objective && <span>{errors.objective}</span>}
                </div>

                <div>
                    <label>Resumo</label>
                    <input name="resume" value={form.resume} onChange={handleChange} />
                    {errors.resume && <span>{errors.resume}</span>}
                </div>

                <button type="button" onClick={handleAi} disabled={loading}>
                    {loading ? 'Gerando...' : 'Gerar Recomendações com IA'}
                </button>

                <div>
                    <label>Data prevista</label>
                    <input name="pre_data" value={form.pre_data} onChange={handleChange} />
                </div>

                <div>
                    <label>Conteúdo</label>
                    <textarea name="content" value={form.content}onChange={handleChange} rows={10}/>
                </div>

                <div>
                    <label>Recursos</label>
                    <input name="resources" value={form.resources} onChange={handleChange} />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Criando...' : 'Criar Plano'}
                </button>

            </form>
        </div>
    )

}

export default PlanForm