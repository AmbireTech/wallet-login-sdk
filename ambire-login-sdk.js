const walletUrl = 'http://localhost:3000'

function getLoginIframe() {
    return `<iframe src="`+ walletUrl +`/#/email-login-iframe" width="100%" height="100%" frameborder="0"/>`
}

window.addEventListener('message', (e) => {
    if (e.origin !== walletUrl) return
    document.getElementById("ambire-sdk-iframe").remove()

    const event = new CustomEvent(e.data.type, { detail: {...e.data} });
    window.dispatchEvent(event);
}, false)