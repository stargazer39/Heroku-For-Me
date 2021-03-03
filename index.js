const { spawn } = require('child_process');
const http = require('http');
const URL = require('url');


const port = process.env.PORT || 80;
const ping_server = "ping-pong-is-awsome.herokuapp.com";
console.log("Heroku is Working");

var httpSrv = http.createServer((req,res)=>{
	var query = URL.parse(req.url,true).query
	//res.setHeader("Access-Control-Allow-Origin",'*');
    //res.writeHead(200,{'Content-Type' : 'text/plain'});
    var pinger = setInterval(pingPong,10*60);
    var spawn_args = [];
    switch(query.mode){
    	case "sliit":
    		spawn_args = ['-i',query.url,'-c:a','aac','-c:v','libx264','-preset','fast','-f','matroska','pipe:1'];
    		videoStreamer(spawn_args,req,res);
    		break;
    	case "ytstream":
    		spawn_args = ['-i',query.url,'-c:a','aac','-b:a','256K','-vf','scale=640x360','-c:v','libx265','-preset','fast','-f','matroska','pipe:1'];
    		videoStreamer(spawn_args,req,res);
    		break;
    	case "hi":
    		res.write("Hi for the other side");
    		break;
    }

    req.on("close", function() {
	    clearInterval(pinger);
	});

	req.on("end", function() {
	    clearInterval(pinger);
	});

})

httpSrv.listen(port);

function videoStreamer(spawn_args,req_,res_){
	res.writeHead(200,{
    	'Content-Type': 'video/x-matroska',
    	"Connection": "keep-alive"
    });
    const ffmpeg = spawn('ffmpeg',spawn_args);
	ffmpeg.stderr.on('data',(data)=>{
		//res.write(data.toString('utf-8'));
		//res.pipe
		//console.log(data.toString('utf-8'));
	})

	ffmpeg.stdout.pipe(res);

	req.on("close", function() {
	    console.log(`FFMPEG killed`);
		ffmpeg.kill('SIGKILL');
	});

	req.on("end", function() {
	    console.log(`FFMPEG killed`);
		ffmpeg.kill('SIGKILL');
	});
	
	ffmpeg.on('close',(code)=>{
		console.log(`child process exited with code ${code}`);
		res.end();
	})

	ffmpeg.on('error',(err)=>{
		res.write(`Opening FFMPEG faild ${err}`);
    	res.end();
	})
}

function pingPong(){
	var options = {
		host:ping_server,
		path:"/?hi=true",
		port:"80",
		method:"GET"
	}
	//console.log("req");
	var str = "";
	var req = http.request(options,(response)=>{
		response.on('data', function (chunk) {
		    str += chunk;
		});
	    //the whole response has been received, so we just print it out here
	    response.on('end', function () {
	       //console.log(str);
	    });
	});
	req.on('error',(err)=>{
		console.log(`Couldn't req with error ${err}`)
	})
	req.end();
}