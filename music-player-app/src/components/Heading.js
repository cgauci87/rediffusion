import React, { Component }  from 'react';

function Heading()
{
    return(
        <div className="heading-container">
            <video id="bg-video" src="./assets/videos/vinyl-video.mp4" loop >
            </video>
            <img id="logo" src="./assets/images/logo.png" alt="logo" />
            <h1 >Set<br />the<br />tone . </h1>
        </div>
    )
}

export default Heading;