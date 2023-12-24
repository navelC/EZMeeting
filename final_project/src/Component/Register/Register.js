import React, { Component } from 'react'
import "./Register.scss"
import 'bootstrap/dist/css/bootstrap.css'
import { Button, TextField } from '@material-ui/core'
import { login, regis } from '../../Service/ManagementService'
import { Label } from '@material-ui/icons'

class Register extends Component {
    constructor(props){
        super(props)
        this.state = {
            email: "",
            password: "",
            name: "",
            errMsg: ''
        }
    }

	handleChange = (e, key) => {
        const state = this.state
        state[key] = e.target.value
        this.setState(state)
    }

    handleSubmit = async () => {
        try{
            const result = await (this.props.isLogin ?
                login(this.state)
                : regis(this.state))

            console.log(result.data)
        }
        catch(err) {
            console.log(err)
            this.setState({errMsg: 'your email or password is incorrect'})
        }
    }

	render() {
		return (
			<div className='content' style={{marginTop: '60px'}}>
                <div className='title'>{this.props.isLogin?"Login":"Register"}</div>
                {!this.props.isLogin && (
                    <div className='box'>
                        <TextField id="outlined-basic" onChange={(e) => this.handleChange(e, 'name')} fullWidth label="name" variant="outlined" />
                    </div>
                )}
                <div className='box'>
                    <TextField id="outlined-basic" onChange={(e) => this.handleChange(e, 'email')} fullWidth label="email" variant="outlined" />
                </div>
                <div className='box'>
                    <TextField id="outlined-basic" onChange={(e) => this.handleChange(e, 'password')} fullWidth label="password" type="password" variant="outlined" />
                </div>
                <div className='box'>
                    <Button variant="contained" onClick={this.handleSubmit}  fullWidth color="primary" style={{padding: '10px'}}>Sign Up</Button>
                </div>
                {this.state.errMsg && (
                    <div className='box'>
                        <Label color='error'>{this.state.errMsg}</Label>
                    </div>
                )}
			</div>
		)
	}
}

export default Register;