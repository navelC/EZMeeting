var UserFrameHelper = (function(){
    var elms = 0

    var changeCssVideos = (main) => {
		let widthMain = main.offsetWidth
		let minWidth = "30%"
		if ((widthMain * 30 / 100) < 300) {
			minWidth = "300px"
		}
		let minHeight = "40%"

		let height = String(100 / elms) + "%"
		let width = ""
		if(elms === 0 || elms === 1) {
			width = "100%"
			height = "100%"
		} else if (elms === 2) {
			width = "45%"
			height = "100%"
		} else if (elms === 3 || elms === 4) {
			width = "35%"
			height = "50%"
		} else {
			width = String(100 / elms) + "%"
		}

		let videos = main.querySelectorAll("video")
		for (let a = 0; a < videos.length; ++a) {
			videos[a].parentNode.style.minWidth = minWidth
			videos[a].parentNode.style.minHeight = minHeight
			videos[a].parentNode.style.setProperty("width", width)
			videos[a].parentNode.style.setProperty("height", height)
		}

		return {minWidth, minHeight, width, height}
	}

    var createVideo = function(stream, socketListId, eleLength, userName) {
        elms = eleLength
        let main = document.getElementById('main')
        let cssMesure = changeCssVideos(main)

        let video = document.createElement('video')
        let par = document.createElement('div')
        let name = document.createElement('div')

        let css = {minWidth: cssMesure.minWidth, minHeight: cssMesure.minHeight, maxHeight: "100%", margin: "10px",
        width: cssMesure.width, height: cssMesure.height, position: 'relative'}
        for(let i in css) par.style[i] = css[i]

        video.style.setProperty("object-fit", "fill")
        video.style.setProperty("width", "100%")
        video.style.setProperty("height", "100%")

        video.setAttribute('data-socket', socketListId)
        par.setAttribute('id', socketListId)
        video.srcObject = stream
        video.autoplay = true
        video.playsinline = true

        name.style.setProperty("position", "absolute")
        name.style.setProperty("bottom", "10px")
        name.style.setProperty("left", "10px")
        name.innerHTML = userName

        par.appendChild(name)
        par.appendChild(video)
        main.appendChild(par)
    }

    var removeVideo = (id) => {
        // let video = document.querySelector(`[data-socket="${id}"]`)
        let video = document.querySelector(`#${id}`)
        console.log(video)
        if (video !== null) {
            elms--
            video.parentNode.removeChild(video)

            let main = document.getElementById('main')
            changeCssVideos(main)
        }
    }

    return {
        createVideo,
        removeVideo
    }
})();

export default UserFrameHelper