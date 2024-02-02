const express = require('express');
const legoData = require("./modules/legoSets");
const HTTP_PORT = process.env.PORT || 8080;
const app = express();

legoData.initialize();

app.get('/', (req, res) => {
    res.send("Assignment 2: Darius Bruno - 047701073");
})

app.get('/lego/sets', (req, res) => {
    res.json(legoData.getAllSets());
});

app.get('/lego/sets/num-demo', (req, res) => {
    const set = legoData.getSetByNum("03-1"); 
    res.send(set); 
});


app.get('/lego/sets/theme-demo', (req, res) => {
    const sets = legoData.getSetsByTheme("tech"); 
    res.send(sets); 
});


app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));