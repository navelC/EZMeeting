import { IconButton, Tooltip } from "@material-ui/core"
import React from 'react'

export const IconCustom = (props) => {
    const {state, Icon, OffIcon, handleClick, tooltip} = props
    return(
        <Tooltip title={tooltip}>
            <IconButton className={(!!state)?'':'off'}  onClick={handleClick}>
                {(!!state) ? <Icon /> : <OffIcon/>}
            </IconButton>
        </Tooltip>
    )
}