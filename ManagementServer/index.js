const express = require('express');
const { getDB, sql } = require('./database'); // Adjust the path accordingly
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { MAX } = require('mssql');

const app = express();
const port = 9090;

app.use(bodyParser.json());

app.use(cors());

app.use(express.json());

app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;
    console.log(req.body)
    
    try {
        const emailCheckResult = await pool
        .request()
        .input('email', sql.NVarChar(320), email)
        .query('SELECT TOP 1 userID FROM EM_User WHERE email = @email');
        if (emailCheckResult.recordset.length > 0) {
            // Email already exists, return a 409 Conflict status
            return res.status(409).json({ message: 'Email is already in use.' });
        }

        const hashedPash = await bcrypt.hash(password, 0)
        const result = await pool
            .request()
            .input('name', sql.NVarChar(20), name)
            .input('email', sql.NVarChar(320), email)
            .input('password', sql.VarChar(MAX), hashedPash)
            .query('INSERT INTO EM_User (name, email, password) OUTPUT inserted.userID VALUES (@name, @email, @password);');
        console.log(result)
        const {userID} = result.recordset[0]
        res.json({ userID, name });
    } catch (err) {
        console.error('Error creating a new user:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to get all users
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool
        .request()
        .input('email', sql.NVarChar(320), email)
        .query('SELECT * FROM EM_User WHERE email = @email');
        console.log(user)
        if (user.recordset.length < 1) {
            // Email already exists, return a 409 Conflict status
            return res.status(404).send('User not found');
        }
       const result = await bcrypt.compare(password, user.recordset[0].password)
        if(result){
            const {userID, name} = user.recordset[0]
            res.json({ userID, name});
        }
        else{
            return res.status(404).send('User not found');
        }
    } catch (err) {
        console.error('Error querying users:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to create a new class
app.post('/classes', async (req, res) => {
    const { className, userIDs, classMasterID } = req.body;

    try {
        const result = await pool
            .request()
            .input('className', sql.NVarChar(20), className)
            .input('userIDs', sql.NVarChar(sql.MAX), userIDs)
            .input('classMasterID', sql.Int, classMasterID)
            .query('INSERT INTO EM_Class (className, userIDs, classMasterID) VALUES (@className, @userIDs, @classMasterID);');
        res.json({ classID: result.recordset[0].classID });
    } catch (err) {
        console.error('Error creating a new class:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to get all classes
app.get('/classes', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM EM_Class');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error querying classes:', err.message);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/rooms', async (req, res) => {
    const { id } = req.body;
    const startTime = new Date()
    const endTime = new Date()
    try {
        const result = await pool
            .request()
            .input('roomID', sql.NVarChar(50), id)
            .input('startTime', sql.DateTime, startTime)
            .input('endTime', sql.DateTime, endTime)
            .query('INSERT INTO EM_Room (roomID, startTime, endTime) VALUES (@roomID, @startTime, @endTime);');
        console.log(result)
        const {roomID} = result.recordset[0]
        res.json({ roomID: result.recordset[0].roomID });
    } catch (err) {
        console.error('Error creating a new room:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to get all rooms
app.get('/rooms', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM EM_Room');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error querying rooms:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to create a new record
app.post('/records', async (req, res) => {
    const { roomID, userID, startTime, endTime, isTemporary } = req.body;

    try {
        await pool
            .request()
            .input('roomID', sql.NVarChar(12), roomID)
            .input('userID', sql.Int, userID)
            .input('startTime', sql.DateTime, startTime)
            .input('endTime', sql.DateTime, endTime)
            .input('isTemporary', sql.Bit, isTemporary)
            .query('INSERT INTO EM_Record (roomID, userID, startTime, endTime, isTemporary) VALUES (@roomID, @userID, @startTime, @endTime, @isTemporary);');

        res.json({ roomID, userID });
    } catch (err) {
        console.error('Error creating a new record:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to get all records
app.get('/records', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM EM_Record');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error querying records:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to create a new roll call
app.post('/rollcalls', async (req, res) => {
    const { roomID, userID, isCount } = req.body;

    try {
        await pool
            .request()
            .input('roomID', sql.NVarChar(50), roomID)
            .input('userID', sql.Int, userID)
            .input('isCount', sql.Bit, isCount)
            .query('INSERT INTO EM_RollCallStatus (roomID, userID, isCount) VALUES (@roomID, @userID, @isCount);');

        res.json({ roomID, userID });
    } catch (err) {
        console.error('Error creating a new roll call:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to get all roll calls
app.get('/rollcalls', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM EM_RollCallStatus');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error querying roll calls:', err.message);
        res.status(500).send('Internal Server Error');
    }
});
// Route to get a user by ID
app.get('/users/:id', async (req, res) => {
    const userID = req.params.id;

    try {
        const result = await pool
            .request()
            .input('userID', sql.Int, userID)
            .query('SELECT * FROM EM_User WHERE userID = @userID');

        if (result.recordset.length === 0) {
            res.status(404).send('User not found');
        } else {
            res.json(result.recordset[0]);
        }
    } catch (err) {
        console.error('Error querying user by ID:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Similar routes for other tables...

// Route to get a class by ID
app.get('/classes/:id', async (req, res) => {
    const classID = req.params.id;

    try {
        const result = await pool
            .request()
            .input('classID', sql.Int, classID)
            .query('SELECT * FROM EM_Class WHERE classID = @classID');

        if (result.recordset.length === 0) {
            res.status(404).send('Class not found');
        } else {
            res.json(result.recordset[0]);
        }
    } catch (err) {
        console.error('Error querying class by ID:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to get a room by ID
app.get('/rooms/:id', async (req, res) => {
    const roomID = req.params.id;

    try {
        const result = await pool
            .request()
            .input('roomID', sql.NVarChar(50), roomID)
            .query('SELECT * FROM EM_Room WHERE roomID = @roomID');

        if (result.recordset.length === 0) {
            res.status(404).send('Room not found');
        } else {
            res.json(result.recordset[0]);
        }
    } catch (err) {
        console.error('Error querying room by ID:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to get a record by ID
app.get('/records/:roomID/:userID', async (req, res) => {
    const { roomID, userID } = req.params;

    try {
        const result = await pool
            .request()
            .input('roomID', sql.NVarChar(50), roomID)
            .input('userID', sql.Int, userID)
            .query('SELECT * FROM EM_Record WHERE roomID = @roomID AND userID = @userID');

        if (result.recordset.length === 0) {
            res.status(404).send('Record not found');
        } else {
            res.json(result.recordset[0]);
        }
    } catch (err) {
        console.error('Error querying record by ID:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to get a roll call by ID
app.get('/rollcalls/:roomID/:userID', async (req, res) => {
    const { roomID, userID } = req.params;

    try {
        const result = await pool
            .request()
            .input('roomID', sql.NVarChar(50), roomID)
            .input('userID', sql.Int, userID)
            .query('SELECT * FROM EM_RollCallStatus WHERE roomID = @roomID AND userID = @userID');

        if (result.recordset.length === 0) {
            res.status(404).send('Roll Call not found');
        } else {
            res.json(result.recordset[0]);
        }
    } catch (err) {
        console.error('Error querying roll call by ID:', err.message);
        res.status(500).send('Internal Server Error');
    }
});
// Route to delete a user by ID
app.delete('/users/:id', async (req, res) => {
    const userID = req.params.id;

    try {
        const result = await pool
            .request()
            .input('userID', sql.Int, userID)
            .query('DELETE FROM EM_User WHERE userID = @userID');

        if (result.rowsAffected[0] === 0) {
            res.status(404).send('User not found');
        } else {
            res.send('User deleted successfully');
        }
    } catch (err) {
        console.error('Error deleting user by ID:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Similar routes for other tables...

// Route to delete a class by ID
app.delete('/classes/:id', async (req, res) => {
    const classID = req.params.id;

    try {
        const result = await pool
            .request()
            .input('classID', sql.Int, classID)
            .query('DELETE FROM EM_Class WHERE classID = @classID');

        if (result.rowsAffected[0] === 0) {
            res.status(404).send('Class not found');
        } else {
            res.send('Class deleted successfully');
        }
    } catch (err) {
        console.error('Error deleting class by ID:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to delete a room by ID
app.delete('/rooms/:id', async (req, res) => {
    const roomID = req.params.id;

    try {
        const result = await pool
            .request()
            .input('roomID', sql.NVarChar(50), roomID)
            .query('DELETE FROM EM_Room WHERE roomID = @roomID');

        if (result.rowsAffected[0] === 0) {
            res.status(404).send('Room not found');
        } else {
            res.send('Room deleted successfully');
        }
    } catch (err) {
        console.error('Error deleting room by ID:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to delete a record by ID
app.delete('/records/:roomID/:userID', async (req, res) => {
    const { roomID, userID } = req.params;

    try {
        const result = await pool
            .request()
            .input('roomID', sql.NVarChar(50), roomID)
            .input('userID', sql.Int, userID)
            .query('DELETE FROM EM_Record WHERE roomID = @roomID AND userID = @userID');

        if (result.rowsAffected[0] === 0) {
            res.status(404).send('Record not found');
        } else {
            res.send('Record deleted successfully');
        }
    } catch (err) {
        console.error('Error deleting record by ID:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route to delete a roll call by ID
app.delete('/rollcalls/:roomID/:userID', async (req, res) => {
    const { roomID, userID } = req.params;

    try {
        const result = await pool
            .request()
            .input('roomID', sql.NVarChar(50), roomID)
            .input('userID', sql.Int, userID)
            .query('DELETE FROM EM_RollCallStatus WHERE roomID = @roomID AND userID = @userID');

        if (result.rowsAffected[0] === 0) {
            res.status(404).send('Roll Call not found');
        } else {
            res.send('Roll Call deleted successfully');
        }
    } catch (err) {
        console.error('Error deleting roll call by ID:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

app.use((req, res, next) => {
    res.status(404).send('Not found');
});

app.listen(port, async () => {
    pool = await getDB();
    console.log(`Server is running on port ${port}`);
});
