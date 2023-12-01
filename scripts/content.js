const markElement = id => {
  const el = document.getElementById(id)
  if (el) {
    const newEl = document.createElement('div')
    newEl.style.position = 'absolute'
    newEl.style.top = 0
    newEl.style.left = 0
    newEl.style.width = '100%'
    newEl.style.height = '100%'
    newEl.style.backgroundColor = 'rgba(0, 255, 255, 0.5)'
    newEl.style.border = '1px solid rgb(255, 255, 0)'
    newEl.onclick = () => {
      newEl.remove()
    }
    el.appendChild(newEl)
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (Array.isArray(request)) {
    request.forEach(item => markElement(item))
  }
})
