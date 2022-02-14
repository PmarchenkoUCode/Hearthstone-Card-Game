const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const mysql = require('mysql');
require('dotenv').config();

const app = express();

app.use(express.static('./views'));
app.use(express.static('./module'));
app.use('/views/', express.static(__dirname + '/views/'));
app.set('view engine', 'ejs');

const options = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONNECTION_LIMIT
};

const pool = mysql.createPool(options);

const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore({
    expiration: 10800000,
    createDatabaseTable: true,
    schema: {
        tableName: 'USERS_SESSIONS',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, pool);

app.use(cookieParser());
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const sessionMiddleware = session({
    key: 'session_cookie_name',
    secret: process.env.SECRET_KEY,
    resave: false,
    store: sessionStore,
    saveUninitialized: true
});

io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
});

module.exports = {pool:pool,io:io};
app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.json());
app.use(require('./routes/index.js'));
app.get('/', (req, res) => {
    res.redirect('/auth');
});

http.listen(process.env.PORT, () => {
    console.log('Start server');
});