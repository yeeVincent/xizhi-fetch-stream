import { type FC, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import StreamFetcher, { type FetchEventSourceInitExtends } from './fetch'
import { useStreamList } from './hooks'
import StreamPanel from './panel'

export interface FetchComponentProps {
  /** 自定义 StreamItem 组件 */
  CustomStreamItem?: FC<{ event: any }>
}

export interface FetchComponentRef {
  streamList: any[]
  start: <T>(url: string, params: FetchEventSourceInitExtends<T>) => void
  stop: (cb?: any) => void
  reset: () => void
  setStreamItem: <T>(item: T) => void
  getStreamItem: <T>(id: string) => T | undefined
  removeStreamItem: (id: string) => void
}

const FetchStream = forwardRef<FetchComponentRef, FetchComponentProps>((props, ref) => {
  const { CustomStreamItem } = props
  const { fetch } = new StreamFetcher()
  const {
    list: streamList,
    reset: resetStreamList,
    setItem: setStreamItem,
    getItem: getStreamItem,
    removeItem: removeStreamItem,
  } = useStreamList()
  const abortControllerRef = useRef<AbortController>(new AbortController())

  async function start<T>(url: string, params: FetchEventSourceInitExtends<T>) {
    const defaultConfig: Partial<FetchEventSourceInitExtends<T>> = {
      method: 'GET',
      params: {},
      openWhenHidden: false,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    abortControllerRef.current = new AbortController()
    // 外部传入的signal会在此处被替换
    params.signal = abortControllerRef.current.signal
    fetch<T>(url, {
      ...defaultConfig,
      ...params,
      abortController: abortControllerRef.current,
      onmessage(event: T) {
        console.log(event, 'messageEv')
        const newEvent = params?.onmessage?.(event)
        // 让外部传入的props.customMessage返回一个新的event, 这样可以让外界可以控制数据
        setStreamItem(newEvent || event)
      },
    })
  }

  const stop = (cb?: any) => {
    abortControllerRef.current.abort()
    cb?.()
  }

  const reset = () => {
    resetStreamList()
  }

  useImperativeHandle(ref, () => ({
    streamList,
    start,
    stop,
    reset,
    setStreamItem,
    getStreamItem,
    removeStreamItem,
  }))

  useEffect(() => {
    return () => {
      reset()
      stop()
    }
  }, [])

  return <StreamPanel streamList={streamList} CustomStreamItem={CustomStreamItem}></StreamPanel>
})

export default FetchStream
