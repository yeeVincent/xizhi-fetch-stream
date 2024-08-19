import { Fragment, memo, useEffect, useState } from "react";
import StreamFetcher from "./fetch";
import { getStreamMap } from "./utils";
import { EventSourceMessage } from "@microsoft/fetch-event-source";

const fetcher = new StreamFetcher()

const Panel = () => {
  
  const { start } = fetcher
  const initMap = getStreamMap()
  const [streamMap, setStreamMap] = useState(initMap)

  // 设置流的内容
  const setStreamMapFn = (event: EventSourceMessage) => {
    setStreamMap(prevStreamMap => {
      const newStreamMap = getStreamMap(prevStreamMap)
      newStreamMap.set(event.id, event.data)
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
        setStreamMapFn(event)
      },
    })
  }

  useEffect(() => {
    create()
  }, [])
  const StreamItem = ({stream}: {stream: string}) => <span>{stream}</span>
  const streamList = Array.from(streamMap.values())

  return (
    <div>
      {streamList.map(stream => (
        <Fragment key={stream}>
          {<StreamItem stream={stream}></StreamItem>}
        </Fragment>
      ))}
    </div>
  );
};

export default memo(Panel);
