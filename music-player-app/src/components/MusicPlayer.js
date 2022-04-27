import React, { useRef} from 'react';
import MusicPlayerInfo from './MusicPlayerInfo';
import MusicPlayerControls from './MusicPlayerControls';

function MusicPlayer(props) {
  const audioControl = useRef(null);


  const MoveForward = () => {
    props.setCurrentIndex( () => {
        let temp = props.currentIndex;
        temp++;

        if ( temp > props.songs.length - 1 ) {
            temp = 0;
        } 

        return temp;
    })
  };

  const MoveBackward = () => {
    props.setCurrentIndex( () => {
        let temp = props.currentIndex;
        temp--;

        if ( temp < 0 ) {
            temp = props.songs.length - 1;
        } 

        return temp;
    });
  };

  return (
    <div className='audioPlayer'>
        <audio ref={audioControl} src={props.songs[props.currentIndex].src}></audio>
        <h4>Playing Music...</h4>
        <MusicPlayerInfo currentSong={props.songs[props.currentIndex]} />
        <MusicPlayerControls 
        // playing={playing} 
        //     setPlaying={setPlaying}
             MoveBackward={MoveBackward}
            MoveForward={MoveForward} />
        <p>
            <strong>Next Song:</strong> {props.songs[props.nextIndex].title} by {props.songs[props.nextIndex].artist}
            </p>
    </div>
  )
}

export default MusicPlayer;