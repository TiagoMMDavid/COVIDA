const router = require('express').Router()
const passport = require('passport')

module.exports = router

//TODO: CHANGE THIS
const crypto = require('crypto')
const HASH_ALGORITHM = 'sha256'
const SECRET_KEY = 'changeit'
const users = []

/**
 * @typedef User
 * @property {String} username
 * @property {String} password
 * @property {Array<String>} groups
 */

router.get('/covida/login', handlerLogin)
router.post('/covida/login', handlerLoginPost)
router.get('/covida/signup', handlerSignup)
router.post('/covida/signup', handlerSignupPost)
router.get('/covida/logout', handlerLogout)

function handlerLogin(req, resp, next) {
    resp.render('login', {
        'messages': {
            'error': req.flash('userError'),
            'success': req.flash('userSuccess')
        },
        'username': req.flash('userName')
    })
}

function handlerLoginPost(req, resp, next) {
    const username = req.body.username.toLowerCase()
    const user = users.find(user => user.username.toLowerCase() == username)
    if (user) {
        const hash = crypto.createHmac(HASH_ALGORITHM, SECRET_KEY)
        const password = hash.update(req.body.password).digest('hex')
        if (user.password == password) {
            req.logIn(user, (err) => {
                if(err) return next(err)
                resp.redirect('/covida')
            })
        } else {
            req.flash('userError', 'Invalid credentials!')
            req.flash('userName', req.body.username)
            resp.redirect('/covida/login')
        }
    } else {
        req.flash('userError', 'User not registered!')
        req.flash('userName', req.body.username)
        resp.redirect('/covida/login')
    }
}

function handlerSignup(req, resp, next) {
    resp.render('signup', {
        'messages': {
            'error': req.flash('userError')
        },
        'username': req.flash('userName')
    })
}

function handlerSignupPost(req, resp, next) {
    const hash = crypto.createHmac(HASH_ALGORITHM, SECRET_KEY)
    const user = {
        'username': req.body.username,
        'password': hash.update(req.body.password).digest('hex')
    }
    users.push(user)
    req.flash('userSuccess', 'Sign up complete! Try to log in')
    resp.redirect('/covida/login')
}

function handlerLogout(req, resp, next) {
    req.logout()
    resp.redirect('/covida')
}

passport.serializeUser(function(user, done) {
    done(null, user.username)
})
  
passport.deserializeUser(function(username, done) {
    const user = users.find(user => user.username == username)
    done(null, user)
})