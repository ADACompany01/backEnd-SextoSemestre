# Plano de Testes — ADA Company

## 1. Objetivo do Teste

Verificar que os requisitos funcionais e não funcionais do sistema ADA Company são atendidos de forma confiável, garantindo qualidade nos fluxos críticos de negócio (cadastro de clientes, ciclo de vida das solicitações, geração de orçamentos e assinatura de contratos), além de assegurar que a pipeline de CI/CD execute os testes automaticamente em cada push.

---

## 2. Itens a Serem Testados

### Requisitos Funcionais (RF)

| ID   | Requisito                                               | Módulo             |
|------|---------------------------------------------------------|--------------------|
| RF01 | Cadastro de cliente com hashing de senha                | Cliente            |
| RF02 | Bloqueio de e-mail duplicado no cadastro                | Cliente            |
| RF03 | Criação de solicitação com status inicial PENDENTE      | Solicitação        |
| RF04 | Atualização de status da solicitação                    | Solicitação        |
| RF05 | Geração automática de orçamento a partir de solicitação | Orçamento          |
| RF06 | Cálculo de validade do orçamento (30 dias)              | Orçamento          |
| RF07 | Criação de contrato a partir de orçamento existente     | Contrato           |
| RF08 | Assinatura digital de contrato                          | Contrato           |
| RF09 | Validação de relacionamentos (FK) antes de criação      | Geral              |
| RF10 | Valor base por tipo de pacote (A=1000, AA=1500, AAA=2000)| Solicitação/Pacote |

### Requisitos Não Funcionais (RNF)

| ID    | Requisito                                               | Critério               |
|-------|---------------------------------------------------------|------------------------|
| RNF01 | Cobertura mínima de testes de 80%                       | Jest coverage ≥ 80%    |
| RNF02 | Execução automatizada a cada push via GitHub Actions    | Pipeline verde         |
| RNF03 | Senhas nunca armazenadas em texto puro                  | bcrypt hash verificado |
| RNF04 | Respostas de erro semânticas (HTTP 404, 409, 400, 500)  | Exceções corretas      |
| RNF05 | Tempo de execução dos testes unitários < 30 segundos    | Jest timer             |

---

## 3. Estratégia de Teste

### 3.1 Abordagem

- **Testes Unitários (Jest)**: Foco nos casos de uso (`use-cases`), que concentram 100% da lógica de negócio. Repositórios são substituídos por mocks. Meta: ≥ 80% de cobertura de linhas, funções, branches e statements.
- **Caixa Preta (Partição de Equivalência + Análise de Valor Limite)**: Aplicada sobre as entradas dos use-cases sem conhecimento de implementação. Classifica entradas em partições válidas e inválidas e verifica valores nos limites.
- **Máquina de Estados (Solicitação)**: Garante que todos os estados, transições e caminhos do fluxo de solicitação sejam exercitados.

### 3.2 Técnicas Utilizadas

| Técnica                        | Onde aplica                              |
|--------------------------------|------------------------------------------|
| Partição de Equivalência       | CreateSolicitacao, CreateCliente, CreateOrcamento |
| Análise de Valor Limite        | Valor base por tipo de pacote (A/AA/AAA), validade de 30 dias |
| Cobertura de Estados           | Solicitação (5 estados)                  |
| Cobertura de Transições        | Solicitação (6 transições)               |
| Cobertura de Caminhos          | Solicitação (4 caminhos principais)      |

### 3.3 Ferramentas

| Ferramenta         | Finalidade                            |
|--------------------|---------------------------------------|
| Jest + ts-jest     | Testes unitários e cobertura          |
| GitHub Actions     | CI/CD automatizado em cada push       |
| ESLint             | Qualidade de código                   |
| Docker             | Ambiente padronizado de execução      |

---

## 4. Critérios de Entrada e Saída

### 4.1 Critérios de Entrada (início dos testes)

- Código-fonte commitado no repositório GitHub
- Dependências instaladas (`npm install --legacy-peer-deps`)
- Arquivo `.env` ou variáveis de ambiente configuradas
- Pipeline de CI disponível (GitHub Actions habilitado)

### 4.2 Critérios de Saída (conclusão dos testes)

- Todos os testes unitários passando (`npm test` verde)
- Cobertura ≥ 80% em todas as métricas (branches, functions, lines, statements)
- Pipeline verde em cada push (sem falhas no job `build_and_test_backend`)
- Zero erros de lint (`npm run lint:check` verde)
- Relatório de cobertura publicado como artefato no GitHub Actions

---

## 5. Recursos Necessários

