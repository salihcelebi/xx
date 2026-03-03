// NISAI.MD'de netleştir: Gerçek Puter/OpenAI chat endpoint sözleşmesi.

export async function sendChatCompletion({ messages, model, onChunk, signal }) {
  const requestId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `req_${Date.now()}`;

  const assistantText = `(${model || 'chat-fast'}) Yanıt: ${messages.at(-1)?.content || ''}`.trim();
  const chunks = assistantText.split(' ');

  for (const part of chunks) {
    if (signal?.aborted) {
      throw Object.assign(new Error('Stream aborted'), { code: 'CHAT_ABORTED' });
    }
    onChunk?.(`${part} `);
    await Promise.resolve();
  }

  return {
    requestId,
    assistantMessage: assistantText,
    meta: {
      usedModel: model || 'chat-fast',
      tokens: { input: messages.length * 10, output: chunks.length * 8 },
      cost: '$0.00',
    },
  };
}

export async function loadThreadHistory(threadId) {
  // NISAI.MD'de netleştir: historyService kalıcı kaynak/endpoint.
  return [
    {
      id: `${threadId}:welcome`,
      role: 'assistant',
      content: 'Geçmiş mesaj örneği.',
      ts: Date.now(),
      meta: {},
    },
  ];
}
