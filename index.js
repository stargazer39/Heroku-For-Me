const { spawn } = require('child_process');
const http = require('http');

const port = process.env.PORT || 80;
console.log("Heroku is Working");

var httpSrv = http.createServer((req,res)=>{
	res.setHeader("Access-Control-Allow-Origin",'*');
    res.writeHead(200,{'Content-Type' : 'text/plain'});
    try{
    	const ffmpeg = spawn('ffmpeg',['-v']);
    }catch{
    	res.write("Opening FFMPEG faild");
    	res.end();
    	return;
    }
    

	ffmpeg.stderr.on('data',(data)=>{
		res.write(data.toString('utf-8'));
	})

	ffmpeg.on('close',(code)=>{
		console.log(`child process exited with code ${code}`);
		res.end();
	})

})

httpSrv.listen(port);