const express = require('express');
const bcrypt = require('bcrypt');
const colors = require('colors');
const router = express.Router();
const pool = require('../app').pool;

router.route('/auth')
.get((req, res) => {
    if (req.session.loggedin == true) {
        res.redirect('/home');
    } else {
        res.render('login');
    }
})
.post((req, res) => {
    const login = req.body.login;
    const password = req.body.password;

    console.log(colors.yellow('Auth - LOGIN input: '), login);
    console.log(colors.yellow('Auth - PASSWORD input: '), password);

    if (login && password) {
        pool.query(`SELECT * FROM accounts WHERE login = '${login}';`, (err, result) => {
            if (result.length > 0) {
                try {
                    bcrypt.compare(password, result[0].password).then(answer => {
                        if (answer) {
                            req.session.loggedin = true;
                            req.session.login = login;
                            req.session.player = result[0].id;
                            res.redirect('/home');
                            console.log(colors.yellow('Auth - Result ID:'), result[0].id);
                            console.log(colors.yellow('Auth - Session Loggedin:'), req.session.loggedin);
                        } else {
                            res.json({
                                msg: 'Неправильный пользователь или пароль'
                            });
                            res.end();
                        }
                    });
                } catch (err) {
                    res.json({
                        mes: 'Error'
                    })
                    res.end();
                }
            }
        });
    }
});


// router.get('/auth', (req, res) => {
//     if (req.session.loggedin == true) res.redirect('/home');
//     else res.render('login');
// });

// router.post('/auth', (req, res) => {
//     const login = req.body.login;
//     const password = req.body.password;

//     console.log('Auth - LOGIN input: ', login);
//     console.log('Auth - PASSWORD input: ', password);

//     if (login && password) {
//         pool.query(`SELECT * FROM accounts WHERE login = '${login}';`, (err, result) => {
//             if (result.length > 0) {
//                 try {
//                     bcrypt.compare(password, result[0].password).then(answer => {
//                         if (answer) {
//                             req.session.loggedin = true;
//                         }
//                     });
//                 } catch (err) {

//                 }
//             }
//         });
//     }
// });

module.exports = router;