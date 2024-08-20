import { useState } from "react"
import { getStreamMap } from "./utils"
import { EventSourceMessage } from "@microsoft/fetch-event-source"

/**
 * 流的列表管理
 */
export const useStreamList = () => {
  const initMap = getStreamMap()
  const [streamMap, setStreamMap] = useState(initMap)
    // 设置流的内容
    const setItem = (event: EventSourceMessage) => {
      setStreamMap(prevStreamMap => {
        const newStreamMap = getStreamMap(prevStreamMap)
        newStreamMap.set(event.id, event)
        return newStreamMap
      })
    }

    const getItem = (id: string) => {
      return streamMap.get(id)
    }

    const removeItem = (id: string) => {
      setStreamMap(prevStreamMap => {
        const newStreamMap = getStreamMap(prevStreamMap)
        newStreamMap.delete(id)
        return newStreamMap
      })
    }

    const list =  Array.from(streamMap.values())

    return {
      list,
      setItem,
      getItem,
      removeItem
    }
}
