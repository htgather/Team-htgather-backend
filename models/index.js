const mongoose = require('mongoose');


const connect = () => {
    mongoose.connect('mongodb://localhost:27017/work-out-at-home', { ignoreUndefined:true }).catch((err) => {
        console.error(err);
    })
};

module.exports = connect;