#### 跨域文档通信

主要使用到Messenger对象，Messenger的主要职责是：send(发送消息)、listen(监听消息)。Messenger是信使的意思，顾名思义是用来传递信息的。为了帮助理解，我们可以想象下：有一个通信管道，多个终端可以往管道发送消息，同时也可以对管道进行监听，为了使通信效率高效，节省资源，引入消息分类的概念，终端发送消息时，会定义一个分类，用来标识当前消息的类型，这样其他终端就可以进行针对性地监听，只获取自己感兴趣的消息。

#### 使用场景

父窗口与iframe之间通信

#### 接口说明

##### Messenger

- 构造函数：Messenger(target)
    
    target：目标的window对象

示例：
```
#父窗口跟iframe页面通信
var iframe1 = document.getElementById('iframe1')
var messenger = new Messenger(iframe1.contentWindow)

#iframe跟父窗口通信
var messenger = new Messenger(window.top)
```

- send(type, message)

    type：消息类型 (string)
    message：消息 (string|object)

- listen(type, action)

    type：消息类型 (string) 若需要监听所有类型，则type='*'
    action：监听到指定消息类型后，触发的行为，即回调函数 (function)

- openDebugger

    调用此方法，控制台会打印send、listen的相关信息。

#### 如何使用

1.在需要通信的文档中(父窗口和iframe页面), 都确保引入messenger.js

2.父窗口和iframe页面都需要有自己的Messenger来进行通信。
    
```
// 父窗口中 初始化Messenger对象
var messenger = new Messenger(iframe1.contentWindow)

// iframe页面中 初始化Messenger对象
var messenger = new Messenger(window.top)

```

3.监听/发送消息

```
// 父窗口中
// 监听所有消息类型
messenger.listen('*', function (msg) {
    console.log('接收到的消息：' + msg).
})

// iframe页面中
// 发送消息
messenger.send('Iframe', '来自iframe的消息')
```

#### 项目中推荐的使用方式

> 如果是这样的使用场景：iframe页面需要往父页面发送消息，触发父页面的事件，那么可以定义一个工具类，以静态方法的形式提供给父页面，iframe页面使用，屏蔽消息类型，达到易用性的效果。

- iframe页面触发父页面的注销方法

##### MessageService
    - sendLogout()

    - listenLogout(callback)
```
// 在父页面中
// 初始化阶段进行监听
MessageService.listenLogout(logout)

// 在iframe页面中
// 对应事件中调用
MessageService.sendLogout();
```

#### demo

具体使用可以参考demo。浏览器直接访问parent.html，就能看到效果，如果想看到跨域环境下的效果，可以把parent.html,iframe.html分别部署到不同web服务器下（nginx配置多个虚拟主机）。