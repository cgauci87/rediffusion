import React from 'react';

function MusicPlayerInfo(props) {
  return (
    <div className='music-player-info-c'>
        <div className='info-img'>
            <img src={props.currentSong.img} alt='' />
            <input id="file" type="file" hidden />
            <canvas id='canvas' height="300" width="300"></canvas>
        </div>
        <h3 className='info-title'>{props.currentSong.title}</h3>
        <h4 className='info-artist'>{props.currentSong.artist}</h4>
    </div>
  )
}

export default MusicPlayerInfo;