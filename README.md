# 🚨 SafeWay — Plataforma de Alertas Comunitários

## 📌 Sobre o projeto

O **SafeWay** é uma plataforma colaborativa voltada à segurança comunitária, desenvolvida para facilitar o compartilhamento de informações sobre riscos e ocorrências em diferentes regiões.

Inspirado em ferramentas de navegação colaborativa, como o Waze, o projeto permite que usuários registrem ocorrências, visualizem alertas geolocalizados e consultem informações relevantes sobre determinadas localidades.

A proposta é conectar pessoas por meio da tecnologia, incentivando a colaboração, a prevenção e o acesso a informações que possam contribuir para a segurança e a mobilidade urbana.

## 🎯 Objetivos

- Facilitar a identificação de riscos e ocorrências nas proximidades.
- Permitir o registro e o compartilhamento de alertas comunitários.
- Disponibilizar informações organizadas por localização e categoria.
- Incentivar a participação e a colaboração entre os usuários.
- Oferecer mecanismos de análise e verificação das ocorrências.
- Melhorar o acesso a informações sobre segurança e infraestrutura urbana.

## 🛠️ Funcionalidades

O SafeWay possui as seguintes funcionalidades em desenvolvimento:

- **Mapa interativo:** visualização de ocorrências geolocalizadas.
- **Registro de ocorrências:** formulário para cadastrar alertas, com descrição, categoria, localização e imagem.
- **Pesquisa de localização:** busca por ruas e endereços para navegar até o local desejado no mapa.
- **Filtros:** organização das ocorrências por categorias e outros critérios disponíveis.
- **Mural comunitário:** espaço para visualizar e consultar as ocorrências publicadas.
- **Perfil do usuário:** visualização das informações da conta e das próprias ocorrências.
- **Autenticação:** acesso à plataforma por meio da identificação do usuário.
- **Sistema de moderação:** área administrativa para gerenciar moderadores e área de análise para verificar as ocorrências publicadas.
- **Classificação das ocorrências:** identificação de publicações como "Em análise", "Verificada" ou "Falsa".
- **Tema e idioma:** opções de personalização da interface.

## 💻 Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| React.js | Construção da interface e componentes |
| JavaScript (ES6+) | Lógica e interatividade |
| HTML5 | Estrutura da aplicação |
| CSS3 | Estilização e responsividade |
| Vite | Ambiente de desenvolvimento e ferramenta de build |
| React Leaflet | Integração do mapa com React |
| Leaflet | Exibição e manipulação do mapa |
| React Bootstrap | Componentes de interface |
| Bootstrap | Recursos de estilização |
| OpenStreetMap | Fornecimento dos mapas |
| Nominatim | Pesquisa e geocodificação de endereços |
| LocalStorage | Armazenamento local de informações no navegador |

## 📦 Bibliotecas e dependências

As principais bibliotecas utilizadas no projeto são:

| Biblioteca | Finalidade |
|---|---|
| `react` | Biblioteca principal para construção da interface |
| `react-dom` | Renderização da aplicação no navegador |
| `react-leaflet` | Componentes de mapas para React |
| `leaflet` | Biblioteca responsável pelo mapa interativo |
| `react-bootstrap` | Componentes visuais baseados no Bootstrap |
| `bootstrap` | Estilos e recursos de interface |
| `vite` | Execução do ambiente de desenvolvimento |
| `@vitejs/plugin-react` | Integração do React com o Vite |

### Instalação das dependências

Caso esteja configurando o projeto pela primeira vez, execute:

```bash
npm install
```

Esse comando instala as dependências registradas no `package.json`.

Caso precise instalar individualmente as bibliotecas utilizadas, execute:

```bash
npm install react react-dom leaflet react-leaflet react-bootstrap bootstrap
```

E, caso o ambiente Vite ainda não esteja configurado:

```bash
npm install -D vite @vitejs/plugin-react
```

**Importante:** o Nominatim e o OpenStreetMap são serviços externos utilizados pelo projeto, não bibliotecas que precisam ser instaladas pelo npm.

## 📂 Estrutura do projeto

