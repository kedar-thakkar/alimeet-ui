import Spinner from "react-loader-spinner";

const Loader = (props) => {
  
  return (
    <Spinner type="Puff" visible={props.visible} color="#00BFFF" height={41} width={41} />
  );
};

export default Loader;
