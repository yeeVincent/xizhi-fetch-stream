import { type EventSourceMessage } from '@microsoft/fetch-event-source'

/**
 * 获取一个新的map地址
 */
const getStreamMap = (contentMap: Map<string, EventSourceMessage> = new Map()) => {
  const newStreamMap = new Map(contentMap)
  return newStreamMap
}

export { getStreamMap }
