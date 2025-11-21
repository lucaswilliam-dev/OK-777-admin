import React, { useState, useEffect } from "react";
import { Button, Modal, Input, Upload, Select } from "antd";
import { CameraOutlined } from "@ant-design/icons";
import { getImageURL } from "../../services/api";
import "../MainContent/GameCategory/Table/style.css";

const AddOrEditModal = ({
  open,
  onOk,
  onCancel,
  initialName = "",
  initialVisibility = ["EN", "ZH"],
  initialCover = null,
  initialIcon = null,
}) => {
  const [fileList, setFileList] = useState([]);
  const [nameValue, setNameValue] = useState(initialName);
  const [visibilityValue, setVisibilityValue] = useState(initialVisibility);
  const [coverImage, setCoverImage] = useState(initialCover || initialIcon);

  useEffect(() => {
    if (open) {
      setNameValue(initialName);
      setVisibilityValue(initialVisibility);
      setCoverImage(initialCover || initialIcon);
      setFileList([]);
    }
  }, [open, initialName, initialVisibility, initialCover, initialIcon]);

  const handleOk = async () => {
    let imagePath = null;
    
    // If a new file was uploaded, upload it first
    if (fileList.length > 0 && fileList[0].originFileObj) {
      try {
        // Import apiService dynamically to avoid circular dependencies
        const { default: apiService } = await import("../../services/api");
        const uploadResult = await apiService.uploadImage(fileList[0].originFileObj);
        if (uploadResult.success && uploadResult.data) {
          imagePath = uploadResult.data.path;
        } else {
          console.error('Upload failed:', uploadResult);
          return;
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        return;
      }
    } else if (coverImage && coverImage !== "/cat.jpg") {
      // If no new file but there's an existing image, use it
      imagePath = coverImage;
    }
    
    if (onOk) {
      onOk({ 
        name: nameValue, 
        visibility: visibilityValue, 
        fileList,
        image: imagePath,
        icon: imagePath,
        cover: imagePath
      });
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCancel = () => {
    setNameValue(initialName);
    setVisibilityValue(initialVisibility);
    setCoverImage(initialCover || initialIcon);
    setFileList([]);
    if (onCancel) {
      onCancel();
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    // If a new file is selected, update the preview
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const imageUrl = URL.createObjectURL(newFileList[0].originFileObj);
      setCoverImage(imageUrl);
    } else if (newFileList.length === 0) {
      // If file is removed, revert to initial
      setCoverImage(initialCover || initialIcon);
    }
  };

  const beforeUpload = () => {
    return false; // Prevent auto upload
  };

  // Determine which image to show
  const getDisplayImage = () => {
    // If a new file was uploaded, show it
    if (fileList.length > 0 && fileList[0].originFileObj) {
      return URL.createObjectURL(fileList[0].originFileObj);
    }
    
    // If there's an existing image, convert it to full URL if needed
    if (coverImage && coverImage !== null && coverImage !== "") {
      // For local public assets like /cat.jpg, don't use getImageURL
      if (coverImage === "/cat.jpg" || (coverImage.startsWith("/") && !coverImage.startsWith("/uploads/"))) {
        return coverImage;
      }
      return getImageURL(coverImage);
    }
    
    // Default image (local public asset) - always show when no image is set
    return "/cat.jpg";
  };

  const displayImage = getDisplayImage();

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
      footer={null}
      className="custom-modal"
      width={700}
      closable={false}
      maskClosable={false}
    >
      <div className="modal-form">
        {/* Name Field */}
        <div className="form-item-row form-item-name">
          <label className="form-label">Name</label>
          <Input
            className="form-input"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
          />
        </div>

        {/* Cover Field */}
        <div className="form-item-row form-item-cover">
          <label className="form-label">Cover</label>
          <div className="form-input-wrapper">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              className="cover-upload"
              showUploadList={false}
            >
              <div className="cover-preview">
                <img
                  src={displayImage}
                  alt="preview"
                  className="cover-image"
                  onError={(e) => {
                    // If image fails to load, show default
                    if (e.target.src !== "/cat.jpg") {
                      e.target.src = "/cat.jpg";
                    }
                  }}
                />
                <div className="camera-icon-overlay">
                  <CameraOutlined />
                </div>
              </div>
            </Upload>
          </div>
        </div>

        {/* Visibility Field */}
        {/* <div className="form-item-row form-item-visibility">
          <label className="form-label">Visibility</label>
          <Select
            mode="multiple"
            className="visibility-select"
            value={visibilityValue}
            onChange={setVisibilityValue}
            options={[
              { label: "EN", value: "EN" },
              { label: "ZH", value: "ZH" },
              { label: "ST", value: "ST" },
              { label: "DE", value: "DE" },
              { label: "PT", value: "PT" },
            ]}
            placeholder="Select visibility"
            showSearch
          />
        </div> */}

        {/* Buttons */}
        <div className="form-item-row form-item-buttons">
          <div className="modal-buttons">
            <Button className="cancel-button" onClick={handleCancel}>
              cancel
            </Button>
            <Button className="ok-button" type="primary" onClick={handleOk}>
              ok
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddOrEditModal;
