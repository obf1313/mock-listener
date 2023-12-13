/** 跟 content.js 通信 */
const sendMessageToContent = (type, params) => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    if (Array.isArray(tabs) && tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type,
        params,
      })
    } else {
      console.log('未找到激活的 tab', tabs)
    }
  })
}

/** 跟 popup.js 通信 */
const sendMessageToPopup = (type, params) => {
  chrome.runtime.sendMessage({ type, params })
}

/** 对比之前数据和本次数据变更 */
const diffJSON = (before, now, id, json, appId) => {
  sendMessageToPopup('to-popup', appId)
  if (before.updatedAt === now.updatedAt) {
    console.log('无变更')
  } else {
    const diffArr = []
    const deleteArr = []
    const newArr = []
    // 判断删除和变更
    diff(before.components, now.components, diffArr, deleteArr)
    // 判断新增
    diff(now.components, before.components, [], newArr)
    /** 因为 background.js 只能做服务端操作，不能进行 dom 操作，所以需要通过 postMessage 形式通知 content */
    sendMessageToContent('to-content', {
      diffArr,
      deleteArr,
      newArr,
      nodeId: id,
      json,
    })
  }
}

/** 查找匹配元素 */
const findNowElement = (nowArr, id) => {
  for (let i = 0; i < nowArr.length; i++) {
    const nowElement = nowArr[i]
    if (nowElement._id === id) {
      return nowElement
    } else if (Array.isArray(nowElement.components)) {
      const res = findNowElement(nowElement.components, id)
      if (res) {
        return res
      }
    }
  }
  return null
}

/** 递归判断节点 */
const diff = (beforeArr, nowArr, diffArr, deleteArr) => {
  for (let i = 0; i < beforeArr.length; i++) {
    const beforeElement = beforeArr[i]
    // 如果内部还有其他组件，则对比内部 components
    if (Array.isArray(beforeElement.components)) {
      diff(beforeElement.components, nowArr, diffArr, deleteArr)
    } else {
      const nowElement = findNowElement(nowArr, beforeElement._id)
      if (nowElement) {
        if (JSON.stringify(beforeElement) !== JSON.stringify(nowElement)) {
          diffArr.push(beforeElement._id)
        }
      } else {
        deleteArr.push(beforeElement._id)
      }
    }
  }
}

let getOverSet = new Set()

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.action.setBadgeText({
//     text: 'ON',
//   })
// })

// 监听请求
chrome.webRequest.onResponseStarted.addListener(
  details => {
    // TODO: 此处切换 Tab 就不会执行了，因为不会请求
    // chrome.storage.local.set('(hlmrmWW19)VZECxoO5N', data['VZECxoO5N'])
    // 因为会进入循环
    if (!getOverSet.has(details.url)) {
      getOverSet.add(details.url)
      // 自己请求一次
      fetch(details.url, {
        method: details.method,
      })
        .then(response => response.json())
        .then(data => {
          // 项目ID，对应 mock 中一个项目
          const appID = data?.payload?.[0]?.appID || ''
          const nodeID = data?.payload?.[0]?.nodeID || ''
          const id = `(${appID})${nodeID}`
          if (nodeID) {
            chrome.storage.local.get([id]).then(result => {
              if (
                (result.constructor === Object &&
                  Object.keys(result).length === 0) ||
                !result
              ) {
                // 设置浏览器存储该数据
                chrome.storage.local.set({
                  [id]: JSON.stringify(data.payload[0]),
                })
              } else {
                // 如果之前存过该页面的数据
                const before = JSON.parse(result[id])
                const now = data.payload[0]
                diffJSON(before, now, id, JSON.stringify(now), appID)
              }
              getOverSet.delete(details.url)
            })
          }
        })
    }
  },
  { urls: ['https://rp.mockplus.cn/api/v1/artboard/preview/all/*'] },
  []
)
