function Pagination(props) {
  const { page, previousFn, nextFn } = props;

  return (
    <div className="pagination-wrapper">
      <button className="button" disabled={page <= 1} onClick={previousFn}>
        Previous
      </button>
      <button className="button" onClick={nextFn}>
        Next
      </button>
      <span>Page: {page}</span>
    </div>
  );
}

export default Pagination;
