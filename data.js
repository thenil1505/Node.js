const mysql = require('mysql');
var fs = require('fs');
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const { TINY_BLOB } = require('mysql/lib/protocol/constants/types');
 
const app = express();
 
app.use(express.static('public'));
 
// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
 
const oneDay = 1000 * 60 * 60 * 24; // calculate one day

// create connection
function connect_db(){
    return  mysql.createConnection({host:"mysqlserverthea.mysql.database.azure.com", user:"thenil", 
    password:"Passord1", database:"restaurant", port:3306, ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});
}

// express app should use sessions
app.use(sessions({
    secret: "thisismysecrctekeyfhgjkgfhkgfjlklkl",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
 
// set the view engine to ejs
app.set('view engine', 'ejs');
 
// a variable to save a session
var session;
 
app.get('/', function (req, res) {
     session=req.session;
     if(session.userid){
        res.render('user_login.ejs', { 
            userid: session.userid      
        });
     } 
     else {
        res.render('user_login.ejs', { });
     }
})
 
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.render('user_login.ejs', {     
    });
})

app.get('/staff_login', function (req, res) {
    res.render('staff_login.ejs', {     
    });
})

app.get('/back_user_login', function (req, res) {
    res.render('user_login.ejs', {     
    });
})

app.get('/signup', function (req, res) {
    res.render('signup.ejs', {     
    });
})

app.get('/home', function (req, res) {
    res.render('main.ejs', {     
    });
})

app.get('/work', function (req, res) {
    res.render('work.ejs', {     
    });
})

app.get('/booking', function (req, res) {
    var con = connect_db()

    con.connect(function(err) {
        //if (err) throw err;
        con.query("SELECT * FROM tables", function (err, table_result, fields) {
           if (err) throw err;
           console.log(table_result);     
                         
           res.render('table_book.ejs', {
              data: table_result,
                 
         }); // render
        }); // select
   });// connect
})


app.get('/order_food', function (req, res) {
    var con = connect_db()

    con.connect(function(err) {
        //if (err) throw err;
        con.query("SELECT * FROM food_items", function (err, food_result, fields) {
           if (err) throw err;
           console.log(food_result);     
                         
           res.render('food_menu.ejs', {
              data: food_result,
                 
         }); // render
        }); // select
   });// connect
})

app.get('/order_drink', function (req, res) {
    var con = connect_db()

    con.connect(function(err) {
        //if (err) throw err;
        con.query("SELECT * FROM drink_items", function (err, drink_result, fields) {
           if (err) throw err;
           console.log(drink_result);     
                         
           res.render('drink_menu.ejs', {
              data: drink_result,
                 
         }); // render
        }); // select
   });// connect
})

app.post('/book_table',(req, res) => {
    var con = connect_db()

    var table_number = req.body.table_number
    var customer_id = req.body.customer_id
    var date_time = req.body.date_time
   
    var sql = `INSERT INTO book (table_number, customer_id, date_time) VALUES (?,?,?)`;
    var values = [table_number, customer_id, date_time];
 
    con.query(sql, values, (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Table has been booked');
        
        res.render('booked.ejs');
    });
})

app.get('/reserve', function (req, res) {
    res.render('reserve.ejs', {     
    });
})

app.get('/about', function (req, res) {
    res.render('about_us.ejs', {     
    });
})


app.post('/user',(req,res) => {

    var con = connect_db()

   // hent brukernavn og passord fra skjema på login
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var password = req.body.password;

    var sql = `SELECT * FROM customers WHERE firstname = ? AND lastname = ? AND password = ?`;

    con.query(sql, [firstname,lastname,password], (error, results) => {
        if (error) {
            res.status(500).send('Internal Server Error');
        } else if (results.length === 1) {
            session = req.session;
            session.userid=req.body.firstname; // set session userid til navnet
            res.redirect('/home');
 
        } else {
            res.redirect('/login?error=invalid'); // redirect med error beskjed i GET
        }
    });
})

app.post('/signup', (req, res) => {
    
    var con = connect_db()

    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var phone_nr = req.body.phone_nr;
    var email = req.body.email;
    var password = req.body.password;
 
    var sql = `INSERT INTO customers (firstname,lastname,password,phone_nr,email) VALUES (?,?,?,?,?)`;
    var values = [firstname,lastname,password,phone_nr,email];
 
    con.query(sql, values, (err, result) => {
        if (err) {
            throw err;
        }
        console.log('User inserted into database');
        
        res.render('user_login.ejs');
 
    });
});
 
 var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
 })


 app.get('/api', function(req, res) {
    res.send('this is the response');
 });