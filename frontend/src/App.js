import { useEffect, useState } from "react";
import axios from "axios";

import { Toaster } from 'react-hot-toast';
import ImageList from "./ImageList";
import Uploader from "./Uploader";

function App() {

  const [images, setImages] = useState([]);

  const load = async () => {
     try {
        const apiURL = `/index`;
        const response = await axios.get(apiURL);
        setImages(response.data);
     } catch(e) {
        alert("Something went wrong. Please try again later");
        console.error(e);
     }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main>
      <div><Toaster/></div>
      <div className="container">
        <div className="col-9">
          <ImageList images={images} />
        </div>
        <div className="col-3">
          <div className="card">

            <Uploader onUpload={load}/>

          </div>
          <div className="footer">
            <small>
            Buy and sell images for sats, sent directly to your own wallet.
            Set a budget feature in Alby for an optimal browsing experience.
            Made using <a href='https://github.com/lightninglabs/LSAT/'>LSAT</a> and the <a href='https://dhananjaypurohit.medium.com/building-a-middleware-library-implementing-the-lsats-spec-summer-of-bitcoin22-at-alby-a64455a62568'>Gin LSAT middleware</a>.
            </small>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
