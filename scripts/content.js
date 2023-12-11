/** 标记元素 */
const markElement = (id, type = 'update') => {
  const setting = {
    update: {
      backgroundColor: 'rgba(255, 0, 0, 0.5)',
      border: '1px solid rgb(255, 0, 0)',
    },
    new: {
      backgroundColor: 'rgba(0, 255, 0, 0.5)',
      border: '1px solid rgb(0, 255, 0)',
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
    newEl.classList.add('plugin-remove')
    newEl.onclick = () => {
      newEl.remove()
    }
    el.appendChild(newEl)
  }
}

/** TODO: 之前被删除的元素怎么处理呢 */
const showDeleteElement = () => {}

/** 清楚当前页面缓存节点 */
const renderClearButton = (nodeId, json) => {
  const el = document.createElement('button')
  el.style.position = 'fixed'
  el.style.top = '20px'
  el.style.right = '20px'
  el.style.padding = '10px 20px'
  el.style.backgroundColor = '#046626'
  el.style.border = '1px solid #ffffff'
  el.style.borderRadius = '6px'
  el.style.color = '#fff'
  el.style.fontSize = '18px'
  el.style.cursor = 'pointer'
  el.innerText = '已完成本次变更'
  el.onclick = () => {
    chrome.storage.local.remove([nodeId])
    // 清除所有标记节点
    const domList = document.querySelectorAll('.plugin-remove')
    for (let i = 0; i < domList.length; i++) {
      domList[i].remove()
    }
    // 将本次请求设置为缓存
    chrome.storage.local.set({
      [nodeId]: json,
    })
  }
  document.body.appendChild(el)
}

chrome.runtime.onMessage.addListener(function ({
  diffArr,
  deleteArr,
  newArr,
  nodeId,
  json,
}) {
  if (Array.isArray(diffArr)) {
    diffArr.forEach(item => markElement(item))
  }
  if (Array.isArray(deleteArr)) {
    deleteArr.forEach(item => showDeleteElement(item))
  }
  if (Array.isArray(newArr)) {
    newArr.forEach(item => markElement(item, 'new'))
  }
  renderClearButton(nodeId, json)
})