| Recurso              | Descrição                                    |
|----------------------|----------------------------------------------|
| Node.js 20+          | Runtime JavaScript/TypeScript                |
| Jest 29+             | Framework de testes unitários                |
| ts-jest              | Suporte a TypeScript no Jest                 |
| GitHub Actions       | Plataforma de CI/CD                          |
| Repositório GitHub   | Versionamento e pipeline                     |
| Docker               | Ambiente isolado (opcional para testes)      |
| VS Code / IDE        | Desenvolvimento e execução local             |

---

## 6. Cronograma Estimado

| Atividade                                  | Prazo estimado |
|--------------------------------------------|----------------|
| Elaboração do plano de testes              | 1 dia          |
| Identificação e mapeamento de requisitos   | 1 dia          |
| Escrita dos casos de teste (caixa preta)   | 2 dias         |
| Modelagem do diagrama de estados (UML)     | 1 dia          |
| Escrita dos casos de teste de estados      | 1 dia          |
| Automação dos testes com Jest              | 2 dias         |
| Configuração/validação da pipeline CI/CD   | 1 dia          |
| Revisão e aprovação                        | 1 dia          |
| **Total**                                  | **10 dias**    |

---

## 7. Papéis Envolvidos no Processo de Teste

| Papel                  | Responsabilidade                                                                      |
|------------------------|---------------------------------------------------------------------------------------|
| **Gerente de Testes**  | Elabora e aprova o plano de testes, coordena esforços, reporta resultados ao professor |
| **Testador**           | Escreve e executa os casos de teste (manuais e automatizados)                         |
| **Desenvolvedor**      | Implementa os casos de uso, corrige defeitos apontados pelos testes                   |
| **Revisor de Código**  | Revisa pull requests, garante que a pipeline passe antes do merge                     |
| **DevOps**             | Configura e mantém a pipeline de CI/CD no GitHub Actions                              |

---

## 8. Técnica de Caixa Preta — Partição de Equivalência

### 8.1 CreateSolicitacaoUseCase

#### Partições

| ID Partição | Campo        | Classe     | Valores                             | Resultado Esperado          |
|-------------|--------------|------------|-------------------------------------|-----------------------------|
| PE-SOL-01   | id_cliente   | Válida     | ID de cliente existente no banco    | Solicitação criada (status PENDENTE) |
| PE-SOL-02   | id_cliente   | Inválida   | ID inexistente                      | NotFoundException (404)     |
| PE-SOL-03   | tipo_pacote  | Válida (A) | `'A'`                               | Solicitação criada          |
| PE-SOL-04   | tipo_pacote  | Válida (AA)| `'AA'`                              | Solicitação criada          |
| PE-SOL-05   | tipo_pacote  | Válida (AAA)| `'AAA'`                            | Solicitação criada          |
| PE-SOL-06   | site         | Válida     | URL bem formada (`https://...`)     | Solicitação criada          |

### 8.2 CreateClienteUseCase

| ID Partição | Campo   | Classe    | Valores                            | Resultado Esperado      |
|-------------|---------|-----------|------------------------------------|-------------------------|
| PE-CLI-01   | email   | Válida    | E-mail único não cadastrado        | Cliente criado          |
| PE-CLI-02   | email   | Inválida  | E-mail já cadastrado               | HttpException (409)     |
| PE-CLI-03   | db      | Inválida  | Falha de banco de dados            | HttpException (500)     |
| PE-CLI-04   | senha   | Válida    | Qualquer string                    | Senha armazenada com hash|

### 8.3 CreateOrcamentoUseCase

| ID Partição | Campo      | Classe   | Valores                                | Resultado Esperado           |
|-------------|------------|----------|----------------------------------------|------------------------------|
| PE-ORC-01   | id_pacote  | Válida   | Pacote existente, sem orçamento prévio | Orçamento criado             |
| PE-ORC-02   | id_pacote  | Inválida | Pacote inexistente                     | NotFoundException (404)      |
| PE-ORC-03   | id_pacote  | Inválida | Pacote com orçamento já criado         | ConflictException (409)      |

### 8.4 UpdateSolicitacaoUseCase

| ID Partição | Campo          | Classe   | Valores                          | Resultado Esperado      |
|-------------|----------------|----------|----------------------------------|-------------------------|
| PE-UPD-01   | id_solicitacao | Válida   | ID de solicitação existente      | Atualização realizada   |
| PE-UPD-02   | id_solicitacao | Inválida | ID inexistente                   | NotFoundException (404) |
| PE-UPD-03   | affectedCount  | Inválida | Update afeta 0 linhas            | NotFoundException (404) |

---

## 9. Análise de Valor Limite — Valor Base por Tipo de Pacote

Para `CreateOrcamentoFromSolicitacaoUseCase`, os valores base são:
- Tipo A → R$ 1.000,00 (limite inferior válido)
- Tipo AA → R$ 1.500,00 (valor médio)
- Tipo AAA → R$ 2.000,00 (limite superior válido)
- Tipo desconhecido → R$ 1.500,00 (fallback, valor padrão)

