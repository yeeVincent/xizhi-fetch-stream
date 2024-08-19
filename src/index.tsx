type a  =  { b: string}
const MyComponent = (props:a  ) => {
  console.log(props);
  
  return <div>{props.b}</div>;
};

export default MyComponent;
