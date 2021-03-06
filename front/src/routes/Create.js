import React, { useContext, useEffect, useState } from "react";
import AccountContext, { ProviderContext } from "../Context";
import QRCode from "qrcode.react";
import { RIF_TOKEN_ADDRESS, RSK_RPC_URL } from "../config/constants";
import { getERC677TokenDetails } from "../utils/essentials";
import ConnectWalletCard from "../components/ConnectWalletCard";

export default function Create() {
  // Context
  const [account] = useContext(AccountContext);
  const [provider] = useContext(ProviderContext);
  const providerChainId = +provider.networkVersion;

  // ERC677Token State
  const [tokenDecimals, setTokenDecimals] = useState(0);
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [, setTokenName] = useState("");

  // Generated QR Code State
  const [qrCode, setQrCode] = useState(<></>);

  // Form State
  const [productPrice, setProductPrice] = useState(null);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [validationError, setvalidationError] = useState(false);
  const [generateQr, setGenerateQr] = useState(false);
  const [validationErrorMsg, setvalidationErrorMsg] = useState("Qr Code");

  const downloadQR = () => {
    const canvas = document.getElementById("qrcode");
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "qrcode.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Form Handlers
  const handleChangeAmount = ({ target }) => setProductPrice(target.value);
  const handleChangeProductName = ({ target }) => setProductName(target.value);
  const handleChangeProductDescription = ({ target }) =>
    setProductDescription(target.value);
  const handleSubmit = (e) => {
    e.preventDefault();

    validateFrom();
    if (!validationError) {
      setQrCode(
        <div className="qr-wrapper">
          <QRCode
            id="qrcode"
            size={400}
            className="qr"
            value={JSON.stringify({
              To: account,
              Price: productPrice * Math.pow(10, tokenDecimals),
              Name: productName,
              Description: productDescription,
              Token: RIF_TOKEN_ADDRESS[providerChainId],
            })}
          />
          <button className="btn" onClick={downloadQR}>
            Download QR
          </button>
        </div>
      );
    }
  };

  const validateFrom = () => {
    if (!productPrice) {
      setvalidationError(true);
      setGenerateQr(false);
      setvalidationErrorMsg("Please Enter A Product Price");
    } else if (productPrice <= 0) {
      setvalidationError(true);
      setGenerateQr(false);
      setvalidationErrorMsg("Please Enter A Valid Product Price");
    } else {
      setGenerateQr(true);
      setvalidationError(false);
    }
  };

  // Get The ERC677Tolen Details
  useEffect(() => {
    if (!account || !provider) return;
    getERC677TokenDetails(
      RSK_RPC_URL[providerChainId],
      RIF_TOKEN_ADDRESS[providerChainId],
      setTokenName,
      setTokenSymbol,
      setTokenDecimals
    );
  }, [account, provider, providerChainId]);

  return (
    <>
      {account ? (
        <>
          <h2>
            Fill the form with a product details and generate a QR Price Tag for
            it.
          </h2>
          <p>Your connected wallet address Will be added.</p>

          <div className="flex-row-space-around">
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="price">
                  Product Price {`(${tokenSymbol})`}
                </label>
                <input
                  min={0}
                  type="number"
                  step="1"
                  onChange={handleChangeAmount}
                  name="price"
                  id="price"
                  value={productPrice || ""}
                ></input>
              </div>
              <div className="form-group">
                <label id="name">Product Name</label>
                <input
                  type="text"
                  onChange={handleChangeProductName}
                  name="name"
                  id="name"
                  value={productName || ""}
                ></input>
              </div>
              <div className="form-group">
                <label id="name">Product Description</label>
                <textarea
                  type="text"
                  onChange={handleChangeProductDescription}
                  name="desc"
                  id="desc"
                  value={productDescription || ""}
                ></textarea>
              </div>
              <button className="btn" type="submit">
                Generate QR
              </button>
            </form>
            {generateQr ? (
              <div>{qrCode}</div>
            ) : (
              <div className="qr-placeholder">{validationErrorMsg}</div>
            )}
          </div>
        </>
      ) : (
        <ConnectWalletCard
          message={"Connect Your Wallet And Start Making QR Price Tags"}
        ></ConnectWalletCard>
      )}
    </>
  );
}
