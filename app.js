const port = 3000;
const path = require('path')
const express =require('express')
const app = express()
const upload = require('express-fileupload')
const session = require('express-session')
const data = require('./routes/default')
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(upload())
app.use(express.static('public'))
app.use(express.urlencoded({
  
    extended:true
  }))
app.use(session({
    secret: "mywebsite",
    resave:true ,
    saveUninitialized:true
  
}));
app.use('/',data)
app.use((req,res )=>{
    res.status(400).render('404')       
})
app.listen(port,(err)=>{
    if(err){
        console.log(err)
    }
    console.log('serve is running')
})
