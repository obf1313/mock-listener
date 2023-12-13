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

/** 弹消息 */
function message(message, time = 1000) {
  const el = document.createElement('div')
  el.classList.add('message-box')
  el.innerText = message
  document.body.appendChild(el)
  setTimeout(() => {
    el.remove()
  }, time)
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
    if (!appIdVar) {
      message('未查询到当前项目信息')
      return
    }
    const deleteArr = []
    chrome.storage.local.get().then(data => {
      for (key in data) {
        if (key.toString().startsWith(`(${appIdVar})`)) {
          deleteArr.push(key)
        }
      }
      // chrome.storage.local.remove(deleteArr, function () {
      //   message('删除成功')
      // })
    })
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

// TODO: 只有打开控制台才能成功接收（传递）消息，有时候会报错 Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
chrome.runtime.onMessage.addListener(function ({ type, params: { appId } }) {
  console.log('appIdVar', appIdVar)
  if (type === 'to-popup') {
    appIdVar = appId
  }
})
