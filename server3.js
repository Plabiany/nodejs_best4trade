const express = require("express");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const dbData = require("./operations.js");
const utils = require("./utils.js");
require("dotenv").config();
const app = express();
const http = require('http').Server(app);
var expressWs = require('express-ws')(app);
var delay = require('express-delay');
const { pool } = require("./dbConfig.js");
var sign = 0;
var inicio = {}; 
var blocos = {}; 
var preg = {};
var freq = {};
var tempo = {};
//const PORT = process.env.PORT_SERVER || 21009;
const PORT = process.env.PORT || process.argv[2];
const initializePassport = require("./passportConfig");
var listOpen = [];
let listClosed = []; //tentar com let
//var listAtive = [];
var fstDateRecv = {};
var SignClosedSign = 6;
let corrente = '-';
let numero_preg = 0;
let n_preg = 0;
let consolidado = 0;
let consolidado_preg = 0;
let consolidado_day = 0;


initializePassport(passport);

// Middleware

// Parses details from a form
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("view engine", "ejs");
app.use('/users', express.static(__dirname + '/public'));
app.use('/', express.static(__dirname + '/public'));

app.use(
  session({
    // Key we want to keep secret which will encrypt all of our information
    secret: process.env.SESSION_SECRET,
    // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false
  })
);
// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());

app.get("/", checkAuthenticated, (req, res) => {
  // flash sets a messages variable. passport sets the error message
  res.render("index");
  console.log(req.session.flash.error);
});

app.get("/bestfortrade", checkNotAuthenticated, (req, res) => {
  
  console.log(req.isAuthenticated());
  if(req.isAuthenticated() === true){
    res.render("bestfortrade", { user: req.user.name });
    //res.sendFile('views/bestfortrade.ejs');
    //req.session
  }else{
    res.render("index.ejs");
  }
  
});

app.ws('/bestfortrade', function(ws, req) {
  if( sign === 3 ){
    const dados = dbData.plab(inicio, preg, "1");
    const resultado = dados.then(total => { 
    //console.log(total);
    listOpen.push(total);
  
    var firstHour = (total.time).toString();
    var firstDate = (total.date).toString();
    
    //listAtive.push(ativos);
    
    var tableVoid = utils.getObject();
    
    listClosed.push(tableVoid);
    var framework = utils.framework(listOpen, listClosed, firstDate, firstHour,' ' ,3 ,(consolidado_preg).toFixed(3), numero_preg ,consolidado.toFixed(3));
    ws.send(JSON.stringify(framework));
    })

    ws.on('message', function(msg) {
      fstDateRecv = JSON.parse(msg);
      //console.log('received: %s', msg);
    
    ///var day = 0;
    for (var day = 0; day <= preg-1; day++ ){
      
      numero_preg = (day+1).toString() + '/' + preg;
      let listClosed = [];
      var parts = fstDateRecv[0].split('/');
      //console.log(parts);
      var data0 = utils.addDays(fstDateRecv[0],day);
      var data = (data0.getMonth()+1).toString() + "/" + (data0.getDate()).toString() + "/" + (data0.getFullYear()).toString();
      var hour = 1;
      var FirstAll= fstDateRecv[1];

      let consolidado_preg = 0;

      if (SignClosedSign === 3){
        FirstAll = '13:00:00'; // limite de duas horas para mais ou menos
        var tablevoid3 = utils.getObject();
        listClosed.push(tablevoid3);
        SignClosedSign = 6;
        let corrente = '-';
        let numero_preg = 0;
        let n_preg = 0;
        //let consolidado = 0
        //consolidado += parseFloat(consolidado_day);
        
      }
      //myFunction();
      setInterval(function(){
        hour++;
        var framework = [];
        var newHour = utils.add_secs_to_time(FirstAll, hour);
        const dados2 = dbData.getNextTime(data, newHour);
        const resultado = dados2.then(total1 => {     

          if(total1.ES === 'E'){      
            console.log(total1);
            listOpen.push(total1);
            var tdate = utils.dayFormat(total1.date);     

            if(listClosed.length === 0){
              var tablevoid3 = utils.getObject();  
              listClosed.push(tablevoid3);
            }     

            framework = utils.framework(listOpen, listClosed ,tdate ,total1.time ,' ' ,9 ,(consolidado_preg).toFixed(3) ,numero_preg ,consolidado.toFixed(3));
            ws.send(JSON.stringify(framework));

          }else if(total1.ES === "S"){
            var nListOpen = [];
            var newListOpen = utils.exclude_position(listOpen,total1.opeNum);     

            listOpen = newListOpen[0];
            var Dict_ = newListOpen[1];     

            var tableAmount = utils.getObjectClosed(
                          total1.opeNum,
                          Dict_[0], //time
                          Dict_[1], // rull
                          Dict_[2], // operation
                          Dict_[3], // symbol
                          Dict_[4], // amount
                          Dict_[5], // price
                          Dict_[6], // value
                          total1.time, //time2
                          total1.rull, //rull2
                          total1.price, // price2
                          total1.value // value2
                          );
            listClosed.push(tableAmount[0]);              
            consolidado_preg += parseFloat(tableAmount[1]);
            consolidado += parseFloat(tableAmount[1]);
            var tdate = utils.dayFormat(total1.date);     

            framework = utils.framework(listOpen, listClosed ,tdate ,total1.time ,' ' ,9 ,(consolidado_preg).toFixed(3) ,numero_preg ,consolidado.toFixed(3));
            ws.send(JSON.stringify(framework));  
          }
        })
        }
        ,1000);
      numero_preg = (day).toString() + '/' + preg;
      SignClosedSign = 3;      
    }
    });

    sign = 0;
  }else{
    //ws.send('feijao');
    //console.log("Login realizado");
    sign = 3;
  }
  
});

