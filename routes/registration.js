const express = require('express');
const bcrypt = require('bcrypt');
const colors = require('colors');
let router = express.Router();
const pool = require('../app').pool;

router.route('/reg')
.get((req, res) => {
    res.render('registration');
})
.post((req, res) => {
    const login = req.body.login;
    const password = req.body.password;

    pool.query(`SELECT * FROM accounts WHERE login = '${login}';`, (err, result) => {
        if (result.length > 0) {
            res.json({message:'Введенная почта уже зарегистрирована'});
            res.end();
            return ;
        } else {
            bcrypt.hash(req.body.password, 8).then(hash => {
                pool.query(`INSERT INTO accounts(login, password) VALUES ('${login}', '${hash}');`, (err, result) => {
                    pool.query(`SELECT id FROM accounts WHERE login = '${login}';`, (err, result) => {
                        let userID = result[0].id;
                        req.session.loggedin = false;
                        res.redirect('/auth');
                        console.log(colors.yellow('Registration MySQL Database - ID: '), userID);
                    });
                });
            });
        }
    });
});

module.exports = router;