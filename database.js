require('dotenv').config();
const mysql = require('mysql2/promise');

// Configuração centralizada usando as variáveis do arquivo .env
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste rápido de conexão ao iniciar o app
pool.query('SELECT 1')
    .then(() => console.log('🗄️ MySQL conectado com sucesso via Node.js!'))
    .catch((err) => console.error('❌ Erro na conexão do Node com o MySQL:', err.message));

module.exports = pool;