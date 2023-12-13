/** 标记元素 */
const markElement = (id, type = 'update') => {
  const setting = {
    update: 'mark-ele-update',
    new: 'mark-ele-new',
  }
  const el = document.getElementById(id)
  if (el) {
    const newEl = document.createElement('div')
    newEl.classList.add('mark-ele')
    newEl.classList.add(setting[type])
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
  el.classList.add('clear-button')
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
  type,
  params: { diffArr, deleteArr, newArr, nodeId, json },
}) {
  if (type === 'to-content') {
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
  }
})
