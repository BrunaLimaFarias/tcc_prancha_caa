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
                <img src="${figura.img}" alt="${figura.palavra}" onerror="this.src='./img/assets/image-notfound.jpg';">
                <div class="card-body">
                    <h5 class="card-title">${figura.palavra}</h5>
                </div>
                `;
            fraseListaElement.appendChild(li);
        });
    } catch (error) {
        console.error('Erro ao atualizar a frase formada:', error);
    }
}

// Função para carregar as categorias do servidor
async function carregarCategorias() {
    try {
        const response = await fetch('php/obter_categorias.php');
        const categorias = await response.json();
        console.log('Categorias carregadas:', categorias);
        return categorias;
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        return {};
    }
}

function criarBotoesDeCategoria(categorias, markovChain, wordImageMap) {
    const categorySelector = document.querySelector('.category-selector');
    categorySelector.innerHTML = ''; // Limpa os botões existentes

    const macrosCategorias = {
        'Educação e Alfabetização': ['Alfabetização e Numerais', 'Escola e Aprendizagem', 'Gramática e Funções'],
        'Alimentação e Saúde': ['Alimentação', 'Alimentos', 'Saúde e Higiene'],
        'Natureza e Animais': ['Animais', 'Natureza'],
        'Ações e Comportamentos': ['Ações', 'Comportamento'],
        'Objetos e Tecnologia': ['Objetos', 'Tecnologia e Comunicação'],
        'Pessoas e Identidade': ['Pessoas', 'Identidade e Gênero', 'Partes do Corpo'],
        'Sentimentos e Expressões': ['Sentimentos', 'Expressões de Comunicação', 'Gestos'],
        'Tempo e Eventos': ['Tempo e Datas', 'Eventos e Celebrações', 'Estações do Ano']
    };

    // Define cores para cada macro 
    const cores = {
        'Educação e Alfabetização': '#448aff',
        'Alimentação e Saúde': '#1565c0',
        'Natureza e Animais': '#009688',
        'Ações e Comportamentos': '#8bc34a',
        'Objetos e Tecnologia': '#ffc107',
        'Pessoas e Identidade': '#ff9800',
        'Sentimentos e Expressões': '#f44336',
        'Tempo e Eventos': '#ad1457'
    };

    // Ordena macrosCategorias pelo total de figuras em cada macro categoria
    const macrosCategoriasOrdenadas = Object.entries(macrosCategorias).sort((a, b) => {
        const countA = a[1].reduce((sum, cat) => sum + (categorias[cat] || 0), 0);
        const countB = b[1].reduce((sum, cat) => sum + (categorias[cat] || 0), 0);
        return countB - countA;
    }).slice(0, 8);

    // Cria botões para categorias macros
    macrosCategoriasOrdenadas.forEach(([macroCategoria, subCategorias]) => {
        const button = document.createElement('button');
        button.classList.add('category-btn');
        button.dataset.category = macroCategoria;
        button.textContent = macroCategoria;
        button.setAttribute('aria-label', `Selecionar categoria ${macroCategoria}`);
        button.style.backgroundColor = cores[macroCategoria]; // Aplica a cor correspondente
        categorySelector.appendChild(button);

        // Adiciona o evento de clique para chamar buscaFigura com as categorias correspondentes
        button.addEventListener('click', () => {
            console.log(`Botão da categoria macro clicado: ${macroCategoria}`); // Log de verificação
            subCategorias.forEach(categoria => {
                buscaFigura(categoria, markovChain, wordImageMap);
            });
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

        const cardsContainer = document.getElementById('cards-container');
        cardsContainer.innerHTML = ''; // Limpar figuras anteriores

        // Treina a cadeia de Markov com os títulos das figuras
        let text = data.map(figura => figura.palavra).join(' ');
        console.log('Texto para treinar MarkovChain:', text);
        markovChain.Load(text, wordImageMap);

        // Fazer predições com base na última palavra adicionada à frase
        let ultimaPalavra = figurasSelecionadas.length > 0 ? figurasSelecionadas[figurasSelecionadas.length - 1].palavra : '';
        let prediction = markovChain.Predict(ultimaPalavra);
        console.log('Predição com base na última palavra:', prediction);

        // Exibir figuras da categoria selecionada
        data.forEach(figura => {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card');

            cardDiv.innerHTML += `
            <img src="${figura.img}" alt="${figura.palavra}"  onerror="this.src='./img/assets/image-notfound.jpg';">
            <div class="card-body">
                <h5 class="card-title">${figura.palavra}</h5>
            </div>
            `;
                
            // Adiciona evento para chamar a função de adicionar a figura à frase
            cardDiv.addEventListener('click', () => {
                adicionarFiguraAFrase(figura);
                cardDiv.classList.add('selected');
                setTimeout(() => {
                    cardDiv.classList.remove('selected');   // Cria efeito visual para indicar que o card foi selecionado
                }, 300);
            });

            cardsContainer.appendChild(cardDiv);
        });
    } catch (error) {
        console.error('Erro ao carregar as figuras:', error);
    }
}

// Função para buscar e exibir figuras da categoria fixa
async function buscaFiguraFixa(markovChain, wordImageMap) {
    try {
        const categoriaFixa = 'Ações';
        const response = await fetch(`php/listar.php?categoria=${encodeURIComponent(categoriaFixa)}`);
        const data = await response.json();
        console.log('Dados recebidos:', data);

        const fixedCardsContainer = document.getElementById('fixed-cards-container');
        fixedCardsContainer.innerHTML = ''; // Limpar figuras anteriores

        // Exibir figuras da categoria fixa
        data.forEach(figura => {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card');

            cardDiv.innerHTML += `
            <img src="${figura.img}" alt="${figura.palavra}"  onerror="this.src='./img/assets/image-notfound.jpg';">
            <div class="card-body">
                <h5 class="card-title">${figura.palavra}</h5>
            </div>
            `;
                
            // Adiciona evento para chamar a função de adicionar a figura à frase
            cardDiv.addEventListener('click', () => {
                adicionarFiguraAFrase(figura);
                cardDiv.classList.add('selected');
                setTimeout(() => {
                    cardDiv.classList.remove('selected');   // Cria efeito visual para indicar que o card foi selecionado
                }, 300);
            });

            fixedCardsContainer.appendChild(cardDiv);
        });
    } catch (error) {
        console.error('Erro ao carregar as figuras da categoria fixa:', error);
    }
}

async function init() {
    console.log('JavaScript carregado'); // Log de verificação
    const markovChain = new MarkovChain();
    const wordImageMap = {};
    const categorias = await carregarCategorias();
    console.log('Categorias recebidas:', categorias); // Log de verificação
    criarBotoesDeCategoria(categorias, markovChain, wordImageMap);
    buscaFiguraFixa(markovChain, wordImageMap);
}

document.addEventListener('DOMContentLoaded', init);

export { removerUltimaFigura, limparFrase, buscaFigura, criarBotoesDeCategoria };
