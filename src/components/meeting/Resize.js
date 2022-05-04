import React, { useEffect, useState } from 'react';
import { ResizeProvider, ResizeConsumer } from "react-resize-context";
// import "./css/style.css";
import $ from 'jquery'


function Resize() {

  const [size, setSize] = useState("");

  const handleSizeChanged = size => {
    console.log("size", size);
    // this.setState({ size });
    setSize(size);
  };

  const getDatasetBySize = size => ({
    widthRange: size.width > 200 ? "large" : "small",
    heightRange: size.height > 200 ? "large" : "small"
  });


  useEffect(() => {

    //   try {
    //     // `element` is the element you want to wrap
    //  const element = $(`#teacher-video`);
    //  console.log(element);
    //  var parent = element.parentNode;
    //  console.log(parent)
    //  var wrapper = document.createElement('div');

    //  // set the wrapper as child (instead of the element)
    //  parent.replaceChild(wrapper, element);
    //  // set element as child of wrapper
    //  wrapper.appendChild(element);
    //   } catch (error) {
    //     console.log("Error: ", error);
    //   }

    $("#teacher-video").wrap('<div class="outside-div"></div>');

  }, [])

  return (

    <>
      <ResizeProvider>
        <ResizeConsumer
          className="container"
          onSizeChanged={handleSizeChanged}
          updateDatasetBySize={getDatasetBySize}
        >
          <h1 style={{position:"absolute"}}>hii</h1>
        </ResizeConsumer>
      </ResizeProvider>

      <div id="teacher-video" className>
        fghfhfgh
      </div>

    </>

  )
}

export default Resize;

