let appIdVar = ''

/** 二次确认框 */
function alert(parent, message, cb) {
  const ele = document.createElement('div')
  ele.classList.add('pop-modal')
  const title = document.createElement('div')
  title.classList.add('pop-title')
  title.innerText = message
  const row = document.createElement('div')
  row.classList.add('row')
  const cancelButton = document.createElement('button')
  cancelButton.classList.add('little-button')
  cancelButton.innerText = '取消'
  cancelButton.onclick = function () {
    ele.remove()
  }
  const confirmButton = document.createElement('button')
  confirmButton.classList.add('little-button')
  confirmButton.innerText = '确定'
  confirmButton.onclick = function () {
    cb()
    ele.remove()
  }
  row.appendChild(cancelButton)
  row.appendChild(confirmButton)
  ele.appendChild(title)
  ele.appendChild(row)
  parent.appendChild(ele)
}

/** 清除全部缓存 */
function clearAllCache(e) {
  alert(e.target, '确认清除全部缓存吗？', () => {
    chrome.storage.local.clear()
  })
}

/** 清除当前项目缓存 */
function clearProjectCache(e) {
  alert(e.target, '确认清除当前项目缓存吗？', () => {
    console.log('appIdVar', appIdVar)
    // TODO: 如何获取当前项目 id
    console.log('删除')
  })
}

const allDom = document.getElementById('all')
const projectDom = document.getElementById('project')

allDom.onclick = function (e) {
  clearAllCache(e)
}

projectDom.onclick = function (e) {
  clearProjectCache(e)
}

// chrome.runtime.onMessage.addListener(function ({ type, params: { appId } }) {
//   if (type === 'to-popup') {
//     console.log('appId', appId)
//     appIdVar = appId
//   }
// })
