// ==UserScript==
// @name        Twitter Video Fix 
// @version     1.1.1
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
        .size-inherit {
            width : inherit;
            height : inherit;
        }
    `)
    
    const resource = "https://www.savetweetvid.com/result?url="
    const tweet = /mobile.twitter.com\/.+\/status\/.+/
    const log = '[Twitter Video Fix]'
    let article, videoContainer, embeddedVideo, downloadUrl, oldHref 
    
    const config = {childList: true}
    const target = document.head
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(function(mutation) {
            const currentHref = window.location.href
            
            if (oldHref != currentHref) {
                oldHref = currentHref
                article = null
                videoContainer = null
                embeddedVideo = null
                downloadUrl = null
                console.log(log, 'Clear Variable')
                
                if (currentHref.match(tweet)) {
                    console.log(log, 'Start tweet operation')
                    tweetOperation()
                }
            }
        })
    })

    observer.observe(target, config)
    console.log(log, 'Observe URL Changes')
    
    function tweetOperation() {
        try {
            article = document.getElementsByTagName('article')[0]
            let times = 0
            
            if (article) {
                checkEmbeddedVideo()
            } else {
                console.log(log, 'Waiting for the tweet to load ')
                setTimeout(tweetOperation, 500)
            }
            
            function checkEmbeddedVideo() {
                console.log(log, 'Check if this tweet contain a video')
                embeddedVideo = article.getElementsByClassName('css-1dbjc4n r-1awozwy r-1p0dtai r-1777fci r-1d2f490 r-u8s1d r-zchlnj r-ipm5af')[0]
                times++
                
                if (embeddedVideo) {
                    videoContainer = embeddedVideo.parentNode
                    embeddedVideo.remove()
                    console.log(log, 'Remove embedded video')					
                    createXhr()
                } else if (times < 5){
                    setTimeout(checkEmbeddedVideo, 500)
                } else if (times >= 5){
                    console.log(log, "This tweet doesn't contain any video")
                    return
                }	
            }
        }
        catch(e) {
            console.log(log, e)
        }
    }
    
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
                        const videoDiv = document.createElement('div')
                        videoDiv.setAttribute('class', size-inherit')
                        videoDiv.innerHTML = `
                            <video controls class="size-inherit">
                                <source src="${downloadUrl}" type="video/mp4">
                            </video>
                        `		
                        videoContainer.append(videoDiv)
                        console.log(log, 'Append new Video')
                    }
                } else {
                    console.log(log, "This tweet doesn't contain any video")
                    return
                }
            }
        })
    }
    
})()
