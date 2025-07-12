const DAILY_LIMIT = 15;

const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('userInput');
const limitWarning = document.getElementById('limit-warning');

function getTodayKey() {
  const today = new Date().toISOString().split('T')[0];
  return `questions_${today}`;
}

function getQuestionCount() {
  return parseInt(localStorage.getItem(getTodayKey()) || '0');
}

function incrementQuestionCount() {
  const count = getQuestionCount() + 1;
  localStorage.setItem(getTodayKey(), count);
}

function appendMessage(text, sender) {
  const div = document.createElement('div');
  div.classList.add('message', sender);
  div.innerText = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendQuestion(question) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer TU_API_KEY_AQUI' // <--- Cambia aquí con tu API key real
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Eres un profesor experto que ayuda a estudiantes a resolver tareas paso a paso con tono claro y amable.`
        },
        {
          role: 'user',
          content: question
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error('Error en la respuesta de la IA');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

chatForm.addEventListener('submit', async e => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;

  if (getQuestionCount() >= DAILY_LIMIT) {
    limitWarning.classList.remove('hidden');
    return;
  } else {
    limitWarning.classList.add('hidden');
  }

  appendMessage(question, 'user');
  userInput.value = '';
  appendMessage("Pensando...", 'bot');

  // Eliminar mensaje "Pensando..." previo
  const messages = chatWindow.querySelectorAll('.message');
  const lastBotMsg = Array.from(messages).findLast(m => m.classList.contains('bot'));
  if (lastBotMsg && lastBotMsg.innerText === "Pensando...") {
    lastBotMsg.remove();
  }

  try {
    const answer = await sendQuestion(question);
    appendMessage(answer, 'bot');
    incrementQuestionCount();
  } catch (err) {
    appendMessage("Error: No se pudo obtener respuesta. Intenta más tarde.", 'bot');
  }
});
