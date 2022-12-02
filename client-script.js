var $logoutButton = document.getElementById("logout")
var $addressElement = document.getElementById("wallet-address")
var $connectBtnId = 'connect'
var $connectButton = document.getElementById($connectBtnId)
var $sendTxnDiv = document.getElementById("ambire-sdk-send-transaction")
var $sendTxnButton = document.getElementById("ambire-sdk-send-transaction-btn")
var $signMsgDiv = document.getElementById("ambire-sdk-sign-message")
var $signMsgButton = document.getElementById("ambire-sdk-sign-message-btn")

showLogout = function() {
    $logoutButton.style.display = 'block'
}
showAddress = function(address) {
    $addressElement.innerHTML = `Wallet address: ${address}`
}
showTxnDiv = function() {
    $sendTxnDiv.style.display = 'block'
}
showMsgDiv = function() {
    $signMsgDiv.style.display = 'block'
}
showConnect = function() {
    $connectButton.style.display = 'block'
}
hideConnect = function() {
    $connectButton.style.display = 'none'
}
hideAddress = function() {
    $addressElement.innerHTML = ''
}
hideLogout = function() {
    $logoutButton.style.display = 'none'
}
hideTxnDiv = function() {
    $sendTxnDiv.style.display = 'none'
}
hideMsgDiv = function() {
    $signMsgDiv.style.display = 'none'
}

// use the local storage to set and remove address
setAddress = function(address) {
    window.localStorage.setItem('wallet_address', address)
}
removeAddress = function() {
    window.localStorage.removeItem('wallet_address')
}

const sdk = new window.AmbireSDK({
    walletUrl: 'http://localhost:3000',
    dappName: 'dapp1',
    chainID: 1,
    iframeElementId: 'ambire-sdk-iframe',
})

const wallet = window.localStorage.getItem('wallet_address')
if (wallet) {
    showLogout()
    showAddress(wallet)
    hideConnect()
    showTxnDiv()
    showMsgDiv()
} else {
    hideAddress()
    hideLogout()
    showConnect()
    hideTxnDiv()
    hideMsgDiv()
}
$logoutButton.addEventListener('click', function() {
    logout()
})

logout = function() {
    if (!window.localStorage.getItem('wallet_address')) return

    hideLogout()
    hideAddress()
    showConnect()
    hideTxnDiv()
    hideMsgDiv()
    removeAddress()
}

sdk.onLoginSuccess(function(data) {
    showLogout()
    showAddress(data.address)
    hideConnect()
    showTxnDiv()
    showMsgDiv()
    setAddress(data.address)
})
sdk.onRegistrationSuccess(function(data) {
    showLogout()
    showAddress(data.address)
    hideConnect()
    showTxnDiv()
    showMsgDiv()
    setAddress(data.address)
})

// send transaction
$sendTxnButton.addEventListener('click', function() {
    const inputs = $sendTxnDiv.getElementsByTagName('input')
    sdk.openSendTransaction(
        inputs[0].value,
        inputs[1].value,
        inputs[2].value
    )
})

// sign a message
$signMsgButton.addEventListener('click', function() {
    const inputs = $signMsgDiv.getElementsByTagName('input')
    const dropdowns = $signMsgDiv.getElementsByTagName('select')

    const signType = dropdowns[0].value
    let message = inputs[0].value

    if (['eth_signTypedData', 'eth_signTypedData_v4'].includes(signType)) {
        // temp dummy typed message
        message = {
            domain: {
                name: "My example Dapp",
                chainId: 137
            },
            types: {
                "MessageType1": [
                    {
                        name: "from",
                        type: "address"
                    },
                    {
                        name: "to",
                        type: "address"
                    },
                    {
                        name: "value",
                        type: "uint256"
                    },
                    {
                        name: "text",
                        type: "string"
                    }
                ]
            },
            primaryType: "MessageType1",
            message: {
                from: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
                to: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
                value: 12345,
                text: message
            }
        }
    }

    sdk.openSignMessage(signType, message)
})

$connectButton.addEventListener('click', function() {
    sdk.openLogin()
})