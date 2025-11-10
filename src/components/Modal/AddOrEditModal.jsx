import React, {useState, useEffect} from "react";
import { Button, Modal, Input, Upload, Select } from "antd";
import { CameraOutlined } from "@ant-design/icons";
import "../MainContent/GameCategory/Table/style.css";

const AddOrEditModal = ({ open, onOk, onCancel, initialName = "", initialVisibility = ["EN", "ZH"] }) => {
  const [fileList, setFileList] = useState([]);
  const [nameValue, setNameValue] = useState(initialName);
  const [visibilityValue, setVisibilityValue] = useState(initialVisibility);

  useEffect(() => {
    if (open) {
      setNameValue(initialName);
      setVisibilityValue(initialVisibility);
      setFileList([]);
    }
  }, [open, initialName, initialVisibility]);

  const handleOk = () => {
    // Handle form submission here
    console.log("Name:", nameValue);
    console.log("Visibility:", visibilityValue);
    if (onOk) {
      onOk({ name: nameValue, visibility: visibilityValue, fileList });
    }
  };

  const handleCancel = () => {
    setNameValue(initialName);
    setVisibilityValue(initialVisibility);
    setFileList([]);
    if (onCancel) {
      onCancel();
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = () => {
    return false; // Prevent auto upload
  };

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
                {fileList.length === 0 && (
                  <div className="cover-preview">
                    <img
                      src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=200&h=150&fit=crop"
                      alt="preview"
                      className="cover-image"
                    />
                    <div className="camera-icon-overlay">
                      <CameraOutlined />
                    </div>
                  </div>
                )}
                {fileList.length > 0 && (
                  <div className="cover-preview">
                    <img
                      src={URL.createObjectURL(fileList[0].originFileObj)}
                      alt="preview"
                      className="cover-image"
                    />
                    <div className="camera-icon-overlay">
                      <CameraOutlined />
                    </div>
                  </div>
                )}
              </Upload>
            </div>
          </div>

          {/* Visibility Field */}
          <div className="form-item-row form-item-visibility">
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
          </div>

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
