import { type FC, forwardRef, useImperativeHandle, useState } from 'react'

import StreamFetcher, { type FetchEventSourceInitExtends } from './fetch'
import StreamPanel from './panel'

export interface FetchComponentProps {
  /** 自定义 StreamItem 组件 */
  CustomStreamItem?: FC<{ event: any }>
}

export interface FetchComponentRef {
  start: <T>(url: string, params: FetchEventSourceInitExtends<T>) => void
  stop: (cb?: any) => void
  reset: () => void
}

const FetchStream = forwardRef<FetchComponentRef, FetchComponentProps>((props, ref) => {
  const { CustomStreamItem, } = props
  const { fetch, abort, getEventList, reset: fetcherReset } = new StreamFetcher()
  const [streamList, setStreamList] = useState<any[]>([])
  // 设置流的内容
  const setList = (eventList: any) => {
    setStreamList([...eventList])
  }
  const reset = () => {
    setStreamList([])
    fetcherReset()
  }
  async function start<T>(url: string, params: FetchEventSourceInitExtends<T>) {
    console.log('执行start')

    const defaultConfig: Partial<FetchEventSourceInitExtends<T>> = {
      method: 'GET',
      params: {},
      openWhenHidden: false,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    fetch<T>(url, {
      ...defaultConfig,
      ...params,
      onmessage(ev, eventList) {
        if (!ev) return

        params.onmessage?.(ev, getEventList())
        setList(eventList)
      },
    })
  }

  const stop = (cb?: any) => {
    abort?.()
    cb?.()
  }

  useImperativeHandle(ref, () => ({
    start,
    stop,
    reset,
  }))

  return <StreamPanel streamList={streamList} CustomStreamItem={CustomStreamItem}></StreamPanel>
})

export default FetchStream
