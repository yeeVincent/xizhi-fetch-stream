import {  FC, useEffect, useState } from 'react';
import Panel from './panel'
import { EventSourceMessage } from '@microsoft/fetch-event-source';
import StreamFetcher from "./fetch";
import { getStreamMap } from "./utils";
export interface FetchStreamProps {
  /** 自定义 StreamItem 组件 */
  CustomStreamItem ?: FC<{event: EventSourceMessage}>
}

const fetcher = new StreamFetcher()

const FetchStream: FC<FetchStreamProps> = (props) => {
  const { CustomStreamItem, } = props
  const { start } = fetcher
  const initMap = getStreamMap()
  const [streamMap, setStreamMap] = useState(initMap)

  // 设置流的内容
  const setStreamMapFn = (event: EventSourceMessage) => {
    setStreamMap(prevStreamMap => {
      const newStreamMap = getStreamMap(prevStreamMap)
      newStreamMap.set(event.id, event)
      return newStreamMap
    })
  }
  const create = async () => {
    start('http://localhost:3000/stream', {
      onopen: async (event) => {
        console.log(event, 'event');
      },
      onmessage(event) {
        console.log(event, 'ev');
        // 让外部传入的props.customMessage返回一个新的event, 这样可以让外界可以控制数据
        // setStreamMapFn(props.customMessage)
        setStreamMapFn(event)
      },
    })
  }

  useEffect(() => {
    create()
  }, [])
  const streamList = Array.from(streamMap.values())
  return <Panel streamList={streamList} CustomStreamItem={CustomStreamItem}  ></Panel>
};

export default (FetchStream);
