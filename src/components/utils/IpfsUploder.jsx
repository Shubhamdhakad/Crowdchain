import React, { useState } from "react";
import axios from "axios";

const IpfsUploader = ({ setCid }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedCid, setUploadedCid] = useState("");

  const PINATA_API_KEY = "2bad787a107e1d7aad84";
  const PINATA_SECRET_API_KEY = "d201daf82eace61ae206f8d0fd7813e7cd2a44ea2a3e796ec51299941fa6bb51";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadToIPFS = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxContentLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      });
      const cid = res.data.IpfsHash;
      setUploadedCid(cid);
      setCid(cid); // Notify parent component
    } catch (err) {
      console.error("Upload failed", err.response ? err.response.data : err.message);
      alert("Upload failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      {/* <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
        Upload Supporting Document (PDF/Image)
      </label> */}
      <input type="file" onChange={handleFileChange} style={{ marginBottom: "10px" }} />
      <div>
        <button
          type="button"
          onClick={uploadToIPFS}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Uploading..." : "Upload to IPFS"}
        </button>
      </div>
     
    </div>
  );
};

export default IpfsUploader;
