var WebSocketServer = require('websocket').server;
var http = require('http');
var mysql = require("mysql");

var fs = require("fs");
var express = require("express");
var cors = require('cors');
var app = express();
app.use(cors());
var serverExpress = app.listen(8080, function () {
    console.log("********HTTP SERVER STARTED**********");
});

app.get('/test/:num', function (req, res) {
    console.log(req.params.num);
    res.end("OK");
})
var contatore = 0;
app.get('/CheckLogIn/:DATA', function (req, res) {
    var notFoundJson = {};
    //notFoundJson["Risposta"] = "NO";
    console.log("RICHIESTA ARRIVARTA: " + contatore);
    contatore++;

    con.query('SELECT * FROM risto_matic_android.cameriere WHERE password = ' + req.params.DATA, function (err, rows, fields) {
        if (!err) {
            if (rows.length >= 1)
            {
                console.log(rows[0]);
                res.json(rows[0]);
            }
            else
            {
                console.log(notFoundJson);
                res.json(notFoundJson);
            }
            console.log("QUERY ANDATA A BUON FINE");
        }
        else {
            console.log("ERRORE:   " + err);
        }
    });
})

app.get('/GetTavoli', function (req, res) {
    console.log("GetTavoli");
    var jsonFormattato = [];
    var jsonTavolo = {};
    con.query('CALL SelectTables()', function (err, rows, fields) {
        if (!err) {
            var idTavoloPrecedente = 0;
            var dataOraPrecedente = false;
            var primaVoltaNelForEach = true;
            rows[0].forEach(function(element) {
                var idTavoloCorrente = parseInt(element["tavolo_id"], 10);
                if (element["dataOraPrenotazione"] == null)
                {
                    if (dataOraPrecedente)
                        jsonFormattato.push(jsonTavolo);
                    jsonTavolo = {};
                    jsonTavolo["tavolo_id"] = element["tavolo_id"];
                    jsonTavolo["nome_stato"] = element["nome_stato"];
                    jsonTavolo["dataOraPrenotazione"] = [];
                    jsonFormattato.push(jsonTavolo);
                    dataOraPrecedente = false;
                }
                else
                {
                    if(idTavoloCorrente == idTavoloPrecedente)
                    {
                        jsonTavolo["dataOraPrenotazione"].push(element["dataOraPrenotazione"]);
                    }
                    else
                    {
                        if (!primaVoltaNelForEach)
                        {
                            jsonFormattato.push(jsonTavolo);
                            
                        }
                        primaVoltaNelForEach = false;
                        jsonTavolo = {};
                        jsonTavolo["tavolo_id"] = element["tavolo_id"];
                        jsonTavolo["nome_stato"] = element["nome_stato"];
                        jsonTavolo["dataOraPrenotazione"] = [];
                        jsonTavolo["dataOraPrenotazione"].push(element["dataOraPrenotazione"]);
                    }
                    dataOraPrecedente = true;
                }
                console.log(jsonFormattato);
                console.log("\nFINE FOR EACH\n");
                idTavoloPrecedente = idTavoloCorrente;
            });
            res.json(jsonFormattato);
        }
        else {
            console.log(err);
        }
    });
})

app.get('/camerieri', function (req, res) {
    res.end("CAMERIERI");
})

app.get('/addPiatto/:JsonPiatto', function (req, res) {
    console.log(req.params.JsonPiatto);
    if (IsJsonString(req.params.JsonPiatto))
    {
        var JsonPiatto = JSON.parse(req.params.JsonPiatto);
        con.query('INSERT INTO `mydb`.`piatti` (`idPiatto`, `Nome`,`Descrizione`,`Prezzo`, `Tipo`) VALUES ("' + JsonPiatto["idPiatto"] + '", "' + JsonPiatto["idPiatto"] + '", "' + JsonPiatto["Descrizione"] + '", "' + JsonPiatto["Prezzo"] + '", "' + JsonPiatto["Tipo"] + '")', function (err, rows, fields) {
            if (!err) {
                res.end("OK");
                console.log("QUERY ANDATA A BUON FINE");
            }
            else {
                res.end("Not valid query: " + err);
                console.log("ERRORE:   " + err);
            }
        });
    }
    else
    {
        res.end("Not valid json");
    }
})

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


////////////////////////////////////
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "cisco",
    database: "risto_matic_android"
});
con.connect();


var server = http.createServer(function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
    // server we don't have to implement anything.
    response.end("WORK!!");
});
server.listen(1337, function() {console.log("SERVER STARTED"); });



// create the server
wsServer = new WebSocketServer({
  httpServer: server
});

var connections = [];

function getConnectionIndex(connection)
{
	for(var i=0;i<connections.length;i++)
	{
		if(connections[i] == connection)
		{
			return i+1;
		}
	}
}
var messages = {}
var countMessages = 1;
var key = 'Message';


function putInJSON(utf8Data, connection)
{
	key = 'Message' + countMessages++ + ' WAITER ' + getConnectionIndex(connection);
	messages[key] = [];
	messages[key].push(utf8Data);
}

function readFromJSON(utf8Data, connection)
{
    var jsonData = JSON.parse(utf8Data);
    var tavolo = jsonData["tavolo"];
    var ordinazioni = jsonData["ordinazioni"];


    for (var i = 0; i < ordinazioni.length; i++)
    {
        con.query('INSERT INTO `sakila`.`actor` (`first_name`, `last_name`) VALUES ("WAITER: ' + tavolo + '", "' + ordinazioni[i] + '")', function (err, rows, fields) {
            if (!err) {
                console.log("QUERY ANDATA A BUON FINE");
            }
            else {
                console.log("ERRORE:   " + err);
            }
        });
    }
}

// WebSocket server
//wsServer.on('request', function(request) {
//  var connection = request.accept(null, request.origin);
//console.log("A connection started");
//	connections.push(connection);
//	console.log("WAITER " + connections.length);
//  // This is the most important callback for us, we'll handle
//  // all messages from users here.
//  connection.on('message', function(message) {
//      if (message.type === 'utf8') {
          
//      // process WebSocket message
//	  connection.sendUTF(message.utf8Data);
//          console.log("MESSAGE RECEIVED FORM WAITER " + getConnectionIndex(connection) + ": " + message.utf8Data);
          
//	  //putInJSON(message.utf8Data, connection);
//	  //console.log(messages);
//	  //readFromJSON(message.utf8Data, connection);

//    }
// });

//  connection.on('close', function(connection) {
//    // close user connection
//	console.log("A connection is closed");
//  });
//});