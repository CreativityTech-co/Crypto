# 🔐 Guía de Seguridad - Crypto API

## 🛡️ Medidas de Seguridad Implementadas

### 1. **Autenticación API Key**

- Todas las operaciones de hash requieren una clave API válida
- Configurar la variable de entorno `API_KEY` con una clave fuerte
- Incluir en headers: `X-API-Key: tu-clave-api` o `Authorization: Bearer tu-clave-api`

### 2. **Rate Limiting**

- Máximo 100 requests por IP cada 15 minutos (configurable)
- Protección contra ataques de fuerza bruta y DDoS
- Headers de respuesta incluyen información sobre límites

### 3. **Validación de Entrada**

- Sanitización automática de parámetros
- Validación de longitud máxima (token: 1000 chars, accesskey: 100 chars)
- Escape de caracteres peligrosos

### 4. **Headers de Seguridad (Helmet.js)**

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options, X-Content-Type-Options
- Referrer Policy

### 5. **CORS Restrictivo**

- Solo orígenes específicos permitidos
- Configurar `ALLOWED_ORIGINS` para tu dominio
- Métodos HTTP limitados a GET y POST

### 6. **Logging de Seguridad**

- Registro de intentos de autenticación fallidos
- Logging de IPs sospechosas
- Detección de patrones anómalos

## 🔧 Configuración de Seguridad

### Variables de Entorno Requeridas

```bash
# .env
API_KEY=genera-una-clave-super-segura-aqui
ALLOWED_ORIGINS=https://tu-dominio.com,https://otro-dominio-permitido.com
NODE_ENV=production
ENABLE_REQUEST_LOGGING=false
```

### Generación de API Key Segura

```bash
# Método 1: OpenSSL
openssl rand -base64 32

# Método 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Método 3: Online (usar solo para desarrollo)
# https://www.uuidgenerator.net/api-key-generator
```

## 🚨 Alertas de Seguridad

### Configuración de Producción

1. ✅ Usar HTTPS siempre
2. ✅ Configurar API_KEY fuerte y única
3. ✅ Restringir ALLOWED_ORIGINS a dominios específicos
4. ✅ Configurar NODE_ENV=production
5. ✅ Deshabilitar logging detallado en producción
6. ✅ Usar proxy reverso (nginx/cloudflare)
7. ✅ Configurar firewall y monitoreo

### Indicadores de Compromiso

- Múltiples intentos de API key inválida
- Requests desde IPs no autorizadas
- Patrones de uso anómalos
- Parámetros de longitud sospechosa

## 📊 Monitoreo

### Logs a Vigilar

```bash
# Intentos de autenticación fallidos
grep "Invalid API key attempt" logs/

# Requests sospechosos
grep "SECURITY" logs/

# Errores de validación
grep "Validation failed" logs/
```

### Métricas Importantes

- Tasa de error de autenticación
- Número de IPs bloqueadas por rate limiting
- Tiempo de respuesta promedio
- Uso de CPU y memoria

## 🔄 Actualizaciones de Seguridad

### Dependencias a Monitorear

```bash
# Verificar vulnerabilidades
npm audit

# Actualizar dependencias
npm update

# Verificar dependencias obsoletas
npm outdated
```

### Rotación de Claves

- Cambiar API_KEY cada 90 días mínimo
- Notificar a clientes con anticipación
- Implementar sistema de múltiples claves si es necesario

## 🆘 Respuesta a Incidentes

### En caso de compromiso:

1. 🚨 Cambiar API_KEY inmediatamente
2. 🔍 Revisar logs de acceso
3. 🚫 Bloquear IPs sospechosas
4. 📧 Notificar a usuarios afectados
5. 🔄 Revisar y actualizar medidas de seguridad

### Contacto de Seguridad

- Email: security@tu-dominio.com
- Teléfono de emergencia: +1-xxx-xxx-xxxx
- Sistema de tickets: https://support.tu-dominio.com
