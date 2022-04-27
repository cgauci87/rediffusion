/***********************************
************************************
          AUDIO VISUALIZER
************************************
***********************************/



/*Three Classes used to control playback, Analyze and draw visualization
* Visualiser Object created on page load
* playback and control functions called on respective events*/







//entry into the program  

window.onload = () => {  

  /* to fix responsiveness issue */
  //some mobile browsers still need some time to load canvas so giving 200ms timeout for them
  setTimeout(()=>{
    var visualizer = new Visualiser(); //prepares audio object and drawing



    window.onresize = () => {
      visualizer.resize();
    }
  
    //when play/pause button is clicked
    document.querySelector(".btn-play").addEventListener("click", () => { 
      visualizer.audio.play(); // determines whether to play/pause
    });
  
  
    //next/previous buttons
    let nextPrevious = document.querySelectorAll(".btn-skip");
    let i=0;
    while(i < nextPrevious.length){
      //when next/previous button is clicked
      nextPrevious[i].addEventListener("click", ()=>{
        //giving app a time of 500ms to load next/previous audio source
        setTimeout(() => {
          visualizer.audio.play(); //play the next/previous soung
        }, 500)
      });
      i++;
    }
  
  
  
   //when volume bar is changed
    document.querySelector("#volume").addEventListener("input", () => {
      visualizer.audio.changeVolume(); //set the new volume
    });
  
  
    //when seekbar is used to forward the song
    document.querySelector(".progressBar").addEventListener("input", (e) => {
      visualizer.audio.updateTime(e); //forward/backward the song and update time
    });
  
  
    //when forward or backward by 10s buttons are clicked
    document.querySelector(".backward").addEventListener("click",()=>{
      //console.log("click")
      visualizer.audio.updateTimeFixed(10,"backward");
    });
  
    document.querySelector(".forward").addEventListener("click",()=>{
      //console.log("click")
      visualizer.audio.updateTimeFixed(10,"forward");
    });
  
  },200);

  
  
  
  /* POPUP */ 
  //enable popup on scroll
  window.addEventListener('scroll',function() {      
    let scroll = this.scrollY;
    let popup = this.document.querySelector(".popup");
    if(popup.hasAttribute("verified")) //if user has once used correct pincode
    {
      return false;
    }
    else{ //if user has not yet used correct pincode

      let playerContainer = document.querySelector(".player-container");
      if (scroll > playerContainer.offsetTop) { //enalbing popup when user scrolls to last section
        popup.classList.add("fade-in"); //adding fade-in effect to the popup
        setTimeout(()=>{
          popup.style.display = "flex"; //enabling popup after the fade-in animation is completed
        },500)
      }

    }
    });
    
    


}




class Analyser {
  constructor(audio, smoothTime, color, scale, min, max, offset, radius, isAlpha) {
    this.audio = audio;
    this.visual = this.audio.visual;

    this.scale = scale;

    this.radius = radius;

    this.isAlpha = isAlpha;

    this.color = color;

    this.audioContext = this.audio.audioContext;
    this.analyser = this.audioContext.createAnalyser();


    this.analyser.fftSize = 2048;
    // this.analyser.minDecibels = -60;
    // this.analyser.maxDecibels = 0;
    this.frequencyNum = 1024;
    this.hz = 22028;
    this.analyser.smoothingTimeConstant = smoothTime;

    this.filterLP = this.audioContext.createBiquadFilter();
    this.filterHP = this.audioContext.createBiquadFilter();

    // sourceNode.connect(this.gainNode);

    this.filterLP.type = "lowpass";
    this.filterLP.frequency.value = max;
    // this.filterLP.detune.value = 500;

    // this.filterHP.type = "highpass";
    // this.filterHP.frequency.value = 0;
    // this.filterHP.detune.value = 200;

    this.maxHz = max;
    this.minHz = min;

    this.offset = offset;
    this.radiusOffset = 16 * this.offset;
    this.count = 0;




    this.stockSpectrums = [];

    this.sourceStart = Math.ceil(this.frequencyNum * this.minHz / this.hz);
    this.sourceEnd = Math.round(this.frequencyNum * this.maxHz / this.hz);
    this.sourceLength = this.sourceEnd - this.sourceStart + 1;

    this.adjustOffset = Math.round(this.sourceLength * 0.12);

    this.distLength = 120;
    this.interval = (this.sourceLength - 1) / (this.distLength - 1);

    this.totalLength = Math.round(this.distLength * 3 / 2);
  }

