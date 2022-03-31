const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const { check, validationResult} = require('express-validator');
const encoder = bodyParser.urlencoded();

const app = express();
app.use("/assets", express.static("assets"));

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "node_login"
});
 
//connect to DB
connection.connect(function(error){
	if(error) throw error
		else console.log("connected to database successfully");
});

app.get("/", function(req, res){
	res.sendFile(__dirname + "/index.html");
});

app.get("/signup", function(req, res){
	res.sendFile(__dirname + "/signup.html");
});


app.post("/",encoder,  function(req, res){
	var user_name=req.body.user_name;
	var password=req.body.password;
	connection.query("select * from user where user_name=? and password=?",[user_name,password], function(error,results,fields){
		if(results.length > 0 ){
			res.redirect("/welcome");
		} else {
			res.redirect("/");
		}

		res.end();
	});
});


app.post("/sign-up",encoder, [
		check('name', 'Name is required.')
		.exists()
		.isLength({ min:3 }),
		check('user_name', 'E-mail is not valid')
		.isEmail()
		.normalizeEmail(),
		// password validation
		  check('password').trim().notEmpty().withMessage('Password required')
		  .isLength({ min: 5 }).withMessage('password must be minimum 5 length')
		  .matches(/(?=.*?[A-Z])/).withMessage('At least one Uppercase')
		  .matches(/(?=.*?[a-z])/).withMessage('At least one Lowercase')
		  .matches(/(?=.*?[0-9])/).withMessage('At least one Number')
		  .matches(/(?=.*?[#?!@$%^&*-])/).withMessage('At least one special character')
		  .not().matches(/^$|\s+/).withMessage('White space not allowed'),
		  // confirm password validation
		  check('confirm_password').custom((value, { req }) => {
		       if (value !== req.body.password) {
		             throw new Error('Password Confirmation does not match password');
		        }
		        return true;
		   })

	],  function(req, res){

		const errors = validationResult(req);

		if(!errors.isEmpty()){
			return res.status(422).jsonp(errors.array());
		}

	var name=req.body.name;
	var user_name=req.body.user_name;
	var password=req.body.password;

	var sql = `INSERT INTO user (name, user_name, password, status) VALUES ("${name}", "${user_name}", "${password}", "1")`;
  	connection.query(sql, function(error, result) {
		
		if(error) throw error;
		
		res.redirect("/signin");
		console.log("1 record inserted");

	});
});

//when signup is success
app.get("/signin", function(req, res){
	res.sendFile(__dirname + "/index.html");
});


//when login is success
app.get("/welcome", function(req, res){
	res.sendFile(__dirname + "/welcome.html");
});

//set app port
app.listen(4500);