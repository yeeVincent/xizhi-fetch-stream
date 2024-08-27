import { useState } from 'react'

import { getStreamMap } from './utils'

/**
 * 流的列表管理
 */
export const useStreamList = () => {
  const initMap = getStreamMap()
  const [streamMap, setStreamMap] = useState(initMap)

  // 设置流的内容
  const setItem = <T>(event: T) => {
    setStreamMap((prevStreamMap) => {
      const newStreamMap = getStreamMap(prevStreamMap)
      const length = newStreamMap.size
      newStreamMap.set(String(length + 1), event)
      return newStreamMap
    })
  }

  const getItem: <T>(id: string) => T | undefined = <T>(id: string) => {
    if (!streamMap.has(id)) return
    return streamMap.get(id) as T
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
