const { spawn } = require('child_process');
const http = require('http');
const URL = require('url');


const port = process.env.PORT || 80;
const ping_server = "ping-pong-is-awsome.herokuapp.com";
console.log("Heroku is Working");
var isPingiging = false;
var pinger;
var httpSrv = http.createServer((req,res)=>{
	var query = URL.parse(req.url,true).query
	//res.setHeader("Access-Control-Allow-Origin",'*');
    //res.writeHead(200,{'Content-Type' : 'text/plain'});
    pingpls = false;
    var spawn_args = [];
    switch(query.mode){
    	case "sliit":
    		pingpls = true;
    		spawn_args = ['-i',query.url,'-c:a','aac','-c:v','libx264','-preset','fast','-f','matroska','pipe:1'];
    		videoStreamer(spawn_args,req,res);
    		break;
    	case "ytstream":
    		pingpls = true;
    		spawn_args = ['-i',query.url,'-c:a','aac','-b:a','256K','-vf','scale=640x360','-c:v','libx265','-preset','fast','-f','matroska','pipe:1'];
    		videoStreamer(spawn_args,req,res);
    		break;
    	case "hi":
    		res.write("Hi for the other side");
    		res.end();
    		break;
    }

   	if(pingpls && !isPingiging) {
   		pinger = setInterval(pingPong,10000)
   		isPingiging = true;
   	};
    req.on("close", function() {
	    clearInterval(pinger);
	    isPingiging = false;
	});

	req.on("end", function() {
	    clearInterval(pinger);
	    isPingiging = false;
	});

})

httpSrv.listen(port);

function videoStreamer(spawn_args,req_,res_){
	res_.writeHead(200,{
    	'Content-Type': 'video/x-matroska',
    	"Connection": "keep-alive"
    });
    const ffmpeg = spawn('ffmpeg',spawn_args);
	ffmpeg.stderr.on('data',(data)=>{
		//res.write(data.toString('utf-8'));
		//res.pipe
		//console.log(data.toString('utf-8'));
	})

	ffmpeg.stdout.pipe(res_);

	req_.on("close", function() {
	    console.log(`FFMPEG killed`);
		ffmpeg.kill('SIGKILL');
	});

	req_.on("end", function() {
	    console.log(`FFMPEG killed`);
		ffmpeg.kill('SIGKILL');
	});
	
	ffmpeg.on('close',(code)=>{
		console.log(`child process exited with code ${code}`);
		res_.end();
	})

	ffmpeg.on('error',(err)=>{
		res_.write(`Opening FFMPEG faild ${err}`);
    	res_.end();
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