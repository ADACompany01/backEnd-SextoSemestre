*** Settings ***
Documentation     Testes locais de API com Robot Framework e RequestsLibrary.
Resource          ../resources/api_keywords.robot
Suite Setup       Criar Sessao Da Api

*** Test Cases ***
Chatbot Deve Retornar Arvore De Decisao
    [Documentation]    Valida endpoint publico GET /api/chatbot/tree.
    ${response}=    GET Publico Deve Retornar Sucesso    /chatbot/tree
    ${body}=    Set Variable    ${response.json()}
    Resposta Deve Ter Chave    ${body}    statusCode
    Resposta Deve Ter Chave    ${body}    data
    ${data}=    Get From Dictionary    ${body}    data
    Resposta Deve Ter Chave    ${data}    rootNodeId
    Resposta Deve Ter Chave    ${data}    nodes

Chatbot Deve Processar Opcao Do Usuario
    [Documentation]    Valida endpoint publico POST /api/chatbot/message.
    &{payload}=    Create Dictionary    nodeId=inicio    optionId=site
    ${response}=    POST Publico Deve Retornar Sucesso    /chatbot/message    ${payload}
    ${body}=    Set Variable    ${response.json()}
    Resposta Deve Ter Chave    ${body}    statusCode
    Resposta Deve Ter Chave    ${body}    data
    ${data}=    Get From Dictionary    ${body}    data
    Resposta Deve Ter Chave    ${data}    node
