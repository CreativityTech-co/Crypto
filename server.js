require('dotenv').config();
const express = require('express');
const CryptoJS = require('crypto-js');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { body, query, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security check for API_KEY in production
if (NODE_ENV === 'production' && (!API_KEY || API_KEY === 'your-super-secret-api-key-here')) {
	console.error('❌ SECURITY ERROR: API_KEY must be set in production environment');
	process.exit(1);
}

// Security middleware
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				scriptSrc: ["'self'"],
				imgSrc: ["'self'", 'data:', 'https:'],
			},
		},
		hsts: {
			maxAge: 31536000,
			includeSubDomains: true,
			preload: true,
		},
	}),
);

// Rate limiting
const limiter = rateLimit({
	windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
	max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
	message: {
		success: false,
		error: 'Too many requests from this IP, please try again later.',
		retryAfter: 15,
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Slow down repeated requests
const speedLimiter = slowDown({
	windowMs: 15 * 60 * 1000, // 15 minutos
	delayAfter: parseInt(process.env.SLOW_DOWN_DELAY_AFTER) || 50,
    delayMs: () => parseInt(process.env.SLOW_DOWN_DELAY_MS) || 1000, // Nueva sintaxis
    validate: {
        delayMs: false // Deshabilitar la advertencia
    }
	origin: function (origin, callback) {
		const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);

		if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
};

app.use(cors(corsOptions));
app.use(limiter);
app.use(speedLimiter);

// JSON body parser with size limit
app.use(
	express.json({
		limit: '10mb',
		verify: (req, res, buf) => {
			req.rawBody = buf;
		},
	}),
);

// URL encoded parser with size limit
app.use(
	express.urlencoded({
		extended: true,
		limit: '10mb',
	}),
);

// Security logging middleware
const securityLogger = (req, res, next) => {
	const timestamp = new Date().toISOString();
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
	const userAgent = req.headers['user-agent'] || 'Unknown';

	if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
		console.log(
			`[${timestamp}] ${req.method} ${req.url} - IP: ${ip} - UA: ${userAgent.substring(0, 100)}`,
		);
	}
	next();
};

app.use(securityLogger);

// API Key authentication middleware
const authenticateApiKey = (req, res, next) => {
	// Skip auth for health check endpoints in development
	if (NODE_ENV === 'development' && (req.path === '/' || req.path === '/keepalive')) {
		return next();
	}

	const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

	if (!apiKey) {
		return res.status(401).json({
			success: false,
			error: 'API key required',
			message: 'Include X-API-Key header or Authorization: Bearer token',
		});
	}

	if (apiKey !== API_KEY) {
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		console.warn(`[SECURITY] Invalid API key attempt from IP: ${ip}`);
		return res.status(401).json({
			success: false,
			error: 'Invalid API key',
		});
	}

	next();
};

// Validation middleware
const validateHashRequest = [
	body('token')
		.notEmpty()
		.withMessage('Token is required')
		.isLength({ min: 1, max: 1000 })
		.withMessage('Token must be between 1 and 1000 characters')
		.trim()
		.escape(),
	body('accesskey')
		.notEmpty()
		.withMessage('Access key is required')
		.isLength({ min: 1, max: 100 })
		.withMessage('Access key must be between 1 and 100 characters')
		.trim()
		.escape(),
];

const validateHashQueryRequest = [
	query('token')
		.notEmpty()
		.withMessage('Token is required')
		.isLength({ min: 1, max: 1000 })
		.withMessage('Token must be between 1 and 1000 characters')
		.trim()
		.escape(),
	query('accesskey')
		.notEmpty()
		.withMessage('Access key is required')
		.isLength({ min: 1, max: 100 })
		.withMessage('Access key must be between 1 and 100 characters')
		.trim()
		.escape(),
];

// Request validation result handler
const handleValidationErrors = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		console.warn(
			`[SECURITY] Validation failed for IP: ${ip} - Errors: ${JSON.stringify(errors.array())}`,
		);

		return res.status(400).json({
			success: false,
			error: 'Validation failed',
			details: errors.array().map((err) => ({
				field: err.path,
				message: err.msg,
			})),
		});
	}
	next();
};

let lastRequest = Date.now();
app.get('/keepalive', (req, res) => {
	lastRequest = Date.now();
	res.json({
		status: 'alive',
		uptime: process.uptime(),
		lastRequest: new Date(lastRequest).toISOString(),
		environment: NODE_ENV,
		security: 'enabled',
	});
});

// Health check
app.get('/', (req, res) => {
	res.json({
		status: 'ok',
		message: 'Crypto API running',
		uptime: process.uptime(),
		environment: NODE_ENV,
		security: {
			helmet: 'enabled',
			rateLimit: 'enabled',
			cors: 'restrictive',
			authentication: API_KEY ? 'required' : 'disabled',
		},
		endpoints: {
			'/hash/md5': 'Generate MD5 hash (GET with query params) - Requires API key',
			'/hash/md5/post': 'Generate MD5 hash (POST with body) - Requires API key',
			'/keepalive': 'Keep service alive',
		},
	});
});

app.get(
	'/hash/md5',
	authenticateApiKey,
	validateHashQueryRequest,
	handleValidationErrors,
	(req, res) => {
		try {
			lastRequest = Date.now();
			const { token, accesskey } = req.query;
			const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

			// Additional security: Check for suspicious patterns
			if (token.length > 1000 || accesskey.length > 100) {
				console.warn(`[SECURITY] Suspicious parameter length from IP: ${ip}`);
				return res.status(400).json({
					success: false,
					error: 'Parameter length exceeds maximum allowed',
				});
			}

			// Hash generation with input sanitization
			const stringToHash = String(token) + String(accesskey);
			const hash = CryptoJS.MD5(stringToHash).toString();

			// Security logging (without exposing sensitive data)
			if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
				console.log(
					`[${new Date().toISOString()}] Hash generated successfully - Token length: ${token.length}, IP: ${ip}`,
				);
			}

			res.json({
				success: true,
				hash: hash,
				timestamp: new Date().toISOString(),
				requestId: CryptoJS.MD5(Date.now() + Math.random())
					.toString()
					.substring(0, 8),
			});
		} catch (error) {
			const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			console.error(`[ERROR] Hash generation failed for IP: ${ip} - ${error.message}`);

			res.status(500).json({
				success: false,
				error: 'Hash generation failed',
				message: NODE_ENV === 'development' ? error.message : 'Internal server error',
				timestamp: new Date().toISOString(),
			});
		}
	},
);

