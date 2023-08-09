import React, { useState, useEffect } from 'react';

const SpeakeasyQRCode = () => {
  const [qrImage, setQrImage] = useState(null);
  const [secret, setSecret] = useState(null);

  useEffect(() => {
    // Fetch QR code image from endpoint
    fetch('/2fa-setup')
      .then((response) => response.json())
      .then((data) => {
        setQrImage(data.qrImage);
        setSecret(data.secret);
        // console.log('Secret:', data.secret);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);


  return (
    <div className={'authenticator_container'}>
      <p>Use this code within your chosen authenticator app</p>
      {qrImage ? (
        // Render the QR code image with the retrieved data URL
        <img src={qrImage} alt="QR Code" />
      ) : (
        // Render a loading message if the QR code image is not yet loaded
        <p>Loading QR code image...</p>
      )}
      <p>
        Or enter it manually:
      </p>
      <p id = 'auth-secret-field' value = {secret}>{secret}</p>
    </div>
  );
};

export default SpeakeasyQRCode;