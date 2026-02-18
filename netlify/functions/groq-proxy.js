exports.handler = async (event) => {
    // Solo aceptar POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { userPrompt, systemPrompt, model = 'llama-3.1-8b-instant' } = JSON.parse(event.body);
        const groqKey = process.env.GROQ_API_KEY;  // Lee la env var segura de Netlify

        if (!groqKey) {
            return { statusCode: 500, body: JSON.stringify({ error: 'GROQ_API_KEY no configurada en Netlify' }) };
        }

        if (!userPrompt) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Falta userPrompt en el body' }) };
        }

        // Construir mensajes: system es opcional
        const messages = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: userPrompt });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqKey}`
            },
            body: JSON.stringify({
                model,
                max_tokens: 2000,
                temperature: 0.1,
                messages
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: data?.error?.message || `Groq error ${response.status}` })
            };
        }

        // Devolver la respuesta de Groq tal cual al browser
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