  adjustFrequency(i, avr) {
    var f = Math.max(0, this.spectrums[this.sourceStart + i] - avr) * this.scale;
    var offset = i - this.sourceStart;

    var ratio = offset / this.adjustOffset;

    f *= Math.max(0, Math.min(1, 5 / 6 * (ratio - 1) * (ratio - 1) * (ratio - 1) + 1));
    // f *= Math.max(0, Math.min(1, -3 / 4 * Math.pow(Math.exp(-ratio), 6) + 1));

    return f;
  }

  update() {
    var spectrums = new Float32Array(this.frequencyNum);
    if (this.audio.isReady) {
      this.analyser.getFloatFrequencyData(spectrums);
      this.stockSpectrums.push(spectrums);
    }



    if (this.count < this.offset) {
      this.spectrums = new Float32Array(this.frequencyNum);
    } else {
      if (this.audio.isReady) {
        var _spectrums = this.stockSpectrums[0];

        if (!isFinite(_spectrums[0])) {
          this.spectrums = new Float32Array(this.frequencyNum);
        } else {
          this.spectrums = _spectrums;
        }

        this.stockSpectrums.shift();
      } else {
        this.spectrums = new Float32Array(this.frequencyNum);
      }
    }

    if (this.audio.isReady) {
      this.count++;
    }


    var canvasContext = this.visual.canvasContext;
    canvasContext.strokeStyle = this.color;
    canvasContext.fillStyle = this.color;
    // canvasContext.globalCompositeOperation = (this.isAlpha) ? "multiply" : "source-over";
    // canvasContext.globalAlpha = (this.isAlpha) ? 1 : 1;


    var avr = 0;
    for (var i = this.sourceStart; i <= this.sourceEnd; i++) {
      avr += this.spectrums[i];
    }

    avr /= this.sourceLength;

    avr = (!this.audio.isReady || avr === 0) ? avr : Math.min(-40, Math.max(avr, -60));

    canvasContext.beginPath();

    var frequencyArray = [];

    for (var i = 0; i < this.distLength; i++) {
      var n1 = Math.floor(i * this.interval);
      var n2 = n1 + 1;
      var n0 = Math.abs(n1 - 1);
      var n3 = n1 + 2;


      n2 = (n2 > this.sourceLength - 1) ? (this.sourceLength - 1) * 2 - n2 : n2;
      n3 = (n3 > this.sourceLength - 1) ? (this.sourceLength - 1) * 2 - n3 : n3;

      var p0 = this.adjustFrequency(n0, avr);
      var p1 = this.adjustFrequency(n1, avr);
      var p2 = this.adjustFrequency(n2, avr);
      var p3 = this.adjustFrequency(n3, avr);

      var mu = i * this.interval - n1;

      var mu2 = mu * mu;

      var a0 = -0.5 * p0 + 1.5 * p1 - 1.5 * p2 + 0.5 * p3;
      var a1 = p0 - 2.5 * p1 + 2 * p2 - 0.5 * p3;
      var a2 = -0.5 * p0 + 0.5 * p2;

      var targetFrequency = a0 * mu * mu2 + a1 * mu2 + a2 * mu + p1;
      targetFrequency = Math.max(0, targetFrequency);
      frequencyArray.push(targetFrequency);

      var pos = this.visual.calcPolorCoord((i + this.visual.tick + this.offset) / (this.totalLength - 1), this.radius + targetFrequency + 3);
      canvasContext.lineTo(pos.x + this.radiusOffset, pos.y + this.radiusOffset);
    };


    for (var i = 1; i <= this.distLength; i++) {
      var targetFrequency = frequencyArray[this.distLength - i];
      var pos = this.visual.calcPolorCoord((i / 2 + this.distLength - 1 + this.visual.tick + this.offset) / (this.totalLength - 1), this.radius + targetFrequency + 3);
      canvasContext.lineTo(pos.x + this.radiusOffset, pos.y + this.radiusOffset);
    }

    for (var i = this.distLength; i > 0; i--) {
      var targetFrequency = frequencyArray[this.distLength - i];
      var pos = this.visual.calcPolorCoord((i / 2 + this.distLength - 1 + this.visual.tick + this.offset) / (this.totalLength - 1), this.radius - targetFrequency - 3);
      canvasContext.lineTo(pos.x + this.radiusOffset, pos.y + this.radiusOffset);
    }


    for (var i = this.distLength - 1; i >= 0; i--) {
      var targetFrequency = frequencyArray[i];
      var pos = this.visual.calcPolorCoord((i + this.visual.tick + this.offset) / (this.totalLength - 1), this.radius - targetFrequency - 3);
      canvasContext.lineTo(pos.x + this.radiusOffset, pos.y + this.radiusOffset);
    }



    canvasContext.fill();



  }
}

