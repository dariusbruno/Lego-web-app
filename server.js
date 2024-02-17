/********************************************************************************
* WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Darius Bruno Student ID: 047701073 Date: 2/16/2024
*
* Published URL: https://prussian-blue-sea-lion-hose.cyclic.app/
*
********************************************************************************/

const express = require('express');
const path = require('path');

const legoData = require("./modules/legoSets");
const HTTP_PORT = process.env.PORT || 8080;
const app = express();

app.use(express.static('public'));



async function startServer() {
    try {
        await legoData.initialize();
        console.log('Initialization successful');

                
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'views', 'home.html'));
        })

        app.get('/about', (req, res) => {
            res.sendFile(path.join(__dirname, 'views', 'about.html'));
        })

        app.get('/404', (req, res) => {
            res.sendFile(path.join(__dirname, 'views', '404.html'));
        })

        app.get('/lego/sets', (req, res) => {
            legoData.getAllSets()
                .then(sets => res.json(sets))
                .catch(err => res.status(500).send(err));
        });

        app.get('/lego/sets/02-2', (req, res) => {
            legoData.getSetByNum("02-2")
                .then(set => res.json(set))
                .catch(err => res.status(404).send(err));
        });

        app.get('/lego/sets/022-1', (req, res) => {
            legoData.getSetByNum("022-1")
                .then(set => res.json(set))
                .catch(err => res.status(404).send(err));
        });

        app.get('/lego/sets/021-1', (req, res) => {
            legoData.getSetByNum("021-1")
                .then(set => res.json(set))
                .catch(err => res.status(404).send(err));
        });


        app.get('/lego/sets/:setNum', (req, res) => {
            const setNum = req.params.setNum;
            legoData.getSetByNum(setNum)
                .then(set => res.json(set))
                .catch(err => res.status(404).send(`Error: ${err}`));
        });



        app.get('/lego/sets/theme/:themeName', (req, res) => {
            const themeName = req.params.themeName;
            legoData.getSetsByTheme(themeName)
                .then(sets => res.json(sets))
                .catch(err => res.status(404).send(err));
        });

        app.get('/lego/sets/:setNum', (req, res) => {
            legoData.getSetByNum(req.params.setNum)
                .then(set => res.json(set))
                .catch(err => res.status(404).send(`Error: ${err}`));
        });


        app.get('/lego/sets/num-demo', (req, res) => {
            legoData.getSetByNum("03-1")
                .then(set => res.json(set))
                .catch(err => res.status(404).send(err));
        });

        app.use((req, res) => {
            res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
        });

        app.get('/lego/sets', (req, res) => {
            if (req.query.theme) {
                legoData.getSetsByTheme(req.query.theme)
                    .then(sets => res.json(sets))
                    .catch(err => res.status(404).send(err));
            } else {
                legoData.getAllSets()
                    .then(sets => res.json(sets))
                    .catch(err => res.status(500).send(err));
            }
        });

        app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
            } catch (err) {
                console.error('Initialization failed:', err);
            }
        }

startServer();

