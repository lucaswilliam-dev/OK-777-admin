import React, { useState, useEffect } from "react";
import { Button, Modal, Input, Upload, Select } from "antd";
import { CameraOutlined } from "@ant-design/icons";
import { useAppContext } from "../../contexts";
import "./ManagerEditModal.css";

const ManagerEditModal = ({
  open,
  onOk,
  onCancel,
  initialData = null,
}) => {
  const safeData = initialData || {};
  const { fetchDropdownData, state } = useAppContext();
  const { dropdowns } = state;
  
  const [fileList, setFileList] = useState([]);
  const [zhName, setZhName] = useState(safeData.zhName || "");
  const [enName, setEnName] = useState(safeData.enName || "");
  const [provider, setProvider] = useState(safeData.provider || "All");
  const [category, setCategory] = useState(safeData.category || "All");
  const [tags, setTags] = useState(safeData.tags || ["Hot", "New"]);
  const [visibility, setVisibility] = useState(
    safeData.visibility || ["EN", "ZH", "DE"]
  );
  
  // State for dropdown options
  const [providerOptions, setProviderOptions] = useState([
    { value: "All", label: "All" },
  ]);
  const [categoryOptions, setCategoryOptions] = useState([
    { value: "All", label: "All" },
  ]);

  // Load dropdown data from database
  useEffect(() => {
    const loadDropdownData = async () => {
      // Use cached data if available
      if (dropdowns.categories.length > 0 && dropdowns.providers.length > 0) {
        const categoryOpts = [
          { value: "All", label: "All" },
          ...dropdowns.categories.map((cat) => ({
            value: cat.name,
            label: cat.name,
          })),
        ];
        const providerOpts = [
          { value: "All", label: "All" },
          ...dropdowns.providers.map((prov) => ({
            value: prov,
            label: prov,
          })),
        ];
        setCategoryOptions(categoryOpts);
        setProviderOptions(providerOpts);
      } else {
        // Fetch if not cached
        const result = await fetchDropdownData();
        if (result.success) {
          const categoryOpts = [
            { value: "All", label: "All" },
            ...result.categories.map((cat) => ({
              value: cat.name,
              label: cat.name,
            })),
          ];
          const providerOpts = [
            { value: "All", label: "All" },
            ...result.providers.map((prov) => ({
              value: prov,
              label: prov,
            })),
          ];
          setCategoryOptions(categoryOpts);
          setProviderOptions(providerOpts);
        }
      }
    };

    loadDropdownData();
  }, [fetchDropdownData, dropdowns.categories, dropdowns.providers]);

  useEffect(() => {
    if (open) {
      const data = initialData || {};
      setZhName(data.zhName || "");
      setEnName(data.enName || "");
      setProvider(data.provider || "All");
      setCategory(data.category || "All");
      setTags(data.tags || ["Hot", "New"]);
      setVisibility(data.visibility || ["EN", "ZH", "DE"]);
      setFileList(data.coverImage ? [{ url: data.coverImage }] : []);
    }
  }, [open, initialData]);

  const handleOk = () => {
    if (onOk) {
      onOk({
        zhName,
        enName,
        provider,
        category,
        tags,
        visibility,
        fileList,
      });
    }
  };

  const handleCancel = () => {
    const data = initialData || {};
    setZhName(data.zhName || "");
    setEnName(data.enName || "");
    setProvider(data.provider || "All");
    setCategory(data.category || "All");
    setTags(data.tags || ["Hot", "New"]);
    setVisibility(data.visibility || ["EN", "ZH", "DE"]);
    setFileList(data.coverImage ? [{ url: data.coverImage }] : []);
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

  const tagOptions = [
    { value: "Hot", label: "Hot" },
    { value: "New", label: "New" },
  ];

  const visibilityOptions = [
    { value: "EN", label: "EN" },
    { value: "ZH", label: "ZH" },
    { value: "ST", label: "ST" },
    { value: "DE", label: "DE" },
    { value: "PT", label: "PT" },
  ];

  const coverImageUrl =
    fileList.length > 0 && fileList[0].originFileObj
      ? URL.createObjectURL(fileList[0].originFileObj)
      : fileList.length > 0 && fileList[0].url
      ? fileList[0].url
      : "/cat.jpg"; // Default image

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      className="manager-edit-modal"
      width={700}
      closable={true}
      maskClosable={false}
    >
      <div className="manager-modal-form">
        {/* ZH Name Field */}
        <div className="form-item-row form-item-zh-name">
          <label className="form-label">ZH Name</label>
          <Input
            className="form-input"
            value={zhName}
            onChange={(e) => setZhName(e.target.value)}
            placeholder="Enter Chinese name"
          />
        </div>

        {/* EN Name Field */}
        <div className="form-item-row form-item-en-name">
          <label className="form-label">EN Name</label>
          <Input
            className="form-input"
            value={enName}
            onChange={(e) => setEnName(e.target.value)}
            placeholder="Enter English name"
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
                  src={coverImageUrl}
                  alt="preview"
                  className="cover-image"
                />
                <div className="camera-icon-overlay">
                  <CameraOutlined />
                </div>
              </div>
            </Upload>
          </div>
        </div>

        {/* Provider Field */}
        <div className="form-item-row form-item-provider">
          <label className="form-label">Provider</label>
          <Select
            className="form-select"
            value={provider}
            onChange={setProvider}
            options={providerOptions}
            placeholder="Select provider"
            loading={dropdowns.loading}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>

        {/* Category Field */}
        <div className="form-item-row form-item-category">
          <label className="form-label">Category</label>
          <Select
            className="form-select"
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            placeholder="Select category"
            loading={dropdowns.loading}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>

        {/* Tags Field */}
        <div className="form-item-row form-item-tags">
          <label className="form-label">Tags</label>
          <Select
            mode="multiple"
            className="form-select form-select-multiple"
            value={tags}
            onChange={setTags}
            options={tagOptions}
            placeholder="Select tags"
            showSearch
          />
        </div>

        {/* Visibility Field */}
        <div className="form-item-row form-item-visibility">
          <label className="form-label">Visibility</label>
          <Select
            mode="multiple"
            className="form-select form-select-multiple visibility-select"
            value={visibility}
            onChange={setVisibility}
            options={visibilityOptions}
            placeholder="Select visibility"
            showSearch
          />
        </div>

        {/* Buttons */}
        <div className="form-item-row form-item-buttons">
          <div className="modal-buttons">
            <Button className="ok-button" type="primary" onClick={handleOk}>
              ok
            </Button>
            <Button className="cancel-button" onClick={handleCancel}>
              cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ManagerEditModal;

