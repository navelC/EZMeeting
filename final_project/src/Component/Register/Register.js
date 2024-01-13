import React, { Component } from 'react'
import "./Register.scss"
import 'bootstrap/dist/css/bootstrap.css'
import { Button, TextField } from '@material-ui/core'
import { login, regis } from '../../Service/ManagementService'
import { uploadImage } from '../../Service/facialVerificationService'

class Register extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email: "",
            password: "",
            name: "",
            errMsg: '',
            imgSrc: null,
            file: null,
            err: {
                name: null,
                pass: null,
                email: null
            },
            updateSuccess: null
        }
        console.log(props)
    }

    handleChange = (e, key) => {
        const state = this.state
        state[key] = e.target.value
        this.setState(state)
        console.log(this.state)
    }

    validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        const res = regex.test(email)
        if (!res) this.setState({ err: { ...this.state.err, email: 'Email is not in correct format' } })
        else this.setState({ err: { ...this.state.err, email: null } })
        return res;
    }

    validatePassword = (pass) => {
        const res = pass.length > 5
        console.log(res,  pass.length)
        if (!res){
            this.setState({ err: { ...this.state.err, pass: 'Password must contain more than 5 characters' } })
        } 
        else {
            console.log('here')
            this.setState({ err: { ...this.state.err, pass: null } })
        }
        return res;
    }

    validateName = (name) => {
        const res = name.length <= 20
        if (!res) this.setState({ err: { ...this.state.err, name: 'Name cannot contain more than 20 characters' } })
        else this.setState({ err: { ...this.state.err, name: null } })
        return res;
    }

    validateAll = () => {
        let pass = true;
        pass = this.validateEmail(this.state.email) && pass
        pass = this.validatePassword(this.state.password) && pass
        pass = this.validateName(this.state.name) && pass
        return pass
    }

    handleImage = (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }
        const file = e.target.files[0]
        this.setState({ imgSrc: URL.createObjectURL(file), file })
        // I've kept this example simple by using the first image instead of multiple
    }

    handleSubmit = () => {
        try {
            switch (this.props.mode) {
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
            console.log('pass')
        }
        catch (err) {
            console.log(err)
            this.setState({ errMsg: 'your email or password is incorrect' })
        }
    }

    handleSubmitSuccess = ({ userID, name }) => {
        localStorage.setItem('user', JSON.stringify({ userID, name }))
        JSON.parse(localStorage.getItem('user'))
        this.props.setUser({ userID, name })
        this.props.context.history.push('/')
    }

    Login = async () => {
        const { email, password } = this.state
        if (!this.validateAll()) return
        try {
            const result = await login({ email, password })
            this.handleSubmitSuccess(result.data)
        }
        catch (err) {
            console.log(err)
            this.setState({ errMsg: 'your email or password is incorrect' })
        }
    }

    Regis = async () => {
        console.log(this.state)
        const { email, password, name } = this.state
        if (!this.validateAll()) return
        try {
            const result = await regis({ email, password, name })
            this.handleSubmitSuccess(result.data)
            console.log(result)
        } catch (err) {
            console.log(err)
            this.setState({ errMsg: 'data is wrong' })
        }
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
        alert('Update Successfully')
        // this.setState({updateSuccess: true})
        console.log(res)
    }

    render() {
        let title = 'Login'
        console.log(this.state.file)
        switch (this.props.mode) {
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
            <div className='content' style={{ marginTop: '60px', maxWidth: '30%' }}>
                <div className='title'>{title}</div>
                {this.props.mode !== 1 && (
                    <div className='box'>
                        <TextField id="outlined-basic"
                            error={this.state.err.name}
                            helperText={this.state.err.name}
                            onChange={(e) => {
                                this.handleChange(e, 'name')
                                this.validateName(e.target.value)
                            }} fullWidth defaultValue={this.props.user?.name} label="name" variant="outlined" />
                    </div>
                )}
                {this.props.mode !== 3 && (
                    <div className='box'>
                        <TextField id="outlined-basic"
                            helperText={this.state.err.email}
                            error={this.state.err.email}
                            onChange={(e) => {
                                this.handleChange(e, 'email')
                                this.validateEmail(e.target.value)
                            }} fullWidth label="email" variant="outlined" />
                    </div>
                )}
                <div className='box'>
                    <TextField id="outlined-basic"
                        error={this.state.err.pass}
                        helperText={this.state.err.pass}
                        onChange={(e) => {
                            this.handleChange(e, 'password')
                            this.validatePassword(e.target.value)
                        }} fullWidth label="password" type="password" variant="outlined" />
                </div>
                {this.props.mode === 3 && (
                    <div className='box'>
                        <img src={this.state.imgSrc} style={{ width: '100%' }} />
                        <label style={{ width: '100%' }} htmlFor="uploadImage">
                            <Button variant="contained" component="span" fullWidth>
                                Upload File
                            </Button>
                        </label>
                        <input accept="image/*" hidden type="file" id='uploadImage' multiple={false} onChange={this.handleImage} />
                    </div>
                )}
                <div className='box'>
                    <Button variant="contained" onClick={this.handleSubmit} fullWidth color="primary" style={{ padding: '10px' }}>{title}</Button>
                </div>

                {this.state.errMsg && (
                    <div className='box'>
                        <label style={{ color: 'red' }}>{this.state.errMsg}</label>
                    </div>
                )}
            </div>
        )
    }
}

export default Register;