class Audio {
  //initializes all variables
  constructor(_visual) {
    this.visual = _visual;
    this.audioContext = (window.AudioContext) ? new AudioContext : new webkitAudioContext;
    this.fileReader = new FileReader;
    this.isReady = false;
    this.count = 0;
    this.played_once = false;
    this.playing = false;
    this.completed = false;
    this.audioSource;
    this.duration = 0;
    this.currentTime = 0;
    this.progressBarEl = document.querySelector(".progressBar");
    this.currentTimeEl = document.querySelector(".currentTime");
    this.totalDurationEl = document.querySelector(".totalDuration");
    this.video = document.querySelector("#bg-video");
    this.interval;
    this.source;
    this.buffer;




  }

  //nodes reinitialized to provide seek facility
  reinit() {
    this.source.stop();
    if (!this.audioContext.createGain) {

      this.audioContext.createGain = this.audioContext.createGainNode;
    }
    this.gainNode = this.audioContext.createGain();
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gainNode);
    this.source.loop = false;

    this.source.connect(this.analyser_1.analyser);

    this.source.connect(this.analyser_2.analyser);

    this.gainNode.connect(this.audioContext.destination);
  }

  updateTimeFixed(time,where){
    //console.log("aa gya");
    if(where === "forward"){
      if(this.currentTime >= (this.duration-9))
      {
      this.currentTime = this.duration;

      }
      else{

        this.currentTime = this.currentTime+time;
      }
    }
    else if(where === "backward"){
      if(this.currentTime <= 10)
      {
        this.currentTime = 0;
      }
      else{

        this.currentTime = this.currentTime-time;
      }
    }
    this.reinit();
    this.source.start(0, this.currentTime);
    var minutes = Math.floor(this.currentTime / 60);
    var seconds = Math.trunc(this.currentTime % 60);
    this.currentTimeEl.innerText = minutes + ":" + seconds;
  
  }


  //to update time when seekbar is used
  updateTime(e) {
    // this.audioContext.currentTime = e.target.value;


      this.currentTime = e.target.value;
      this.reinit();
      this.source.start(0, this.currentTime);
      var minutes = Math.floor(e.target.value / 60);
      var seconds = Math.trunc(e.target.value % 60);
      this.currentTimeEl.innerText = minutes + ":" + seconds;
   
  

  }

  //before a new song is loaded
  reset() {
    //console.log("changed source !");
    document.querySelector(".btn-play").innerHTML = '<i class="fa-solid fa-play"></i>';
    this.progressBarEl.value = 0;
    this.currentTimeEl.innerText = "0:0";
    this.totalDurationEl.innerText = "0.0";
    this.source.stop();
    this.duration = 0;
    this.currentTime = 0;
    this.completed = false;
    this.played_once = false;
    this.playing = false;
    clearInterval(this.interval);

  }

  //when a song is played first time
  playingFirstTime() {
    //console.log("playing First time");
    let audio = document.querySelector("audio");

    document.querySelector(".btn-play").innerHTML = '<i class="fa-solid fa-pause"></i>';
    // audioContext = (window.AudioContext) ? new AudioContext : new webkitAudioContext;
    document.querySelector(".audioPlayer h4").innerText = "loading..";
    fetch(audio.currentSrc)
      .then(response => response.blob())
      .then(blob => {
        let file = new File([blob], "music", {
          type: "audio/mp3", lastModified: new Date().getTime()
        });

        // const fileReader = new FileReader();
        this.fileReader.readAsArrayBuffer(file);
        this.fileReader.onload = (() => {
          this.audioContext.decodeAudioData(this.fileReader.result, (buffer) => {
            if (this.source) {
              this.source.stop();
            }
            this.duration = buffer.duration;
            //console.log("duration:" + buffer.duration)
            var minutes = Math.floor(this.duration / 60);
            var seconds = Math.trunc(this.duration % 60.00);
            this.totalDurationEl.innerText = minutes + ":" + seconds;
            this.progressBarEl.max = this.duration;



            this.audioSource = audio.currentSrc;
            if (!this.audioContext.createGain) {

              this.audioContext.createGain = this.audioContext.createGainNode;
            }
            this.gainNode = this.audioContext.createGain();
            this.audioContext.resume();
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = buffer;
            this.buffer = buffer;
            this.source.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            this.source.loop = false;

            this.connectNode(buffer);
            this.video.play(); 

            this.isReady = true;
            this.playing = true;
            this.played_once = true;
            document.querySelector(".audioPlayer h4").innerText = "PLAYING MUSIC...";
            document.querySelector("canvas").style.opacity = "1";
            //console.log("current context time : " + this.audioContext.currentTime);

            this.interval = setInterval(() => {
              this.currentTime++;
              // this.currentTime = duration;
              this.progressBarEl.value = this.currentTime;
              // //console.log(this.audioContext.currentTime);
              var minutes = Math.floor(this.progressBarEl.value / 60);
              var seconds = Math.trunc(this.progressBarEl.value % 60);
              this.currentTimeEl.innerText = minutes + ":" + seconds;
              if (this.currentTime >= Math.trunc(this.duration)) {
                //console.log("song poora ho gya !");
                this.completed = true;
                //console.log("ho gya");
                clearInterval(this.interval);
                // document.querySelector(".btn-play").click();
                document.querySelector(".music-player-controls-c button:last-child").click();

              }
            }, 1000)

          });
        });
      });
  }

  //when a song is played after pausing
  playingAfterPause() {
    this.playing = true;
    // document.querySelector(".info-img img").style.opacity = "0";
    document.querySelector("canvas").style.opacity = "1";
    document.querySelector(".btn-play").innerHTML = '<i class="fa-solid fa-pause"></i>';
    this.interval = setInterval(() => {
      this.currentTime++;
      // this.currentTime = duration;
      this.progressBarEl.value = this.currentTime;
      // //console.log(this.audioContext.currentTime);
      var minutes = Math.floor(document.querySelector(".progressBar").value / 60);
      var seconds = Math.trunc(document.querySelector(".progressBar").value % 60);
      this.currentTimeEl.innerText = minutes + ":" + seconds;
      if (this.currentTime >= Math.trunc(this.duration)) {
        this.completed = true;
        //console.log("ho gya");
        clearInterval(this.interval);
        // document.querySelector(".btn-play").click();
        document.querySelector(".music-player-controls-c button:last-child").click();
      }
    }, 1000)
    this.audioContext.resume();
    //console.log(this.audioContext.currentTime);

  }

  //when a song is paused
  pause(){
    //console.log("paused");

    this.playing = false;
    document.querySelector(".info-img img").style.opacity = "1";
    // document.querySelector("canvas").style.opacity = "0";
    document.querySelector(".btn-play").innerHTML = '<i class="fa-solid fa-play"></i>';
    //console.log(this.audioContext.currentTime);
    clearInterval(this.interval);
    this.audioContext.suspend();
  }


  //calls the appropriate functions
  play() {
    let audio = document.querySelector("audio");


    if (this.audioSource && this.audioSource != audio.currentSrc) { //when next/previous song is played
      this.reset(); //reset on next/previous song
      this.video.pause(); //pausing background video until song is loaded
 
    }


    if (!this.playing && !this.played_once) { //when a song is played for first time
      this.playingFirstTime(); //load audio and start audio and background video
    } 
    else if (!this.playing && this.played_once) { //if played after a pause
      this.playingAfterPause(); //resuming audio and time
      this.video.play(); //playing background video 

    } 
    else { 
      this.pause(); //pausing audio 
      this.video.pause(); //pausing background video

    }



  }

  //initializes analyser objects
  init() {

    this.analyser_1 = new Analyser(this, 0.7, "#224982", 5, 1, 600, 2, 460, true);

    this.analyser_2 = new Analyser(this, 0.82, "#30e3ca", 4.8, 1, 600, 0, 460, false);




    this.render();

  }

  //changes volume based on value from audio bar
  changeVolume() {
    let element = document.querySelector("#volume");
    var volume = element.value;
    var fraction = parseInt(volume) / 100;
    this.gainNode.gain.value = fraction;
  }

  //connects audio nodes and starts audio
  connectNode(buffer) {
    if (!this.audioContext.createGain) {

      this.audioContext.createGain = this.audioContext.createGainNode;
    }
    this.gainNode = this.audioContext.createGain();
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = buffer;
    this.source.connect(this.gainNode);
    this.source.loop = false;

    this.source.connect(this.analyser_1.analyser);

    this.source.connect(this.analyser_2.analyser);

    this.gainNode.connect(this.audioContext.destination);





    this.source.start(0);

  }


  render() {
    this.visual.draw();

    requestAnimationFrame(this.render.bind(this));
  }
}

