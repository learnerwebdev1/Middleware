console.log("This is Express JS server - hosting wellfargo APIs");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;

const app = express();

app.use(express.json());
app.use(cors());
// configure the app to use bodyParser()
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());

//Cloud mongo DB Connection string
//const uri = "mongodb+srv://admin:pass123@cluster0.kcijr.mongodb.net/Users?retryWrites=true&w=majority";
const uri =
  "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  console.log(req.body);
  res.send({ Status: "Success" });
});

//-----------------------------------------------------------------------

app.get("/GetAllUserDetails", (req, res) => {
  var usersData = false;

  MongoClient.connect(uri, (err, mongoDB) => {
    if (err) throw err;
    console.log("DB CONNECTED - successful");
    var database = mongoDB.db("Users");
    const RegisteredUsers = database.collection("RegisteredUsers");
    const UsersDetails = RegisteredUsers.find().toArray((err, result) => {
      console.log(result);

      if (result.length !== 0) {
        res.send(result);
      } else {
        res.send("No User Details");
      }
    });
  });
});
//-------------------------------------------------------------------------
// ________________________________________________

app.post("/RegisterUser", (req, res) => {
  console.log(req.body);
  const userInfo = req.body;

  MongoClient.connect(uri, (err, mongoDB) => {
    if (err) throw err;
    console.log("DB CONNECTED - successful");
    var database = mongoDB.db("Users");
    const RegisteredUsers = database.collection("RegisteredUsers");

    const insertObj = {
      fname: userInfo.firstName,
      lname: userInfo.lastName,
      password: userInfo.password,
      email: userInfo.email,
    };

    RegisteredUsers.insertOne(insertObj)
      .then((respone) => {
        res.status(201).json({ respone });
      })
      .catch((err) => {
        res.status(500).json({ err });
      });
  });
});

// __________________________________________________

app.post("/IsUserValid", (req, res) => {
  console.log("step-1");
  console.log(req.body);
  var valid = false;
  if (req.body.email === "" || req.body.password === "") {
    res.send({ IsValid: valid });
    return;
  }

  console.log("step-2");

  MongoClient.connect(uri, (err, mongoDB) => {
    if (err) throw err;
    console.log("DB CONNECTED - successful");

    var database = mongoDB.db("Users");
    //var database = mongoDB.db("sample_mflix");

    //Find the first document in the customers collection:
    var query = { email: req.body.email };
    console.log("step-3");
    const RegisteredUsers = database.collection("RegisteredUsers");
    //const RegisteredUsers = database.collection("users");
    RegisteredUsers.find(query).toArray((err, result) => {
      if (err) throw err;
      console.log("step-4");
      console.log("RESULT from DB: ", result);

      if (result.length !== 0) {
        if (
          result[0].email === req.body.email &&
          result[0].password === req.body.password
        ) {
          console.log("user found");
          valid = true;
          res.send({ IsValid: valid });
          console.log("IF valid: ", valid);
        } else {
          console.log("User not found");
          console.log("ELSE valid: ", valid);
          res.send({ IsValid: valid });
        }
      } else {
        res.send({ IsValid: valid });
      }
      console.log("step-5");
      return valid;
    });
  });
});

app.listen(8080, (status) => {
  console.log("Server listening on port : ", 8080);
});