| ID      | Tipo Pacote | Valor Esperado | Tipo de Limite |
|---------|-------------|----------------|----------------|
| VL-01   | `'A'`       | 1000           | Limite inferior|
| VL-02   | `'AA'`      | 1500           | Valor central  |
| VL-03   | `'AAA'`     | 2000           | Limite superior|
| VL-04   | `'ZZ'`      | 1500           | Fora do limite (default) |
| VL-05   | Validade    | hoje + 30 dias | Limite temporal|

---

## 10. Tabela de Execução dos Testes (Caixa Preta)

| ID Caso | Caso de Teste                                      | Entrada                                         | Resultado Esperado          | Status  |
|---------|----------------------------------------------------|-------------------------------------------------|-----------------------------|---------|
| TC-CB-01| Criar solicitação com cliente válido               | id_cliente existente, tipo_pacote='AA'          | Retorna solicitação criada  | PASSOU  |
| TC-CB-02| Criar solicitação com cliente inexistente          | id_cliente inexistente                          | NotFoundException           | PASSOU  |
| TC-CB-03| Criar solicitação tipo pacote A                    | tipo_pacote='A', cliente válido                 | status='PENDENTE'           | PASSOU  |
| TC-CB-04| Criar solicitação tipo pacote AA                   | tipo_pacote='AA', cliente válido                | status='PENDENTE'           | PASSOU  |
| TC-CB-05| Criar solicitação tipo pacote AAA                  | tipo_pacote='AAA', cliente válido               | status='PENDENTE'           | PASSOU  |
| TC-CB-06| Cadastrar cliente com e-mail único                 | email único, senha, cnpj                        | Cliente criado, senha hash  | PASSOU  |
| TC-CB-07| Cadastrar cliente com e-mail duplicado             | email já cadastrado                             | HttpException (409)         | PASSOU  |
| TC-CB-08| Cadastrar cliente com falha de banco               | findByEmail lança exceção                       | HttpException (500)         | PASSOU  |
| TC-CB-09| Criar orçamento para pacote existente              | id_pacote existente, sem orçamento prévio       | Orçamento criado            | PASSOU  |
| TC-CB-10| Criar orçamento com pacote inexistente             | id_pacote inexistente                           | NotFoundException           | PASSOU  |
| TC-CB-11| Criar orçamento duplicado para mesmo pacote        | id_pacote com orçamento existente               | ConflictException           | PASSOU  |
| TC-CB-12| Validade do orçamento = hoje + 30 dias             | data_orcamento = 2026-04-01                     | data_validade = 2026-05-01  | PASSOU  |
| TC-CB-13| Valor base tipo A                                  | tipo_pacote='A', sem valor informado            | valor_orcamento = 1000      | PASSOU  |
| TC-CB-14| Valor base tipo AA                                 | tipo_pacote='AA', sem valor informado           | valor_orcamento = 1500      | PASSOU  |
| TC-CB-15| Valor base tipo AAA                                | tipo_pacote='AAA', sem valor informado          | valor_orcamento = 2000      | PASSOU  |
| TC-CB-16| Valor base tipo desconhecido                       | tipo_pacote='ZZ', pacote não encontrado         | valor_orcamento = 1500      | PASSOU  |
| TC-CB-17| Atualizar solicitação existente                    | id válido, update retorna 1 linha afetada       | Linha atualizada retornada  | PASSOU  |
| TC-CB-18| Atualizar solicitação inexistente                  | id inválido                                     | NotFoundException           | PASSOU  |
| TC-CB-19| Atualizar solicitação com 0 linhas afetadas        | update retorna [0, []]                          | NotFoundException           | PASSOU  |

---

## 11. Diagrama UML de Estados — Solicitação

```
                    ┌─────────────────┐
                    │    [inicial]    │
                    └────────┬────────┘
                             │ criar solicitação
                             ▼
                    ┌─────────────────┐
              ┌────▶│    PENDENTE     │────────────────────┐
              │     └────────┬────────┘                    │
              │              │ iniciar análise             │ cancelar
              │              ▼                             │
              │     ┌─────────────────┐                    │
              │     │   EM_ANALISE    │────────────────────┤
              │     └────────┬────────┘                    │ cancelar
              │              │ criar orçamento             │
              │              ▼                             │
              │     ┌─────────────────┐                    │
              │     │ORCAMENTO_CRIADO │────────────────────┤
              │     └────────┬────────┘                    │ rejeitar
              │              │ aprovar orçamento           │
              │              ▼                             ▼
              │     ┌─────────────────┐         ┌─────────────────┐
              │     │ORCAMENTO_APROVADO│         │   CANCELADA     │
              │     └─────────────────┘         └─────────────────┘
              │
              └─────── CreateSolicitacaoUseCase define status inicial
```