class Visualiser {
  constructor() {


    this.canvas = document.querySelector('#canvas');
    this.canvasContext = this.canvas.getContext('2d');

    this.resize();

    //     this.particles = [];
    //     this.particleC = [
    //       "#ffea00"
    //     ];
    //     this.particleNum = 12;

    //     for(var i = 0; i < this.particleNum; i++){
    //       var color = this.particleC[Math.floor(Math.random() * this.particleC.length)];
    //       var particle = new Particle(this, color);
    //       this.particles[i] = particle;
    //     }

    this.circleR = 450;
    this.audio = new Audio(this);
    this.audio.init();
    this.tick = 0;
  }


  resize() {

    /* to fix responsiveness */
    this.canvasW;
    this.canvasH;

    //detecting mobile
    window.mobileCheck = function() {
      let check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    };

    //if mobile
    if( window.mobileCheck() )
    {


    this.canvasW = this.canvas.width = window.innerWidth*2.4;
    this.canvasH = this.canvas.height = window.innerWidth*2.4;
    let img = document.querySelector(".info-img img"); 
    this.canvas.style.width=img.offsetWidth+"px"; //setting canvas width same as song image
    this.canvas.style.top="0%"; //setting top to 0
    this.canvas.style.left="0%"; //setting left to 0
    this.canvas.style.overflow="visible"; //setting left to 0




    }

    //if not mobile
    else{
      this.canvasW = this.canvas.width = window.innerWidth;
      this.canvasH = this.canvas.height = window.innerHeight*2;
    }


    // this.canvas.style.height="350px";

    // if (!this.particles) return;
    // for (var i = 0; i < this.particleNum; i++) {
    //   this.particles[i].resize();
    // }
  }

  calcPolorCoord(a, b) {
    var x = Math.cos(a * 2 * Math.PI) * b;
    var y = Math.sin(a * 2 * Math.PI) * b * 0.95;

    return { x: x, y: y };
  }

  draw() {
    this.tick += 0.07;
    var canvasContext = this.canvasContext;
    canvasContext.save();
    canvasContext.clearRect(0, 0, this.canvasW, this.canvasH);
    canvasContext.translate(this.canvasW / 2, this.canvasH / 2);
 


    // for(var i = 0; i < this.particleNum; i++){
    //   this.particles[i].update();
    // }


    canvasContext.lineWidth = 3;

    this.audio.analyser_1.update();
    this.audio.analyser_2.update();
    // this.audio.analyser_3.update();


    canvasContext.restore();
  }
}
