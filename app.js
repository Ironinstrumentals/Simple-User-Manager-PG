const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const uuid = require('uuid');
const PORT = process.env.PORT || 3000;
let editUSER = {};
let Users = [];
//POSTGRES//
const Pool = require('pg').Pool;
const connectionString = process.env.DATABASE_URL;
console.log(`DATABASE_URL: ${connectionString}`);
const pool = new Pool({
    connectionString: connectionString,
});
//-POSTGRES END-//
function readFile() {
    pool.query('SELECT * FROM users ORDER BY id ASC;', (err, results) => {
        if (err) {
            throw err
        }
        Users = results.rows;
    })
}
function addUser(data) {
    let newUser = {
        userid: uuid(),
        email: data.email.toLowerCase(),
        firstname: data.firstname.toLowerCase(),
        lastname: data.lastname.toLowerCase(),
        age: data.age
    };
    pool.query(`INSERT INTO users(userid, email, firstname, lastname, age) VALUES ('${newUser.userid}', '${newUser.email}', '${newUser.firstname}', '${newUser.lastname}', '${newUser.age}');`, (err, results) => {
        if (err) {
            throw err;
        }
        Users.push(newUser);
    });
    readFile();
}
function deleteUser(UUID) {
    for (let i = 0; i < Users.length; i++) {
        if (Users[i].userid == UUID) {
            Users.splice(i, 1);
            pool.query(`DELETE FROM users WHERE userid = '${UUID}';`, (err, results) => {
                if (err) {
                    throw err
                }
            });
            readFile();
        }
    }
}
function setEdit(data) {
    readFile();
    for (let i = 0; i < Users.length; i++) {
        if (Users[i].userid == data) {
            editUSER = Users[i];
        }
    }
}
function updateUser(data) {
    for (let i = 0; i < Users.length; i++) {
        if (Users[i].userid  == data.userid) {
            Users[i] = data;
            pool.query(`UPDATE users SET email = '${data.email}', firstname = '${data.firstname}', lastname = '${data.lastname}', age = '${data.age}' WHERE userid = '${data.userid}';`, (err, results) => {
                if (err) {
                    throw err
                }
            });
            editUSER = {};
            readFile();
        }
    }
}
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    readFile();
    res.render('index.ejs', { PORT: PORT });
    readFile();
});
app.get('/create', (req, res, next) => {
    res.render('create.ejs', { PORT: PORT });
    next();
});
app.get('/list', (req, res, next) => {
    readFile();
    res.render('list.ejs', { PORT: PORT });
    readFile();
    next();
});
app.get('/edit', (req, res, next) => {
    res.render('edit.ejs', { PORT: PORT });
    next();
});
io.on('connection', function(socket){
    readFile();
    io.emit('UserList', Users);
    socket.on('ADDUSER', function(data) {
        addUser(data);
    });
    socket.on('DELETEUSER', function(data) {
        console.log(data);
        deleteUser(data);
    });
    socket.on('SETEDIT', function(data) {
        setEdit(data);
    });
    socket.on('UPDATEUSER', function(data) {
        updateUser(data);
    });
    socket.on('GETEDIT', function (data) {
        io.emit('USEREDIT', {userid: editUSER.userid, email: editUSER.email, firstname: editUSER.firstname, lastname: editUSER.lastname, age: editUSER.age});
    });
});
http.listen(PORT, () => {
    console.log(`Listening on ${ PORT }`);
    readFile();
});