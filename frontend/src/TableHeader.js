function TableHeader(props) {
  const { page, previousFn, nextFn, sortByFn, sortBy } = props;

  return (
    <div className="table-header-wrapper">
      <div className="pagination-wrapper">
        <button className="button" disabled={page <= 1} onClick={previousFn}>
          Previous
        </button>
        <button className="button" onClick={nextFn}>
          Next
        </button>
        <span>Page: {page}</span>
      </div>

      <div className="sortby-wrapper">
        {[
          { value: "created_at", title: "Created at" },
          { value: "price", title: "Price" },
          { value: "nr_of_downloads", title: "Downloads" },
          { value: "sats_earned", title: "Sats" },
        ].map((item) => (
          <button
            disabled={item.value === sortBy}
            className="button"
            onClick={() => sortByFn(item.value)}
            key={item.value}
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TableHeader;
