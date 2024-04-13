require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



let Schema = mongoose.Schema;

let userSchema = new Schema({
  userName: {type: String, unique : true},
  password: String,
  email: String,
  loginHistory: [{ 
    dateTime: Date,
    userAgent: String
  }],
});

let User;


const initialize = () => {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGODB);
        db.on('error', (err) => {
            reject(err); 
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve(); 
        });
    });
};


const registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
            return;
        }
        bcrypt.hash(userData.password, 10)
            .then(hash => {
                let newUser = new User({
                    userName: userData.userName,
                    password: hash, 
                    email: userData.email,
                    loginHistory: []
                });
                newUser.save()
                    .then(() => resolve())
                    .catch(err => {
                        if (err.code === 11000) {
                            reject("User Name already taken");
                        } else {
                            reject(`There was an error creating the user: ${err}`);
                        }
                    });
            })
            .catch(err => reject("There was an error encrypting the password: " + err));
    });
};


const checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName }).exec()
            .then(user => {
                if (!user) {
                    reject(`Unable to find user: ${userData.userName}`);
                } else {
                    
                    bcrypt.compare(userData.password, user.password)
                        .then(isMatch => {
                            if (!isMatch) {
                                reject(`Incorrect Password for user: ${userData.userName}`);
                            } else {
                                if (user.loginHistory.length >= 8) {
                                    user.loginHistory.pop();
                                }
                                user.loginHistory.unshift({
                                    dateTime: new Date().toString(),
                                    userAgent: userData.userAgent
                                });
                                User.updateOne({ _id: user._id }, { $set: { loginHistory: user.loginHistory } })
                                    .then(() => resolve(user))
                                    .catch(err => reject(`There was an error verifying the user: ${err}`));
                            }
                        })
                        .catch(err => reject(`Password verification failed: ${err}`));
                }
            })
            .catch(err => reject(`Unable to find user: ${userData.userName}`));
    });
};



module.exports = {
    initialize,
    registerUser,
    checkUser
};