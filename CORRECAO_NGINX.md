# Correção da Configuração do Nginx na AWS

## Problema Identificado

O nginx estava configurado com a barra final (`/`) no `proxy_pass`, o que fazia o nginx **remover o prefixo** `/api/mobile/` antes de encaminhar para o backend.

### Configuração ANTIGA (INCORRETA):
```nginx
location /api/mobile/ {
    proxy_pass http://127.0.0.1:3001/;  # ❌ Barra final remove o prefixo
}
```

**O que acontecia:**
- Frontend envia: `/api/mobile/lighthouse/analyze`
- Nginx remove `/api/mobile/` e encaminha: `/lighthouse/analyze`
- Backend recebe: `/lighthouse/analyze` 
- Backend procura: `/api/lighthouse/analyze` (com prefixo global `api`)
- ❌ Rota não encontrada!

### Configuração NOVA (CORRETA):
```nginx
location /api/mobile/ {
    proxy_pass http://127.0.0.1:3001;  # ✅ Sem barra final - preserva path completo
}
```

**O que acontece agora:**
- Frontend envia: `/api/mobile/lighthouse/analyze`
- Nginx preserva o path completo e encaminha: `/api/mobile/lighthouse/analyze`
- Backend recebe: `/api/mobile/lighthouse/analyze`
- NestJS remove prefixo global `api` e procura: `/mobile/lighthouse/analyze`
- ✅ Rota encontrada no controller `@Controller('mobile/lighthouse')`!

## Como Aplicar a Correção

1. **Edite o arquivo de configuração do nginx na AWS:**
   ```bash
   sudo nano /etc/nginx/sites-available/default
   # ou
   sudo nano /etc/nginx/conf.d/default.conf
   ```

2. **Substitua a configuração do bloco `/api/mobile/` por:**
   ```nginx
   location /api/mobile/ {
       proxy_pass http://127.0.0.1:3001;  # SEM barra final!
       
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       
       proxy_read_timeout 300s;
       proxy_connect_timeout 300s;
       proxy_send_timeout 300s;
   }
   ```

3. **IMPORTANTE: A ordem das localizações importa!**
   - `location /api/mobile/` deve vir **ANTES** de `location /api/`
   - Isso garante que requisições para `/api/mobile/` sejam capturadas pela primeira regra

4. **Teste a configuração:**
   ```bash
   sudo nginx -t
   ```

5. **Recarregue o nginx:**
   ```bash
   sudo systemctl reload nginx
   # ou
   sudo nginx -s reload
   ```

## Arquivo de Referência

O arquivo `nginx-aws.conf` contém a configuração completa e correta que pode ser usada como referência.

## Diferença Crítica

- **COM barra final (`/`)**: Nginx **remove** o prefixo do `location` antes de encaminhar
- **SEM barra final**: Nginx **preserva** o path completo antes de encaminhar

