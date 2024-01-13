import React from 'react';
import { Input, Button, CircularProgress } from '@material-ui/core'
import { Component } from 'react';
import UserProfile from '../../storage';
import Header from '../../Layout/Header/Header';

class WaitingRoom extends Component {
    constructor(props) {
        super(props)
        this.state = {
            disabled: !this.props.user?.name,
            username: "",
        }
    }

    handleUsername = (e) => {
        let disabled = true
        if (e.target.value) {
            disabled = false
        }
        this.setState({ username: e.target.value, disabled })
    }

    handleJoin = () => {
        UserProfile.setName(this.state.username)
        this.props.switch()
    }

    renderContent = () => {
        if (this.props.isDenied) return (<p style={{ margin: 0, fontWeight: "bold", paddingRight: "50px" }}>Your request has been denied</p>)
        else if (this.props.isLoading) return <>
            <p style={{ margin: 0, fontWeight: "bold", paddingRight: "50px" }}>Request to join...</p>
            <div style={{ marginTop: 10 }}>
                <CircularProgress />
            </div>
        </>
        else return <>
        <p style={{ margin: 0, fontWeight: "bold", paddingRight: "50px" }}>{this.props.user?.name || "What your name?"}</p>
        <div style={{ marginTop: 10 }}>
            {this.props.user?.name ? "" : (<Input placeholder="Your name" defaultValue={this.state.username} onChange={e => this.handleUsername(e)} />)}
            <Button variant="contained" color="primary" onClick={this.handleJoin} style={{ margin: "20px" }} disabled={this.state.disabled}>Request to join</Button>
        </div>
    </>
    }

    render() {
        return (
            <div className='wrap'>
                <div className='cntainer'>
                    <Header />
                    <div style={{
                        background: "white", height: "auto", padding: "20px", minWidth: "400px",
                        textAlign: "center", margin: "auto", marginTop: "50px", justifyContent: "center"
                    }}>
                    {this.renderContent()}
                    </div>
                    <div style={{ justifyContent: "center", textAlign: "center", paddingTop: "40px", }}>
                        <video id="my-video" autoPlay muted style={{
                            background: "rgb(32 33 36)", objectFit: "fill", width: "60%", height: "30%"
                        }}></video>
                    </div>
                </div>
            </div>
        )
    }
}
export default WaitingRoom;