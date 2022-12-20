const  {sequelize} = require('./models')
const express = require('express')
const app = express()
const routes = require('./routes/index')

app.use(express.json())
app.use('/',routes)

app.get('/', (req, res) => {
    res.send("jwt test")
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,async () => {
    await sequelize.authenticate()
    console.log("running at "+ port);
});
