exports.handler = async (event) => {
    try {
        const { prompt, model = 'llama-3.1-8b-instant' } = JSON.parse(event.body);  // Recibe prompt y modelo opcional
        const groqKey = process.env.GROQ_API_KEY;  // Aquí SÍ lee la env var segura

        if (!groqKey) throw new Error('Missing GROQ_API_KEY');

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
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) throw new Error(`Groq error: ${response.status}`);

        const data = await response.json();
        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};