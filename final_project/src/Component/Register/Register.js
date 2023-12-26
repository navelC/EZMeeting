import React, { Component } from 'react'
import "./Register.scss"
import 'bootstrap/dist/css/bootstrap.css'
import { Button, TextField } from '@material-ui/core'
import { login, regis } from '../../Service/ManagementService'
import { uploadImage } from '../../Service/facialVerificationService'
import { Label } from '@material-ui/icons'

class Register extends Component {
    constructor(props){
        super(props)
        this.state = {
            email: "",
            password: "",
            name: "",
            errMsg: '',
            imgSrc: null,
            file: null
        }
        console.log(props)
    }

	handleChange = (e, key) => {
        const state = this.state
        state[key] = e.target.value
        this.setState(state)
    }

    handleImage = (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }
        const file = e.target.files[0]
        this.setState({imgSrc: URL.createObjectURL(file), file})
        // I've kept this example simple by using the first image instead of multiple
    }

    handleSubmit = () => {
        try{
            switch(this.props.mode){
                case 1:
                    this.Login()
                    break
                case 2:
                    this.Regis()
                    break
                case 3:
                    this.UpdateUser()
                    break
            }
        }
        catch(err) {
            console.log(err)
            this.setState({errMsg: 'your email or password is incorrect'})
        }
    }
    handleSubmitSuccess = ({userID, name}) => {
        this.props.setUser({userID, name})
        this.props.context.history.push('/')
    }

    Login = async () => {
        const {email, password} = this.state
        const result = await login(email, password)
        this.handleSubmitSuccess(result.data)
    }

    Regis = async() => {
        const {email, password, name} = this.state
        const result = await regis(email, password, name)
        this.handleSubmitSuccess(result.data)
    }

    UpdateUser = async () => {
        // const {password, name} = result.data
        // const body = password?{password, name}:{name}
        // const result = await regis(email, password, name)
        // handleSubmitSuccess(result.data)
        const data = new FormData()
        // append data
        data.append('file', this.state.file);
        data.append('userID', this.props.user.userID);

        const res = await uploadImage(data)
        console.log(res)
    }

	render() {
        let title = 'Login'
        console.log(this.state.file)
        switch(this.props.mode){
            case 1: 
                title = 'Login'
                break
            case 2: 
                title = 'Sign Up'
                break
            case 3: 
                title = 'Update'
                break
            default:
                title = 'Login'
                break
        }
		return (
			<div className='content' style={{marginTop: '60px'}}>
                <div className='title'>{title}</div>
                {this.props.mode !== 2 && (
                    <div className='box'>
                        <TextField id="outlined-basic" onChange={(e) => this.handleChange(e, 'name')} fullWidth defaultValue={this.props.user?.name} label="name" variant="outlined" />
                    </div>
                )}
                 {this.props.mode !== 3 && (
                    <div className='box'>
                        <TextField id="outlined-basic" onChange={(e) => this.handleChange(e, 'email')} fullWidth label="email" variant="outlined" />
                    </div>
                )}
                <div className='box'>
                    <TextField id="outlined-basic" onChange={(e) => this.handleChange(e, 'password')} fullWidth label="password" type="password" variant="outlined" />
                </div>
                {this.props.mode === 3 && (
                <div className='box'>
                    <img src={this.state.imgSrc} style={{width: '100%'}}/>
                    <label style={{width: '100%'}} htmlFor="uploadImage">
                        <Button  variant="contained" component="span" fullWidth>
                            Upload File
                        </Button>
                    </label> 
                    <input accept="image/*" hidden type="file" id='uploadImage' multiple={false} onChange={this.handleImage}/>
                </div>
                )}
                <div className='box'>
                    <Button variant="contained" onClick={this.handleSubmit}  fullWidth color="primary" style={{padding: '10px'}}>{title}</Button>
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