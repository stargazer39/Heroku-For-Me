const { spawn } = require('child_process');
const http = require('http');

const port = process.env.PORT || 80;
console.log("Heroku is Working");

var httpSrv = http.createServer((req,res)=>{
	res.setHeader("Access-Control-Allow-Origin",'*');
    //res.writeHead(200,{'Content-Type' : 'text/plain'});
    res.writeHead(200,{'Content-Type': 'video/mp4'});
    const url_ = "https://lecturecapture.sliit.lk/archive/saved/Personal_Capture/2020-07-09/IT1060-Software-Process-Modeling_6935/IT1060-Software-Process-Modeling_6935_144.m3u8";
    const file = "G:\\Data\\Media\\【 Hatsune Miku 】\\【Hatsune Miku】【初音ミク】livetune feat. Hatsune Miku「Catch the Wave」Music Video【Project DIVA MEGA39's】 ( 1080 X 1920 ).mp4";
    const ffmpeg = spawn('ffmpeg',['-i',url_,'-c:a','aac','-c:v','libx264','-preset','slow','-f','matroska','pipe:1']);

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