function Pagination(props) {
  const { page, previousFn, nextFn } = props;

  return (
    <div>
      <button disabled={page <= 1} onClick={previousFn}>
        Previous
      </button>
      <span>Page: {page}</span>
      <button onClick={nextFn}>Next</button>
    </div>
  );
}

export default Pagination;
