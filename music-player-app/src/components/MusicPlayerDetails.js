import React from "react";
import MusicPlayer from "./MusicPlayer";

 function TrackDetails(props) {
     return (
         <div className="sound-track--details">
             <div className="details-img"> 
                 <img src={props.track.img_src} alt="" />                    
             </div>"
                <h2 className="track-title">{props.track.title}</h2>
                <h2 className="track-artist">{props.track.artist}</h2>
             </div>

     )

 }

 export default MusicPlayer;
