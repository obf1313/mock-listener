let getOverList = []
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: 'OFF',
  })
})
chrome.webRequest.onResponseStarted.addListener(
  details => {
    console.log('details', details)
    if (!getOverList.includes(details.url)) {
      getOverList.push(details.url)
      fetch(details.url, {
        method: details.method,
      })
        .then(response => response.body)
        .then(rb => {
          const reader = rb.getReader()
          return new ReadableStream({
            start(controller) {
              // The following function handles each data chunk
              function push() {
                // "done" is a Boolean and value a "Uint8Array"
                reader.read().then(({ done, value }) => {
                  // If there is no more data to read
                  if (done) {
                    controller.close()
                    return
                  }
                  // Get the data and send it to the browser via the controller
                  controller.enqueue(value)
                  // Check chunks by logging to the console
                  push()
                })
              }
              push()
            },
          })
        })
        .then(stream => {
          return new Response(stream, { headers: { 'Content-Type': 'text/html' } }).text()
        })
        .then(result => {
          
          const jsonObj = JSON.parse(result)
          const nodeID = jsonObj?.payload?.[0]?.nodeID || ''
          if (nodeID) {
            chrome.storage.local.get([nodeID]).then((result) => {
              // TODO: 对比 JSON，将对应 id 在页面上高亮显示
              if (result) {
                
              } else {
                // 没有则存储 payload
                chrome.storage.local.set({ [nodeID]: jsonObj.payload });
              }
            })
          }
        })
    }
  },
  { urls: ['https://rp.mockplus.cn/api/v1/artboard/preview/all/*'] },
  []
)
