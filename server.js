const express = require('express');
const CryptoJS = require('crypto-js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
	res.json({
		status: 'ok',
		message: 'Crypto API running',
		endpoints: {
			'/hash/md5': 'Generate MD5 hash',
		},
	});
});

// Endpoint alternativo con query params (por si prefieres GET)
app.get('/hash/md5', (req, res) => {
	try {
		const { token, accesskey } = req.query;

		if (!token || !accesskey) {
			return res.status(400).json({
				error: 'Missing required query params: token and accesskey',
			});
		}

		const hash = CryptoJS.MD5(token + accesskey).toString();

		res.json({
			success: true,
			hash: hash,
		});
	} catch (error) {
		res.status(500).json({
			error: 'Hash generation failed',
			details: error.message,
		});
	}
});

app.listen(PORT, () => {
	console.log(`🚀 Crypto API running on port ${PORT}`);
});
