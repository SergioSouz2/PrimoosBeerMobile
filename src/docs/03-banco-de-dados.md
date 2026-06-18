# Estrutura do Banco de Dados — PrimoosBeerMobile

O banco de dados é gerenciado pelo Supabase (PostgreSQL). Abaixo estão as principais tabelas utilizadas pelo aplicativo.

## Tabela `users`

Armazena o perfil de cada usuário autenticado, vinculado ao sistema de autenticação do Supabase.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid | Identificador do usuário (vinculado ao `auth.users`) |
| `name` | text | Nome do usuário |
| `email` | text | E-mail do usuário |
| `role` | text | Papel do usuário: `admin` ou `user` |
| `avatar_url` | text | URL da foto de perfil (opcional) |

## Tabela `produtos`

Armazena o catálogo de produtos da distribuidora.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid | Identificador do produto |
| `nome` | text | Nome do produto |
| `preco` | numeric | Preço unitário |
| `estoque` | integer | Quantidade disponível em estoque |
| `foto` | text | URL da imagem do produto no Supabase Storage |
| `ativo` | boolean | Indica se o produto está disponível no catálogo (soft delete) |

## Tabela `pedidos`

Armazena os pedidos realizados, tanto pelo cliente quanto pelo administrador.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid | Identificador do pedido |
| `user_id` | uuid | Usuário que realizou o pedido |
| `status` | text | Situação do pedido: `pendente`, `preparando`, `enviado`, `entregue` ou `cancelado` |
| `total` | numeric | Valor total do pedido |
| `created_at` | timestamp | Data e hora de criação do pedido |

## Tabela `pedido_itens`

Armazena os itens que compõem cada pedido, em um relacionamento N:N entre `pedidos` e `produtos`.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid | Identificador do item |
| `pedido_id` | uuid | Referência ao pedido (FK → `pedidos.id`) |
| `produto_id` | uuid | Referência ao produto (FK → `produtos.id`) |
| `quantidade` | integer | Quantidade vendida desse produto no pedido |
| `preco_unitario` | numeric | Preço do produto no momento da venda |

## Relacionamentos

```
users (1) ──────< (N) pedidos
pedidos (1) ──────< (N) pedido_itens >────── (1) produtos
```

- Um usuário pode realizar **vários** pedidos;
- Um pedido pode conter **vários** itens (`pedido_itens`);
- Cada item de pedido referencia **um único** produto.

## Automação de regras de negócio no banco

### Trigger: `after_insert_pedido_itens`

Disparada automaticamente após a inserção de um registro em `pedido_itens`. Responsável por:

1. Subtrair a quantidade vendida do estoque do produto correspondente;
2. Verificar, na mesma operação, se havia estoque suficiente;
3. Bloquear a inserção (gerando exceção) caso o estoque seja insuficiente, impedindo que o pedido e seus itens sejam registrados com dados inconsistentes.

Essa abordagem garante **atomicidade**: a verificação de estoque e o decremento ocorrem na mesma instrução SQL, eliminando a possibilidade de duas vendas simultâneas concorrerem pelo mesmo estoque de forma inconsistente (*race condition*).

## Justificativa do uso de `ativo` em `produtos` (soft delete)

Como `pedido_itens.produto_id` referencia `produtos.id` por chave estrangeira, a exclusão física de um produto já vendido violaria a integridade referencial do banco (ou exigiria exclusão em cascata, apagando o histórico de vendas). A coluna `ativo` resolve esse problema sem comprometer a integridade dos dados históricos.