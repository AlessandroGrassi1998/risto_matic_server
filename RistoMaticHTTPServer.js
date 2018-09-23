var WebSocketServer = require('websocket').server;
var http = require('http');
var mysql = require("mysql");

var fs = require("fs");
var express = require("express");
var cors = require('cors');
var app = express();
// Load the module
var bodyParser = require('body-parser');

// Mount body-parser middleware, and instruct it to 
// process form url-encoded data
app.use(bodyParser.urlencoded({ extended: true }));


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
    //json che viene inviato in response se il codice inserito non viene trovato
    var notFoundJson = {};
    //notFoundJson["Risposta"] = "NO";
    console.log("RICHIESTA ARRIVARTA: " + contatore);
    contatore++;
    //esegue una query e asepetta la risposta in un altro thread
    con.query('SELECT * FROM risto_matic_android.cameriere WHERE password = ' + req.params.DATA, function (err, rows, fields) {
        //se la query non ha dato errori sul database
        if (!err) {
            if (rows.length >= 1)
            {
                //popola il json con il cameriere trovato e lo invia al client
                console.log(rows[0]);
                res.json(rows[0]);
            }
            else
            {
                //invia il json vuoto
                console.log(notFoundJson);
                res.json(notFoundJson);
            }
            console.log("QUERY ANDATA A BUON FINE");
        }
            //se la query ha dato errori sul database
        else {
            console.log("ERRORE:   " + err);
        }
    });
})

app.get('/getTablesInRoom/:sala', function (req, res) {
    var sala = parseInt(req.params.sala);
    
    console.log("GetTablesInRoom: " + sala + "\n");
    var formattedJson = [];
    var tableJson = {};
    con.query('SELECT * FROM risto_matic_android.gettablesinroom WHERE sala = ' + (sala+1) + ';', function (err, rows, fields) {
        if (!err) {
            var previusIdTable = 0;
            var previusDateTime = false;
            var firstTimeInForEach = true;
            var counter = 0;
            rows.forEach(function(element) {
                var currentIdTable = parseInt(element["tavolo_id"], 10);
                if (element["dataOraPrenotazione"] == null)
                {
                    if (previusDateTime && !firstTimeInForEach)
                        formattedJson.push(tableJson);
                    tableJson = {};
                    tableJson["idTable"] = element["tavolo_id"];
                    tableJson["state"] = element["nome_stato"];
                    tableJson["dataOraPrenotazione"] = [];
                    formattedJson.push(tableJson);
                    previusDateTime = false;
                }
                else
                {
                    if (currentIdTable == previusIdTable)
                    {
                        tableJson["dataOraPrenotazione"].push(element["dataOraPrenotazione"]);
                    }
                    else
                    {
                        if (!firstTimeInForEach)
                        {
                            formattedJson.push(tableJson);
                            
                        }
                        firstTimeInForEach = false;
                        tableJson = {};
                        tableJson["idTable"] = element["tavolo_id"];
                        tableJson["state"] = element["nome_stato"];
                        tableJson["dataOraPrenotazione"] = [];
                        tableJson["dataOraPrenotazione"].push(element["dataOraPrenotazione"]);
                    }
                    previusDateTime = true;
                }
                previusIdTable = currentIdTable;
                firstTimeInForEach = false;
            });
            res.json(formattedJson);
        }
        else {
            console.log(err);
        }
    });
})

