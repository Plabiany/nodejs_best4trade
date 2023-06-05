var local = false;
if(local)
  var PORT = process.env.PORT || process.argv[2];
else
  var PORT = process.env.PORT_SERVER || 21009;
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
var tempo = 0;
var pausa = false;
var stopInterval = false;
const initializePassport = require("./passportConfig");


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
    secret: 'process.env.SESSION_SECRET',
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
  //console.log(req.session.flash.error);
});

app.get("/bestfortrade", checkNotAuthenticated, (req, res) => {
  
  //console.log(req.isAuthenticated());
  if(req.isAuthenticated() === true){
    res.render("bestfortrade", { user: req.user.name });
    //res.sendFile('views/bestfortrade.ejs');
    //req.session
  }else{
    res.render("index.ejs");
  }
  
});

app.ws('/bestfortrade', function(ws, req) {
  let listOpen = [];
  let listClosed = []; //tentar com let
  //var listAtive = [];
  var fstDateRecv = {};
  let corrente = '-';
  var numero_preg = 1;
  let n_preg = 0;
  var consolidado = 0;
  var consolidado_day = 0;
  var consolidado_preg = 0;
  var day = 0;
  var hour = 1;
  var framework = []; 

  if( sign === 3 ){
    const dados = dbData.plab(inicio, preg, "1");
    const resultado = dados.then(total => { 
    //console.log(total);


    var objOpen = utils.getObjDict(total.opeNum, 
                                   total.time, 
                                   total.rull, 
                                   total.operation, 
                                   total.symbol, 
                                   total.amount, 
                                   total.price, 
                                   total.value);

    listOpen.push(objOpen);
  
    var firstHour = (total.time).toString();
    //console.log('FIRST '+total.date);
    var firstDate = (total.date).toString();
    var firstDate1 = utils.dayFormat(firstDate);
    
    //listAtive.push(ativos);
    
    var tableVoid = utils.getObject();
    listClosed.push(tableVoid);

    framework = utils.framework(listOpen, 
                                listClosed, 
                                firstDate1, 
                                firstHour,
                                [inicio, blocos, preg, freq, tempo],
                                3,
                                (consolidado_preg).toFixed(3),
                                numero_preg,
                                consolidado.toFixed(3));
    ws.send(JSON.stringify(framework));
    })

    ws.on('message', function(msg) {
      var  newHour = '';
      var FirstAll = {};
      fstDateRecv = JSON.parse(msg);

      //var j = setInterval(function(){},tempo);
      var i = setInterval(function(){
       
        var data0 = utils.addDays(fstDateRecv[0],day);
        var data = (data0.getMonth()+1).toString() + "/" + (data0.getDate()).toString() + "/" + (data0.getFullYear()).toString();
        
        let numero_preg = (day+1).toString() + '/' + preg;
        if (day > 0 && hour === 1){
          listClosed = [];
          FirstAll = '13:00:00'; // limite de duas horas para mais ou menos
          var tablevoid3 = utils.getObject();
          listClosed.push(tablevoid3);
          let corrente = '-';
          let n_preg = 0;
          consolidado_preg = 0;
        }else{       
          FirstAll = fstDateRecv[1]; 
          //FirstAll = '17:24:09';
        }

        var newHour = utils.add_secs_to_time(FirstAll, hour);
        const dados2 = dbData.getNextTime(data, newHour);
        const resultado = dados2.then(total1 => {     

          if(total1.ES === 'E'){

            var objOpen = utils.getObjDict(total1.opeNum, 
                                           total1.time, 
                                           total1.rull, 
                                           total1.operation, 
                                           total1.symbol, 
                                           total1.amount, 
                                           total1.price, 
                                           total1.value);
            listOpen.push(objOpen);
            var tdate = utils.dayFormat(total1.date);     

            //Fazer um if para separar as vezes que 0.485 é enviado, o if deve apenas alterar o envio de consolidados

            var anotherConsolidadoPreg = utils.getResultFixedConsole(consolidado_preg.toString(),consolidado_preg);
            var anotherConsolidado = utils.getResultFixedConsole(consolidado.toString(),consolidado);
            framework = utils.framework(
                                          listOpen, 
                                          listClosed,
                                          tdate,
                                          //total1.time,
                                          newHour,
                                          [inicio, blocos, preg, freq, tempo],
                                          9,
                                          anotherConsolidadoPreg,
                                          numero_preg,
                                          anotherConsolidado);
            
            if (ws.readyState === ws.OPEN) {
              // open
              ws.send(JSON.stringify(framework));
            }else{
              stopInterval = !stopInterval;
              ws.send(JSON.stringify(framework));
            }

          }else if(total1.ES === "S"){
            var nListOpen = [];
            var newListOpen = utils.exclude_position(listOpen,total1.opeNum);
            //console.log(newListOpen[0].length); 
            listOpen = newListOpen[0];
            var Dict_ = newListOpen[1];     

            var objOpen = utils.getObjDict(total1.opeNum, 
                                           total1.time, 
                                           total1.rull, 
                                           total1.operation, 
                                           total1.symbol, 
                                           total1.amount, 
                                           total1.price, 
                                           total1.value);

            var tableAmount = utils.getObjectClosed(
                          objOpen.opeNum,
                          Dict_[0], //time
                          Dict_[1], // rull
                          Dict_[2], // operation
                          Dict_[3], // symbol
                          Dict_[4], // amount
                          Dict_[5], // price
                          Dict_[6], // value
                          objOpen.time, //time2
                          objOpen.rull, //rull2
                          objOpen.price, // price2
                          objOpen.value // value2
                          );

            listClosed.push(tableAmount[0]); 
                   
            var tdate = utils.dayFormat(total1.date);     
            //var noPointConsole = utils.getResultFixed(tableAmount[1]);

            if(consolidado_preg < 1000){
              consolidado_preg += tableAmount[2];
              consolidado += tableAmount[2];
              var anotherConsolidadoPreg = utils.getResultFixedConsole(consolidado_preg.toString(),consolidado_preg);
              var anotherConsolidado = utils.getResultFixedConsole(consolidado.toString(),consolidado);
              framework = utils.framework(listOpen, 
                                          listClosed,
                                          tdate,
                                          //total1.time,
                                          newHour,
                                          [inicio, blocos, preg, freq, tempo],
                                          9,
                                          anotherConsolidadoPreg,
                                          numero_preg,
                                          anotherConsolidado);
            }else{
              consolidado_preg += tableAmount[2];
              consolidado += tableAmount[2];
              framework = utils.framework(
                              listOpen, 
                              listClosed,
                              tdate,
                              //total1.time,
                              newHour,
                              [inicio, blocos, preg, freq, tempo],
                              9,
                              consolidado_preg.toFixed(3),
                              numero_preg,
                              consolidado.toFixed(3));
            }
            
            ws.send(JSON.stringify(framework));
          }
          console.log(newHour);
        })
        
        if(!stopInterval){
          if(day < (preg-1) && newHour === '20:00:00'){ 
            //SignClosedSign = true;
            //console.log("TEMPO " + tempo);

            var end = Date.now() + parseInt(tempo);
            //console.log(end);
            while (Date.now() < end);
            day++;
            hour = 0;
          }else if( day === (preg-1) && newHour === '20:00:00'){
            clearInterval(i);
          }else{
            if(pausa){ 
              //console.log("PAUSE CLICADO");
              ws.send(JSON.stringify(framework));
            }else
              hour++;
          }
        }else{
          clearInterval(i);
          stopInterval = !stopInterval;
        }
      },freq);
    });

    sign = 0;
  }else{
    //ws.send('feijao');
    //console.log("Login realizado");
    sign = 3;
  }
  
});

app.post('/bestfortrade', function(req, res){
  if (sign === 0) {
    inicio = 0;
    blocos = 0;
    preg = 0;
    freq = 0;
    tempo = 0;
    sign = 0;
  }else{
    inicio = req.body.inicio_dos_testes; 
    blocos = req.body.blocos; 
    preg = req.body.pregoes;
    freq = req.body.frequencia;
    tempo = req.body.tempo_entre_pregoes;
    sign = 3;
  }
  return res.render('bestfortrade');
});

app.post("/bestfortrade/:id", (req, res) => {
  pausa = !pausa;
  //app.locals.language = pausa;
  res.json({
    success: true
  });
});


app.get("/users/logout", (req, res) => {
  stopInterval = !stopInterval;
  sign = 0;
  inicio = {}; 
  blocos = {}; 
  preg = {};
  freq = {};
  tempo = {};
  pausa = false;
  req.logout();
  res.redirect("/");
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
