<script>
  const DAILY_LIMIT = 15;

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

  async function sendQuestion() {
    const responseDiv = document.getElementById('response');
    const question = document.getElementById('userInput').value;

    if (!question.trim()) {
      responseDiv.innerHTML = "<span style='color:red;'>Por favor, escribe una pregunta.</span>";
      return;
    }

    if (getQuestionCount() >= DAILY_LIMIT) {
      responseDiv.innerHTML = `
        <div style="color:red;">
          Has alcanzado el límite de 15 preguntas gratis hoy. 
          <br><br>
          <strong><a href="https://tupagina.com/premium" target="_blank">Hazte Premium aquí</a></strong>
        </div>`;
      return;
    }

    responseDiv.innerHTML = "Pensando...";

    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });

      const data = await res.json();

      if (!res.ok) {
        responseDiv.innerHTML = `<span style="color:red;">Error: ${data.error || 'Algo salió mal'}</span>`;
        return;
      }

      responseDiv.innerHTML = `<strong>Respuesta:</strong><br>${data.answer}`;
      incrementQuestionCount();
    } catch (error) {
      responseDiv.innerHTML = `<span style="color:red;">Error al conectar con la IA.</span>`;
      console.error(error);
    }
  }
</script>

