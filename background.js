const diffJSON = (before, now) => {
  if (before.updatedAt === now.updatedAt) {
    console.log('无变更')
  } else {
    // 判断删除和变更
    diffAndMark(before.components, now.components)
    // 新增是不是要反着找？
  }
}

const findNowElement = (nowArr, id) => {
  for (let i = 0; i < nowArr.length; i++) {
    const nowElement = nowArr[i]
    if (nowElement._id === id) {
      return nowElement
    } else if (Array.isArray(nowElement.components)) {
      return findNowElement(nowElement.components, id)
    }
  }
}

const markElement = id => {
  const el = document.getElementById(id)
  if (el) {
    const newEl = document.createElement('div')
    el.style.position = 'relative'
    newEl.style.position = 'absoulte'
    newEl.style.top = 0
    newEl.style.left = 0
    newEl.style.width = el.getBoundingClientRect().width
    newEl.style.height = el.getBoundingClientRect().height
    newEl.style.backgroundColor = 'rgba(0, 255, 255, 0.5)'
    newEl.style.border = '1px solid rgb(255, 255, 0)'
    el.appendChild(newEl)
  }
}

const diffAndMark = (beforeArr, nowArr) => {
  for (let i = 0; i < beforeArr.length; i++) {
    const beforeElement = beforeArr[i]
    if (Array.isArray(beforeElement.components)) {
      diffAndMark(nowElement.components, nowArr)
    } else {
      const nowElement = findNowElement(nowArr, beforeElement._id)
      if (nowElement) {
        // 对比两个元素是否有差异，如果有则高亮该元素
        if (JSON.stringify(beforeElement) !== JSON.stringify(nowElement)) {
          // markElement(beforeElement._id)
        }
      } else {
        console.log('有元素被删除了')
      }
    }
  }
}

let getOverList = []
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: 'ON',
  })
})
chrome.webRequest.onResponseStarted.addListener(
  details => {
    if (!getOverList.includes(details.url)) {
      getOverList.push(details.url)
      fetch(details.url, {
        method: details.method,
      })
        .then(response => response.json())
        .then(data => {
          const nodeID = data?.payload?.[0]?.nodeID || ''
          if (nodeID) {
            chrome.storage.local.get([nodeID]).then(result => {
              if (
                (result.constructor === Object &&
                  Object.keys(result).length === 0) ||
                !result
              ) {
                chrome.storage.local.set({
                  [nodeID]: JSON.stringify(data.payload[0]),
                })
              } else {
                const before = JSON.parse(result[nodeID])
                const now = data.payload[0]
                diffJSON(before, now)
              }
            })
          }
        })
    }
  },
  { urls: ['https://rp.mockplus.cn/api/v1/artboard/preview/all/*'] },
  []
)
