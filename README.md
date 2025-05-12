# MyStore

Este projeto é um exemplo de aplicação em **Next.js** que implementa um catálogo de produtos com funcionalidades de:

* Exibição e carregamento de produtos (mock via **json-server**)
* Formulário de adição de novos produtos com upload de imagem (drag & drop e file picker)
* Geração de preview de imagem
* Filtragem, ordenação e paginação de produtos

## Tecnologias utilizadas

* **Next.js 15.3.2**: framework React com rotas automáticas e suporte a APIs.
* **TypeScript**: tipagem estática para componentes e lógica.
* **Tailwind CSS**: estilização utilitária.
* **json-server**: mock de API REST para desenvolvimento.
* **concurrently**: execução simultânea do servidor mock e do Next.js.
* **lucide-react**: ícones vetoriais.

## Como rodar o projeto

1. Clone este repositório:

   ```bash
   git clone https://github.com/gustavokurtz/teste-senior.git
   cd teste-senior
   ```
2. Instale as dependências:

   ```bash
   npm install
   ```
3. Inicie o servidor e a aplicação em modo de desenvolvimento:

   ```bash
   npm run dev
   ```
4. Abra o navegador em `http://localhost:3000` para ver a aplicação.

## Estrutura e decisões de código

### 1. Padrões de dados (Types)

* **Product**: representa um produto carregado da API, com `id`, `name`, `category`, `price`, `description` e `imageUrl`.
* **NewProduct**: usa `price` como `string` para permitir campo vazio antes da conversão, e `imageFile: File | null` para armazenar o arquivo de imagem.

### 2. Estados principais (`useState`)

* `products` e `loading`: controle do carregamento e armazenamento da lista de produtos.
* `newProduct` e `preview`: valores do formulário e URL de preview da imagem.
* Filtros (`filterName`, `minPrice`, `maxPrice`), ordenação (`sortField`, `sortOrder`) e paginação (`currentPage`).

**Decisão**: separar cada aspecto (dados, UI e lógica) em estados claros para facilitar manutenção e escalabilidade.

### 3. Carregamento de dados (`useEffect`)

```ts
useEffect(() => {
  fetch('http://localhost:4000/products')
    .then(res => res.json())
    .then((data: Product[]) => {
      setProducts(data)
      setLoading(false)
    })
    .catch(console.error)
}, [])
```

* **Mock API**: usamos o **json-server** para servir `db.json` em `http://localhost:4000/products`.
* **Loading state**: exibe spinner enquanto aguarda resposta.

### 4. Formulário e upload de imagem

* **Drag & drop**: `onDragOver` e `onDrop` capturam arquivos arrastados.
* **File picker**: `input type="file"` escondido; `ref` e `onClick` no contêiner.
* **Preview**: `URL.createObjectURL(file)` gera URL temporária para exibir a imagem antes de enviar.
* **Limpeza do input**: `e.target.value = ''` no `handleFileChange` garante que selecionar o mesmo arquivo dispare `onChange` novamente.

### 5. Conversão para Base64 e envio

```ts
const getBase64 = (file: File): Promise<string> => /* ... */
```

* Converte `File` em `data URL` para armazenar no mock.
* No `handleAdd`, se há `imageFile`, converte antes de `POST` para `/products`.

### 6. Lógica de filtragem, ordenação e paginação

* **Filtragem**: `.filter(p => ...)` verifica `name`, `minPrice` e `maxPrice`.
* **Ordenação**: `.sort(...)` por `name` ou `price` em ordem asc/desc.
* **Paginação**:

  * `itemsPerPage = 6`
  * calcula índices `firstIndex` e `lastIndex` e usa `.slice()`.
  * controla navegação de páginas com botões.

**Decisão**: lógica no cliente permite UX rápido sem chamadas adicionais.

### 7. Interface (Tailwind CSS)

* **Layout responsivo**: grid e utilitários responsivos (`sm:`, `md:`, `lg:`).
* **Componentes reutilizáveis**: classes utilitárias e transições de hover.
* **Spinner de loading**: simples `<div>` com animação CSS.

## Scripts disponíveis (package.json)

* **npm run dev**: executa simultaneamente o mock e o Next.js em dev.
* **npm run build/start**: gera build de produção.
* **npm run lint**: verifica qualidade de código.

