const { spawn } = require('child_process');

const ffmpeg = spawn('ffmpeg',['-v']);

ffmpeg.stderr.on('data',(data)=>{
	console.log(data.toString("utf-8"));
})

ffmpeg.on('close',(code)=>{
	console.log(`child process exited with code ${code}`)
})
console.log("Heroku is Working");

