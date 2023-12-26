import React, { Component } from 'react'
import "./Header.scss"
import 'bootstrap/dist/css/bootstrap.css'
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

class Header extends Component {
    constructor(props) {
       super(props) 
    }
	render() {
        const {user} = this.props
        console.log(this.props)
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
                        {user?<Link to="/user" className="notLinkBlack">{user.name}</Link>:<Link to="/Login" className="notLinkBlack">Login</Link>}
                    </div>
                    <Button variant="contained" color='primary' onClick={() =>{}}>{user?"Logout":<Link className="notLink" to="/Register">Register</Link>}</Button>
                </div>
            </div>
		)
	}
}

export default Header;