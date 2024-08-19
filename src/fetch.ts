import { fetchEventSource, FetchEventSourceInit } from '@microsoft/fetch-event-source';


// interface StreamFetcherOptions extends FetchEventSourceInit {
//   signal: AbortSignal,
//   abortAsError: true,
// }

class StreamFetcher {
  constructor() {
  }

  public start(url: string, params: FetchEventSourceInit, ) {
    // const { onopen, onmessage, onclose, onerror } = params
    fetchEventSource(url, params);
  }
}

export default StreamFetcher;
