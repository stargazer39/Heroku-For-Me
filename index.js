const { spawn } = require('child_process');
const http = require('http');
const URL = require('url');


const port = process.env.PORT || 80;
console.log("Heroku is Working");

var httpSrv = http.createServer((req,res)=>{
	var query = URL.parse(req.url,true).query
	res.setHeader("Access-Control-Allow-Origin",'*');
    //res.writeHead(200,{'Content-Type' : 'text/plain'});
    res.writeHead(200,{'Content-Type': 'video/mp4'});
    const ffmpeg = spawn('ffmpeg',['-i',query.url,'-c:a','aac','-c:v','libx264','-preset','slow','-f','matroska','pipe:1']);

	ffmpeg.stderr.on('data',(data)=>{
		//res.write(data.toString('utf-8'));
		//res.pipe
		console.log(data.toString('utf-8'));
	})

	ffmpeg.stdout.pipe(res);
	ffmpeg.on('close',(code)=>{
		console.log(`child process exited with code ${code}`);
		res.end();
	})

	ffmpeg.on('error',(err)=>{
		res.write(`Opening FFMPEG faild ${err}`);
    	res.end();
	})

})

httpSrv.listen(port);