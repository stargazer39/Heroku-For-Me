const { spawn } = require('child_process');

const ffmpeg = spawn('ls','.');

ffmpeg.stderr.on('data',(data)=>{
	console.log(data);
})

ffmpeg.on('close',(code)=>{
	console.log(`child process exited with code ${code}`)
})
console.log("Heroku is Working");

