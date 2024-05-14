// Função para obter o período do dia com base no horário atual
function getPeriodoDia() {
  const horaAtual = new Date().getHours();
  // Verifica o período do dia com base na hora atual
  if (horaAtual >= 5 && horaAtual < 12) {
    return 'manhã'; // Retorna 'manhã' se estiver entre 5h e 12h
  } else if (horaAtual >= 12 && horaAtual < 18) {
    return 'tarde'; // Retorna 'tarde' se estiver entre 12h e 18h
  } else {
    return 'noite'; // Retorna 'noite' caso contrário
  }
}

// Função para obter a localização do usuário com base no endereço IP usando a API do Geoapify
function getLocalizacaoUsuario() {
  return new Promise((resolve, reject) => {
    fetch('https://api.geoapify.com/v1/ipinfo?apiKey=afaaa54c319a4dba81f57014b11ffb57')
      .then(response => response.json())
      .then(data => {
        // Verifica se os dados de localização foram retornados corretamente
        if (data && data.city && data.city.name && data.country && data.country.name_native) {
          const cidade = data.city.name;
          const estado = data.state.name;
          const pais = data.country.name_native;
          const latitude = data.location.latitude;
          const longitude = data.location.longitude;

          // Obter detalhes do local do usuário
          return fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            .then(response => response.json())
            .then(localData => {
              // Extrair informações relevantes do endereço detalhado
              const numeroRua = localData.address.house_number;
              const rua = localData.address.road;
              const bairro = localData.address.suburb;
              const type = localData.type;

              const detalhes = `${numeroRua}, ${rua}, ${bairro}, ${type}`;
              resolve({ cidade, estado, pais, detalhes, type });
            })
            .catch(error => {
              reject('Erro ao obter detalhes do local:', error);
            });
        } else {
          reject('Dados de localização incompletos ou inválidos.');
        }
      })
      .catch(error => {
        console.error('Erro ao obter localização:', error);
        reject(error);
      });
  });
}

// Função para fazer a predição com base no contexto de tempo e geolocalização
function fazerPredicao() {
  const periodoDia = getPeriodoDia();

  getLocalizacaoUsuario()
    .then(localizacao => {
      // Saída da predição com base no contexto
      const predicao = `Usuário está numa ${localizacao.type} na cidade de ${localizacao.cidade}, ${localizacao.estado}, ${localizacao.pais}; e no local ${localizacao.detalhes} durante a ${periodoDia}.`;

      // Atualizar o conteúdo do elemento HTML com a predição
      const predicaoTextoElement = document.getElementById('predicao-texto');
      predicaoTextoElement.textContent = predicao;

      // Limpar o conteúdo anterior das ações comuns
      const acoesComunsElement = document.getElementById('acoes-comuns');
      acoesComunsElement.innerHTML = '';


      if (periodoDia === 'manhã') {

        // Adicionar mensagem sobre ações comuns durante a manhã
        const mensagem = document.createElement('p');
        mensagem.textContent = 'Ações comuns durante a manhã: Café da manhã, preparativos para o dia.';
        acoesComunsElement.appendChild(mensagem);

      } else if (periodoDia === 'tarde') {

        // Adicionar mensagem sobre ações comuns durante a tarde
        const mensagem = document.createElement('p');
        mensagem.textContent = 'Ações comuns durante a tarde: Almoço, trabalho ou estudos.';
        acoesComunsElement.appendChild(mensagem);
        
      } else {

        // Adicionar mensagem sobre ações comuns durante a noite
        const mensagem = document.createElement('p');
        mensagem.textContent = 'Ações comuns durante a noite: Jantar, relaxamento, sono.';
        acoesComunsElement.appendChild(mensagem);
      }
    });
}


// Função para atualizar o texto da predição no HTML
function atualizarPredicaoTexto(texto) {
  document.getElementById('predicao-texto').value = texto;
}

  // Adicionar evento de clique ao botão para fazer a predição manualmente
  document.getElementById('btn-fazer-predicao').addEventListener('click', function(){
  fazerPredicao();
});
