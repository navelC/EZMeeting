const sql = require('mssql');

const config = {
    server: 'localhost',
    port: 1433,
    database: 'EZMeet',
    user: 'cuong', // update me
    password: '123', // update me
    options: {
        encrypt: false
    }
}

let pool = null

async function connectToDatabase() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to SQL Server');
        return pool
    } catch (err) {
        console.error('Error connecting to SQL Server:', err.message);
    }
}

async function getDB(){
    if(!pool)
        pool = connectToDatabase();
    return pool;
}

module.exports = {
    getDB,
    sql
};