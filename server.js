/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Darius Bruno Student ID: 047701073 Date: 3/15/2024
*
* Published URL: https://prussian-blue-sea-lion-hose.cyclic.app/
*
********************************************************************************/

const express = require('express');
const path = require('path');
const clientSessions = require('client-sessions');


const authData = require('./modules/auth-service');
const legoData = require("./modules/legoSets");
const HTTP_PORT = process.env.PORT || 8080;
const app = express();

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(
    clientSessions({
      cookieName: 'session', 
      secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', 
      duration: 2 * 60 * 1000, 
      activeDuration: 1000 * 60, 
    })
  );


  app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });



  function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      next();
    }
  }
  


async function startServer() {
    try {
        await legoData.initialize();
        await authData.initialize();
        console.log('Initialization successful');


        app.get('/', (req, res) => {
            
            res.render("home");
        })   

        app.get('/lego/addSet', ensureLogin, async (req, res) => {
            try {
                const themes = await legoData.getAllThemes();
                res.render("addSet", { themes: themes });
            } catch (err) {
                res.render("500", { message: `Internal Server, cannot get themes: ${err}` });
            }
        });
        
        app.post('/lego/addSet', ensureLogin, async (req, res) => {
            try {
                await legoData.addSet(req.body);
                res.redirect('/lego/sets');
            } catch (err) {
                res.render("500", { message: `Sorry but an error occurred, this error: "${err}"` });
            }
        });


        app.get('/about', (req, res) => {
            
            res.render("about", { page: '/about' });
        })       

        app.get('/lego/sets', (req, res) => {
            
            if (req.query.theme) {
                legoData.getSetsByTheme(req.query.theme)
                    .then(sets => {
                        res.render("sets", { sets: sets, page: '/lego/sets' });
                    })
                    .catch(err => {
                        
                        res.status(404).render("404", { 
                            page: '/404',
                            message: "No sets found for the theme " + req.query.theme
                        });
                    });
            } else {
                
                legoData.getAllSets()
                    .then(sets => {
                        res.render("sets", { sets: sets, page: '/lego/sets' });
                    })
                    .catch(err => {
                        
                        res.status(500).send(err);
                    });
            }
        });

        app.get('/lego/sets/:setNum', (req, res) => {
            legoData.getSetByNum(req.params.setNum)
                .then(legoSet => {
                    res.render("set", { set: legoSet });
                })
                .catch(err => {
                    res.status(404).render("404", {
                        page: '/404',
                        message: err.message || "We're unable to find the sets for the specified theme."
                    });
                });
        });



        app.get('/lego/sets/theme/:themeName', (req, res) => {
            const themeName = req.params.themeName;
            legoData.getSetsByTheme(themeName)
                .then(sets => res.json(sets))
                .catch(err => {
                    res.status(404).render("404", {
                        page: '/404',
                        message: err.message || "We're unable to find the sets for the specified theme."
                    });
                });
        });


        // app.get('/lego/editSet/:setNum', async (req, res) => {
        //     try {
        //         const set = await legoData.getSetByNum(req.params.setNum);
        //         const themes = await legoData.getAllThemes();
        //         res.render("editSet", { set: set, themes: themes });
        //     } catch (err) {
        //         res.status(404).render("404", { 
        //             page: '/404',
        //             message: `Error getting set details: ${err}` 
        //         });
        //     }
        // });
        
        // app.post('/lego/editSet', async (req, res) => {
        //     try {
        //         await legoData.editSet(req.body.set_num, req.body); 
        //         res.redirect('/lego/sets');
        //     } catch (err) {
        //         res.render("500", { 
        //             message: `Error when editing set: ${err}` 
        //         });
        //     }
        // });
        
        app.get('/lego/editSet/:setNum', ensureLogin, async (req, res) => {
            try {
                const set = await legoData.getSetByNum(req.params.setNum);
                const themes = await legoData.getAllThemes();
                res.render("editSet", { set: set, themes: themes });
            } catch (err) {
                res.status(404).render("404", { message: `Error getting set details: ${err}` });
            }
        });
        
        app.post('/lego/editSet', ensureLogin, async (req, res) => {
            try {
                await legoData.editSet(req.body.set_num, req.body); 
                res.redirect('/lego/sets');
            } catch (err) {
                res.render("500", { message: `Error when editing set: ${err}` });
            }
        });

        app.get('/lego/deleteSet/:setNum', async (req, res) => {
            try {
                await legoData.deleteSet(req.params.setNum);
                res.redirect('/lego/sets');
            } catch (err) {
                res.render("500", { message: `Error deleting set: ${err}` });
            }
        });

        app.get('/lego/sets/num-demo', (req, res) => {
            legoData.getSetByNum("03-1")
                .then(set => res.json(set))
                .catch(err => res.status(404).send(err));
        });




        
     

        app.get('/register', (req, res) => {            
            res.render('register', {
                successMessage: '',
                errorMessage: '',
                userName: ''
            });
        });
        
        
        app.post('/register', async (req, res) => {
            try {
                await authData.registerUser(req.body);
                res.render('register', {
                    successMessage: "User created",
                    errorMessage: '',
                    userName: req.body.userName
                });
            } catch (err) {
                res.render('register', {
                    errorMessage: err.toString(),
                    successMessage: '',
                    userName: req.body.userName
                });
            }
        });
        
        app.get('/login', (req, res) => {
            
            res.render('login', {
                errorMessage: '',
                userName: ''
            });
        });

        app.post('/login', async (req, res) => {
            req.body.userAgent = req.get('User-Agent');
        
            try {
                const user = await authData.checkUser(req.body);
                req.session.user = {
                    userName: user.userName,
                    email: user.email,
                    loginHistory: user.loginHistory || []
                };
                res.redirect('/lego/sets');
            } catch (err) {
                
                res.render('login', {
                    errorMessage: err.toString(),
                    userName: req.body.userName
                });
            }
        });

        // app.post('/login', async (req, res) => {
        //     req.body.userAgent = req.get('User-Agent');
        //     try {
        //         const user = await authData.checkUser(req.body);            
        //         req.session.user = {
        //             userName: user.userName,
        //             email: user.email,
        //             loginHistory: user.loginHistory || [] // Ensures loginHistory is always an array
        //         };            
        //         res.redirect('/lego/sets');
        //     } catch (err) {
        //         res.render('login', { errorMessage: err, userName: req.body.userName });
        //     }
        // });
        

        
        app.get('/logout', ensureLogin, (req, res) => {
    
        req.session.reset();
    
        res.redirect('/');
        });

        
        app.get('/userHistory', ensureLogin, (req, res) => {
            res.render('userHistory');
        });







        
        app.use((req, res) => {
            res.status(404).render("404", { 
                page: '/404',
                message: "I'm sorry, we're unable to find what you're looking for"
            });
        });

        app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
            } catch (err) {
                console.error('Initialization failed:', err);
            }
        }

startServer();

