import {  FC, useEffect, useImperativeHandle, useRef } from 'react';
import Panel from './panel'
import { EventSourceMessage, FetchEventSourceInit } from '@microsoft/fetch-event-source';
import StreamFetcher from "./fetch";
import { useStreamList } from './hooks';
export interface FetchStreamProps {
  /** 自定义 StreamItem 组件 */
  CustomStreamItem ?: FC<{event: EventSourceMessage}>
}

interface FetchEventSourceUpdateInit extends FetchEventSourceInit {
  /** 回传EventSourceMessage, 以修改数据 */
  onmessage: (event: EventSourceMessage) => EventSourceMessage
}

const FetchStream: FC<FetchStreamProps> = (props) => {
  const { CustomStreamItem, } = props
  const { fetch } = new StreamFetcher()
  const {list : streamList, setItem: setStreamItem, getItem: getStreamItem, removeItem: removeStreamItem} = useStreamList()
  const ref = useRef<{
    start: (url: string, params: FetchEventSourceUpdateInit) => void;
    stop: () => void;
    setStreamItem: (item: EventSourceMessage) => void;
    getStreamItem: (id: string) => EventSourceMessage | undefined;
    removeStreamItem: (id: string) => void;
  }>(null);
  const abortControllerRef = useRef<AbortController>(new AbortController());

  const start = async (url: string, params: FetchEventSourceUpdateInit) => {
    console.log(url, 'url');
    if(params.signal){
      abortControllerRef.current = new AbortController();
    }
    fetch(url, {
      ...params,
      signal: abortControllerRef.current.signal,
      onmessage(event) {
        console.log(event, 'ev');
        const newEvent = params.onmessage(event)
        // 让外部传入的props.customMessage返回一个新的event, 这样可以让外界可以控制数据
        // setStreamMapFn(props.customMessage)
        setStreamItem(newEvent || event)
      },
    })
  }

  const stop = () => {
    abortControllerRef.current.abort();
  }
  useImperativeHandle(ref, () => ({
    start,
    stop,
    setStreamItem,
    getStreamItem,
    removeStreamItem,
  }))




  useEffect(() => {
    start('http://localhost:3000/stream', {
      onmessage: (event) => {
        console.log(event);
        return event
        
      },
    })
  }, [])
  return <Panel streamList={streamList} CustomStreamItem={CustomStreamItem}  ></Panel>
};

export default (FetchStream);
