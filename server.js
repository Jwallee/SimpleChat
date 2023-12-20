const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Connect to the database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
    rejectUnauthorized: false // Note: Setting this for demo purposes only. In production, you should have a valid SSL setup.
    }
});

app.use(express.json());

// Route for user signup
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).send('Username already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);

        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Internal server error');
    }
});

// Route for user login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username exists
        const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(400).send('Invalid username or password');
        }

        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }

        // Passwords match, proceed to the chat window
        // You might want to implement session handling or token generation here
        res.status(200).send({ message: 'Logged in successfully', username: user.username });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Internal server error');
    }
});


let users = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    let currentUser = '';

    // Handle the 'user connected' event
    socket.on('user connected', (username) => {
        // Save the username associated with the current socket
        currentUser = username;
        users[socket.id] = username;

        // Emit an event to update the list of connected users
        io.emit('update users', Object.values(users));

        // Notify other clients that a new user has connected
        socket.broadcast.emit('chat message', { username: username, message: 'has connected' });
    });

    socket.on('chat message', (data) => {
        if (data.message === 'has connected') {
            currentUser = data.username;
            users[socket.id] = currentUser;
            io.emit('chat message', { username: data.username, message: 'has connected' });
        } else if (data.message === 'has disconnected') {
            io.emit('chat message', { username: data.username, message: 'has disconnected' });
        } else {
            io.emit('chat message', data);
        }
        io.emit('update users', Object.values(users));
    });

    socket.on('disconnect', () => {
        if (currentUser) {
            io.emit('chat message', { username: currentUser, message: 'has disconnected' });
            delete users[socket.id];
        }
        io.emit('update users', Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});