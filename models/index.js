const mongoose = require('mongoose')

const connect = () => {
    mongoose
        .connect(process.env.DB_URL, {
            ignoreUndefined: true,
        })
        .catch((err) => {
            console.error(err)
        })
}

module.exports = connect
