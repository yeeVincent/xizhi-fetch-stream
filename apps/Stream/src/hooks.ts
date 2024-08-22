import { useState } from 'react'

import { type EventMessageType } from './fetch'
import { getStreamMap } from './utils'

/**
 * 流的列表管理
 */
export const useStreamList = () => {
  const initMap = getStreamMap()
  const [streamMap, setStreamMap] = useState(initMap)

  // 设置流的内容
  const setItem = (event: EventMessageType<any>) => {
    setStreamMap((prevStreamMap) => {
      const newStreamMap = getStreamMap(prevStreamMap)
      newStreamMap.set(event.id || event.data, event)
      return newStreamMap
    })
  }

  const getItem = (id: string) => {
    return streamMap.get(id)
  }

  const removeItem = (id: string) => {
    setStreamMap((prevStreamMap) => {
      const newStreamMap = getStreamMap(prevStreamMap)
      newStreamMap.delete(id)
      return newStreamMap
    })
  }

  const reset = () => {
    setStreamMap(getStreamMap())
  }

  const list = Array.from(streamMap.values())

  return {
    list,
    reset,
    setItem,
    getItem,
    removeItem,
  }
}
