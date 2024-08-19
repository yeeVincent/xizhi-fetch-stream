import StreamFetcher from "./fetch";

const Panel = () => {
  const fetcher = new StreamFetcher()
  // fetcher.start()
  console.log(fetcher, 'fetcher');
  
  return <div>{ 123}</div>;
};

export default Panel;
