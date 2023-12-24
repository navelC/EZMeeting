import React, { Component } from 'react'
import "./Header.scss"
import 'bootstrap/dist/css/bootstrap.css'
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

class Header extends Component {
	render() {
		return (
			<div className='header'>
                <div className='logo' onClick={() => {window.location.href = "/"}}>EZMeeting</div>
                <div>
                    <div>Overview</div>
                    <div>Features</div>
                    <div>Pricing</div>
                    <div>About</div>
                </div>
                <div>
                    <div>
                        <Link to="/home/Login" className="notLinkBlack">Login</Link>
                    </div>
                    <Button variant="contained" color='primary' onClick={() =>{}}><Link className="notLink" to="/home/Register">Register</Link></Button>
                </div>
            </div>
		)
	}
}

export default Header;