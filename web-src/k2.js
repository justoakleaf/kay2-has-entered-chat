// typing params
const TYPE_SPEED = 5;
const SEND_DELAY = 500;

// store all the timers so thaty can be cleared
let TIMERS = [];
// store all the timings
let TIMINGS = []

const ELEMENTS = {
    credits: document.getElementById("credits"),
    chatbox: document.getElementById("chatbox"),
    prompt: document.getElementById("prompt"),
    typeSpace: document.getElementById("typewriter-space"),
    typing: document.getElementById("typing"),
    typers: document.getElementById("typers"),
    appContainer: document.getElementById("droidchat"),
    audioPlayer: document.getElementById("audio"),
}

function setTimeoutWrapper(callbackShow, callbackHide, seconds) {
    if (seconds < 0) {
        callbackShow();
    } else {
        callbackHide();
        let timer = setTimeout(callbackShow, seconds*1000)
        TIMERS.push(timer)
    }

}

function timeoutModifyMessage(timing, currentTime) {
    const element = timing.element;
    const promptText = timing.prompt;
    const time = timing.timing - currentTime;
    const display = timing.display;
    setTimeoutWrapper(() => {
        element.style.display = display;
        ELEMENTS.prompt.innerText = promptText;
    }, () => {
        element.style.display = 'none';
    }, time)
}

function getTextTiming(timing, currentTime) {
    const txtStart = parseInt(timing.element.getAttribute('data-type-start'))
    const txt = timing.element.firstElementChild.lastElementChild.innerText.slice(txtStart)
    const startTime = timing.timing - currentTime
    const timeOut = startTime - txt.length*TYPE_SPEED/1000 - SEND_DELAY/1000

    return { txt, timeOut, startTime }
}

function timeoutTyper(txtObj, currentTime) {
    const typingElement = ELEMENTS.typeSpace;
    const { txt, timeOut, startTime } = getTextTiming(txtObj, currentTime)
    
    if (timeOut < 0) {
        return;
    }
    for (let i = 0; i < txt.length; i++) {
        const letter = txt.charAt(i)
        // console.log(timeOut)
        const timer = setTimeout(() => {
            typingElement.innerHTML += letter;
        }, timeOut*1000+i*TYPE_SPEED)
        TIMERS.push(timer);
    }
    const timer = setTimeout(() => {
        typingElement.innerHTML = '';
    }, startTime*1000)
    TIMERS.push(timer)
}

function countVisibleTypers () {
    const typerDivs = ELEMENTS.typers.children;
    let visCount = 0;

    for (let i = 0; i < typerDivs.length; i++) {
        if (typerDivs[i].style.display === 'inline') {
            visCount += 1
        }
    }

    return visCount;
}

function whoTypes (timing, currentTime) {
    const typerDiv = document.getElementById(`typer-${timing.user}`)

    if (typerDiv === null) {
        return
    }

    const { timeOut, startTime } = getTextTiming(timing, currentTime)

    setTimeoutWrapper(() => {
        ELEMENTS.typing.style.display = "block";
        typerDiv.style.display = "inline"; 
    }, () => {
        typerDiv.style.display = 'none';
        if (countVisibleTypers() === 0) {
            ELEMENTS.typing.style.display = "none";
        }
    }, timeOut)

    setTimeoutWrapper(() => {
        typerDiv.style.display = "none";
        if (countVisibleTypers() === 0) {
            ELEMENTS.typing.style.display = "none";
        }
    }, () => {}, startTime)
}

function makeTimings() {
    const chatMessages = ELEMENTS.chatbox.children;
    let accTime = 0; // in seconds

    for (let i = 0; i < chatMessages.length; i++) {
        const element = chatMessages[i]
        const msgType = element.getAttribute('data-class')

        const delay = parseFloat(element.getAttribute('data-timing'))
        TIMINGS.push({
            timing: accTime,
            element,
            prompt: chatMessages[i+1] ? chatMessages[i+1].getAttribute('data-prompt') || '>>' : '>>',
            display: "flex",
            callback: timeoutModifyMessage,
        })

        switch (msgType) {
            case 'msg':

                const user = element.firstElementChild.firstElementChild.innerText;
                // who's typing effect
                TIMINGS.push({
                    timing: accTime,
                    element,
                    user,
                    callback: whoTypes,
                }) 

                // K2 typing effect
                if (user === 'Kay2') {
                    TIMINGS.push({
                        timing: accTime,
                        element,
                        display: "",
                        callback: timeoutTyper,
                    })
                }
                
                break;
            case 'K2cmd':

                TIMINGS.push({
                    timing: accTime,
                    element,
                    display: "",
                    callback: timeoutTyper,
                })
                
                break;
            default:
                break;
        }

        accTime += delay;
    }
}

function unhideMessage(currentTime) {
    ELEMENTS.appContainer.style.display = 'flex';
    TIMINGS.forEach((timing) => {
        timing.callback(timing, currentTime)
    })

}

ELEMENTS.appContainer.style.display = 'none';
ELEMENTS.audioPlayer.addEventListener("play", () => {
    ELEMENTS.credits.style.display = 'none';
    ELEMENTS.appContainer.style.display = 'flex';
    unhideMessage(ELEMENTS.audioPlayer.currentTime)
})

ELEMENTS.audioPlayer.addEventListener("pause", () => {
    // clear timers
    TIMERS.forEach((timer) => {
        clearTimeout(timer)
    })
    TIMERS = []

    ELEMENTS.typeSpace.innerText = '';
})

makeTimings()
