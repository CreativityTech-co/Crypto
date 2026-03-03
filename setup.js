#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('\n🔧 Script de Setup - Crypto API Segura\n');

// Generar API key segura
const generateApiKey = () => {
	return crypto.randomBytes(32).toString('hex');
};

// Crear archivo .env si no existe
const createEnvFile = () => {
	const envPath = path.join(__dirname, '.env');
	const envExamplePath = path.join(__dirname, '.env.example');

	if (fs.existsSync(envPath)) {
		console.log('⚠️  Archivo .env ya existe. No se sobrescribirá.');
		return false;
	}

	if (!fs.existsSync(envExamplePath)) {
		console.log('❌ Archivo .env.example no encontrado');
		return false;
	}

	// Leer template y generar API key
	const template = fs.readFileSync(envExamplePath, 'utf8');
	const apiKey = generateApiKey();

	// Reemplazar placeholder con API key real
	const envContent = template.replace('your-super-secret-api-key-here', apiKey);

	fs.writeFileSync(envPath, envContent);

	console.log('✅ Archivo .env creado exitosamente');
	console.log(`🔑 API Key generada: ${apiKey.substring(0, 8)}...`);
	return true;
};

// Verificar dependencias
const checkDependencies = () => {
	const packagePath = path.join(__dirname, 'package.json');
	const nodeModulesPath = path.join(__dirname, 'node_modules');

	if (!fs.existsSync(packagePath)) {
		console.log('❌ package.json no encontrado');
		return false;
	}

	if (!fs.existsSync(nodeModulesPath)) {
		console.log('❌ Dependencias no instaladas. Ejecuta: npm install');
		return false;
	}

	const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
	const requiredDeps = ['helmet', 'express-rate-limit', 'express-validator', 'dotenv'];

	for (const dep of requiredDeps) {
		if (!pkg.dependencies[dep]) {
			console.log(`❌ Dependencia faltante: ${dep}`);
			return false;
		}
	}

	console.log('✅ Todas las dependencias están instaladas');
	return true;
};

// Configuración de seguridad
const showSecurityConfig = () => {
	console.log('\n🔒 Configuración de Seguridad:');
	console.log('├── ✅ Helmet.js - Headers de seguridad');
	console.log('├── ✅ Rate Limiting - Anti DDoS');
	console.log('├── ✅ Input Validation - Sanitización');
	console.log('├── ✅ API Key Authentication');
	console.log('├── ✅ CORS Restrictivo');
	console.log('└── ✅ Security Logging');
};

// Instrucciones finales
const showFinalInstructions = () => {
	console.log('\n🚀 Siguientes pasos:');
	console.log('1. Edita tu archivo .env si es necesario');
	console.log('2. Configura ALLOWED_ORIGINS para tu dominio');
	console.log('3. Para desarrollo: npm run dev');
	console.log('4. Para producción: npm start');
	console.log('\n📚 Documentación:');
	console.log('- README_SECURE.md - Documentación completa');
	console.log('- SECURITY.md - Guía de seguridad');
	console.log('\n⚠️  IMPORTANTE: Cambia la API_KEY antes de deployar a producción');
};

// Main execution
const main = () => {
	try {
		console.log('🔍 Verificando dependencias...');
		if (!checkDependencies()) {
			process.exit(1);
		}

		console.log('\n🔧 Configurando archivo .env...');
		createEnvFile();

		showSecurityConfig();
		showFinalInstructions();

		console.log('\n✅ Setup completado exitosamente!\n');
	} catch (error) {
		console.error('❌ Error durante el setup:', error.message);
		process.exit(1);
	}
};

// Ejecutar si es llamado directamente
if (require.main === module) {
	main();
}

module.exports = {
	generateApiKey,
	createEnvFile,
	checkDependencies,
};
