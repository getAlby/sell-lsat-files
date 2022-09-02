import { useEffect, useState } from "react";
import axios from "axios";

import { Toaster } from "react-hot-toast";
import ImageList from "./ImageList";
import Uploader from "./Uploader";
import Pagination from "./Pagination";

const load = async (page) => {
  try {
    const apiURL = `/index?page=${page}`;
    const response = await axios.get(apiURL);
    return response.data;
  } catch (e) {
    alert("Something went wrong. Please try again later");
    console.error(e);
  }
};

function Home() {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      const images = await load(page);
      setImages(images);
    })();
  }, [page]);

  const previousFnHandler = () => {
    setPage((page) => page - 1);
  };

  const nextFnHandler = () => {
    setPage((page) => page + 1);
  };

  return (
    <main>
      <div>
        <Toaster />
      </div>

      <div className="container">
        <div className="col-9">
          <Pagination
            previousFn={previousFnHandler}
            nextFn={nextFnHandler}
            page={page}
          />

          <ImageList images={images} />

          <Pagination
            previousFn={previousFnHandler}
            nextFn={nextFnHandler}
            page={page}
          />
        </div>

        <div className="col-3">
          <div className="card">
            <div className="about">
              <h2 className="logo">📸 InSATgram</h2>
              <h3>Upload your image, earn sats!</h3>
              <small>
                Buy and sell images for sats, sent directly to your own wallet.
                Set a budget feature in <a href="https://getalby.com">Alby</a>{" "}
                for an optimal browsing experience. Made using{" "}
                <a href="https://www.webln.guide/">WebLN</a> and{" "}
                <a href="https://lsat.tech/">LSAT</a> (using the{" "}
                <a href="https://dhananjaypurohit.medium.com/building-a-middleware-library-implementing-the-lsats-spec-summer-of-bitcoin22-at-alby-a64455a62568">
                  Gin LSAT middleware)
                </a>
                .
              </small>
            </div>

            <Uploader onUpload={load} />
          </div>

          <div className="footer">
            <div className="powered-by">
              <h3>This showcase is powered by</h3>
              <p>Upgrade your Browser for the Bitcoin Lightning age</p>
              <a href="https://getalby.com">
                <svg
                  viewBox="0 0 1094 525"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <ellipse
                    opacity="0.1"
                    cx="162.28"
                    cy="480.52"
                    rx="79.0085"
                    ry="14.5862"
                    fill="black"
                  />
                  <path
                    d="M238.442 409.511C279.259 409.511 297.837 319.131 297.837 284.862C297.837 258.151 279.407 241.963 255.177 241.963C231.098 241.963 211.55 252.318 211.307 265.14C211.306 298.978 205.351 409.511 238.442 409.511Z"
                    fill="white"
                    stroke="black"
                    strokeWidth="12.1552"
                  />
                  <path
                    d="M89.3601 409.511C48.5429 409.511 29.9648 319.131 29.9648 284.862C29.9648 258.151 48.3954 241.963 72.6254 241.963C96.7043 241.963 116.252 252.318 116.495 265.14C116.496 298.978 122.451 409.511 89.3601 409.511Z"
                    fill="white"
                    stroke="black"
                    strokeWidth="12.1552"
                  />
                  <mask id="path-4-inside-1_2666_16266" fill="white">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M275.311 274.482C275.972 267.932 268.612 263.976 262.947 267.333C233.341 284.878 198.784 294.95 161.875 294.95C125.31 294.95 91.0541 285.066 61.6332 267.823C55.9577 264.496 48.6216 268.478 49.3049 275.021C54.3448 323.28 80.635 363.674 116.661 382.478C126.717 387.726 133.752 397.003 140.815 406.317C146.527 413.848 152.256 421.404 159.616 426.875C160.472 427.511 161.364 427.847 162.28 427.847C163.197 427.847 164.088 427.511 164.944 426.874C172.304 421.403 178.034 413.848 183.745 406.317C190.808 397.003 197.844 387.726 207.899 382.478C244.059 363.604 270.411 322.979 275.311 274.482Z"
                    />
                  </mask>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M275.311 274.482C275.972 267.932 268.612 263.976 262.947 267.333C233.341 284.878 198.784 294.95 161.875 294.95C125.31 294.95 91.0541 285.066 61.6332 267.823C55.9577 264.496 48.6216 268.478 49.3049 275.021C54.3448 323.28 80.635 363.674 116.661 382.478C126.717 387.726 133.752 397.003 140.815 406.317C146.527 413.848 152.256 421.404 159.616 426.875C160.472 427.511 161.364 427.847 162.28 427.847C163.197 427.847 164.088 427.511 164.944 426.874C172.304 421.403 178.034 413.848 183.745 406.317C190.808 397.003 197.844 387.726 207.899 382.478C244.059 363.604 270.411 322.979 275.311 274.482Z"
                    fill="#FFDF6F"
                  />
                  <path
                    d="M116.661 382.478L122.286 371.702H122.286L116.661 382.478ZM140.815 406.317L131.13 413.662L131.13 413.662L140.815 406.317ZM159.616 426.875L166.868 417.119L166.868 417.119L159.616 426.875ZM164.944 426.875L172.196 436.63L172.196 436.63L164.944 426.875ZM183.745 406.317L174.06 398.973L174.06 398.973L183.745 406.317ZM207.899 382.478L213.523 393.254L207.899 382.478ZM275.311 274.482L263.217 273.261L275.311 274.482ZM256.75 256.876C228.969 273.341 196.545 282.795 161.875 282.795V307.106C201.024 307.106 237.714 296.416 269.145 277.79L256.75 256.876ZM161.875 282.795C127.529 282.795 95.387 273.516 67.7793 257.336L55.487 278.309C86.7212 296.615 123.092 307.106 161.875 307.106V282.795ZM37.2155 276.283C42.6153 327.988 70.8859 372.297 111.037 393.254L122.286 371.702C90.384 355.052 66.0743 318.571 61.3944 273.758L37.2155 276.283ZM111.037 393.254C118.255 397.021 123.721 403.891 131.13 413.662L150.501 398.972C143.783 390.115 135.179 378.432 122.286 371.702L111.037 393.254ZM131.13 413.662C136.632 420.917 143.373 429.946 152.365 436.63L166.868 417.119C161.139 412.861 156.421 406.779 150.501 398.972L131.13 413.662ZM152.365 436.63C154.841 438.471 158.215 440.002 162.28 440.002V415.692C164.513 415.692 166.103 416.551 166.868 417.119L152.365 436.63ZM162.28 440.002C166.346 440.002 169.72 438.47 172.196 436.63L157.693 417.119C158.457 416.551 160.047 415.692 162.28 415.692V440.002ZM172.196 436.63C181.187 429.946 187.928 420.917 193.43 413.662L174.06 398.973C168.139 406.779 163.421 412.861 157.693 417.119L172.196 436.63ZM193.43 413.662C200.84 403.892 206.305 397.021 213.523 393.254L202.275 371.702C189.382 378.432 180.777 390.115 174.06 398.973L193.43 413.662ZM213.523 393.254C253.823 372.219 282.155 327.66 287.404 275.704L263.217 273.261C258.667 318.298 234.295 354.989 202.275 371.702L213.523 393.254ZM67.7793 257.336C61.0064 253.366 53.1154 253.721 47.077 257.154C40.8769 260.679 36.3204 267.712 37.2155 276.283L61.3944 273.758C61.4794 274.573 61.3158 275.576 60.8041 276.51C60.324 277.386 59.676 277.955 59.092 278.287C57.9697 278.926 56.5844 278.953 55.487 278.309L67.7793 257.336ZM269.145 277.79C268.05 278.439 266.663 278.418 265.538 277.784C264.953 277.455 264.302 276.887 263.818 276.012C263.302 275.079 263.135 274.075 263.217 273.261L287.404 275.704C288.271 267.123 283.683 260.102 277.465 256.601C271.408 253.191 263.51 252.871 256.75 256.876L269.145 277.79Z"
                    fill="black"
                    mask="url(#path-4-inside-1_2666_16266)"
                  />
                  <ellipse
                    cx="162.686"
                    cy="273.072"
                    rx="106.965"
                    ry="35.6551"
                    fill="black"
                    stroke="black"
                    strokeWidth="12.1552"
                  />
                  <path
                    d="M76.7888 333.038C76.7888 333.038 129.549 350.865 163.496 350.865C197.442 350.865 250.202 333.038 250.202 333.038"
                    stroke="black"
                    strokeWidth="12.1552"
                    strokeLinecap="round"
                  />
                  <circle
                    r="24.1868"
                    transform="matrix(-1 0 0 1 62.0795 120.604)"
                    fill="black"
                  />
                  <path
                    d="M58.0485 116.976L103.197 162.124"
                    stroke="black"
                    strokeWidth="12.0934"
                  />
                  <circle cx="259.606" cy="120.604" r="24.1868" fill="black" />
                  <path
                    d="M264.04 116.976L218.891 162.124"
                    stroke="black"
                    strokeWidth="12.0934"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M68.945 264.934C55.909 258.728 48.3223 244.792 50.8637 230.579C61.7713 169.58 107.228 123.829 161.649 123.829C216.201 123.829 261.746 169.802 272.512 231.023C275.016 245.261 267.368 259.191 254.287 265.346C226.298 278.518 195.035 285.88 162.052 285.88C128.726 285.88 97.1564 278.364 68.945 264.934Z"
                    fill="#FFDF6F"
                  />
                  <path
                    d="M272.512 231.023L278.468 229.976L272.512 231.023ZM56.816 231.644C67.3556 172.702 110.923 129.875 161.649 129.875V117.782C103.534 117.782 56.1869 166.458 44.9114 229.515L56.816 231.644ZM161.649 129.875C212.497 129.875 256.154 172.911 266.557 232.07L278.468 229.976C267.339 166.693 219.905 117.782 161.649 117.782V129.875ZM251.713 259.875C224.512 272.675 194.126 279.834 162.052 279.834V291.927C195.943 291.927 228.084 284.36 256.862 270.817L251.713 259.875ZM162.052 279.834C129.645 279.834 98.9608 272.526 71.544 259.474L66.3459 270.393C95.3521 284.202 127.808 291.927 162.052 291.927V279.834ZM266.557 232.07C268.565 243.485 262.452 254.821 251.713 259.875L256.862 270.817C272.283 263.56 281.468 247.037 278.468 229.976L266.557 232.07ZM44.9114 229.515C41.8661 246.545 50.9775 263.077 66.3459 270.393L71.544 259.474C60.8406 254.379 54.7785 243.038 56.816 231.644L44.9114 229.515Z"
                    fill="black"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M92.2042 249.768C81.711 245.495 75.4866 234.33 79.1225 223.599C90.3356 190.507 123.045 166.559 161.649 166.559C200.253 166.559 232.962 190.507 244.175 223.599C247.811 234.33 241.587 245.495 231.094 249.768C209.662 258.497 186.217 263.306 161.649 263.306C137.081 263.306 113.636 258.497 92.2042 249.768Z"
                    fill="black"
                  />
                  <ellipse
                    cx="189.464"
                    cy="218.157"
                    rx="20.1557"
                    ry="16.1246"
                    fill="white"
                  />
                  <ellipse
                    cx="131.763"
                    cy="218.167"
                    rx="20.1557"
                    ry="16.1246"
                    fill="white"
                  />
                  <path
                    d="M557.311 263.36H514.751L535.551 204.16L557.311 263.36ZM507.391 134.4L425.791 352H483.711L498.751 309.12H573.951L589.631 355.2L646.911 349.44L565.631 134.4H507.391ZM721.131 352V126.08L662.891 129.6V352H721.131ZM782.494 352L811.294 322.88V126.08L753.054 129.6V352H782.494ZM792.414 257.28C798.6 250.88 804.36 245.76 809.694 241.92C815.027 238.08 820.254 236.16 825.374 236.16C831.56 236.16 836.68 237.547 840.734 240.32C845 243.093 848.2 247.253 850.334 252.8C852.68 258.133 853.854 264.747 853.854 272.64C853.854 280.533 852.68 287.36 850.334 293.12C847.987 298.88 844.894 303.253 841.054 306.24C837.214 309.227 832.84 310.72 827.934 310.72C822.387 310.72 816.627 309.227 810.654 306.24C804.68 303.04 798.6 298.56 792.414 292.8L776.094 327.04C782.067 333.867 788.04 339.413 794.014 343.68C800.2 347.733 806.387 350.72 812.574 352.64C818.974 354.56 825.374 355.52 831.774 355.52C848.2 355.52 862.494 352.427 874.654 346.24C887.027 340.053 896.627 330.773 903.454 318.4C910.494 306.027 914.014 290.667 914.014 272.32C914.014 253.76 910.494 238.507 903.454 226.56C896.627 214.613 887.24 205.76 875.294 200C863.347 194.24 849.694 191.36 834.334 191.36C826.44 191.36 818.76 192.747 811.294 195.52C803.827 198.293 797 201.92 790.814 206.4C784.84 210.667 779.934 215.147 776.094 219.84L792.414 257.28ZM971.616 352.64C970.55 355.627 967.776 358.613 963.296 361.6C958.816 364.587 953.696 367.36 947.936 369.92C942.39 372.48 937.056 374.827 931.936 376.96L951.456 422.08C961.696 419.733 971.616 416.107 981.216 411.2C990.816 406.293 999.243 400.32 1006.5 393.28C1013.75 386.24 1018.98 378.56 1022.18 370.24L1090.34 196.8H1032.42L1002.66 284.48L970.976 191.04L917.216 206.4L972.896 349.12L971.616 352.64Z"
                    fill="black"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Home;
