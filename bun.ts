import * as Bun from 'bun';
import * as mysql from 'mysql2/promise';

// Define the interface for a user row
interface User {
    id: number;
    name: string;
    email: string;
    // Add more properties as needed
}

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Todokana1ko!',
    database: 'laravel',
    waitForConnections: true,
    connectionLimit: 13,
    queueLimit: 0
});

const server = Bun.serve({
    port: 3000,
    async fetch(req: Request) {
        let connection;
        try {
            // Get a connection from the pool
            connection = await pool.getConnection();

            // Example query to select all users
            const [rows, fields] = await connection.execute<User[]>('SELECT * FROM users');

            // Process the rows or perform some logic
            const result = rows.map((user: User) => ({ id: user.id, name: user.name, email: user.email }));

            // Return the result as JSON
            return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
        } catch (error) {
            console.error('Error executing MySQL query:', error);
            return new Response('Error fetching data from MySQL', { status: 500 });
        } finally {
            if (connection) {
                // Release the connection back to the pool, even if an error occurred
                connection.release();
            }
        }
    },
});

console.log(`Listening on http://localhost:${server.port} ...`);
