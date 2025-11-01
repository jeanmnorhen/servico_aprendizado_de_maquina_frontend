'use client';

import { useState } from 'react';

export default function Home() {
  const [textPrompt, setTextPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [textResponse, setTextResponse] = useState('...');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState('');

  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  // Configurações da API (usando variáveis de ambiente).
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'my-super-secret-key'; // Substitua pela sua chave real

  const handleTextSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!textPrompt.trim()) return;

    setTextLoading(true);
    setTextError('');
    setTextResponse('Gerando resposta...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
        body: JSON.stringify({
          prompt: textPrompt,
          model: selectedModel,
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ocorreu um erro desconhecido.');
      }

      setTextResponse(data.result);
      setSessionId(data.session_id);
    } catch (error: any) {
      console.error('Erro na geração de texto:', error);
      setTextError(`Erro: ${error.message}`);
      setTextResponse('...');
    } finally {
      setTextLoading(false);
      setTextPrompt('');
    }
  };

  const handleImageSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!imagePrompt.trim()) return;

    setImageLoading(true);
    setImageError('');
    setImageSrc('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ocorreu um erro desconhecido.');
      }

      // A API retorna um caminho como /generated_images/image.png
      // Usamos a URL base para construir o caminho completo
      setImageSrc(`${API_BASE_URL}${data.image_path}`);
    } catch (error: any) {
      console.error('Erro na geração de imagem:', error);
      setImageError(`Erro: ${error.message}`);
    } finally {
      setImageLoading(false);
      setImagePrompt('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">AI Service Frontend</h1>

      {/* Seção de Geração de Texto */}
      <section className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Geração de Texto</h2>
        <form onSubmit={handleTextSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="model-select" className="block text-gray-700 text-sm font-bold mb-2">
              Escolha o Modelo:
            </label>
            <select
              id="model-select"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={textLoading}
            >
              <option value="gemini">Gemini (gemini-1.5-flash-latest)</option>
              <option value="codellama">Ollama: Code Llama</option>
              <option value="gemma:2b">Ollama: Gemma</option>
            </select>
          </div>
          <div>
            <label htmlFor="text-prompt" className="block text-gray-700 text-sm font-bold mb-2">
              Prompt para Texto:
            </label>
            <input
              type="text"
              id="text-prompt"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Digite seu prompt aqui..."
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              disabled={textLoading}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            disabled={textLoading}
          >
            {textLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Resposta da IA:</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{textResponse}</p>
          {sessionId && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>ID da Sessão:</strong> {sessionId}
            </p>
          )}
          {textError && <p className="text-red-500 text-sm mt-2">{textError}</p>}
        </div>
      </section>

      {/* Seção de Geração de Imagem */}
      <section className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Geração de Imagem</h2>
        <form onSubmit={handleImageSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="image-prompt" className="block text-gray-700 text-sm font-bold mb-2">
              Prompt para Imagem:
            </label>
            <input
              type="text"
              id="image-prompt"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Descreva a imagem que deseja gerar..."
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              disabled={imageLoading}
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            disabled={imageLoading}
          >
            {imageLoading ? 'Gerando...' : 'Gerar Imagem'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Imagem Gerada:</h3>
          {imageLoading && <p>Gerando imagem...</p>}
          {imageSrc && !imageLoading && (
            <img src={imageSrc} alt="Imagem Gerada" className="max-w-full h-auto rounded-md mt-4" />
          )}
          {imageError && <p className="text-red-500 text-sm mt-2">{imageError}</p>}
        </div>
      </section>
    </div>
  );
}

