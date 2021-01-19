'use-strict'

const router = require('express').Router()
const passport = require('passport')
const users = require('../repo/covida-users')
const crypto = require('crypto')

const HASH_ALGORITHM = 'sha256'
const SECRET_KEY = 'changeit'

module.exports = router

router.get('/covida/login', handlerLogin)
router.post('/covida/login', handlerLoginPost)
router.get('/covida/signup', handlerSignup)
router.post('/covida/signup', handlerSignupPost)
router.get('/covida/logout', handlerLogout)
router.get('/covida/account/delete', handlerDeleteAccount)

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
    const username = req.body.username
    users.getUser(username)
        .then(user => {
            if (user) {
                const hash = crypto.createHmac(HASH_ALGORITHM, SECRET_KEY)
                const password = hash.update(req.body.password).digest('hex')
                if (user.password == password) {
                    req.logIn(user, (err) => {
                        if(err) return next(err)
                        resp.redirect(req.session.redirectUrl || '/covida')
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
        })
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
    users.addUser(req.body.username, hash.update(req.body.password).digest('hex'))
        .then(user => {
            if (!user) {
                req.flash('userError', 'Username already exists!')  
                return resp.redirect('/covida/signup')
            }
            req.flash('userSuccess', 'Sign up complete! Try to log in')
            resp.redirect('/covida/login')
        })
}

function handlerLogout(req, resp, next) {
    req.logout()
    resp.redirect(req.session.redirectUrl || '/covida')
}

function handlerDeleteAccount(req, resp, next) {
    const user = req.user
    if (req.query.confirm == 'true' && user) {
        req.logout()
        return users.deleteUser(user.username)
            .then((username) => {
                if (username) {
                    req.flash('userInfo', 'User deleted successfully')
                } else {
                    req.flash('userError', 'Failed to delete user')
                }
                // Clear redirect url when deleting account
                req.session.redirectUrl = null
                resp.redirect('/covida')
            })
    }
    resp.redirect('/covida')
}

passport.serializeUser((user, done) =>  {
    done(null, user.username)
})
  
passport.deserializeUser((username, done) => {
    users.getUser(username)
        .then(user => done(null, user))
})