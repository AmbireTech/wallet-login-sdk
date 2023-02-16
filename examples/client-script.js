var $logoutButton = document.getElementById("logout")
var $addressElement = document.getElementById("wallet-address")
var $connectBtnId = 'connect'
var $connectButton = document.getElementById($connectBtnId)
var $sendTxnDiv = document.getElementById("ambire-sdk-send-transaction")
var $sendTxnButton = document.getElementById("ambire-sdk-send-transaction-btn")
var $signMsgDiv = document.getElementById("ambire-sdk-sign-message")
var $signMsgButton = document.getElementById("ambire-sdk-sign-message-btn")

const sdk = new window.AmbireLoginSDK({
    walletUrl: 'https://wallet.ambire.com/sdk-login',
    dappName: 'Example dapp',
    chainID: 1,
})

const showLogout = function() {
    $logoutButton.style.display = 'block'
}
const showAddress = function(address) {
    $addressElement.innerHTML = `Wallet address: ${address}`
}
const showTxnDiv = function() {
    $sendTxnDiv.style.display = 'block'
}
const showMsgDiv = function() {
    $signMsgDiv.style.display = 'block'
}
const showConnect = function() {
    $connectButton.style.display = 'block'
}
const hideConnect = function() {
    $connectButton.style.display = 'none'
}
const hideAddress = function() {
    $addressElement.innerHTML = ''
}
const hideLogout = function() {
    $logoutButton.style.display = 'none'
}
const hideTxnDiv = function() {
    $sendTxnDiv.style.display = 'none'
}
const hideMsgDiv = function() {
    $signMsgDiv.style.display = 'none'
}

// use the local storage to set and remove address
const setAddress = function(address) {
    window.localStorage.setItem('wallet_address', address)
}
const removeAddress = function() {
    window.localStorage.removeItem('wallet_address')
}

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

const logout = function() {
    if (!window.localStorage.getItem('wallet_address')) return

    sdk.openLogout()
}

sdk.onLogoutSuccess(function() {
    hideLogout()
    hideAddress()
    showConnect()
    hideTxnDiv()
    hideMsgDiv()
    removeAddress()
})

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
sdk.onMsgRejected(function() {
    console.log('just subscribing to reject msg')
})
sdk.onMsgSigned(function() {
    console.log('just subscribing to sign msg')
})
sdk.onTxnRejected(function() {
    console.log('just subscribing to reject txn')
})
sdk.onTxnSent(function() {
    console.log('just subscribing to send txn')
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