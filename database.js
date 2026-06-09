require('dotenv').config();
const mysql = require('mysql2/promise');

// Função para limpar espaços e aspas acidentais das variáveis de ambiente
const cleanEnvVar = (val) => {
    if (!val) return val;
    let clean = val.trim();
    if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
        clean = clean.slice(1, -1);
    }
    return clean.trim();
};

const host = cleanEnvVar(process.env.DB_HOST);
const portStr = cleanEnvVar(process.env.DB_PORT);
const user = cleanEnvVar(process.env.DB_USER);
const password = cleanEnvVar(process.env.DB_PASSWORD);
const database = cleanEnvVar(process.env.DB_NAME);
const sslStr = cleanEnvVar(process.env.DB_SSL);

// Detecta automaticamente se é Aiven pelo domínio ou se DB_SSL está explicitamente true
const isAiven = host && host.includes('aivencloud.com');
const useSSL = sslStr === 'true' || isAiven;

// Configuração centralizada usando as variáveis do arquivo .env
const pool = mysql.createPool({
    host: host,
    port: parseInt(portStr || '3306'),
    user: user,
    password: password,
    database: database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: useSSL ? {
        rejectUnauthorized: false // Permite conexões seguras exigidas pelo Aiven
    } : undefined
});

// Teste rápido de conexão ao iniciar o app
pool.query('SELECT 1')
    .then(() => console.log('🗄️ MySQL conectado com sucesso via Node.js!'))
    .catch((err) => console.error('❌ Erro na conexão do Node com o MySQL:', err.message));

module.exports = pool;