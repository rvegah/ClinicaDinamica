# Docker - SI CLINICA FARMA
## Desarrollo
```bash
# Iniciar en modo desarrollo
docker-compose -f docker-compose.dev.yml up

# Detener
docker-compose -f docker-compose.dev.yml down

# Construir imagen
docker-compose build

# Iniciar contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reconstruir y reiniciar
docker-compose up -d --build