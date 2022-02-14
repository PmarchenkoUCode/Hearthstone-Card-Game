const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
    next();
});

router.use(require('./auth'));
router.use(require('./registration'));
router.use(require('./home'));

module.exports = router;