



function Popup(props) {



    return (
        <div className="popup">
            <div className="popup-content">
                <h3>Enter The pincode :</h3>
                <div className="inputs-container">
                    <input type="text" maxlength="1" />
                    <input type="text" maxlength="1" />
                    <input type="text" maxlength="1"/>
                    <input type="text" maxlength="1" />
                </div>
                <button className="submit-button" onClick={()=>{props.checkInput()}}>Enter</button>
                <span className="error">Wrong Pincode !</span>
            </div>
        </div>
    )
}



export default Popup;