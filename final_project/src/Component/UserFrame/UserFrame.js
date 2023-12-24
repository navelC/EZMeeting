import React from 'react';
import { Component } from 'react';

class UserFrame extends Component{
    constructor(props){
        super(props)
        this.state = {
            disabled: true,
            username: "",
        }
    }

    render(){
        return (
            <video id="my-video" ref={this.localVideoref} autoPlay muted style={{
                borderStyle: "solid",borderColor: "#bdbdbd",margin: "10px",objectFit: "fill",
                width: "100%",height: "100%"}}></video>
        )
    }
}
export default UserFrame;