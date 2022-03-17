console.log("This is Express JS server - hosting wellfargo APIs");

const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;

const app = express();

app.use(express.json());
app.use(cors());
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// For parsing application/x-www-form-urlencoded
// app.use(express.urlencoded({ extended: true }));

/******* DB CONNECTION START **/

let mdb;
//const uri = "mongodb+srv://admin:Learn@2022@cluster0.kcijr.mongodb.net/Users?retryWrites=true&w=majority";

const uri = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
//const client = new MongoClient(uri);
MongoClient.connect(uri, (err, db) => {
    if(err) throw err;
    console.log("DB Connection successful");
    mdb = db;
   // db.close();
})

/****** DB CONNECTION END */


app.use((req, res, next)=> {
    res.header('Access-Control-Allow-Origin', '*');
    next();
})

app.get('/', (req, res)=> {
    console.log(req.body);
    res.send({Status:"Success"});
})

app.post('/IsUserValid', (req, res)=> {
    console.log(req.body);

    if(req.body.email === "" || req.body.password === "")
    {
        res.send({IsValid:false});
        return;
    }

    var valid = false;
    var dbo = mdb.db("Users");
    //Find the first document in the customers collection:
    var query = { email: req.body.email };
    dbo.collection("RegisteredUsers").find(query).toArray( (err, result) => {
      if (err) throw err;
      console.log("RESULT from DB: ",result);

      console.log("result.email : ", result[0].email, "--- result.password : ", result[0].password);
      console.log("req.body.email : ", req.body.email, "--- req.body.password: ", req.body.password)

      if(result[0].email === req.body.email && result[0].password === req.body.password)
      {
          console.log("user found");
          valid = true;
          console.log("IF valid: " , valid)
      }        
      else{
        console.log("User not found");
        console.log("ELSE valid: " , valid)
      }
      res.send({IsValid:valid});
     // mdb.close();
    });

    //console.log("BEFORE SEND --- valid: " , valid)

    
})

app.listen(8080, (status) => {
console.log("Server listening on port : ", 8080);
});
