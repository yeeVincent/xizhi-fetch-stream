import { FC, useImperativeHandle, useRef, forwardRef } from 'react';
import Panel from './panel';
import { EventSourceMessage, FetchEventSourceInit } from '@microsoft/fetch-event-source';
import StreamFetcher from "./fetch";
import { useStreamList } from './hooks';

export interface FetchComponentProps {
  /** 自定义 StreamItem 组件 */
  CustomStreamItem?: FC<{ event: EventSourceMessage }>;
}

export interface FetchEventSourceUpdateInit extends FetchEventSourceInit {
  headers?: Record<string, string>;
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';
  /** 回传EventSourceMessage, 以修改数据 */
  onmessage: (event: EventSourceMessage) => EventSourceMessage;
}

export interface FetchComponentRef {
    start: (url: string, params: FetchEventSourceUpdateInit) => void;
    stop: () => void;
    setStreamItem: (item: EventSourceMessage) => void;
    getStreamItem: (id: string) => EventSourceMessage | undefined;
    removeStreamItem: (id: string) => void;
}

const FetchStream = forwardRef<FetchComponentRef, FetchComponentProps>((props, ref) => {
  const { CustomStreamItem } = props;
  const { fetch } = new StreamFetcher();
  const { list: streamList, reset: resetStreamList, setItem: setStreamItem, getItem: getStreamItem, removeItem: removeStreamItem } = useStreamList();
  const abortControllerRef = useRef<AbortController>(new AbortController());

  const start = async (url: string, params: FetchEventSourceUpdateInit) => {
    console.log(url, 'url');
    if (params.signal) {
      abortControllerRef.current = new AbortController();
    }
    fetch(url, {
      ...params,
      signal: abortControllerRef.current.signal,
      onmessage(event) {
        console.log(event, 'ev');
        const newEvent = params.onmessage(event);
        // 让外部传入的props.customMessage返回一个新的event, 这样可以让外界可以控制数据
        setStreamItem(newEvent || event);
      },
    });
  };

  const stop = () => {
    abortControllerRef.current.abort();
  };

  const reset = () => {
    resetStreamList();
  };

  useImperativeHandle(ref, () => ({
    start,
    stop,
    reset,
    setStreamItem,
    getStreamItem,
    removeStreamItem,
  }));

  return (
    <Panel streamList={streamList} CustomStreamItem={CustomStreamItem}></Panel>
  );
});

export default FetchStream;
