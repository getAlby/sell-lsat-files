import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import axios from "axios";

const load = async (sort) => {
  try {
    const apiURL = `https://insatgram.getalby.com/api/accounts?sort_by="${sort}"`;
    const response = await axios.get(apiURL);
    return response.data;
  } catch (e) {
    alert("Something went wrong. Please try again later");
    console.error(e);
  }
};

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [sort, setSort] = useState("earned");

  useEffect(() => {
    (async () => {
      const images = await load(sort);
      setAccounts(images);
    })();
  }, [sort]);

  return (
    <main>
      <div className="container">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>
                <button className="button" onClick={() => setSort("count")}>
                  Pictures
                </button>
              </th>
              <th>
                <button className="button" onClick={() => setSort("earned")}>
                  Sats
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {accounts.map((account) => (
              <tr key={account.LNAddress}>
                <td>
                  <Link to={`/accounts/${account.LNAddress}`}>
                    {account.LNAddress}
                  </Link>
                </td>
                <td>{account.Count}</td>
                <td>{account.Earned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Accounts;