app.post('/bestfortrade', function(req, res){
  inicio = req.body.inicio_dos_testes; 
  blocos = req.body.blocos; 
  preg = req.body.pregões;
  freq = req.body.frequência;
  tempo = req.body.tempo_entre_pregões;
  sign = 3;
  return res.render('bestfortrade');
});


app.get("/users/logout", (req, res) => {
   req.logout();
   res.redirect("/"); //Inside a callback… bulletproof!
   sign = 9;
});

app.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/bestfortrade",
    failureRedirect: "/",
    failureFlash: true
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/bestfortrade");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


function opDay(FirstAll, hour, data){
  var listOpenDay = [];
  var framework = [];
  var newHour = utils.add_secs_to_time(FirstAll, hour);
  const dados2 = dbData.getNextTime(data, newHour);
  const resultado = dados2.then(total1 => {

    if(total1.ES === 'E'){

      listOpenDay.push(total1);
      var tdate = utils.dayFormat(total1.date);

      if(listClosed.length === 0){
        var tablevoid3 = utils.getObject();  
        listClosed.push(tablevoid3);
      }

      framework = utils.framework(listOpenDay, listClosed ,tdate ,total1.time ,' ' ,9 ,(consolidado_preg).toFixed(3) ,numero_preg ,consolidado.toFixed(3));
      //console.log(framework);

    }else if(total1.ES === "S"){
      var nListOpen = [];
      var newListOpen = utils.exclude_position(listOpen,total1.opeNum);

      listOpen = newListOpen[0];
      var Dict_ = newListOpen[1];

      var tableAmount = utils.getObjectClosed(
                    total1.opeNum,
                    Dict_[0], //time
                    Dict_[1], // rull
                    Dict_[2], // operation
                    Dict_[3], // symbol
                    Dict_[4], // amount
                    Dict_[5], // price
                    Dict_[6], // value
                    total1.time, //time2
                    total1.rull, //rull2
                    total1.price, // price2
                    total1.value // value2
                    );
      listClosed.push(tableAmount[0]);              
      consolidado_preg += parseFloat(tableAmount[1]);
      consolidado += parseFloat(tableAmount[1]);
      var tdate = utils.dayFormat(total1.date);

      framework = utils.framework(listOpen, listClosed ,tdate ,total1.time ,' ' ,9 ,(consolidado_preg).toFixed(3) ,numero_preg ,consolidado.toFixed(3));
           
    }
  })
}


var counter = 5;
let aux = 0;

function makeRequest(options, i) {
    // do your request here
    console.log(options.key, options.name, options.counter);
    console.log(i);
    return 9
}

function myFunction() {
    //alert(counter);
    //console.log(counter);
    // create options object here
    var options = {
    //    host:'www.host.com',
    //    path:'/path/'+counter
          'key':'9',
          'name':'bestfortrade',
          'counter': counter
    };
    aux = makeRequest(options, counter);
    console.log('ACIMA AUX');
    counter--;
    if (counter > 0) {
        setTimeout(myFunction, 3000);    
    }
}