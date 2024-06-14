class Child {
    constructor(word = '', occurrence = 0, imagePath = '') {
        this.Occurrence = occurrence; // Número de ocorrências da palavra associada ao Child
        this.Word = word; // Palavra associada ao Child
        this.ImagePath = imagePath; // Caminho da imagem associada à palavra
    }
}

class RootWord {
    constructor(word = '', imagePath = '') {
        this.StartWord = false; // Indica se a palavra é o início de uma sentença
        this.EndWord = false; // Indica se a palavra é o final de uma sentença
        this.Word = word; // A própria palavra
        this.Occurrence = 0; // Número de ocorrências da palavra na cadeia de Markov
        this.ChildCount = 0; // Número de filhos da palavra na cadeia de Markov
        this.Childs = new Map(); // Mapa de filhos da palavra, onde as chaves são as palavras e os valores são instâncias da classe Child
        this.ImagePath = imagePath;
    }
}

class MarkovChain {
    // Inicialização das propriedades da cadeia de Markov
    constructor() {
        this.NextIsStart = false; // Flag para indicar se a próxima palavra é o início de uma sentença
        this.Tokens = []; // Array para armazenar os tokens (palavras) do texto  
        this.startindex = []; // Array para armazenar os índices das palavras de início de sentença
        this.FSortWordsByFrequence = false; // Flag para indicar se as palavras devem ser classificadas por frequência
        this.Words = new Map(); // Mapa para armazenar as palavras e suas informações associadas 
    }

    // Método para obter os filhos de uma palavra
    getChilds(rootWord) {
        let listChilds = [...rootWord.Childs.values()]; // Obtenção dos filhos da palavra raiz
        listChilds.sort((x, y) => y.Occurrence - x.Occurrence); // Ordenação dos filhos com base na ocorrência (decrescente)
        return listChilds; // Retorno da lista de filhos ordenada
    }

    // Método para dividir o texto em tokens (palavras)
    getListTokens(txt) {
        txt = txt.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"]/g, "");
        txt = txt.toLowerCase();
        return txt.split(" "); // Divisão do texto em tokens usando o espaço como delimitador
    }

    // Método para carregar o texto na cadeia de Markov
    Load(text, wordImageMap = {}) {
        this.Words.clear();
        this.Tokens = this.getListTokens(text); // Divide o texto em tokens

        // Iteração sobre os tokens
        for (let i = 0; i < this.Tokens.length; i++) {
            let s1 = this.Tokens[i];
            if (s1 === "") continue; // Verificação se o token é vazio

            // Verificação se a imagem já existe no mapa de imagens
            let imagePath = wordImageMap[s1] || '';
            if (!this.Words.has(s1)) {
                this.Words.set(s1, new RootWord(s1, imagePath));
            }

            let w = this.Words.get(s1);
            w.Occurrence += 1; // Atualização da ocorrência da img

            // Se houver uma próxima imagem
            if (i < this.Tokens.length - 1) {
                
                let nextToken = this.Tokens[i + 1];
                let nextImagePath = wordImageMap[nextToken] || '';
                if (!w.Childs.has(nextToken)) {
                    w.Childs.set(nextToken, new Child(nextToken, 0, nextImagePath)); // Adiciona o próximo token como um novo filho
                }
                let c = w.Childs.get(nextToken);
                c.Occurrence += 1; // Incrementa a ocorrência do filho
                w.ChildCount += 1; // Incrementa o contador de filhos

                // Verificação se a próxima palavra é o início de uma sentença
                if (this.NextIsStart) {
                    w.StartWord = true;
                    this.NextIsStart = false;
                    this.startindex.push(s1);
                }

                // Verificação se a palavra termina com um ponto final
                if (s1.endsWith(".")) {
                    w.EndWord = true;
                    this.NextIsStart = true;
                }

            // Verificação se a palavra é o final de uma sentença
            } else {
                w.EndWord = true;
            }

            // Atualiza a palavra no mapa
            this.Words.set(s1, w);
        }
    }

    // Método para prever a próxima palavra com base na palavra anterior
    Predict(previousWord) {
        // Conversão para letras minúsculas
        previousWord = previousWord.toLowerCase();
        
        if (!this.Words.has(previousWord)) {
            // Se a palavra anterior não estiver na cadeia de Markov, retornar uma lista vazia
            return [];
        }

        const rootWord = this.Words.get(previousWord);
        if (!rootWord || rootWord.ChildCount === 0) {
            // Se a palavra anterior não existir ou não tiver filhos, retornar uma lista vazia
            return [];
        }

        // Obter os filhos da palavra anterior
        const childs = this.getChilds(rootWord);
        
        // Criar uma lista para armazenar as previsões
        const predictions = [];

        // Adicionar os filhos à lista de previsões
        for (const child of childs) {
            predictions.push(child.Word);
        }

        return predictions;
    }

}

export { MarkovChain };
