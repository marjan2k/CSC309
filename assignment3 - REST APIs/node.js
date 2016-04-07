var http = require('http');
var fs = require("fs");
const PORT=3000; 




var obj;
fs.readFile('favs.json', 'utf8', function (err, data) {
  if (err) throw err;
  obj = JSON.parse(data);
  //console.log(obj[0].id_str);
  //console.log("Json object size: "+obj.length);
});

//We need a function which handles requests and send response
function handleRequest(request, response){
    //console.log(request.url);
    if(request.url === "/"){
        //console.log(request.method);
        fs.readFile("index.html", function (err, data) {
            if(err){
                response.writeHead(404);
                response.write("Not Found!");
            }
            else{
              response.writeHead(200, {'Content-Type': 'text/html'});
              response.write(data);
            }
            response.end();
        });
    }
    
    else if(/^\/[a-zA-Z0-9\/]*.css$/.test(request.url.toString())){
        //console.log("serving css");
        sendFileContent(response, request.url.toString().substring(1), "text/css");
    }
    else if(/^\/[a-zA-Z0-9\/]*.js$/.test(request.url.toString())){
        console.log("serving javascript");
        sendFileContent(response, request.url.toString().substring(1), "text/javascript");
    }

    else if(request.url === "/tweets"){
        //console.log(request.url);
        var i;
        var result=[];
        for (i=0; i<obj.length; i++){
            var element={};
            element["created_at"] = obj[i].created_at;
            element["id"] = obj[i].id_str;
            element["text"] = obj[i].text;
            result.push(element);
            //console.log(result);
        }
        result = JSON.stringify(result);
        response.writeHead(200, {"Content-Type": "application/json"});
        //console.log(result);
        response.end(result);
    }
   
    else if(request.url === "/users"){
        var i;
        var result=[];
        for (i=0; i<obj.length; i++){

            for (var key in obj[i]) {
                if (obj[i].hasOwnProperty(key)){
                    //console.log(key + " -> " + obj[i][key]);
                    if (key === 'user'){
                        var element={};
                        element["id"] = obj[i][key]["id_str"];
                        element["name"] = obj[i][key]["name"];
                        element["screen_name"] = obj[i][key]["screen_name"];
                        result.push(element);
                    }
             
                    if (key === 'entities'){
                        //console.log(key)
                        for (var key2 in obj[i][key]["user_mentions"]){
                            //console.log (obj[i][key]["user_mentions"][key2]);
                            var element={};
                            element["id"] = obj[i][key]["user_mentions"][key2]["id_str"];
                            element["name"] = obj[i][key]["user_mentions"][key2]["name"];
                            element["screen_name"] = obj[i][key]["user_mentions"][key2]["screen_name"];
                            //console.log(element);
                            result.push(element); 
                        }
                    }
                }
            }
        }
        result = JSON.stringify(result);
        response.writeHead(200, {"Content-Type": "application/json"});
        response.end(result);
    }

    else if (request.url === "/links"){
        var regexp = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/i;
        //console.log("requst.url:"+request.url);
        var url;
        var i;
        var result=[];
        for (i=0; i<obj.length; i++){
            var element={};
            element["id"] = obj[i].id_str;
            //console.log(element);
            for (var key in obj[i]) {
                if (obj[i].hasOwnProperty(key)){
                    url = regexp.exec(obj[i][key]);
                    //console.log(obj[i][key]);
                    if (url!==null){
                        element[key]=url[0];
                        //console.log(url[0]);
                    }
                    //console.log(key + " -> " + obj[i][key]);
                    if(typeof obj[i][key]==='object' && obj[i][key]!==null){
                        for (var key2 in obj[i][key]){
                            //console.log(key2 + " -> " + obj[i][key][key2]);
                            url = regexp.exec(obj[i][key][key2]);
                            //console.log(obj[i][key]);
                            if (url!==null && key2!=="coordinates"){
                                element[key2]=url[0];
                                //console.log(url[0]);
                            }
                            if(typeof obj[i][key][key2]==='object' && obj[i][key][key2]!==null){
                                for (var key3 in obj[i][key][key2]){
                                    //console.log(key3 + " -> " + obj[i][key][key2][key3]);
                                    url = regexp.exec(obj[i][key][key2][key3]);
                                    //console.log(obj[i][key]);
                                    if (url!==null && key3!=="0" && key3!=="1" && key3!=="coordinates"){
                                        element[key3]=url[0];
                                        //console.log(key3 + url[0]);
                                    }
                                    if(typeof obj[i][key][key2][key3]==='object' && obj[i][key][key2][key3]!==null){
                                        for (var key4 in obj[i][key][key2][key3]){
                                            //console.log(key3 + " -> " + obj[i][key][key2][key3]);
                                            url = regexp.exec(obj[i][key][key2][key3][key4]);
                                            //console.log(obj[i][key]);
                                            if (url!==null && key4!=="0" && key4!=="1" && key4!=="coordinates"){
                                                element[key4]=url[0];
                                                //console.log(key4 + url[0]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
            }
            
            result.push(element);
        }
        result = JSON.stringify(result);
        response.writeHead(200, {"Content-Type": "application/json"});
        //console.log(result);
        response.end(result);
    }

    else if (request.url.split("?")[0] === "/unique_tweet"){
        var tweet_requested = request.url.split("=")[1];
        //console.log("request given data : "+ tweet_requested);
        //console.log(typeof tweet_requested);
        
        var i;
        var result=[];
        
        for (i=0; i<obj.length; i++){
            var element = {};
            for (var key in obj[i]) {
                if (obj[i].hasOwnProperty(key)){
                    if (obj[i][key] === tweet_requested){
                        //console.log(obj[i]["text"]);
                        element["id"] = obj[i]["id_str"];
                        element["text"] = obj[i]["text"];
                        element["source"] = obj[i]["source"];
                        //console.log(element);
                        result.push(element);
                    }
                }
            }

            //console.log(result);
        }
        
        result = JSON.stringify(result);
        response.writeHead(200, {"Content-Type": "application/json"});
        console.log(result);
        response.end(result);
    }
    
    else if (request.url.split("?")[0] === "/unique_user"){
        var screen_name_requested = request.url.split("=")[1];
        //console.log("request given data : "+ screen_name_requested);
        //console.log(typeof screen_name_requested);
        
        var i;
        var result=[];
        
        for (i=0; i<obj.length; i++){

            for (var key in obj[i]) {
                if (obj[i].hasOwnProperty(key)){
                    //console.log(key + " -> " + obj[i][key]);
                    if (key === 'user'){
                        if (obj[i][key]["screen_name"] === screen_name_requested){
                            var element={};
                            element["id"] = obj[i][key]["id_str"];
                            element["name"] = obj[i][key]["name"];
                            element["screen_name"] = obj[i][key]["screen_name"];
                            element["location"] = obj[i][key]["location"];
                            element["description"] = obj[i][key]["description"];
                            result.push(element);
                        }
                    }
                }
            }
        }
        
        result = JSON.stringify(result);
        response.writeHead(200, {"Content-Type": "application/json"});
        //console.log(result);
        response.end(result);
    }
    
    else{
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write('<b>Hey there!</b><br /><br />This is the default response. Requested URL is: ' + request.url);
        response.end();
    }

}

function sendFileContent(response, fileName, contentType){
  fs.readFile(fileName, function(err, data){
    if(err){
      response.writeHead(404);
      response.write("Not Found!");
    }
    else{
      response.writeHead(200, {'Content-Type': contentType});
      response.write(data);
    }
    response.end();
  });
}



var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});