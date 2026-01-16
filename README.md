# 🔐 Cryto - MD5 Crypto API

> API intermediaria para generar hashes MD5 para n8n
>
> [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
> [![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen)]()
> [![Express.js](https://img.shields.io/badge/Express.js-4.18.2-blue)]()
>
> ## 📋 Descripción
>
> **Cryto** es una API REST construida con Express.js que proporciona endpoints para generar hashes criptográficos MD5. Está diseñada específicamente como intermediaria para ser integrada con **n8n** (plataforma de automatización de flujos de trabajo), pero puede ser utilizada por cualquier cliente REST.
>
> La API incluye características como CORS habilitado, validación robusta de parámetros, logs de debugging y un endpoint keep-alive para mantener el servicio activo en plataformas como Render.
>
> ## 🚀 Características
>
> - ✅ Generación de hashes MD5 mediante dos métodos (GET y POST)
> - ✅ CORS habilitado para acceso cross-origin
> - ✅ Validación robusta de parámetros
> - ✅ Endpoint keep-alive para evitar que el servicio se duerma
> - ✅ Health check endpoint
> - ✅ Logging de debugging
> - ✅ Manejo de errores con respuestas JSON consistentes
> - ✅ Timestamps en todas las respuestas
>              
>   ## 📦 Requisitos
>              
>   - **Node.js** >= 18.0.0
>   - **npm** o **yarn**
>                  
>   ## 🔧 Instalación
>                  
>   1. Clona el repositorio:
>   ```bash
>      git clone https://github.com/CreativityTech-co/Cryto.git
>      cd Cryto
>   ```
>
>    2. Instala las dependencias:
>     ```bash
>      npm install
>      ```
>
>    3. Configura las variables de entorno (opcional):
>     ```bash
>      # Por defecto, el puerto es 3000
>      export PORT=3000
>      ```
>
> ## 🚀 Uso
>
> ### Iniciar el servidor
>
> **Modo producción:**
> ```bash
> npm start
> ```
>
> **Modo desarrollo (con auto-reinicio):**
> ```bash
> npm run dev
> ```
>
> El servidor estará disponible en `http://localhost:3000`
>
> ## 📡 API Endpoints
>
> ### 1. Health Check
> **GET** `/`
>
> Verifica el estado de la API y lista los endpoints disponibles.
>
> **Respuesta:**
> ```json
> {
>   "status": "ok",
>   "message": "Crypto API running",
>   "uptime": 125.43,
>   "endpoints": {
>     "/hash/md5": "Generate MD5 hash (GET with query params)",
>     "/hash/md5/post": "Generate MD5 hash (POST with body)",
>     "/keepalive": "Keep service alive"
>   }
> }
> ```
>
> ### 2. Generar Hash MD5 (GET)
> **GET** `/hash/md5`
>
> Genera un hash MD5 concatenando `token` y `accesskey`.
>
> **Parámetros de consulta:**
> | Parámetro | Tipo | Requerido | Descripción |
> |-----------|------|-----------|-------------|
> | `token` | string | Sí | Token a hashear |
> | `accesskey` | string | Sí | Clave de acceso a concatenar |
>
> **Ejemplo de solicitud:**
> ```bash
> curl "http://localhost:3000/hash/md5?token=mytoken&accesskey=mykey"
> ```
>
> **Respuesta exitosa (200):**
> ```json
> {
>   "success": true,
>   "hash": "5d41402abc4b2a76b9719d911017c592",
>   "timestamp": "2026-01-15T16:30:45.123Z"
> }
> ```
>
> **Respuesta con error (400):**
> ```json
> {
>   "success": false,
>   "error": "Missing required query param: token"
> }
> ```
>
> ### 3. Generar Hash MD5 (POST)
> **POST** `/hash/md5/post`
>
> Alternativa POST para generar hashes MD5. Útil para cadenas largas o datos sensibles.
>
> **Body (JSON):**
> ```json
> {
>   "token": "mytoken",
>   "accesskey": "mykey"
> }
> ```
>
> **Ejemplo de solicitud:**
> ```bash
> curl -X POST http://localhost:3000/hash/md5/post \
>   -H "Content-Type: application/json" \
>   -d '{
>     "token": "mytoken",
>     "accesskey": "mykey"
>   }'
> ```
>
> **Respuesta exitosa (200):**
> ```json
> {
>   "success": true,
>   "hash": "5d41402abc4b2a76b9719d911017c592",
>   "timestamp": "2026-01-15T16:30:45.123Z"
> }
> ```
>
> **Respuesta con error (400):**
> ```json
> {
>   "success": false,
>   "error": "Missing required fields: token and accesskey"
> }
> ```
>
> ### 4. Keep-Alive
> **GET** `/keepalive`
>
> Endpoint para mantener el servicio activo. Útil cuando se despliega en plataformas que ponen en sleep servicios inactivos (ej: Render).
>
> **Respuesta:**
> ```json
> {
>   "status": "alive",
>   "uptime": 245.67,
>   "lastRequest": "2026-01-15T16:35:22.456Z"
> }
> ```
>
> ## 🔌 Integración con n8n
>
> Para integrar Cryto con n8n, utiliza el nodo **HTTP Request**:
>
> 1. **Método:** GET o POST (según prefieras)
> 2. **URL:** `http://tu-dominio:puerto/hash/md5` o `/hash/md5/post`
> 3. **Parámetros:**
> 4.    - `token`: El valor a hashear
>       - `accesskey`: La clave de acceso
> 5. **Headers (POST):** `Content-Type: application/json`
>                   
> 6. ### Ejemplo en n8n (GET):
> ```javascript
> {{ $request(
> 'http://localhost:3000/hash/md5?token=' +
> encodeURIComponent(token) +
> '&accesskey=' +
> encodeURIComponent(accesskey)
> ).json() }}
> ```
>
> ## 📦 Dependencias
>
> ```json
> {
>   "express": "^4.18.2",      // Framework web
>   "crypto-js": "^4.2.0",     // Librería de criptografía
>   "cors": "^2.8.5"           // CORS middleware
> }
> ```
>
> **Dependencias de desarrollo:**
> ```json
> {
>   "nodemon": "^3.0.2"  // Auto-reinicio durante desarrollo
> }
> ```
>
> ## 🛠️ Scripts
>
> ```bash
> npm start      # Inicia el servidor en modo producción
> npm run dev    # Inicia el servidor con nodemon para desarrollo
> ```
>
> ## 📝 Estructura del Proyecto
>
> ```
> Cryto/
> ├── server.js              # Archivo principal de la aplicación
> ├── package.json           # Configuración del proyecto
> ├── package-lock.json      # Lock file de dependencias
> ├── .gitignore            # Archivos a ignorar en git
> └── README.md             # Este archivo
> ```
>
> ## 🌍 Despliegue
>
> ### Render.com
>
> 1. Conecta tu repositorio GitHub a Render
> 2. Crea un nuevo **Web Service**
> 3. Configura:
> 4.    - **Build Command:** `npm install`
>       - **Start Command:** `npm start`
>       - **Environment:** Node
> 5. Añade un cron job para el keep-alive:
>    ```
>    */10 * * * * curl https://tu-servicio.onrender.com/keepalive
>    ```
>
>
> ### Docker
>
> ```dockerfile
> FROM node:18-alpine
>
> WORKDIR /app
>
> COPY package*.json ./
> RUN npm ci --only=production
>
> COPY server.js .
>
> EXPOSE 3000
>
> CMD ["npm", "start"]
> ```
>
> ## 🔒 Seguridad
>
> ⚠️ **Nota importante:** MD5 **no es criptográficamente seguro** para nuevas aplicaciones. Se recomienda:
>
> - Usar MD5 solo cuando es requerido por sistemas legados o integraciones específicas
> - - Nunca usar MD5 para almacenar contraseñas
> - - Para nuevas aplicaciones, considera usar SHA-256 o SHA-512
>    
>  ## 🐛 Logs y Debugging
>    
>  El servidor registra información útil en consola:
>    
>   - ```
>     [2026-01-15T16:30:45.123Z] Hash request - Token length: 10, AccessKey: myke...
>     ```
>
>   Para desactivar logs en producción, comenta la línea `console.log()` en `server.js`.
>
> ## 📄 Licencia
>
>   Este proyecto está bajo licencia **MIT**. Ver archivo [LICENSE](LICENSE) para más detalles.
>
> ## 👨‍💻 Autor
>
> **CREATIVITY TECH** - [GitHub](https://github.com/CreativityTech-co)
>
> ## 🤝 Contribuciones
>
> Las contribuciones son bienvenidas. Por favor:
>
> 1. Fork el proyecto
> 2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
> 3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
> 4. Push a la rama (`git push origin feature/AmazingFeature`)
> 5. Abre un Pull Request
>
> ## 📞 Soporte
>
> Si encuentras problemas o tienes sugerencias, abre un issue en el repositorio.
>
> ## 🔄 Changelog
>
> ### v1.0.0 (2026-01-15)
> - ✨ Lanzamiento inicial
> - ✨ Endpoints GET y POST para generación de hashes MD5
> - ✨ Endpoint keep-alive para mantener servicio activo
> - ✨ Health check endpoint
> - ✨ CORS habilitado
> - ✨ Validación robusta de parámetros
>
> ---
>
> **Creado con ❤️ por CREATIVITY TECH**
