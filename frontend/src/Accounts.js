import { useEffect, useState } from "react";
import axios from "axios";

// import { Toaster } from "react-hot-toast";
// import ImageList from "./ImageList";
// import Uploader from "./Uploader";
// import Pagination from "./Pagination";

const load = async (page) => {
  try {
    const apiURL = "https://insatgram.getalby.com/api/accounts";
    const response = await axios.get(apiURL);
    return response.data;
  } catch (e) {
    alert("Something went wrong. Please try again later");
    console.error(e);
  }
};

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  // const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      const images = await load();
      setAccounts(images);
    })();
  }, []);

  // const previousFnHandler = () => {
  //   setPage((page) => page - 1);
  // };

  // const nextFnHandler = () => {
  //   setPage((page) => page + 1);
  // };

  return (
    <main>
      <div>
        <h1>ACCOUNTS</h1>
        {accounts.map((account) => (
          <p key={account.LNAddress}>{account.LNAddress}</p>
        ))}
      </div>
      <div></div>
    </main>
  );
}

export default Accounts;
