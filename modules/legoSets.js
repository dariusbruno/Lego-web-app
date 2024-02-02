const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

const initialize = () => {
    setData.forEach(setDataObj => {
        const themeObj = themeData.find(theme => theme.id === setDataObj.theme_id);
        if (themeObj) {
            sets.push({ ...setDataObj, theme: themeObj.name });
        }
    });
};

const getAllSets = () => sets;

const getSetByNum = setNum => {
    const foundSet = sets.find(set => set.set_num === setNum);
    return foundSet ? foundSet : "Error! No sets have been found with that number.";
};

const getSetsByTheme = theme => {
    const foundSets = sets.filter(set => set.theme.toLowerCase().includes(theme.toLowerCase()));
    return foundSets.length > 0 ? foundSets : "Error! No sets have been found with that theme.";
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

