/** 对比之前数据和本次数据变更 */
const diffJSON = (before, now) => {
  if (before.updatedAt === now.updatedAt) {
    console.log('无变更')
  } else {
    const diffArr = []
    const deleteArr = []
    const newArr = []
    // 判断删除和变更
    diff(before.components, now.components, diffArr, deleteArr)
    // 判断新增
    // diff(before.components, now.components, [], newArr)
    /** 因为 background.js 只能做服务端操作，不能进行 dom 操作，所以需要通过 postMessage 形式通知 content */

    console.log('diffArr', diffArr)
    console.log('newArr', newArr)
    console.log('deleteArr', deleteArr)
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // TODO: 不知道为什么有时候拿不到
      if (Array.isArray(tabs) && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { diffArr, deleteArr, newArr })
      } else {
        console.log('未知错误', tabs)
      }
    })
  }
}

/** 查找匹配元素 */
const findNowElement = (nowArr, id) => {
  for (let i = 0; i < nowArr.length; i++) {
    const nowElement = nowArr[i]
    if (nowElement._id === id) {
      console.log('nowElement', nowElement)
      return nowElement
    } else if (Array.isArray(nowElement.components)) {
      return findNowElement(nowElement.components, id)
    }
  }
}

/** 递归判断节点 */
const diff = (beforeArr, nowArr, diffArr, deleteArr) => {
  for (let i = 0; i < beforeArr.length; i++) {
    const beforeElement = beforeArr[i]
    if (Array.isArray(beforeElement.components)) {
      console.log('beforeElement.components', beforeElement.components)
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

let getOverList = []

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: 'ON',
  })
})

// 监听请求
chrome.webRequest.onResponseStarted.addListener(
  details => {
    // TODO: 此处切换 Tab 就不会执行了，考虑用定时器的方式替换、或者其他更好的方法？
    // 因为会进入循环
    if (!getOverList.includes(details.url)) {
      getOverList.push(details.url)
      // 自己请求一次
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
                // 设置浏览器存储该数据
                chrome.storage.local.set({
                  [nodeID]: JSON.stringify(data.payload[0]),
                })
              } else {
                // 如果之前存过该页面的数据
                const before = JSON.parse(result[nodeID])
                const now = data.payload[0]
                diffJSON(before, now)
                // TODO: 对比后是用当前这次的替换掉初次的，还是手动清除？
              }
            })
          }
        })
    }
  },
  { urls: ['https://rp.mockplus.cn/api/v1/artboard/preview/all/*'] },
  []
)
