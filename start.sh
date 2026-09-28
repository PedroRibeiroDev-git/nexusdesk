#!/usr/bin/env sh
set -eu

echo "Iniciando NexusDesk..."
docker compose up --build -d

echo ""
echo "NexusDesk iniciado em: http://localhost:8088"
echo "Use 'docker compose logs -f' para acompanhar os logs."
