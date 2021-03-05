var express = require("express");
var app = express();

var formidable = require("express-formidable");
app.use(formidable());

var mongodb = require("mongodb");
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;

var http = require("http").createServer(app);
var bcrypt = require("bcrypt");
var fileSystem = require("fs");

var jwt = require("jsonwebtoken");
const { request } = require("http");
var accessTokenSecret = "myAccessTokenSecret714";

app.use("/public", express.static(__dirname + "/public"));
app.set("view engine", "ejs");

var socketIO = require("socket.io")(http);
var socketID = "";
var users = [];

var mainUrl = "https://localhost:3000";

socketIO.on("connection", function (socket) {
  console.log("User connected", socket.id);
  socketID = socket.id;
});

http.listen(3000, function () {
  console.log("Started Serer");
  mongoClient.connect("mongodb://localhost:27017", function (error, client) {
    var database = client.db("TheGambit");
    console.log("Database connected");

    app.get("/signup", function (request, result) {
      result.render("signup");
    });

    app.post("/signup", function (request, result) {
      var name = request.fields.name;
      var username = request.fields.username;
      var email = request.fields.email;
      var password = request.fields.password;
      var gender = request.fields.gender;

      database.collection("users").findOne(
        {
          $or: [
            {
              email: email,
            },
            {
              username: username,
            },
          ],
        },
        function (error, user) {
          if (user == null) {
            bcrypt.hash(password, 10, function (error, hash) {
              database.collection("users").insertOne(
                {
                  name: name,
                  username: username,
                  email: email,
                  gender: gender,
                  profileImage: "",
                  coverPhoto: "",
                  dob: "",
                  city: "",
                  country: "",
                  aboutMe: "",
                  friends: [],
                  pages: [],
                  notifications: [],
                  groups: [],
                  posts: [],
                },
                function (error, data) {
                  result.json({
                    status: "success",
                    message: "Successfully Registered, Proceed to Login",
                  });
                }
              );
            });
          } else {
            result.json({
              status: "error",
              message: "Email or Username Already Exists",
            });
          }
        }
      );
    });
  });
});
