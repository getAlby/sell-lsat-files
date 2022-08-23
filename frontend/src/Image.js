import { useEffect, useRef, useState } from "react";

import PulseLoader from "react-spinners/PulseLoader";

function Image(props) {

  const img = useRef();
  const url = props.image.URL;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadImage() {
      const fetchedJSON = localStorage.getItem(url);
      if (fetchedJSON !== null) {
        const fetched = JSON.parse(fetchedJSON);
        const objectUrl = await fetchImg(url, fetched.mac, fetched.preimage);
        img.current.src = objectUrl;
      } else {
        img.current.src = `${url}?v=${Date.now()}`;
      }
    }
    loadImage();
  }, [img, url]);

  const fetchLSAT = async (event) => {
    event.preventDefault();
    const fetchedJSON = localStorage.getItem(url);
    if (fetchedJSON !== null) {
      const fetched = JSON.parse(fetchedJSON);
      const objectUrl = await fetchImg(url, fetched.mac, fetched.preimage);
      img.current.src = objectUrl;
      return;
    }

    setLoading(true);
    const resp = await fetch(`${url}?v=${Date.now()}`, {
      headers: {
        "Accept": "application/vnd.lsat.v1.full"
      }
    });
    const header = resp.headers.get('www-authenticate');
    if (!header) {
      alert("Failed to load Lighting invoice");
      console.log(header);
    }
    // show some information about the lsat
    const parts = header.split(",");
    const mac = parts[0].replace("LSAT macaroon=", "").trimStart();
    const inv = parts[1].replace("invoice=", "").trimStart();
    if (!window.webln) {
      const installAlby = window.confirm("A WebLN compatible browser is required to pay sats from your browser and load the images. Do you want to visit getalby.com to upgrade your Browser with the Bitcoin Lightning network?");
      if(installAlby) {
        window.open("https://getalby.com");
      }
      return;
    }
    try {
      await window.webln.enable();
      const invResp = await window.webln.sendPayment(inv)
      localStorage.setItem(url, JSON.stringify({
        'mac': mac,
        'preimage': invResp.preimage
      }));
      const objectUrl = await fetchImg(url, mac, invResp.preimage);
      img.current.src = objectUrl;
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const revokeObjectURL = (e) => {
    const i = e.target;
    URL.revokeObjectURL(i.src);
  }

  const fetchImg = async (url, mac, preimage) => {
    const resp = await fetch(`${url}?v=${Date.now()}`, {
      headers: {
        "Authorization": `LSAT ${mac}:${preimage}`
      }
    });
    const blob = await resp.blob();
    const objectUrl = URL.createObjectURL(blob);
    return objectUrl;
  }

  return (
    <div>
      <img ref={img} onLoad={revokeObjectURL} alt={props.image.Name} onClick={fetchLSAT} className="cover" />
      <PulseLoader color="#efefef" loading={loading} cssOverride={{textAlign: "center", paddingTop: "30%"}} size={50} />
    </div>
  );
}

export default Image;
