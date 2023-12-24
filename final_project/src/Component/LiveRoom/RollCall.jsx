import { Badge, IconButton, Tooltip } from "@material-ui/core"
import { AssignmentInd } from "@material-ui/icons"
import Modal from 'react-bootstrap/Modal'
import React, { useState } from 'react'
import { rollcall } from '../../Service/facialVerificationService'

export const RollCall = (props) => {
    const {userList, videoRef, userName} = props
    const [rollCallList, setrollCallList] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [disable, setDisable] = useState(false)
	const [MsgCount, setMsgCount] = useState(0)
	const [tooltip, setToolTip] = useState('Roll Call')

	console.log(rollCallList)
    const handleClick = () => {
		setMsgCount(0)
		if(!!rollCallList){
			setShowModal(true)
		}
		else {
			setDisable(true)
			setToolTip('Waiting for roll call')
			const formData = []
			userList.forEach((data, i) => {
				let video = document.querySelector(`[data-socket="${data.socketId}"]`)
				if(!video) video = videoRef.current
				
				const canvas = Object.assign(document.createElement("canvas"), { width: video.clientWidth, height: video.clientHeight })
				canvas
				.getContext("2d")
				.drawImage(video, 0, 0, video.clientWidth, video.clientHeight);
				const imageDataURL = canvas.toDataURL();
				formData.push({user: data.username, image: imageDataURL})
			})
			rollcall(formData)
			.then(data => {
				setrollCallList(data.data)
				setMsgCount(1)
			})
			.catch(error => {
				console.error('Error:', error);
			}).finally(_ =>{
				setDisable(false)
				setToolTip('Roll Call')
			})
		}

	}
	
	// const dataURItoBlob = (dataURI) => {
	// 	var byteString = atob(dataURI.split(',')[1]);
	// 	var ab = new ArrayBuffer(byteString.length);
	// 	var ia = new Uint8Array(ab);
		
	// 	for (var i = 0; i < byteString.length; i++) {
	// 		ia[i] = byteString.charCodeAt(i);
	// 	}
	
	// 	return new Blob([ab], { type: 'image/png' });
	// }
    return (
        <>
		 	<Tooltip title={tooltip}>
				<Badge badgeContent={MsgCount} color="secondary" >
					<IconButton disabled={disable} onClick={handleClick} style={{opacity: disable?'50%':'100%'}}>
						<AssignmentInd/>
					</IconButton>
				</Badge>
			</Tooltip>
            <Modal show={showModal} onHide={() => setShowModal(false)} style={{ zIndex: "999999" }}>
                <Modal.Header closeButton>
                    <Modal.Title>Roll Call</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ overflow: "auto", overflowY: "auto", height: "400px", textAlign: "left" }} >
                    {rollCallList?.map((element, ind) => {
                        return (
                            <div key={ind} style={{display : 'flex', justifyContent : 'space-between'}}>
                                <p>{element.name + ((element.name === userName)?' (you)':'')}</p>
                                <p>{element.verified === 1?'verified':'unknow'}</p>
                            </div>	
                        )
                    })}
                </Modal.Body>
            </Modal>
        </>
    )

}