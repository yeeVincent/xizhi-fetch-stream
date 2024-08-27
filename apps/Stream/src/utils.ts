/**
 * 获取一个新的map地址
 */
const getStreamMap = <T>(contentMap: Map<string, T> = new Map()) => {
  const newStreamMap = new Map(contentMap)
  return newStreamMap
}

export { getStreamMap }
