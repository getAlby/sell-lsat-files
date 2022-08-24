import Image from "./Image";

function ImageList(props) {
  const images = props.images;

  return (
    <div>
      {images.map(image => { return (
        <div className="card" key={image.Id}>
          <div className="top">
            <div className="userDetails">
              <div className="profilepic">
                <div className="profile_img">
                  <div className="image">
                    <img src={`https://robohash.org/${image.LNAddress}.png`} alt={image.LNAddress} />
                  </div>
                </div>
              </div>
              <h3>{image.Name} - {image.Price} sats
                <br />
                <span>{image.LNAddress}</span>
              </h3>
            </div>
            <div>
              <span className="dot">
                <i className="fas fa-ellipsis-h"></i>
              </span>
            </div>
          </div>
          <div className="imgBx">
            <Image image={image} />
          </div>
          <div className="bottom">
            <p className="likes">{image.NrOfDownloads} downloads</p>
            <p className="message">
              <b>{image.TimeAgo}</b>
            </p>
          </div>
        </div>)}
      )}
    </div>
  );
}

export default ImageList;
