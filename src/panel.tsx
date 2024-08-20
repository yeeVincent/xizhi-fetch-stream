import { FC, Fragment, memo, useEffect, useState } from "react";
import StreamFetcher from "./fetch";
import { getStreamMap } from "./utils";
import { EventSourceMessage } from "@microsoft/fetch-event-source";
import { FetchStreamProps } from ".";

const fetcher = new StreamFetcher()

const Panel : FC<FetchStreamProps>= (props) => {
  const { CustomStreamItem } = props
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
  const StreamItem = ({event}: {event: EventSourceMessage}) => <span>{event.data}</span>
  const streamList = Array.from(streamMap.values())

  return (
    <>
      {streamList.map(event => (
        <Fragment key={event.id}>
          {CustomStreamItem && <CustomStreamItem event={event}></CustomStreamItem>}
          {!CustomStreamItem &&<StreamItem event={event}></StreamItem>}
        </Fragment>
      ))}
    </>
  );
};

export default memo(Panel);