A estrutura pode variar conforme a organização dos componentes, mas a aplicação está organizada aproximadamente da seguinte forma:

```text
Landing-Page-Alertas/
│
├── public/
│
├── src/
│   │
│   ├── Components/
│   │   ├── App.jsx
│   │   ├── Formulario.jsx
│   │   ├── Formulario.css
│   │   ├── Mapa.jsx
│   │   ├── Mapa.css
│   │   ├── Mural.jsx
│   │   ├── Perfil.jsx
│   │   ├── NavBar.jsx
│   │   ├── Navbar.css
│   │   ├── Moderacao.jsx
│   │   ├── Moderacao.css
│   │   └── ...
│   │
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## ⚙️ Como executar o projeto

### 1. Pré-requisitos

Antes de iniciar, é necessário possuir:

- **Node.js:** ambiente de execução JavaScript.
- **npm:** gerenciador de pacotes do Node.js.
- **Git:** ferramenta de controle de versão.
- **Visual Studio Code:** editor de código recomendado.

### 2. Clonar o repositório

```bash
git clone https://github.com/MariPaiva490/Landing-Page-Alertas.git
```

### 3. Acessar a pasta do projeto

```bash
cd Landing-Page-Alertas
```

### 4. Instalar as dependências

```bash
npm install
```

### 5. Executar a aplicação

```bash
npm run dev
```

Após a inicialização, o Vite disponibilizará um endereço local no terminal, geralmente:

```text
http://localhost:5173/
```

Acesse o endereço pelo navegador para visualizar a aplicação.

### 6. Gerar a versão de produção

Para gerar os arquivos otimizados da aplicação, execute:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

Para visualizar a versão de produção localmente:

```bash
npm run preview
```

## 🗺️ Serviços de mapas e localização

O SafeWay utiliza tecnologias de mapas e geolocalização para permitir a visualização e a pesquisa de endereços.

- **Leaflet:** biblioteca responsável pela manipulação do mapa.
- **React Leaflet:** integração dos recursos do Leaflet com os componentes React.
- **OpenStreetMap:** serviço utilizado para disponibilizar os mapas.
- **Nominatim:** serviço de geocodificação utilizado para pesquisar endereços e localizar pontos no mapa.

Esses serviços permitem apresentar informações geográficas sem a necessidade de instalar uma biblioteca adicional para cada serviço.

## 🔐 Armazenamento e moderação

Atualmente, o projeto utiliza o `LocalStorage` do navegador para armazenar informações da aplicação, como dados de usuários, ocorrências e permissões de moderação.

O sistema de moderação possui dois níveis principais:

- **Administrador:** pode gerenciar as permissões dos moderadores.
- **Moderador:** pode analisar as ocorrências e classificá-las como verificadas ou falsas.

As ocorrências também podem permanecer com o status "Em análise" até serem avaliadas.

**Observação:** o armazenamento local é utilizado para fins de prototipação. Como ainda não há uma estrutura de backend responsável pela autenticação e proteção dos dados, as permissões e informações armazenadas no navegador não devem ser consideradas seguras para uso em produção.

## 👥 Desenvolvimento

O SafeWay é desenvolvido de forma colaborativa, utilizando práticas de desenvolvimento ágil e controle de versão com Git e GitHub.

A organização das atividades é realizada por meio de divisão de funcionalidades e acompanhamento das tarefas, permitindo que diferentes partes da aplicação sejam desenvolvidas, testadas e integradas progressivamente.

## 🚀 Próximas etapas

- Implementar uma estrutura de backend e banco de dados.
- Aprimorar a segurança e a autenticação dos usuários.
- Desenvolver notificações de ocorrências próximas.
- Aprimorar os mecanismos de validação das informações.
- Expandir os recursos de pesquisa e filtragem do mapa.
- Melhorar a experiência de uso e a responsividade da aplicação.

## 📄 Considerações finais

O SafeWay busca utilizar a tecnologia como ferramenta de apoio à segurança coletiva, incentivando a participação da comunidade e facilitando o acesso a informações que podem fazer a diferença no cotidiano das pessoas.

---

**SafeWay — Informação, prevenção e colaboração para uma comunidade mais segura.**
