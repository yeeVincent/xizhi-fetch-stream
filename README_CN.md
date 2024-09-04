# xizhi-front-sse

[English](README_EN.md)

悉之的react前端sse组件, 基于微软的fetch-event-source进一步封装, 将dom和sse事件的交互封装为组件, 减少直接的dom操作和事件的处理, 简化sse组件的使用

本项目中功能代码为apps/Stream下的内容, 其他内容主要为其提供简单模板, 方便调试

如果需要在项目中使用该组件, 请在项目中安装 xizhi-front-sse
```bash
pnpm add xizhi-front-sse
```

## 使用方法
以apps/template为例, 这是一个最简单的react项目

引入xizhi-front-sse中的FetchStream组件, 并绑定ref, 待会我们会调用
```tsx
  const ref = useRef<FetchComponentRef>(null)

   <FetchStream
    ref={ref}
    CustomStreamItem={CustomStreamItem}>
  </FetchStream>
```

CustomStreamItem是流的每一项, 让我们可以自定义显示的内容
```tsx
  const CustomStreamItem = (props) => {
    const { event } = props
    return <span>{event?.data?.content}</span>
  }
 
```

dom的配置就完成了, 接下来要做的就是调用ref.current.start()方法, 传入url, 以及配置参数和回调, 这个和fetch的参数是几乎一样的, 详情可以看fetch的文档, 稍有改动的是onmessage第二个值会返回当前所有eventList
```tsx
    const url = 'http://localhost:3000'+'/stream'
    const defaultHeaders = {
      Authorization: 'token xxx',
    }
    ref.current.start(url, {
      headers: {
        ...defaultHeaders,
        // 传入希望携带的header
      },
      params: {
        // 传入希望携带的参数
      },
      onmessage(event, eventList) {
        // 需要的操作
      },
    })
```

为了简化操作, 可以通过ref.current.abort()来终止请求, ref.current.reset()重置请求到的内容, 但signal目前会被覆盖, 暂时不支持传入自定义的signal

## 示例
安装项目后启动dev服务即可, 可以查看template项目的效果
```bash
pnpm dev
```

另外apps/Server可以修改sse的返回内容

## 展望
希望大家能提出更好的建议, 帮助完善这个项目, 以方便于其他开发者, respect!~
