import { memo, useEffect } from "react";
import StreamFetcher from "./fetch";

const fetcher = new StreamFetcher()
const Panel = () => {
  const {start} = fetcher
   
   const create = async () => {
    start('http://localhost:3000/stream', {
      onopen: async (event) => {
        console.log(event, 'event');
      },
      onmessage(ev) {
        console.log(ev, 'ev');
      },
    })
   }
   useEffect(() => {   
    create()
   }, [])
  return <div>{ 123}</div>;
};

export default memo(Panel);