### 11.1 Casos de Teste — Cobertura de Estados

| ID       | Estado Alvo        | Ação                                             | Resultado Esperado                  |
|----------|--------------------|--------------------------------------------------|-------------------------------------|
| TC-EST-01| PENDENTE           | CreateSolicitacaoUseCase.execute()               | status = 'PENDENTE'                 |
| TC-EST-02| EM_ANALISE         | UpdateSolicitacaoUseCase com status='EM_ANALISE' | Retorna status atualizado           |
| TC-EST-03| ORCAMENTO_CRIADO   | CreateOrcamentoFromSolicitacaoUseCase.execute()  | status = 'ORCAMENTO_CRIADO'         |
| TC-EST-04| ORCAMENTO_APROVADO | UpdateSolicitacaoUseCase com status='ORCAMENTO_APROVADO' | Retorna status atualizado  |
| TC-EST-05| CANCELADA          | UpdateSolicitacaoUseCase com status='CANCELADA'  | Retorna status atualizado           |

### 11.2 Casos de Teste — Cobertura de Transições

| ID       | De                | Para               | Ação                                          | Resultado Esperado               |
|----------|-------------------|--------------------|-----------------------------------------------|----------------------------------|
| TC-TR-01 | [inicial]         | PENDENTE           | Criar solicitação                             | status = 'PENDENTE'              |
| TC-TR-02 | PENDENTE          | EM_ANALISE         | Atualizar status para EM_ANALISE              | status = 'EM_ANALISE' salvo      |
| TC-TR-03 | EM_ANALISE        | ORCAMENTO_CRIADO   | Criar orçamento a partir da solicitação       | status = 'ORCAMENTO_CRIADO'      |
| TC-TR-04 | ORCAMENTO_CRIADO  | ORCAMENTO_APROVADO | Atualizar status para ORCAMENTO_APROVADO      | status = 'ORCAMENTO_APROVADO'    |
| TC-TR-05 | PENDENTE          | CANCELADA          | Cancelar solicitação antes da análise         | status = 'CANCELADA'             |
| TC-TR-06 | ORCAMENTO_CRIADO  | CANCELADA          | Rejeitar orçamento                            | status = 'CANCELADA'             |

### 11.3 Casos de Teste — Cobertura de Caminhos

| ID         | Caminho                                                             | Resultado Esperado                               |
|------------|---------------------------------------------------------------------|--------------------------------------------------|
| TC-PATH-01 | PENDENTE → EM_ANALISE → ORCAMENTO_CRIADO → ORCAMENTO_APROVADO       | Fluxo feliz completo bem-sucedido                |
| TC-PATH-02 | PENDENTE → CANCELADA                                                | Cancelamento antecipado (antes da análise)       |
| TC-PATH-03 | PENDENTE → EM_ANALISE → CANCELADA                                   | Cancelamento durante a análise                   |
| TC-PATH-04 | PENDENTE → EM_ANALISE → ORCAMENTO_CRIADO → CANCELADA                | Rejeição do orçamento pelo cliente               |

---

## 12. Tabela de Execução — Testes de Estados

| ID         | Caso de Teste                              | Status  |
|------------|--------------------------------------------|---------|
| TC-EST-01  | Solicitação criada com estado PENDENTE     | PASSOU  |
| TC-EST-02  | Transição para EM_ANALISE                  | PASSOU  |
| TC-EST-03  | Transição para ORCAMENTO_CRIADO            | PASSOU  |
| TC-EST-04  | Transição para ORCAMENTO_APROVADO          | PASSOU  |
| TC-EST-05  | Transição para CANCELADA                   | PASSOU  |
| TC-TR-01   | [inicial] → PENDENTE                       | PASSOU  |
| TC-TR-02   | PENDENTE → EM_ANALISE                      | PASSOU  |
| TC-TR-03   | EM_ANALISE → ORCAMENTO_CRIADO              | PASSOU  |
| TC-TR-04   | ORCAMENTO_CRIADO → ORCAMENTO_APROVADO      | PASSOU  |
| TC-TR-05   | PENDENTE → CANCELADA                       | PASSOU  |
| TC-TR-06   | ORCAMENTO_CRIADO → CANCELADA               | PASSOU  |
| TC-PATH-01 | Caminho feliz completo                     | PASSOU  |
| TC-PATH-02 | Cancelamento antecipado                    | PASSOU  |
| TC-PATH-03 | Cancelamento durante análise               | PASSOU  |
| TC-PATH-04 | Rejeição do orçamento                      | PASSOU  |
