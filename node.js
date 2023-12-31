const http = require('http');
const mysql = require('mysql2/promise');
const bun = require('bun');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Todokana1ko!',
    database: 'laravel',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const JSON_HEADERS = {
    'Content-Type': 'application/json',
};

// Configure Bun.js
const log = bun.createLogger({
    name: 'your-app-name',
    streams: [{ level: 'info', stream: process.stdout }]
});

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/users') {
        try {
            const users = await fetchUsers();
            res.writeHead(200, JSON_HEADERS);
            res.end(JSON.stringify(users));
        } catch (error) {
            log.error(`Error fetching users: ${error.message}`);
            res.writeHead(500, JSON_HEADERS);
            res.end(`{"error": "Error fetching users: ${error.message}"}`);
        }
    } else {
        log.warn(`Not Found: ${req.method} ${req.url}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

process.on('unhandledRejection', (reason, promise) => {
    log.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application-specific logging, re-throwing, or other logic here
});

async function fetchUsers() {
    const [results] = await pool.query('SELECT * FROM users');
    return results;
}

const PORT = 8080;

server.listen(PORT, () => {
    log.info(`Server running at http://127.0.0.1:${PORT}/`);
});
