import { type FC, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import StreamFetcher, { type FetchEventSourceInitExtends } from './fetch'
import StreamPanel from './panel'

export interface FetchComponentProps {
  /** 自定义 StreamItem 组件 */
  CustomStreamItem?: FC<{ event: any }>
  setStreamList: any
  streamList: any
}

export interface FetchComponentRef {
  start: <T>(url: string, params: FetchEventSourceInitExtends<T>) => void
  stop: (cb?: any) => void
  reset: () => void
}

const FetchStream = forwardRef<FetchComponentRef, FetchComponentProps>((props, ref) => {
  const { CustomStreamItem, setStreamList, streamList } = props
  const { fetch } = new StreamFetcher()
  const contentRef = useRef<any[]>([])
  // 设置流的内容
  const setList = (event:any) => {
    contentRef.current = [...contentRef.current, event]
    setStreamList(Array.from(contentRef.current.values()))
  }
  const reset = () => {
    contentRef.current = []
    setStreamList([])
  }
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
    abortControllerRef.current = params.abortController || new AbortController()
    // 外部传入的signal会在此处被替换
    params.signal = abortControllerRef.current.signal
    fetch<T>(url, {
      ...defaultConfig,
      ...params,
      abortController: abortControllerRef.current,
      onmessage(ev) {
        if (!ev) return

        setList(ev)
        params.onmessage?.(ev, contentRef.current)
      },
    })
  }

  const stop = (cb?: any) => {
    abortControllerRef.current.abort()
    cb?.()
  }

  useImperativeHandle(ref, () => ({
    start,
    stop,
    reset,
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
