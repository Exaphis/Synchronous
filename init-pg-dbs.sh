#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER django WITH PASSWORD '${DJANGO_PASSWORD}';
    ALTER ROLE django SET client_encoding TO 'utf8';
    ALTER ROLE django SET default_transaction_isolation TO 'read committed';
    ALTER ROLE django SET timezone TO 'UTC';
    CREATE DATABASE django;
    GRANT ALL PRIVILEGES ON DATABASE django TO django;
    CREATE USER etherpad WITH PASSWORD '${ETHERPAD_PASSWORD}';
    CREATE DATABASE etherpad;
    GRANT ALL PRIVILEGES ON DATABASE etherpad TO etherpad;
    CREATE USER spacedeck WITH PASSWORD '${SPACEDECK_PASSWORD}';
    CREATE DATABASE spacedeck;
    GRANT ALL PRIVILEGES ON DATABASE spacedeck TO spacedeck;
EOSQL
