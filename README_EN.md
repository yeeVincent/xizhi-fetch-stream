# xizhi-front-sse

[中文文档](README_CN.md)

xizhi-front-sse is a React front-end SSE component, based on Microsoft's fetch-event-source, further encapsulated to handle DOM and SSE events' interactions within the component. It reduces direct DOM operations and event handling, simplifying the usage of the SSE component.

The functional code for this project is located under `apps/Stream`, while other content primarily provides a simple template for easy debugging.

To use this component in your project, install `xizhi-front-sse`:
```bash
pnpm add xizhi-front-sse
```

## Usage

Take `apps/template` as an example, which is the simplest React project.

Import the `FetchStream` component from `xizhi-front-sse` and bind a ref, which we will call later:
```tsx
  const ref = useRef<FetchComponentRef>(null);

  <FetchStream
    ref={ref}
    CustomStreamItem={CustomStreamItem}>
  </FetchStream>
```

`CustomStreamItem` is each item in the stream, allowing us to customize the displayed content:
```tsx
  const CustomStreamItem = (props) => {
    const { event } = props;
    return <span>{event?.data?.content}</span>;
  }
```

The DOM configuration is now complete. Next, we need to call the `ref.current.start()` method, passing in the URL, configuration parameters, and callbacks. These parameters are almost the same as those for fetch. For details, refer to the fetch documentation. A slight modification is that the `onmessage` second argument will return the current `eventList`:
```tsx
    const url = 'http://localhost:3000' + '/stream';
    const defaultHeaders = {
      Authorization: 'token xxx',
    };
    ref.current.start(url, {
      headers: {
        ...defaultHeaders,
        // Headers you want to include
      },
      params: {
        // Parameters you want to include
      },
      onmessage(event, eventList) {
        // Operations you need
      },
    });
```

To simplify operations, you can terminate the request with `ref.current.abort()` and reset the fetched content with `ref.current.reset()`. However, the signal is currently overridden and custom signals are not supported for now.

## Example

After installing the project, start the dev service to see the effect of the template project:
```bash
pnpm dev
```

Additionally, you can modify the SSE return content in `apps/Server`.

## Outlook

We hope everyone can provide better suggestions to help improve this project, making it easier for other developers. Respect!~
