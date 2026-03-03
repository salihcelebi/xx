import { renderMessageToolbar } from './MessageToolbar.js';

export function renderMessageBubble(message) {
  const article = document.createElement('article');
  article.className = `message-bubble role-${message.role}`;
  article.innerHTML = `<p>${message.content}</p>`;
  article.append(renderMessageToolbar());
  return article;
}
