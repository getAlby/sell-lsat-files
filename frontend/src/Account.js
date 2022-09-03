import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ImageList from "./ImageList";

const load = async (account) => {
  try {
    const apiURL = `https://insatgram.getalby.com/api/accounts/${account}`;
    const response = await axios.get(apiURL);
    return response.data;
  } catch (e) {
    alert("Something went wrong. Please try again later");
    console.error(e);
  }
};

function Account() {
  const { account } = useParams();
  const [images, setImages] = useState([]);

  useEffect(() => {
    (async () => {
      const images = await load(account);
      setImages(images);
    })();
  }, [account]);

  return (
    <main>
      <div className="container">
        <div className="col-9">
          <h1>{account}</h1>
          <br />

          <ImageList images={images} />
        </div>
      </div>
    </main>
  );
}

export default Account;
