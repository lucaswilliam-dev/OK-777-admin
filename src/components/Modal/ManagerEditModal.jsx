import React, { useState, useEffect, useMemo } from "react";
import { Button, Modal, Input, Upload, Select, message } from "antd";
import { CameraOutlined } from "@ant-design/icons";
import { useAppContext } from "../../contexts";
import { getImageURL, getServerBaseURL } from "../../services/api";
import "./ManagerEditModal.css";

const ManagerEditModal = ({ open, onOk, onCancel, initialData = null }) => {
  const safeData = initialData || {};
  const { fetchDropdownData, state } = useAppContext();
  const { dropdowns } = state;

  const [fileList, setFileList] = useState([]);
  const [zhName, setZhName] = useState(safeData.zhName || "");
  const [enName, setEnName] = useState(safeData.enName || "");
  const [provider, setProvider] = useState(safeData.provider || undefined);
  const [category, setCategory] = useState(safeData.category || undefined);
  const [tags, setTags] = useState(safeData.tags || ["Hot", "New"]);
  // Visibility is stored as array of language codes (numbers 0-43)
  const [visibility, setVisibility] = useState(
    safeData.visibility || []
  );
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState(null);

  const [providerOptions, setProviderOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const uploadEndpoint = useMemo(
    () => `${getServerBaseURL()}/api/v1/admin/uploads/image`,
    []
  );

  const uploadHeaders = useMemo(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    return token
      ? {
          Authorization: token,
        }
      : {};
  }, []);

  useEffect(() => {
    const loadDropdownData = async () => {
      if (dropdowns.categories.length > 0 && dropdowns.providers.length > 0) {
        const categoryOpts = dropdowns.categories.map((cat) => ({
          value: cat.name,
          label: cat.name,
        }));
        const providerOpts = dropdowns.providers.map((prov) => ({
          value: prov,
          label: prov,
        }));
        setCategoryOptions(categoryOpts);
        setProviderOptions(providerOpts);
      } else {
        const result = await fetchDropdownData();
        if (result.success) {
          const categoryOpts = result.categories.map((cat) => ({
            value: cat.name,
            label: cat.name,
          }));
          const providerOpts = result.providers.map((prov) => ({
            value: prov,
            label: prov,
          }));
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
      setProvider(data.provider || undefined);
      setCategory(data.category || undefined);
      // Tags should be an array - use empty array if not provided or not an array
      setTags(Array.isArray(data.tags) ? data.tags : []);
      // Visibility should be an array of language codes (numbers)
      setVisibility(Array.isArray(data.visibility) ? data.visibility : []);
      setUploadedImagePath(null);
      // Set fileList with existing image URL if available
      if (data.coverImage) {
        setFileList([
          {
            uid: "-1",
            url: data.coverImage.startsWith("http")
              ? data.coverImage
              : getImageURL(data.coverImage),
            status: "done",
            name: "cover-image",
          },
        ]);
      } else {
        setFileList([]);
      }
      setLoading(false);
      setUploadingImage(false);
    } else {
      // Reset loading when modal closes
      setLoading(false);
      setUploadingImage(false);
      setUploadedImagePath(null);
    }
  }, [open, initialData]);

  const handleOk = async () => {
    if (uploadingImage) {
      message.warning("Please wait for the image upload to finish");
      return;
    }
    // Validate required fields
    if (!zhName.trim() && !enName.trim()) {
      message.warning("Please enter at least one name (ZH or EN)");
      return;
    }

    setLoading(true);
    try {
      if (onOk) {
        await onOk({
          zhName: zhName.trim(),
          enName: enName.trim(),
          provider: provider || undefined,
          category: category || undefined,
          tags,
          visibility,
          coverImage: coverImageUrl,
          uploadedImagePath,
          uploadedImageUrl: uploadedImagePath
            ? getImageURL(uploadedImagePath)
            : undefined,
        });
        // Loading will be reset by parent component after successful update
      }
    } catch (error) {
      console.error("Error in handleOk:", error);
      message.error(error.message || "Failed to update game");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) {
      return; // Prevent canceling while loading
    }
    const data = initialData || {};
    setZhName(data.zhName || "");
    setEnName(data.enName || "");
    setProvider(data.provider || undefined);
    setCategory(data.category || undefined);
    // Tags should be an array - use empty array if not provided or not an array
    setTags(Array.isArray(data.tags) ? data.tags : []);
    // Visibility should be an array of language codes (numbers)
    setVisibility(Array.isArray(data.visibility) ? data.visibility : []);
    setFileList(
      data.coverImage
        ? [{ url: data.coverImage, status: "done", name: "cover-image" }]
        : []
    );
    setLoading(false);
    setUploadingImage(false);
    setUploadedImagePath(null);
    if (onCancel) {
      onCancel();
    }
  };

  const handleUploadChange = (info) => {
    const { file } = info;
    let newFileList = info.fileList.slice(-1);
    newFileList = newFileList.map((item) => {
      if (item.response?.data?.url) {
        return {
          ...item,
          url: item.response.data.url,
          status: item.status || "done",
        };
      }
      return item;
    });
    setFileList(newFileList);

    if (file.status === "uploading") {
      setUploadingImage(true);
      return;
    }

    if (file.status === "done") {
      setUploadingImage(false);
      const uploadPath = file.response?.data?.path;
      const uploadUrl = file.response?.data?.url;
      if (uploadPath) {
        setUploadedImagePath(uploadPath);
      }
      if (uploadUrl) {
        setPreviewUrl(uploadUrl);
      }
      message.success("Image uploaded successfully");
    } else if (file.status === "removed") {
      setUploadingImage(false);
      setUploadedImagePath(null);
      if (initialData?.coverImage) {
        setPreviewUrl(
          initialData.coverImage.startsWith("http")
            ? initialData.coverImage
            : getImageURL(initialData.coverImage)
        );
      } else {
        setPreviewUrl("/cat.jpg");
      }
    } else if (file.status === "error") {
      setUploadingImage(false);
      message.error(file.error?.message || "Failed to upload image");
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Only image files are allowed");
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must smaller than 5MB");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const tagOptions = [
    { value: "Hot", label: "Hot" },
    { value: "New", label: "New" },
  ];

  // Language options based on language codes (0-43)
  const visibilityOptions = [
    { value: 0, label: "English" },
    { value: 1, label: "Traditional Chinese" },
    { value: 2, label: "Simplify Chinese" },
    { value: 3, label: "Thai" },
    { value: 4, label: "Indonesia" },
    { value: 5, label: "Japanese" },
    { value: 6, label: "Korea" },
    { value: 7, label: "Vietnamese" },
    { value: 8, label: "Deutsch" },
    { value: 9, label: "Espanol" },
    { value: 10, label: "Francais" },
    { value: 11, label: "Russia" },
    { value: 12, label: "Portuguese" },
    { value: 13, label: "Burmese" },
    { value: 14, label: "Danish" },
    { value: 15, label: "Finnish" },
    { value: 16, label: "Italian" },
    { value: 17, label: "Dutch" },
    { value: 18, label: "Norwegian" },
    { value: 19, label: "Polish" },
    { value: 20, label: "Romanian" },
    { value: 21, label: "Swedish" },
    { value: 22, label: "Turkish" },
    { value: 23, label: "Bulgarian" },
    { value: 24, label: "Czech" },
    { value: 25, label: "Greek" },
    { value: 26, label: "Hungarian" },
    { value: 27, label: "Brazilian Portugese" },
    { value: 28, label: "Slovak" },
    { value: 29, label: "Georgian" },
    { value: 30, label: "Latvian" },
    { value: 31, label: "Ukrainian" },
    { value: 32, label: "Estonian" },
    { value: 33, label: "Filipino" },
    { value: 34, label: "Cambodian" },
    { value: 35, label: "Lao" },
    { value: 36, label: "Malay" },
    { value: 37, label: "Cantonese" },
    { value: 38, label: "Tamil" },
    { value: 39, label: "Hindi" },
    { value: 40, label: "European Spanish" },
    { value: 41, label: "Azerbaijani" },
    { value: 42, label: "Brunei Darussalam" },
    { value: 43, label: "Croatian" },
  ];

  // State to store preview URL
  const [previewUrl, setPreviewUrl] = useState("/cat.jpg");

  // Update preview URL when fileList or initialData changes
  useEffect(() => {
    if (fileList.length > 0) {
      const file = fileList[0];
      // If it's a new file (has originFileObj), create object URL for preview
      if (file.originFileObj) {
        const objectUrl = URL.createObjectURL(file.originFileObj);
        setPreviewUrl(objectUrl);
        // Cleanup function
        return () => {
          URL.revokeObjectURL(objectUrl);
        };
      }
      // If it has a URL (existing image), use getImageURL to get full URL
      else if (file.url) {
        // Don't use getImageURL for data URLs or full URLs
        if (
          file.url.startsWith("data:") ||
          file.url.startsWith("http://") ||
          file.url.startsWith("https://")
        ) {
          setPreviewUrl(file.url);
        } else {
          setPreviewUrl(getImageURL(file.url) || file.url);
        }
      }
    } else {
      // Default image - check if we have coverImage from initialData
      if (initialData?.coverImage) {
        const imgUrl = initialData.coverImage;
        if (
          imgUrl.startsWith("data:") ||
          imgUrl.startsWith("http://") ||
          imgUrl.startsWith("https://")
        ) {
          setPreviewUrl(imgUrl);
        } else {
          setPreviewUrl(getImageURL(imgUrl) || imgUrl);
        }
      } else {
        setPreviewUrl("/cat.jpg");
      }
    }
  }, [fileList, initialData]);

  const coverImageUrl = previewUrl;

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
                name="file"
                action={uploadEndpoint}
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              className="cover-upload"
                headers={uploadHeaders}
              showUploadList={false}
                accept="image/*"
                withCredentials={false}
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
            value={provider ?? undefined}
            onChange={(value) => setProvider(value || undefined)}
            options={providerOptions}
            placeholder="Select provider"
            loading={dropdowns.loading}
            showSearch
            allowClear
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>

        {/* Category Field */}
        <div className="form-item-row form-item-category">
          <label className="form-label">Category</label>
          <Select
            className="form-select"
            value={category ?? undefined}
            onChange={(value) => setCategory(value || undefined)}
            options={categoryOptions}
            placeholder="Select category"
            loading={dropdowns.loading}
            showSearch
            allowClear
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
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
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>

        {/* Buttons */}
        <div className="form-item-row form-item-buttons">
          <div className="modal-buttons">
            <Button
              className="ok-button"
              type="primary"
              onClick={handleOk}
              loading={loading}
              disabled={loading || uploadingImage}
            >
              ok
            </Button>
            <Button
              className="cancel-button"
              onClick={handleCancel}
              disabled={loading || uploadingImage}
            >
              cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ManagerEditModal;
