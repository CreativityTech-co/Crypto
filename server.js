const express = require('express');
const CryptoJS = require('crypto-js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Keep-alive endpoint para evitar que Render se duerma
let lastRequest = Date.now();
app.get('/keepalive', (req, res) => {
	lastRequest = Date.now();
	res.json({
		status: 'alive',
		uptime: process.uptime(),
		lastRequest: new Date(lastRequest).toISOString(),
	});
});

// Health check
app.get('/', (req, res) => {
	res.json({
		status: 'ok',
		message: 'Crypto API running',
		uptime: process.uptime(),
		endpoints: {
			'/hash/md5': 'Generate MD5 hash (GET with query params)',
			'/hash/md5/post': 'Generate MD5 hash (POST with body)',
			'/keepalive': 'Keep service alive',
		},
	});
});

// Endpoint GET con query params (tu versión actual)
app.get('/hash/md5', (req, res) => {
	try {
		lastRequest = Date.now();
		const { token, accesskey } = req.query;

		// Validación más robusta
		if (!token) {
			return res.status(400).json({
				success: false,
				error: 'Missing required query param: token',
			});
		}

		if (!accesskey) {
			return res.status(400).json({
				success: false,
				error: 'Missing required query param: accesskey',
			});
		}

		// Log para debugging (opcional, comenta en producción)
		console.log(
			`[${new Date().toISOString()}] Hash request - Token length: ${
				token.length
			}, AccessKey: ${accesskey.substring(0, 4)}...`,
		);

		const stringToHash = token + accesskey;
		const hash = CryptoJS.MD5(stringToHash).toString();

		res.json({
			success: true,
			hash: hash,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Hash generation error:', error);
		res.status(500).json({
			success: false,
			error: 'Hash generation failed',
			details: error.message,
		});
	}
});

// Endpoint POST alternativo (por si prefieres POST)
app.post('/hash/md5/post', (req, res) => {
	try {
		lastRequest = Date.now();
		const { token, accesskey } = req.body;

		if (!token || !accesskey) {
			return res.status(400).json({
				success: false,
				error: 'Missing required fields: token and accesskey',
			});
		}

		const stringToHash = token + accesskey;
		const hash = CryptoJS.MD5(stringToHash).toString();

		res.json({
			success: true,
			hash: hash,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Hash generation error:', error);
		res.status(500).json({
			success: false,
			error: 'Hash generation failed',
			details: error.message,
		});
	}
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		success: false,
		error: 'Endpoint not found',
		availableEndpoints: ['/hash/md5', '/hash/md5/post', '/keepalive'],
	});
});

app.listen(PORT, () => {
	console.log(`🚀 Crypto API running on port ${PORT}`);
	console.log(`📍 Keep-alive endpoint: http://localhost:${PORT}/keepalive`);
});
