const ModalCustom = (props) => {
    const {Icon, handleClick, msg, modalTitle, ModalContent} = props
    const [showModal, setShowModal] = React.useState(false)
    return (
        <>
            {msg ?
                <Badge badgeContent={msg} disabled={rollcallSucess} color="secondary" onClick={handleClick}>
                    <IconButton>
                        <Icon />
                    </IconButton>
                </Badge>
                :
                <IconButton onClick={handleClick}>
                    <Icon />
                </IconButton>
            }
            <Modal show={showModal} onHide={() => setShowModal(false)} style={{ zIndex: "999999" }}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ overflow: "auto", overflowY: "auto", height: "400px", textAlign: "left" }} >
                    {/* {this.state.listUser.map(element => {
                        return (
                            <div style={{display : 'flex', justifyContent : 'space-between'}}>
                                <p>{element.username}</p>
                                <IconButton className='roomButton'  onClick={()=> this.handleMute(element)}>
                                    {element.isOnMic ? <MicIcon/> : <MicOffIcon/>}
                                </IconButton>
                            </div>	
                        )
                    })} */}
                    <ModalContent />
                </Modal.Body>
            </Modal>
        </>
    )
   
}