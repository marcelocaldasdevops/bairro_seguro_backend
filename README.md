# 🚀 Bairro Seguro - Backend

O **Bairro Seguro** é um sistema de monitoramento comunitário que utiliza autenticação, banco de dados PostgreSQL e comunicação em tempo real via Socket.IO.

---

## 📋 Sumário

- [Pré-requisitos](#️-pré-requisitos)
- [Configuração do Banco de Dados (PostgreSQL)](#-configuração-do-banco-de-dados-postgresql-via-docker)
- [Instalação do Projeto](#️-instalação-do-projeto)
- [Execução](#-execução)
- [Estrutura do Projeto](#-estrutura-do-projeto-principais-dependências)
- [Workflow de Desenvolvimento](#-workflow-básico)
- [Solução de Problemas](#-solução-de-problemas)
- [Licença](#-licença)

---

## 🛠️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Node.js (v18 ou superior)
- Docker (para rodar o PostgreSQL em container)
- npm ou yarn (gerenciador de pacotes)
- TypeScript (opcional, globalmente instalado via `npm install -g typescript`)

---

## 🐳 Configuração do Banco de Dados (PostgreSQL via Docker)

### 1. Inicie o container do PostgreSQL

```bash
docker run --name postgres -e POSTGRES_PASSWORD=fpf@1212 -e POSTGRES_DB=bairro_seguro -p 5432:5432 -d postgres
```

### 2. Execute o Schema SQL (Criação das Tabelas)

```bash
npm run run-schema
```

> Este comando executa o arquivo `./src/database/schema.sql` dentro do container PostgreSQL.

---

## ⚙️ Instalação do Projeto

### 1. Clone o repositório

```bash
git clone [URL_DO_REPOSITÓRIO]
cd bairro-seguro-backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
PORT=3000
JWT_SECRET=sua_chave_secreta_jwt
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=fpf@1212
DB_NAME=bairro_seguro
```

---

## 🚀 Execução

| Comando             | Descrição                                                             |
|---------------------|-----------------------------------------------------------------------|
| `npm start`         | Inicia o servidor em produção (arquivos compilados em `dist/`).      |
| `npm run dev`       | Inicia o servidor em modo de desenvolvimento com `nodemon`.          |
| `npm run build`     | Compila o código TypeScript para JavaScript na pasta `dist/`.        |
| `npm run run-schema`| Executa o script SQL no banco de dados PostgreSQL.                   |

---

## 📦 Estrutura do Projeto (Principais Dependências)

### 📡 Backend

| Biblioteca    | Função                                                             |
|---------------|---------------------------------------------------------------------|
| express       | Framework para servidor HTTP.                                      |
| pg            | Driver PostgreSQL para Node.js.                                    |
| socket.io     | Comunicação em tempo real entre cliente e servidor.                |
| jwt-simple    | Geração e validação de tokens JWT para autenticação.              |
| bcrypt        | Criptografia segura de senhas.                                     |

---

## ⚙️ Desenvolvimento

| Ferramenta   | Uso                                                                 |
|--------------|----------------------------------------------------------------------|
| typescript   | Adiciona tipagem estática ao JavaScript.                            |
| nodemon      | Reinicia automaticamente o servidor durante o desenvolvimento.      |
| ts-node      | Permite executar TypeScript diretamente sem compilação prévia.      |

---

## 🔄 Workflow Básico

### Desenvolvimento

- Edite os arquivos em `src/` (TypeScript).
- Use `npm run dev` para rodar com hot-reload.

### Compilação para Produção

- Execute `npm run build` para gerar os arquivos JavaScript em `dist/`.

### Deploy

- Use `npm start` para rodar a versão compilada em produção.

---

## 🐞 Solução de Problemas

### ❌ Erro ao conectar ao PostgreSQL

- Verifique se o container está rodando:

```bash
docker ps
```

- Confira as credenciais no `.env`.

### ❌ Erro no `run-schema`

- Certifique-se de que `./src/database/schema.sql` existe.
- No Windows, substitua `<` por `-f` no script do `package.json`.

---

## 📄 Licença

MIT © [Seu Nome ou Organização]
