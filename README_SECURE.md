# 🔐 Cryto - Secure MD5 Crypto API

> API intermediaria **altamente segura** para generar hashes MD5 para n8n
>
> [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
> [![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen)]()
> [![Express.js](https://img.shields.io/badge/Express.js-4.18.2-blue)]()
> [![Security: Enhanced](https://img.shields.io/badge/Security-Enhanced-green)]()

## 📋 Descripción

**Cryto** es una API REST **altamente segura** construida con Express.js que proporciona endpoints para generar hashes criptográficos MD5. Diseñada específicamente como intermediaria para **n8n** (plataforma de automatización), pero funciona con cualquier cliente REST.

### 🔒 **Características de Seguridad Implementadas**

- ✅ **🔑 Autenticación API Key** - Protección contra acceso no autorizado
- ✅ **🛡️ Rate Limiting** - Anti DDoS y ataques de fuerza bruta
- ✅ **🔍 Validación Robusta** - Sanitización completa de entrada
- ✅ **🔐 Headers de Seguridad** - Helmet.js con CSP, HSTS
- ✅ **🌐 CORS Restrictivo** - Control granular de orígenes
- ✅ **📊 Logging de Seguridad** - Monitoreo de actividad sospechosa
- ✅ **⚡ Slow Down** - Ralentización progresiva de requests
- ✅ **🎯 Request IDs** - Trazabilidad completa de solicitudes

## 🚀 Instalación y Configuración

### 1. **Instalación**

```bash
git clone https://github.com/CreativityTech-co/Cryto.git
cd Cryto
npm install
```

### 2. **Configuración Inicial**

```bash
# Setup automático
npm run setup

# Editar configuración
nano .env
```

### 3. **Variables de Entorno Críticas**

```bash
# .env (OBLIGATORIO para producción)
API_KEY=tu-clave-api-super-segura-aqui           # ⚠️ REQUERIDO
ALLOWED_ORIGINS=https://tu-dominio.com           # Orígenes CORS
NODE_ENV=production                              # Entorno
ENABLE_REQUEST_LOGGING=false                     # Logs (false en prod)

# Configuración Rate Limiting
RATE_LIMIT_WINDOW_MS=900000                      # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100                      # Requests máximos
SLOW_DOWN_DELAY_AFTER=50                         # Después de N requests
SLOW_DOWN_DELAY_MS=1000                          # Delay en ms
```

### 4. **Generar API Key Segura**

```bash
# Método OpenSSL (recomendado)
openssl rand -base64 32

# Método Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 Uso

### **Scripts Disponibles**

```bash
npm start              # Producción
npm run dev            # Desarrollo con auto-reload
npm run prod           # Producción con NODE_ENV
npm run setup          # Configuración inicial
npm run security-check # Auditoría de dependencias
```

### ⚠️ **AUTENTICACIÓN OBLIGATORIA**

**Todos los endpoints de hash requieren API key:**

```bash
# Método 1: Header X-API-Key
curl -H "X-API-Key: tu-clave-api" \
  "http://localhost:3000/hash/md5?token=test&accesskey=key"

# Método 2: Authorization Bearer
curl -H "Authorization: Bearer tu-clave-api" \
  "http://localhost:3000/hash/md5?token=test&accesskey=key"
```

## 📡 API Reference

### 1. **Health Check** 🏥

```http
GET /
```

**✅ Sin autenticación requerida**

**Respuesta:**

```json
{
	"status": "ok",
	"message": "Crypto API running",
	"uptime": 125.43,
	"environment": "production",
	"security": {
		"helmet": "enabled",
		"rateLimit": "enabled",
		"cors": "restrictive",
		"authentication": "required"
	},
	"endpoints": {
		"/hash/md5": "Generate MD5 hash (GET) - Requires API key",
		"/hash/md5/post": "Generate MD5 hash (POST) - Requires API key",
		"/keepalive": "Keep service alive"
	}
}
```

### 2. **Hash MD5 (GET)** 🔐

```http
GET /hash/md5?token=VALUE&accesskey=VALUE
X-API-Key: your-api-key
```

**Parámetros:**
| Campo | Tipo | Max Length | Requerido | Descripción |
|-------|------|------------|-----------|-------------|
| `token` | string | 1000 chars | ✅ | Token a hashear |
| `accesskey` | string | 100 chars | ✅ | Clave de acceso |

**Ejemplo:**

```bash
curl -H "X-API-Key: abc123xyz" \
  "http://localhost:3000/hash/md5?token=mytoken&accesskey=mykey"
```

**Respuesta exitosa:**

```json
{
	"success": true,
	"hash": "5d41402abc4b2a76b9719d911017c592",
	"timestamp": "2026-03-03T16:30:45.123Z",
	"requestId": "a1b2c3d4"
}
```

**Errores comunes:**

```json
// 401 - Sin API key
{
  "success": false,
  "error": "API key required",
  "message": "Include X-API-Key header or Authorization: Bearer token"
}

// 400 - Validación fallida
{
  "success": false,
  "error": "Validation failed",
  "details": [{"field": "token", "message": "Token is required"}]
}

// 429 - Rate limit
{
  "success": false,
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": 15
}
```

### 3. **Hash MD5 (POST)** 🔒

```http
POST /hash/md5/post
Content-Type: application/json
X-API-Key: your-api-key

{
  "token": "mytoken",
  "accesskey": "mykey"
}
```

**Ejemplo:**

```bash
curl -X POST http://localhost:3000/hash/md5/post \
  -H "Content-Type: application/json" \
  -H "X-API-Key: abc123xyz" \
  -d '{"token": "mytoken", "accesskey": "mykey"}'
```

### 4. **Keep-Alive** 💓

```http
GET /keepalive
```

**✅ Sin autenticación requerida**

```json
{
	"status": "alive",
	"uptime": 245.67,
	"lastRequest": "2026-03-03T16:35:22.456Z",
	"environment": "production",
	"security": "enabled"
}
```

## 🔌 Integración con n8n

### Configuración en n8n:

```javascript
// HTTP Request Node
{
  "method": "POST",
  "url": "https://tu-api.com/hash/md5/post",
  "headers": {
    "Content-Type": "application/json",
    "X-API-Key": "{{$env.CRYPTO_API_KEY}}"
  },
  "body": {
    "token": "{{$json.token}}",
    "accesskey": "{{$json.accesskey}}"
  }
}
```

### Variables de Entorno n8n:

```bash
CRYPTO_API_KEY=tu-clave-api-secreta
CRYPTO_API_URL=https://tu-api.com
```

## 🔒 Seguridad Avanzada

### **Rate Limiting Inteligente**

- **Tier 1:** 100 requests/15min normal
- **Tier 2:** Después de 50 requests → Slowdown progresivo
- **Tier 3:** Después de 100 → Bloqueo temporal

### **Validación Multi-Capa**

1. **Autenticación:** API Key válida
2. **Sanitización:** Escape de caracteres peligrosos
3. **Validación:** Longitud y formato
4. **Rate Limiting:** Anti-abuso
5. **Logging:** Actividad sospechosa

### **Headers de Seguridad**

```http
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

## 🚀 Despliegue

### **Render.com (Recomendado)**

1. Fork/clone el repositorio
2. Conectar a Render
3. Configurar variables de entorno:
    ```
    API_KEY=tu-clave-super-secreta
    NODE_ENV=production
    ALLOWED_ORIGINS=https://tu-frontend.com
    ```
4. Deploy automático

### **Docker**

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

USER node
CMD ["npm", "start"]
```

### **Docker Compose**

```yaml
version: '3.8'
services:
    crypto-api:
        build: .
        ports:
            - '3000:3000'
        environment:
            - NODE_ENV=production
            - API_KEY=${API_KEY}
            - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
        restart: unless-stopped
```

## 📊 Monitoreo y Logs

### **Logs de Seguridad**

```bash
# Intentos de auth fallidos
grep "Invalid API key" logs/

# Rate limiting
grep "Rate limit" logs/

# Requests sospechosos
grep "SECURITY" logs/
```

### **Métricas Clave**

- Tasa de error de autenticación
- IPs bloqueadas por rate limiting
- Tiempo de respuesta promedio
- Uso de recursos del servidor

## 📦 Dependencias

### **Producción**

```json
{
	"express": "^4.18.2", // Web framework
	"crypto-js": "^4.2.0", // Cryptography
	"cors": "^2.8.5", // CORS handling
	"helmet": "^7.1.0", // Security headers
	"express-rate-limit": "^7.1.5", // Rate limiting
	"express-validator": "^7.0.1", // Input validation
	"dotenv": "^16.3.1", // Environment variables
	"express-slow-down": "^2.0.1" // Progressive delays
}
```

## ⚠️ Advertencias de Seguridad

### **MD5 Deprecation Notice**

> ⚠️ **IMPORTANTE:** MD5 no es criptográficamente seguro para nuevas aplicaciones. Usar solo cuando sea requerido por sistemas legados.

### **Producción Checklist**

- ✅ API_KEY fuerte y única (32+ caracteres)
- ✅ HTTPS obligatorio
- ✅ CORS restrictivo a dominios específicos
- ✅ NODE_ENV=production
- ✅ Logging deshabilitado o mínimo
- ✅ Monitoreo activo de seguridad
- ✅ Firewall configurado
- ✅ Updates de seguridad regulares

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE)

## 👨‍💻 Contacto

- **Author:** CREATIVITY TECH
- **Security:** Ver [SECURITY.md](SECURITY.md)
- **Issues:** [GitHub Issues](https://github.com/CreativityTech-co/Cryto/issues)

---

> **⚡ Performance optimizada | 🔒 Seguridad enterprise | 🚀 Deploy ready**
