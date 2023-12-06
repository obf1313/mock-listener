/** 标记元素 */
const markElement = (id, type = 'update') => {
  const setting = {
    update: {
      backgroundColor: 'rgba(0, 255, 0, 0.5)',
      border: '1px solid rgb(0, 255, 0)',
    },
    new: {
      backgroundColor: 'rgba(255, 0, 0, 0.5)',
      border: '1px solid rgb(255, 0, 0)',
    },
  }
  const el = document.getElementById(id)
  if (el) {
    const newEl = document.createElement('div')
    newEl.style.position = 'absolute'
    newEl.style.top = 0
    newEl.style.left = 0
    newEl.style.width = '100%'
    newEl.style.height = '100%'
    newEl.style.backgroundColor = setting[type].backgroundColor
    newEl.style.border = setting[type].border
    newEl.onclick = () => {
      newEl.remove()
    }
    el.appendChild(newEl)
  }
}

/** 之前被删除的元素怎么处理呢 */
const showDeleteElement = () => {}

chrome.runtime.onMessage.addListener(function ({ diffArr, deleteArr, newArr }) {
  if (Array.isArray(diffArr)) {
    diffArr.forEach(item => markElement(item))
  }
  if (Array.isArray(deleteArr)) {
    deleteArr.forEach(item => showDeleteElement(item))
  }
  if (Array.isArray(newArr)) {
    newArr.forEach(item => markElement(item))
  }
})
