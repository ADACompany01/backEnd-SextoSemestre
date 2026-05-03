-- Este script é executado APENAS na PRIMEIRA vez que o container do PostgreSQL é iniciado
-- com esta imagem ou um volume de dados vazio.

-- Cria um novo usuário para a aplicação se ele não existir
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'adaservicesteam') THEN
      CREATE USER adaservicesteam WITH PASSWORD 'Ada@123';
   END IF;
END
$do$;

-- Cria um novo banco de dados para a aplicação se ele não existir
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'adacompanydb') THEN
      CREATE DATABASE adacompanydb OWNER adaservicesteam;
   END IF;
END
$do$;

-- Concede todos os privilégios ao usuário da aplicação no banco de dados recém-criado
-- Note: Esta GRANT só funcionará se o DB foi criado ou se o usuário 'adaservicesteam' tem permissão para fazer GRANTs
-- E para o DB que o script está executando, que geralmente é 'postgres' por padrão antes do \c
-- Idealmente, GRANTs específicas para tabelas viriam depois do \c, ou seriam gerenciadas pelo ORM.
-- No contexto do docker-entrypoint-initdb.d, os comandos são executados no banco de dados "postgres"
-- a menos que seja um comando específico para conectar.
GRANT ALL PRIVILEGES ON DATABASE adacompanydb TO adaservicesteam;
