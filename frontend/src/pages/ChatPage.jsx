import { useState } from 'react'
import client from '../api/client'

function ChatPage({ plan}) {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState(null)

    function handleSend() {
        if (!input.trim()) return

        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)
        setErro(null)

        client.get('/recommendations', {
            data: { title: plan.title },
            params: { title: plan.title },
        })
            .then(res => {
                const aiMessage = { role: 'assistant', content: res.data.response}
                setMessages(prev => [...prev, aiMessage])
                setLoading(false)
            })
            .catch(() => {
                setErro('Erro ao conectar com aIA. Tente novamente.')
                setLoading(false)
            })
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleSend()
    }

    return (
        <div>
            <h2>Chat - {plan.title}</h2>

            <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'auto', padding: '8px'}}>
                {messages.length === 0 && <p>Nenhuma mensagem ainda</p>}

                {messages.map((msg, index) => (
                    <div key={index} style={{ textAlign: msg.role === 'user' ? 'right' : 'left'}}>
                        <strong>{msg.role === 'user' ? 'Você' : 'IA'}</strong> {msg.content}
                    </div>
                ))}

                {loading && <p>Pensando...</p>}
                {erro && <p style={{ color: 'red'}}>{erro}</p>}                     
            </div>

            <div>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    disabled={loading}
                />
                <button onClick={handleSend} disabled={loading}>
                    {loading ? 'Aguarde...' : 'Enviar'}
                </button>
            </div>
        </div>
    )
}

export default ChatPage
