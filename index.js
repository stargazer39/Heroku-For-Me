const { spawn } = require('child_process');
const http = require('http');
const URL = require('url');

class LogKeeper{
	constructor(){
		this.log_array = [];
	}
	log(tag,content,cons){
		let str = `${new Date().toString()} ${tag} : ${content}`
		if(this.log_array.length > 1000) this.log_array.shift();
		this.log_array.push(str);
		if(cons) console.log(str);
	}
}

var headers = {
	mkv:{
    	'Content-Type': 'video/x-matroska',
    	"Connection": "keep-alive"
    	},
    plain_text:{
    	'Content-Type' : 'text/plain'
    }
}

var ffmpeg_args = {
	sliit(url){
		return ['-i',url,'-flags','+ildct','-c:a','aac','-b:a','256K','-c:v','libx264','-preset','slow','-f','matroska','pipe:1']
	},
	ytstream(url){
		return ['-i',url,'-c:a','aac','-b:a','256K','-vf','scale=640x360','-c:v','libx265','-preset','fast','-f','matroska','pipe:1']
	}
}

const port = process.env.PORT || 80;
const ping_server = "ping-pong-is-awsome.herokuapp.com";
console.log("Heroku is Working");
var isPingiging = false;
var pinger;
var logger = new LogKeeper();

var httpSrv = http.createServer((req,res)=>{
	var query = URL.parse(req.url,true).query;
	if(query.mode) logger.log("MODE",query.mode,true);
	//res.setHeader("Access-Control-Allow-Origin",'*');
    //res.writeHead(200,{'Content-Type' : 'text/plain'});
    pingpls = false;
    if(query.hi == true){
    	res.writeHead(200,headers.plain_text);
		res.write("Hi for the other side");
		res.end();
    }
    switch(query.mode){
    	case "sliit":
    		pingpls = true;
    		videoStreamer(ffmpeg_args.sliit(query.url),req,res);
    		break;
    	case "ytstream":
    		pingpls = true;
    		videoStreamer(ffmpeg_args.ytstream(query.url),req,res);
    		break;
    	case "getlog":
    		res.writeHead(200,headers.plain_text);
    		res.write(logger.log_array.join("\n"));
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

function videoStreamer(spawn_args,request,response){
    const ffmpeg = spawn('ffmpeg',spawn_args);
    var started = false;
    var data_sent = 0;

	ffmpeg.stdout.on("data",(data)=>{
		if(!started){
			logger.log("VStreamer",`FFMPEG Started PID ${ffmpeg.pid}`,true);
			response.writeHead(200,headers.mkv);
			started = true;
		}
		response.write(data);
		data_sent += data.length;
	})

	ffmpeg.on("error",(err)=>{
		let msg = `Opening FFMPEG faild ${err}`
		logger.log("VStreamer",msg,true);
		response.writeHead(200,headers.text_plain);
		response.write(msg);
    	response.end();
	})

	ffmpeg.stderr.on('data',(data)=>{
		//
	})

	request.on("close", function() {
	    logger.log("VStreamer","Request closed",true);
	    logger.log("VStreamer",`data sent ${data_sent/(1024*1024)} MB`,true);
		ffmpeg.kill('SIGKILL');
	});

	request.on("end", function() {
	    logger.log("VStreamer","Request ended",true);
	    logger.log("VStreamer",`data sent ${data_sent/(1024*1024)} MB`,true);
		ffmpeg.kill('SIGKILL');
	});
	
	ffmpeg.on("close",(code)=>{
		logger.log("FFMPEG",`ffmpeg process exited with code ${code}`,true);
		response.end();
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
		logger.log("PingPong",`Couldn't req with error ${err}`,true);
	})
	req.end();
}