app.post(
	'/hash/md5/post',
	authenticateApiKey,
	validateHashRequest,
	handleValidationErrors,
	(req, res) => {
		try {
			lastRequest = Date.now();
			const { token, accesskey } = req.body;
			const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

			// Additional security: Check for suspicious patterns
			if (token.length > 1000 || accesskey.length > 100) {
				console.warn(`[SECURITY] Suspicious parameter length from IP: ${ip}`);
				return res.status(400).json({
					success: false,
					error: 'Parameter length exceeds maximum allowed',
				});
			}

			// Hash generation with input sanitization
			const stringToHash = String(token) + String(accesskey);
			const hash = CryptoJS.MD5(stringToHash).toString();

			// Security logging (without exposing sensitive data)
			if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
				console.log(
					`[${new Date().toISOString()}] Hash generated successfully (POST) - Token length: ${token.length}, IP: ${ip}`,
				);
			}

			res.json({
				success: true,
				hash: hash,
				timestamp: new Date().toISOString(),
				requestId: CryptoJS.MD5(Date.now() + Math.random())
					.toString()
					.substring(0, 8),
			});
		} catch (error) {
			const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
			console.error(`[ERROR] Hash generation failed (POST) for IP: ${ip} - ${error.message}`);

			res.status(500).json({
				success: false,
				error: 'Hash generation failed',
				message: NODE_ENV === 'development' ? error.message : 'Internal server error',
				timestamp: new Date().toISOString(),
			});
		}
	},
);

// Global error handler
app.use((err, req, res, next) => {
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.error(`[ERROR] Global error handler - IP: ${ip} - ${err.message}`);

	// CORS error
	if (err.message.includes('CORS')) {
		return res.status(403).json({
			success: false,
			error: 'CORS policy violation',
			message: 'Origin not allowed',
		});
	}

	// Rate limit error
	if (err.status === 429) {
		return res.status(429).json({
			success: false,
			error: 'Rate limit exceeded',
			message: 'Too many requests, please slow down',
		});
	}

	res.status(err.status || 500).json({
		success: false,
		error: 'Internal server error',
		message: NODE_ENV === 'development' ? err.message : 'Something went wrong',
		timestamp: new Date().toISOString(),
	});
});

// 404 handler
app.use((req, res) => {
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.warn(`[404] Endpoint not found - IP: ${ip} - Path: ${req.path}`);

	res.status(404).json({
		success: false,
		error: 'Endpoint not found',
		message: `The requested endpoint ${req.method} ${req.path} does not exist`,
		availableEndpoints: ['GET /', 'GET /keepalive', 'GET /hash/md5', 'POST /hash/md5/post'],
		timestamp: new Date().toISOString(),
	});
});

// Graceful shutdown handler
process.on('SIGINT', () => {
	console.log('🛑 Received SIGINT, shutting down gracefully...');
	process.exit(0);
});

process.on('SIGTERM', () => {
	console.log('🛑 Received SIGTERM, shutting down gracefully...');
	process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (err) => {
	console.error('💥 Unhandled Promise Rejection:', err);
	process.exit(1);
});

app.listen(PORT, () => {
	console.log(`🚀 Crypto API running on port ${PORT}`);
	console.log(
		`🔒 Security: ${API_KEY ? 'API Key authentication enabled' : 'WARNING: No API key configured'}`,
	);
	console.log(`🌍 Environment: ${NODE_ENV}`);
	console.log(`📍 Health check: http://localhost:${PORT}/`);
	console.log(`📍 Keep-alive: http://localhost:${PORT}/keepalive`);

	if (NODE_ENV === 'production' && !API_KEY) {
		console.warn('⚠️  WARNING: Running in production without API key authentication!');
	}
});
