import { useEffect, useState } from "react";
import axios from "axios";

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
      <div className="container">
        <div className="col-9">
          <ImageList images={images} />
        </div>
        <div className="col-3">
          <div className="card">

            <Uploader onUpload={load}/>

          </div>
          <div className="footer">
            <a className="footer-section" href="#">About</a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
