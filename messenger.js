/**
 * @author zp
 * @description 在跨域iframe页面与父页面之间提供一种简单的通信机制
 */
window.Messenger = (function() {
  //是否支持postMessage
  var supportPostMessage = 'postMessage' in window
  //所有消息类型标识
  var allType = '*'

  //target为目标页面的window对象
  function Messenger(target) {
    this.target = target
    this.types = {}
    this.debugger = false
    this.receive()
  }

  //开启debugger模式，会打印相关信息
  Messenger.prototype.openDebugger = function() {
    this.debugger = true
  }

  // 发送消息 type：string 消息类型  message：string|object 消息
  Messenger.prototype.send = function(type, message) {
    if (supportPostMessage) {
      var msgWrapper = { TYPE: type, MESSAGE: message || '' }
      //对象转为Json字符串
      msgWrapper = JSON.stringify(msgWrapper)
      if (this.target) {
        this.debugger && console.log('Post message:%s', msgWrapper)
        //低版本浏览器中：msgWrapper只能为字符串类型
        this.target.postMessage(msgWrapper, '*')
      } else {
        console.error('target is null.')
      }
    } else {
      assertNotSupoort()
    }
  }

  function assertNotSupoort() {
    console.warn('Current browser not suppoer postMessage.')
  }

  // 接收消息
  Messenger.prototype.receive = function() {
    var self = this
    var messageHandler = function(msg) {
      var data = msg.data
      try {
        //尝试将字符串转为Json对象
        data = JSON.parse(data)
      } catch (e) {
        return
      }
      var type = data.TYPE
      var message = data.MESSAGE
      var actions = self.types[type] || []
      var matchedActions = actions.concat(self.types[allType] || [])
      if (matchedActions && matchedActions.length > 0) {
        for (var i = 0; i < matchedActions.length; i++) {
          matchedActions[i](message)
        }
      }
    }
    if (supportPostMessage) {
      if ('addEventListener' in document) {
        window.addEventListener('message', messageHandler, false)
      } else if ('attachEvent' in document) {
        window.attachEvent('onmessage', messageHandler)
      }
    } else {
      assertNotSupoort()
    }
  }

  //监听消息  type:string 消息类型(若监听所有类型，则type='*')  action:function 执行动作
  Messenger.prototype.listen = function(type, action) {
    if (typeof action !== 'function') {
      console.error('parameter [%o] is not a function.', action)
      return
    }
    if (!this.types[type]) {
      this.types[type] = []
    }
    this.types[type].push(action)
    this.debugger && console.log('Add listen:%s-%s', type, action)
  }

  return Messenger
})()

window.MessageType = function() {}
MessageType.Logout = 'logout'

window.MessageService = function() {}

//发送注销消息
MessageService.sendLogout = function() {
  var messenger = new Messenger(window.top)
  messenger.send(MessageType.Logout)
}

//监听注销消息
MessageService.listenLogout = function(callback) {
  var messenger = new Messenger()
  messenger.listen(MessageType.Logout, callback)
}
