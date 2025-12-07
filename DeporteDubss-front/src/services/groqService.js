const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

/**
 * Servicio para interactuar con la API de Groq
 */
class GroqService {
    constructor() {
        this.apiKey = GROQ_API_KEY;
        this.baseUrl = GROQ_BASE_URL;
    }

    /**
     * Realiza una llamada a la API de Groq para generar respuestas
     * @param {string} input - El texto de entrada/prompt
     * @param {string} model - El modelo a utilizar (default: 'llama-3.3-70b-versatile')
     * @param {object} options - Opciones adicionales (temperature, max_tokens, etc.)
     * @returns {Promise<string>} - La respuesta generada
     */
    async generateResponse(input, model = 'llama-3.3-70b-versatile', options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: input
                        }
                    ],
                    temperature: options.temperature || 0.7,
                    max_tokens: options.max_tokens || 1024,
                    top_p: options.top_p || 1,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Error en la API de Groq: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error al generar respuesta con Groq:', error);
            throw error;
        }
    }

    /**
     * Realiza una llamada a la API de Groq con streaming (para respuestas en tiempo real)
     * @param {string} input - El texto de entrada/prompt
     * @param {string} model - El modelo a utilizar
     * @param {Function} onChunk - Callback que se ejecuta por cada chunk recibido
     * @param {object} options - Opciones adicionales
     * @returns {Promise<void>}
     */
    async generateStreamResponse(input, model = 'llama-3.3-70b-versatile', onChunk, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: 'user',
                            content: input
                        }
                    ],
                    temperature: options.temperature || 0.7,
                    max_tokens: options.max_tokens || 1024,
                    top_p: options.top_p || 1,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error(`Error en la API de Groq: ${response.status} ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.substring(6);
                        if (jsonStr === '[DONE]') continue;

                        try {
                            const json = JSON.parse(jsonStr);
                            const content = json.choices[0]?.delta?.content;
                            if (content) {
                                onChunk(content);
                            }
                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error al generar respuesta con streaming:', error);
            throw error;
        }
    }

    /**
     * Chat con historial de conversación
     * @param {Array} messages - Array de mensajes [{role: 'user'|'assistant', content: string}]
     * @param {string} model - El modelo a utilizar
     * @param {object} options - Opciones adicionales
     * @returns {Promise<string>} - La respuesta generada
     */
    async chat(messages, model = 'llama-3.3-70b-versatile', options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.max_tokens || 1024,
                    top_p: options.top_p || 1,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Error en la API de Groq: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error en chat con Groq:', error);
            throw error;
        }
    }

    /**
     * Obtiene los modelos disponibles
     * @returns {Array} - Lista de modelos disponibles
     */
    getAvailableModels() {
        return [
            'llama-3.3-70b-versatile',
            'llama-3.1-70b-versatile',
            'llama-3.1-8b-instant',
            'mixtral-8x7b-32768',
            'gemma-7b-it'
        ];
    }
}

// Exportar instancia única del servicio
const groqService = new GroqService();
export default groqService;
