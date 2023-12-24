import React from 'react';
import {Input, Button} from '@material-ui/core'
import { Component } from 'react';
import UserProfile from '../../storage';
import Header from '../../Layout/Header/Header';

class WaitingRoom extends Component{
    constructor(props){
        super(props)
        this.state = {
            disabled: true,
            username: "",
        }
    }

	handleUsername = (e) => {
        let disabled = true
		if(e.target.value){
			disabled = false
		}
        this.setState({ username: e.target.value, disabled})
    }

    handleJoin = () => {
        UserProfile.setName(this.state.username)
        this.props.switch()
    }

    render(){
        return (
            <div className='wrap'>
				<div className='cntainer'>
                    <Header />
                    <div style={{background: "white", width: "30%", height: "auto", padding: "20px", minWidth: "400px",
                            textAlign: "center", margin: "auto", marginTop: "50px", justifyContent: "center"}}>
                        <p style={{ margin: 0, fontWeight: "bold", paddingRight: "50px" }}>Set your username</p>
                        <Input placeholder="Username" defaultValue={this.state.username} onChange={e => this.handleUsername(e)} />
                        <Button variant="contained" color="primary" onClick={this.handleJoin} style={{ margin: "20px" }} disabled={this.state.disabled}>Request to join</Button>
                    </div>
            
                    <div style={{ justifyContent: "center", textAlign: "center", paddingTop: "40px" }}>
                        <video id="my-video" autoPlay muted style={{
                            borderStyle: "solid",borderColor: "#bdbdbd",objectFit: "fill",width: "60%",height: "30%"}}></video>
                    </div>
                </div>
            </div>
        )
    }
}
export default WaitingRoom;