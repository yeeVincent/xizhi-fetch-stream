import { fetchEventSource, FetchEventSourceInit } from '@microsoft/fetch-event-source';



class StreamFetcher {
  constructor() {
  }

  public fetch(url: string, params: FetchEventSourceInit, ) {
    // const { onopen, onmessage, onclose, onerror } = params
    fetchEventSource(url, params);
  }
}

export default StreamFetcher;
