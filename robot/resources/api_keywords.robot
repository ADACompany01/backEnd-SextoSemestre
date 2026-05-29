*** Settings ***
Library    RequestsLibrary
Library    Collections
Resource   ../variables/api_variables.robot

*** Keywords ***
Criar Sessao Da Api
    Create Session    ada_api    ${API_BASE_URL}    timeout=${API_TIMEOUT}

GET Publico Deve Retornar Sucesso
    [Arguments]    ${endpoint}
    ${response}=    GET On Session    ada_api    ${endpoint}    expected_status=200
    RETURN    ${response}

POST Publico Deve Retornar Sucesso
    [Arguments]    ${endpoint}    ${payload}
    ${response}=    POST On Session    ada_api    ${endpoint}    json=${payload}    expected_status=201
    RETURN    ${response}

Resposta Deve Ter Chave
    [Arguments]    ${body}    ${chave}
    Dictionary Should Contain Key    ${body}    ${chave}
