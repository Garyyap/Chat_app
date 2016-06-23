var http = require('http');
var fs = require('fs');

	var server = http.createServer(function(req, res) {

      switch(req.url){

         case '/index.html':
            
            console.log("CLient request for index.html page");
            fs.readFile(__dirname + req.url , function(err,data){

            if(err){
                  res.writeHead(404);
                  res.end(JSON.stringify(err));
                  return;
               }
                 res.writeHead(200);
                 res.end(data);
            });                     
            
         break;

         case '/test':
            console.log("hello,client just send a resquest of text");
         break;


      }
	});

server.listen(8000);
console.log("Server is running at port 8000");