app.get('/GetTablesRooms', function (req, res) {
    var tableJson = {};
    var roomJson = [];
    var formattedJson = [];

    con.query('SELECT * FROM risto_matic_android.gettablesinroom;', function (err, rows, fields) {        
        if (!err) {
            var previusIdTable = 0;
            var previusRoom = 0;
            var previusDateTime = false;
            var firstTimeInForEach = true;
            var lastRoom = rows[rows.length-1]["sala"];
            rows.forEach(function (element) {
                var currentIdTable = parseInt(element["tavolo_id"], 10);
                var currentRoom = parseInt(element["sala"], 10);

                if (currentRoom != previusRoom && !firstTimeInForEach) {
                    formattedJson.push(roomJson);
                    roomJson = [];
                }
                

                if (element["dataOraPrenotazione"] == null) {
                    if (previusDateTime)
                        roomJson.push(tableJson);
                    tableJson = {};
                    tableJson["idTable"] = element["tavolo_id"];
                    tableJson["state"] = element["nome_stato"];
                    tableJson["dataOraPrenotazione"] = [];
                    roomJson.push(tableJson);
                    previusDateTime = false;
                }
                else {
                    if (currentIdTable == previusIdTable) {
                        tableJson["dataOraPrenotazione"].push(element["dataOraPrenotazione"]);
                    }
                    else {
                        if (!firstTimeInForEach) {
                            roomJson.push(tableJson);
                        }
                        tableJson = {};
                        tableJson["idTable"] = element["tavolo_id"];
                        tableJson["state"] = element["nome_stato"];
                        tableJson["dataOraPrenotazione"] = [];
                        tableJson["dataOraPrenotazione"].push(element["dataOraPrenotazione"]);
                    }
                    previusDateTime = true;
                }
                previusRoom = currentRoom;
                firstTimeInForEach = false;
                previusIdTable = currentIdTable;
            });
            formattedJson.push(roomJson);

            console.log(formattedJson);
            res.json(formattedJson);
            console.log("QUERY ANDATA A BUON FINE");
        }
        else {
            console.log(err);
        }
    });

    })

app.post('/changeTableState/:parameters', function (req, res) {
    console.log("RICHIESTA LALERO");
    console.log(req.body);
    console.log(req.query);
    console.log(req.params);
    var data = [];
    //UPDATE `risto_matic_android`.`tavolo` SET `fk_stato_tavolo_id`='2' WHERE `tavolo_id`='1';
    var parametersInJson = JSON.parse(req.params.parameters);
    con.query('UPDATE `risto_matic_android`.`tavolo` SET `fk_stato_tavolo_id`=' +/*DA MODIFICARE!!*/ 2 + ' WHERE `tavolo_id`=' + parametersInJson.idTavolo + ';', function (err, rows, fields) {
        //se la query non ha dato errori sul database
        if (!err) {}
        else 
            console.log("ERRORE:   " + err);
        
    });
    res.status(201).json(data);
});


/*
app.get('/GetTablesRooms', function (req, res) {
    var tableJson = {};
    var roomJson = [];
    var formattedJson = [];

    con.query('call getAllTablesAndRooms()', function (err, rows, fields) {
        if (!err) {
            var previusIdTable = 0;
            var previusRoom = 0;
            var previusDateTime = false;
            var firstTimeInForEach = true;
            var lastRoom = rows[0][rows[0].length - 1]["sala"];
            rows[0].forEach(function (element) {
                var currentIdTable = parseInt(element["tavolo_id"], 10);
                var currentRoom = parseInt(element["sala"], 10);

                if (currentRoom != previusRoom && !firstTimeInForEach) {
                    formattedJson.push(roomJson);
                    roomJson = [];
                }
                

                if (element["dataOraPrenotazione"] == null) {
                    if (previusDateTime)
                        roomJson.push(tableJson);
                    tableJson = {};
                    tableJson["idTable"] = element["tavolo_id"];
                    tableJson["state"] = element["nome_stato"];
                    tableJson["dataOraPrenotazione"] = [];
                    roomJson.push(tableJson);
                    previusDateTime = false;
                }
                else {
                    if (currentIdTable == previusIdTable) {
                        tableJson["dataOraPrenotazione"].push(element["dataOraPrenotazione"]);
                    }
                    else {
                        if (!firstTimeInForEach) {
                            roomJson.push(tableJson);
                        }
                        tableJson = {};
                        tableJson["idTable"] = element["tavolo_id"];
                        tableJson["state"] = element["nome_stato"];
                        tableJson["dataOraPrenotazione"] = [];
                        tableJson["dataOraPrenotazione"].push(element["dataOraPrenotazione"]);
                    }
                    previusDateTime = true;
                }
                previusRoom = currentRoom;
                firstTimeInForEach = false;
                previusIdTable = currentIdTable;
            });
            formattedJson.push(roomJson);

            console.log(formattedJson);
            res.json(formattedJson);
            console.log("QUERY ANDATA A BUON FINE");
        }
        else {
            console.log(err);
        }
    });

    })
*/
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