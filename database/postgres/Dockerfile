FROM postgres:17-alpine

COPY ./init.sql /docker-entrypoint-initdb.d/
COPY ./postgresql.conf /tmp/postgresql.conf
COPY ./pg_hba.conf /tmp/pg_hba.conf

# Script para aplicar configurações após inicialização do banco
RUN echo '#!/bin/bash' > /docker-entrypoint-initdb.d/01-setup-config.sh && \
    echo 'set -e' >> /docker-entrypoint-initdb.d/01-setup-config.sh && \
    echo 'echo "Aplicando configurações do PostgreSQL..."' >> /docker-entrypoint-initdb.d/01-setup-config.sh && \
    echo 'cp /tmp/postgresql.conf "$PGDATA/postgresql.conf"' >> /docker-entrypoint-initdb.d/01-setup-config.sh && \
    echo 'cp /tmp/pg_hba.conf "$PGDATA/pg_hba.conf"' >> /docker-entrypoint-initdb.d/01-setup-config.sh && \
    echo 'chmod 600 "$PGDATA/postgresql.conf" "$PGDATA/pg_hba.conf"' >> /docker-entrypoint-initdb.d/01-setup-config.sh && \
    echo 'echo "Configurações aplicadas com sucesso!"' >> /docker-entrypoint-initdb.d/01-setup-config.sh && \
    chmod +x /docker-entrypoint-initdb.d/01-setup-config.sh
