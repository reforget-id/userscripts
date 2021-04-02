// ==UserScript==
// @name        Twitter Video Fix 
// @version     1.0.0
// @author      reforget-id
// @namespace   twitter-video-fix
// @description Fix video playback in twitter
// @homepage    https://github.com/reforget-id/userscripts
// @icon        https://www.iconsdb.com/icons/download/caribbean-blue/play-3-256.png
// @downloadURL https://raw.githubusercontent.com/reforget-id/userscripts/main/scripts/twitter-video-fix.user.js
// @updateURL   https://raw.githubusercontent.com/reforget-id/userscripts/main/scripts/twitter-video-fix.user.js 
// @match       https://mobile.twitter.com/*
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @run-at      document-start

// ==/UserScript==

(() => {
	
	GM_addStyle(`
		.width-inherit {
			width : inherit;
		}
	`)
	
	const resource = "https://www.savetweetvid.com/result?url="
	const tweet = /mobile.twitter.com\/.+\/status\/.+/
	const log = '[Twitter Video Fix]'
	let article, videoContainer, embedVideo, downloadUrl, oldHref 
	
	const config = {childList: true}
	const target = document.head
	
	const observer = new MutationObserver((mutations) => {
		mutations.forEach(function(mutation) {
			const currentHref = window.location.href
			
			if (oldHref != currentHref) {
				oldHref = currentHref
				article = null
				videoContainer = null
				embedVideo = null
				downloadUrl = null
				console.log(log, 'Clear Variable')
				
				if (currentHref.match(tweet)) {
					console.log(log, 'Check if this tweet contain a video')
					createXhr()
				}
			}
		})
	})

	observer.observe(target, config)
	console.log(log, 'Observe URL Changes')
	
	function createXhr() {
		const url = window.location.href
        const openUrl = `${resource}${url}`
        console.log(log, 'Creating XHR request')

        GM_xmlhttpRequest({
            method: 'GET',
            url: openUrl,
            overrideMimeType: 'text/html; charset=UTF-8',
            responseType: 'document',
            binary: false,
            timeout: 0,
            withCredentials: true,
            onerror: function () {
                console.log(log, 'Failed to create XHR request')
            },
            onload: function (res) {
                const downloadButton = res.response.getElementsByClassName('btn btn-download')[0]

                if (downloadButton) {
					const currentHref = window.location.href
					downloadUrl = downloadButton.href
                    console.log(log, 'Success get video url from XHR')
                    console.log(log, downloadUrl)
					
					if (currentHref.match(tweet)) {
						checkEmbeddedVideo()
					}
                } else {
                    console.log(log, "This tweet doesn't contain any video")
                }
            }
        })
    }
	
	function checkEmbeddedVideo() {
		try {
			article = document.getElementsByTagName('article')[0]

			if (article) {
				const videoDiv = document.createElement('div')
				
				embedVideo = article.getElementsByClassName('css-1dbjc4n r-1awozwy r-1p0dtai r-1777fci r-1d2f490 r-u8s1d r-zchlnj r-ipm5af')[0]
				videoContainer = embedVideo.parentNode
				embedVideo.remove()
				console.log(log, 'Remove embedded video')

				videoDiv.setAttribute('class', 'width-inherit')
				videoDiv.innerHTML = `
					<video controls class="width-inherit">
						<source src="${downloadUrl}" type="video/mp4">
					</video>
				`		
				videoContainer.append(videoDiv)
				console.log(log, 'Append new Video')
			} else {
				console.log(log, 'Check embedded video')
				setTimeout(checkEmbeddedVideo, 500)
			}
		}
		catch(e) {
			console.log(log, e)
		}
	}
	
})()
