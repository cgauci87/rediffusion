import React,{Component} from 'react';
import { useState, useEffect } from 'react';
import MusicPlayer from './components/MusicPlayer';
import Heading from './components/Heading';
import Popup from './components/Popup';

function App() {
  const [songs] = useState([
    {
      title: "Forget me too ft. Halsey",
      artist: "Machine Gun Kelly",
      img: "./assets/images/beyond-the-horizon-image.webp",
      src: "./assets/music/on-n-on.mp3"
    },
    {
      title: "Song 2",
      artist: "Artist 2",
      img: "./images/song-2.jpg",
      src: "./assets/music/somebody-new.mp3"
    },
    {
      title: "Song 3",
      artist: "Artist 3",
      img: "./images/song-3.jpg",
      src: "./assets/music/on-n-on.mp3"
    },
    {
      title: "Song 4",
      artist: "Artist 4",
      img: "./images/song-4.jpg",
      src: "./assets/music/somebody-new.mp3"
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(currentIndex + 1);

  useEffect(() => {
    setNextIndex(() => {
      if (currentIndex + 1 > songs.length - 1) {
        return 0;
      } else {
        return currentIndex + 1;
      }
    });
  }, [currentIndex])


/* POPUP */ 
// check input of popup
  const checkInput =()=>{
    let inputs = document.querySelectorAll(".inputs-container input");
    let popup = document.querySelector(".popup");

    let check = false;
    for(let i=0;i<inputs.length;i++)
    {
        if(inputs[i].value === "1"){
            check = true;
        }
        else{
            check= false;
        }
    }

    if(check === true) //if correct pincode
    {
        popup.classList.add("fade-out");
        setTimeout(()=>{
            popup.style.display="none";
        },500);
        popup.setAttribute("verified",'');

    }

    else{ //otherwise, display error message
      let errorEl = document.querySelector(".error"); 
      errorEl.style.display="block";
    }

}

  return (
    <>
      <Popup checkInput={checkInput}/>
      <Heading />
      <div className="player-container">
        <MusicPlayer currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          nextIndex={nextIndex}
          songs={songs} />
      </div>
    </>
  );
}

export default App;
