
/**
 * 获取一个新的map地址
 */
const getStreamMap = (contentMap: Map<string, string>= new Map() ) => {
  const newStreamMap = new Map(contentMap)
  return newStreamMap
}

export { getStreamMap }
