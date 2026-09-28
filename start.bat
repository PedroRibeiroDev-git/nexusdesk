@echo off
setlocal
where docker >nul 2>nul
if errorlevel 1 (
  echo Docker nao foi encontrado. Instale ou abra o Docker Desktop e tente novamente.
  pause
  exit /b 1
)

echo Iniciando NexusDesk...
docker compose up --build -d
if errorlevel 1 (
  echo Falha ao iniciar os containers.
  pause
  exit /b 1
)

echo.
echo NexusDesk iniciado em: http://localhost:8088
echo Para ver logs: docker compose logs -f
pause
