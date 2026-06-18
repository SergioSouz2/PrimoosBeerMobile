# Arquitetura Técnica — PrimoosBeerMobile

## Visão geral da arquitetura

O PrimoosBeerMobile segue uma arquitetura **client-serverless**, em que o aplicativo mobile (cliente) se comunica diretamente com o **Supabase**, que atua como Backend-as-a-Service (BaaS), responsável por:

- Banco de dados PostgreSQL;
- Autenticação de usuários (incluindo MFA/2FA);
- Armazenamento de arquivos (imagens de produtos);
- Regras de negócio executadas no banco via *functions* e *triggers*.

```
┌─────────────────────────────┐
│        App Mobile            │
│   (React Native + Expo)      │
│                               │
│  ┌─────────┐   ┌───────────┐ │
│  │  Telas   │──▶│ Contexts/  │ │
│  │ (Router) │   │   Hooks    │ │
│  └─────────┘   └─────┬──────┘ │
└───────────────────────┼───────┘
                         │
                         ▼
            ┌─────────────────────┐
            │      Supabase        │
            │  ┌─────────────────┐ │
            │  │  Auth (+ MFA)    │ │
            │  ├─────────────────┤ │
            │  │  PostgreSQL DB   │ │
            │  │  + Triggers      │ │
            │  ├─────────────────┤ │
            │  │  Storage (fotos) │ │
            │  └─────────────────┘ │
            └─────────────────────┘
```

## Organização do projeto

A navegação utiliza o **Expo Router**, com roteamento baseado em arquivos e em **grupos de rotas** que isolam cada perfil de usuário:

```
src/app/
├── (auth)/        → Login, cadastro e configuração de 2FA
├── (admin)/        → Telas exclusivas do administrador (tabs)
├── (user)/         → Telas exclusivas do cliente (tabs)
├── index.tsx        → Ponto de entrada — decide para onde redirecionar
└── _layout.tsx       → Layout raiz, provê os Contexts globais
```

### Roteamento por papel de usuário

O ponto de entrada do app (`src/app/index.tsx`) consulta o contexto de autenticação e redireciona o usuário de acordo com o campo `role` do seu perfil:

- Sem sessão ativa → redireciona para `(auth)/login`;
- `role === "admin"` → redireciona para `(admin)/pedido`;
- Demais usuários → redireciona para `(user)/inicio`.

Essa decisão é tomada uma única vez, no carregamento do app, e reativa sempre que o estado de autenticação muda (login, logout).

## Gerenciamento de estado

O projeto utiliza **React Context API** para estado global, evitando a necessidade de uma biblioteca externa de gerenciamento de estado:

- **`AuthContext`** — mantém a sessão do Supabase Auth e o perfil do usuário logado (incluindo seu papel — admin ou cliente). Escuta as mudanças de autenticação via `supabase.auth.onAuthStateChange`;
- **`CarrinhoContext`** — mantém os itens do carrinho de compras do cliente durante a navegação entre telas, antes da finalização do pedido.

Hooks customizados (`useProdutos`, `usePedidos`) encapsulam o acesso aos dados, centralizando as chamadas ao Supabase e o tratamento de erros.

## Decisões técnicas relevantes

### 1. Controle de estoque via trigger de banco de dados

Em vez de decrementar o estoque manualmente no código do aplicativo (o que exigiria repetir a lógica em toda tela que registra uma venda), o controle de estoque foi implementado como um **trigger no PostgreSQL**, disparado a cada inserção na tabela `pedido_itens`:

```sql
create or replace function trg_decrementar_estoque()
returns trigger
language plpgsql
security definer
as $$
begin
  update produtos
  set estoque = estoque - new.quantidade
  where id = new.produto_id
    and estoque >= new.quantidade;

  if not found then
    raise exception 'Estoque insuficiente para o produto %', new.produto_id;
  end if;

  return new;
end;
$$;

create trigger after_insert_pedido_itens
after insert on pedido_itens
for each row
execute function trg_decrementar_estoque();
```

**Justificativa:** essa abordagem garante que a regra de negócio seja aplicada de forma consistente independentemente de qual tela do aplicativo está registrando a venda (carrinho do cliente ou pedido manual do administrador), e a verificação `estoque >= quantidade` torna a operação atômica, eliminando condições de corrida e impedindo estoque negativo.

### 2. Exclusão lógica de produtos (soft delete)

Produtos não são removidos fisicamente do banco de dados. Em vez disso, a tabela `produtos` possui uma coluna `ativo` (booleana), e a "exclusão" de um produto apenas atualiza esse campo para `false`.

**Justificativa:** produtos já vendidos possuem registros vinculados na tabela `pedido_itens` através de uma foreign key. Uma exclusão física geraria erro de violação de integridade referencial ou apagaria o histórico de vendas associado a esse produto. O soft delete preserva a integridade dos pedidos antigos e o histórico para relatórios, ao mesmo tempo em que remove o produto da visualização de catálogo ativo.

### 3. Autenticação em duas etapas (2FA / MFA)

A autenticação utiliza o recurso nativo de **MFA via TOTP** do Supabase Auth (`supabase.auth.mfa`), permitindo que o usuário associe um aplicativo autenticador (Google Authenticator, Authy) à sua conta através de QR code, e exigindo o código de 6 dígitos em logins subsequentes.

### 4. Tratamento de teclado em formulários

Telas com campos de entrada (login, configuração de 2FA) utilizam `KeyboardAvoidingView` combinado com `ScrollView`, além da configuração `softwareKeyboardLayoutMode: "resize"` no Android, garantindo que o teclado virtual nunca sobreponha os campos de formulário.

## Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Interface mobile | React Native |
| Plataforma de desenvolvimento | Expo (SDK 55) |
| Roteamento | Expo Router |
| Linguagem | TypeScript |
| Backend / banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth + MFA (TOTP) |
| Armazenamento de arquivos | Supabase Storage |
| Build de produção | EAS Build |