import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faForward, faBackward } from '@fortawesome/free-solid-svg-icons';

function MusicPlayerControls(props) {
  return (<>
    <div className='volume-container'>
      <input id="volume" type="range" min="0" max="100" defaultValue={100} />
    </div>
    <div className='music-player-controls-c'>

      <button className='btn-skip' onClick={() => { props.MoveBackward() }}>
        <FontAwesomeIcon icon={faBackward}  />
      </button>

      <button className='btn-play'
      >
        <FontAwesomeIcon icon={faPlay} />
      </button>

      <button className='btn-skip' onClick={() => { props.MoveForward() }} >
        <FontAwesomeIcon icon={faForward} />
      </button>
    </div>
    <div className='progress'>
      <span className='backward'><i className="fa-solid fa-arrow-rotate-left"></i></span>
      <span className="currentTime">0:0</span>
      <span className='forward'><i className="fa-solid fa-arrow-rotate-right"></i></span>

      <input type="range" max="100" defaultValue={0} className="progressBar" />
      <span className="totalDuration">0:00</span>

    </div>
  </>
  )
}

export default MusicPlayerControls;