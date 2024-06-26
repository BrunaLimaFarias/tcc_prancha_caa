// Lista para armazenar as figuras selecionadas
let figurasSelecionadas = [];

// Função para adicionar uma figura à lista ao clicar
function adicionarFiguraAFrase(figura) {
    figurasSelecionadas.push(figura);
    atualizarFraseFormada();
}

// Função para remover a última figura da lista
function removerUltimaFigura() {
    figurasSelecionadas.pop();
    atualizarFraseFormada();
}

// Função para limpar a frase formada
function limparFrase() {
    figurasSelecionadas = [];
    atualizarFraseFormada();
}

// Função para atualizar a exibição da lista de figuras selecionadas
function atualizarFraseFormada() {
    try {
        const fraseListaElement = document.getElementById('frase-lista');
        fraseListaElement.innerHTML = ''; // Limpa a lista antes de atualizar

        // Cria elementos para cada figura selecionada e adiciona à lista
        figurasSelecionadas.forEach(figura => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${figura.img}" alt="${figura.palavra}">
                <div class="card-body">
                    <h5 class="card-title">${figura.palavra}</h5>
                </div>`;
            fraseListaElement.appendChild(li);
        });
    } catch (error) {
        console.error('Erro ao atualizar a frase formada:', error);
    }
}

function criarBotoesDeCategoria(categorias, markovChain, wordImageMap) {
    const categorySelector = document.querySelector('.category-selector');
    categorySelector.innerHTML = ''; // Limpa os botões existentes

    categorias.forEach(categoria => {
        const button = document.createElement('button');
        button.classList.add('category-btn');
        button.dataset.category = categoria;
        button.textContent = categoria;
        button.setAttribute('aria-label', `Selecionar categoria ${categoria}`);
        categorySelector.appendChild(button);

        // Adiciona o evento de clique para chamar buscaFigura com a categoria correspondente
        button.addEventListener('click', () => {
            console.log(`Botão da categoria clicado: ${categoria}`); // Log de verificação
            buscaFigura(categoria, markovChain, wordImageMap);
        });
    });
}

// Função para buscar as figuras do banco de dados e criar os cards
async function buscaFigura(categoriaDesejada = '', markovChain, wordImageMap) {
    try {
        console.log(`Iniciando busca de figuras para a categoria: ${categoriaDesejada}`); // Log de verificação
        if (categoriaDesejada === '') {
            console.warn('A categoria desejada está vazia. Verifique se a categoria está sendo passada corretamente.');
            return;
        }

        const response = await fetch(`php/listar.php?categoria=${encodeURIComponent(categoriaDesejada)}`);
        const data = await response.json();
        console.log('Dados recebidos:', data);

        const predictions = markovChain.Predict(categoriaDesejada);
        console.log('Previsões com base na categoria:', predictions);
        if (predictions.length === 0) {
            console.warn('As previsões com base na categoria estão vazias. Verifique se a categoria está presente na cadeia de Markov.');
        }

        const cardsContainer = document.getElementById('cards-container');
        cardsContainer.innerHTML = ''; // Limpar figuras anteriores

        // Treina a cadeia de Markov com os títulos das figuras
        let text = data.map(figura => figura.palavra).join(' ');
        console.log('Texto para treinar MarkovChain:', text);
        markovChain.Load(text);

        // Fazer predições com base nas palavras anteriores na sequência
        let prediction = markovChain.Predict('palavra_anterior');
        console.log('Predição com base na palavra anterior:', prediction);

        data.forEach(figura => {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card');
            cardDiv.innerHTML = `
                <img src="${figura.img}" alt="${figura.palavra}">
                <div class="card-body">
                    <h5 class="card-title">${figura.palavra}</h5>
                    <p>Categorias: ${figura.categorias || 'Nenhuma'}</p>
                    <p>Predição: ${prediction.join(', ')}</p> <!-- Exibir as predições -->
                </div>`;

            // Adiciona evento para chamar a funcao de adicionar a figura à frase
            cardDiv.addEventListener('click', () => {
                adicionarFiguraAFrase(figura);
                cardDiv.classList.add('selected');
                setTimeout(() => {
                    cardDiv.classList.remove('selected'); // Cria efeito visual para indicar que o card foi selecionado
                }, 300);
            });

            cardsContainer.appendChild(cardDiv);
        });
    } catch (error) {
        console.error('Erro ao carregar as figuras:', error);
    }
}

export { removerUltimaFigura, limparFrase, buscaFigura, criarBotoesDeCategoria };
