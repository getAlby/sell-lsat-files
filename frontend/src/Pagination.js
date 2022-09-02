// import { useEffect, useRef, useState } from "react";

function Pagination(props) {
  const { previousFn, nextFn } = props;

  return (
    <div>
      <button onClick={previousFn}>Previous</button>
      <button onClick={nextFn}>Next</button>
    </div>
  );
}

export default Pagination;
