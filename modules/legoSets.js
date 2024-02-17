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

const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];


const initialize = () => {
    return new Promise((resolve, reject) => {
        try {
            setData.forEach(setDataObj => {
                const themeObj = themeData.find(theme => theme.id === setDataObj.theme_id);
                if (themeObj) {
                    sets.push({ ...setDataObj, theme: themeObj.name });
                }
            });
            resolve();
        } catch (error) {
            reject("Initialization failed: " + error.message);
        }
    });
};

const getAllSets = () => {
    return new Promise((resolve, reject) => {
        if (sets.length > 0) {
            resolve(sets);
        } else {
            reject("Error: Sets array problem");
        }
    });
};

const getSetByNum = setNum => {
    return new Promise((resolve, reject) => {
        const foundSet = sets.find(set => set.set_num === setNum);
        if (foundSet) {
            resolve(foundSet);
        } else {
            reject("Error! No sets have been found with that number.");
        }
    });
};

const getSetsByTheme = theme => {
    return new Promise((resolve, reject) => {
        const foundSets = sets.filter(set => set.theme.toLowerCase().includes(theme.toLowerCase()));
        if (foundSets.length > 0) {
            resolve(foundSets);
        } else {
            reject("Error! No sets have been found with that theme.");
        }
    });
};


//initialize();
//console.log(getAllSets());
//console.log(getSetsByTheme("the"));
//console.log(getSetByNum("4"));

module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme
};

