
const socket = io()
//Element
const $messageForm =  document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messageLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//Template
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML
//Options
const {username, room} = Qs.parse(location.search, {'ignoreQueryPrefix': true})

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
   
    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
       $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message', (message) => {
   console.log(message)
   const html =  Mustache.render($messageTemplate, {
       username: message.username,
       message: message.text,
       createdAt: moment(message.createdAt).format('h:mm a')
   })
   $messages.insertAdjacentHTML('beforeend',html)
   autoScroll()
})
socket.on('locationMessage', (message) => {
    console.log(message)
    const html =  Mustache.render($locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

$messageForm.addEventListener('submit', (e) => {
   e.preventDefault()
   $messageFormButton.setAttribute('disabled', 'disabled')

   //disabled
   const message = e.target.elements.message.value
   socket.emit('sendMessage', message, (error) => {
   $messageFormButton.removeAttribute('disabled')
   $messageFormInput.value = ''
   $messageFormInput.focus()
    //enabled
     if(error){
       return  console.log(error)
     }
     return console.log('This message is delivered!')
   })
})

$messageLocationButton.addEventListener('click', (e) => {
    $messageLocationButton.setAttribute('disabled', 'disabled')
   if (!navigator.geolocation) {
      return alert('Geolocation is not support by your browser. ')
   }
   navigator.geolocation.getCurrentPosition((position) => {
    $messageLocationButton.removeAttribute('disabled')
       const {latitude, longitude} = position.coords
      socket.emit('sendLocation', {
          latitude: latitude,
          longitude: longitude
      }, () => {
        console.log('Location shared')
      })
   })

})

socket.on('roomData', ({ room, users})=> {
    const html =  Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', {username, room}, (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
   
})