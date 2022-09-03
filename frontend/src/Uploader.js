import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";

function Uploader(props) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".png", ".gif", ".jpeg", ".jpg"] },
    maxFiles: 1,
    multiple: false,
    onDrop: (acceptedFiles) => {
      const acceptedFile = acceptedFiles[0];
      setFile(
        Object.assign(acceptedFile, {
          preview: URL.createObjectURL(acceptedFile),
        })
      );
    },
  });

  const onUpload = props.onUpload;
  const [file, setFile] = useState(null);
  const [lnAddress, setLnAddress] = useState("");
  const [price, setPrice] = useState("210");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const address = localStorage.getItem("lnAddress");
    if (address) {
      setLnAddress(address);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lnAddress", lnAddress);
  }, [lnAddress]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!price || !lnAddress || !file) {
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ln_address", lnAddress);
    formData.append("price", price);
    try {
      await axios.post("/api/upload", formData);
      window.scrollTo(0, 0);
      setFile(null);
      toast("Image successfully published!", {
        icon: "👏",
      });
      if (onUpload) {
        onUpload();
      }
    } catch (e) {
      console.log(e);
      const errorMessage = e.response?.data;
      alert(
        `Something went wrong. ${errorMessage}.\nIf you need help, please contact support@getalby.com`
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="form-group image-select">
        {!file && (
          <div {...getRootProps({ className: "dropzone" })}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <input {...getInputProps()} />
            <p>
              Drag 'n' drop your image here, <br /> or click to select your
              image
            </p>
          </div>
        )}
        <div className="preview">
          {file && (
            <img
              alt="preview"
              src={file.preview}
              // Revoke data uri after image is loaded
              onLoad={() => {
                URL.revokeObjectURL(file.preview);
              }}
            />
          )}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="lnaddress">Your Lightning Address</label>
        <p>
          <input
            name="lnaddress"
            type="text"
            value={lnAddress}
            onChange={(e) => {
              setLnAddress(e.target.value.trim());
            }}
          />
          <small className="note">
            This is where the sats will be sent when your image is viewed
          </small>
        </p>
      </div>
      <div className="form-group">
        <label htmlFor="price">Price in sats</label>
        <p>
          <input
            min="1"
            name="price"
            type="number"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value.trim());
            }}
          />
        </p>
      </div>
      <div className="form-group">
        <button
          type="submit"
          disabled={!file || !lnAddress || !price || uploading}
          className="button"
        >
          {uploading ? "Uploading..." : "Publish now"}
        </button>
      </div>
    </form>
  );
}

export default Uploader;
