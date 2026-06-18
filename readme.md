# 🍺 PrimoosBeerMobile

Aplicativo mobile para gestão de distribuição de bebidas, desenvolvido como projeto da disciplina de **Projeto Integrador 4** — CEUB (Centro Universitário de Brasília).

## 👤 Integrante

- **Sergio de Souza Silva**

## 📱 Sobre o projeto

O PrimoosBeerMobile é um aplicativo de gestão para distribuidoras de bebidas, construído em React Native com Expo. O sistema atende dois perfis de usuário distintos — **administrador** e **cliente** — com fluxos de navegação e permissões separados.

O cliente pode navegar pelo catálogo de produtos, adicionar itens ao carrinho e finalizar pedidos. O administrador gerencia o catálogo (cadastro, edição e exclusão de produtos), acompanha pedidos recebidos, controla o estoque e administra usuários do sistema.

O projeto integra autenticação segura (com suporte a verificação em duas etapas), persistência de dados em tempo real e controle automatizado de estoque, aplicando na prática conceitos de desenvolvimento mobile e integração com backend-as-a-service estudados ao longo do curso.

### Funcionalidades principais

- **Autenticação segura** com Supabase Auth e suporte a **2FA (TOTP)**, compatível com Google Authenticator e Authy
- **Roteamento por papel de usuário** (admin / cliente), com áreas e permissões distintas
- **Catálogo de produtos** com upload de imagem para o Supabase Storage
- **Carrinho de compras** com persistência de estado durante a navegação
- **Gestão de pedidos**, com itens detalhados por pedido
- **Controle de estoque automatizado**: o estoque é decrementado automaticamente via trigger no banco de dados sempre que uma venda é registrada, com proteção contra estoque negativo
- **Exclusão lógica de produtos** (soft delete): produtos removidos do catálogo preservam o histórico de vendas já realizado
- **Geração de PDF** de recibos de pedidos
- **Gestão de usuários** pelo administrador, via cliente administrativo do Supabase

## 🛠️ Tecnologias utilizadas

| Categoria | Tecnologia |
|---|---|
| Framework mobile | React Native + Expo (SDK 55) |
| Navegação | Expo Router (file-based routing) |
| Backend / BaaS | Supabase (Auth, Database, Storage) |
| Linguagem | TypeScript |
| Build de produção | EAS Build |
| Autenticação | Supabase Auth + MFA (TOTP) |

## 📂 Estrutura do projeto

```
PrimoosBeerMobile/
├── src/
│   ├── app/                  # Rotas (Expo Router)
│   │   ├── (admin)/          # Telas exclusivas do administrador
│   │   ├── (auth)/           # Login, cadastro e configuração de 2FA
│   │   └── (user)/           # Telas do cliente (catálogo, carrinho, pedidos)
│   ├── components/           # Componentes reutilizáveis de UI
│   ├── context/               # Contextos React (Auth, Carrinho)
│   ├── hook/                  # Hooks customizados (useProdutos, usePedidos, etc.)
│   ├── lib/                   # Configuração do client Supabase
│   └── theme/                  # Tema visual da aplicação
└── assets/                     # Imagens e ícones estáticos
```

## ▶️ Como executar o projeto

### Pré-requisitos
- Node.js instalado
- Conta no [Supabase](https://supabase.com) com um projeto criado
- App **Expo Go** instalado no celular (para testes rápidos) ou um emulador Android configurado

### Passos

```bash
# 1. Clonar o repositório
git clone <link-do-repositorio>
cd PrimoosBeerMobile

# 2. Instalar as dependências
npm install

# 3. Configurar as variáveis de ambiente
# Criar um arquivo .env na raiz com as credenciais do Supabase:
EXPO_PUBLIC_SUPABASE_URL=sua_url_aqui
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui

# 4. Iniciar o projeto
npx expo start
```

Em seguida, escaneie o QR code com o app Expo Go, ou pressione `a` no terminal para abrir em um emulador Android.

### Build de produção (Android)

```bash
npx eas-cli build --platform android --profile production
```

## 📄 Documentação complementar

A documentação técnica e negocial completa do projeto está disponível na pasta [`docs/`](./docs) deste repositório, incluindo arquitetura da solução, estrutura do banco de dados e decisões técnicas relevantes.

## 🔄 Principais ajustes realizados a partir dos feedbacks recebidos

> *(Atualizar esta seção a cada entrega, com base nos feedbacks recebidos do professor)*

- Implementação de exclusão lógica (soft delete) de produtos, preservando o histórico de vendas
- Implementação de trigger no banco de dados para controle automático e atômico de estoque
- Tratamento de erros aprimorado nos fluxos de finalização de pedido (cliente e administrador)
- Ajustes de usabilidade no teclado das telas de login e autenticação em duas etapas

## 📚 Disciplina

Projeto desenvolvido para a disciplina de **Projeto Integrador 4** — CEUB, sob orientação do professor **Tiago Leite Pereira**.