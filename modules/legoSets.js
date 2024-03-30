/********************************************************************************
* WEB322 – Assignment 05
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
require('dotenv').config();
const Sequelize = require('sequelize');


const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "postgres",
      port: 5432,
      dialectOptions: {
        ssl: { rejectUnauthorized: false },
      },
    }
);
  

const Theme = sequelize.define('Theme', {
    id: { 
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    name: Sequelize.STRING
}, {
    createdAt: false, 
    updatedAt: false  
});


const Set = sequelize.define('Set', {
    set_num: { 
        type: Sequelize.STRING, 
        primaryKey: true 
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: {
        type: Sequelize.INTEGER,
        references: {
            model: 'Themes',
            key: 'id'
        }
    },
    img_url: Sequelize.STRING
}, {
    createdAt: false, 
    updatedAt: false  
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });





const initialize = () => {
    return sequelize.sync().then(() => {
        console.log('Database synced successfully.');
    }).catch((error) => {
        console.error('Error syncing database:', error);
        throw error; 
    });
};

const getAllSets = () => {
    return Set.findAll({
        include: [Theme]
    })
    .then(sets => {
        if (sets.length > 0) {
            return sets; 
        } else {
            throw new Error("No sets found"); 
        }
    })
    .catch(error => {
        throw error; 
    });
};



const getSetByNum = setNum => {
    return Set.findAll({
        where: { set_num: setNum },
        include: [Theme] 
    })
    .then(sets => {
        if (sets && sets.length > 0) {
            return sets[0]; 
        } else {
            throw new Error(`Unable to find set with number: ${setNum}`);
        }
    })
    .catch(error => {
        throw error; 
    });
};


const getSetsByTheme = theme => {
    return Set.findAll({
        include: [{
            model: Theme,
            where: {
                name: {
                    [Sequelize.Op.iLike]: `%${theme}%` 
                }
            }
        }]
    })
    .then(sets => {
        if (sets && sets.length > 0) {
            return sets; 
        } else {
            throw new Error(`Unable to find sets with theme: ${theme}`);
        }
    })
    .catch(error => {
        throw error; 
    });
};

const getAllThemes = () => {
    return Theme.findAll()
        .then(themes => {
            return themes;
        })
        .catch(err => {
            throw new Error(err.message);
        });
};


const addSet = (setData) => {
    return new Promise((resolve, reject) => {
        
        Set.findOne({ where: { set_num: setData.set_num } })
            .then(existingSet => {
                if (existingSet) {
                    
                    reject("A set already has this number!");
                } else {
                    
                    return Set.create(setData);
                }
            })
            .then(() => resolve())
            .catch(err => {
                
                reject(err.message);
            });
    });
};


const editSet = (set_num, setData) => {
    return new Promise((resolve, reject) => {
        Set.update(setData, { where: { set_num: set_num } })
            .then(result => {
                if (result[0] === 0) { 
                    reject("No set found with that number");
                } else {
                    resolve();
                }
            })
            .catch(err => {
                if (err.errors && err.errors[0] && err.errors[0].message) {
                    reject(err.errors[0].message);
                } else {
                    reject(err.message);
                }
            });
    });
};

const deleteSet = (set_num) => {
    return new Promise((resolve, reject) => {
        Set.destroy({
            where: { set_num: set_num }
        })
        .then(deleted => {
            if (deleted === 0) {
                reject("No set found with that number or unable to delete");
            } else {
                resolve();
            }
        })
        .catch(err => {
            if (err.errors && err.errors[0] && err.errors[0].message) {
                reject(err.errors[0].message);
            } else {
                reject(err.message);
            }
        });
    });
};

module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    getAllThemes,
    addSet,
    editSet,
    deleteSet
};


