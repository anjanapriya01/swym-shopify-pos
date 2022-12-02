const express = require('express')

// Import wishlist-controller
const sbisaRoutes = require('./../controllers/sbisa-controller.js')

const authMiddleware = require('../middleware/auth-middleware')

// Create router
const router = express.Router()

// a middleware function with no mount path. This code is executed for every request to the router
// middleware will always use env hmac
router.use(authMiddleware.isAuthorized)

// router.post('/auth', (req, res, next) => {
//     return res.status(res.locals.status).json({msg: res.locals.msg})
// })
router.get('/subscriptions', sbisaRoutes.fetchSubscriptions)
router.post('/add/product', sbisaRoutes.addProductToWatchlist)
module.exports = router;
//router.post('/add/product', sbisaRoutes.addProductToWatchlist)