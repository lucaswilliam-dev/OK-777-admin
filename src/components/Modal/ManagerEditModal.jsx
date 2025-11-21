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
  const [tags, setTags] = useState(
    Array.isArray(safeData.tags) ? safeData.tags : []
  );
  // Visibility is stored as array of language codes (numbers 0-43)
  const [visibility, setVisibility] = useState(
    safeData.visibility || []
  );
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState(null);

  const [providerOptions, setProviderOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [visibilityOptions, setVisibilityOptions] = useState([]);

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
      if (
        dropdowns.categories.length > 0 &&
        dropdowns.providers.length > 0 &&
        dropdowns.tags.length > 0
      ) {
        const categoryOpts = dropdowns.categories.map((cat) => ({
          value: cat.name,
          label: cat.name,
        }));
        const providerOpts = dropdowns.providers.map((prov) => ({
          value: prov,
          label: prov,
        }));
        const tagOpts = dropdowns.tags
          .filter((tag) => tag.state !== false)
          .map((tag) => ({
            value: tag.id,
            label: tag.name,
          }));
        setCategoryOptions(categoryOpts);
        setProviderOptions(providerOpts);
        setTagOptions(tagOpts);
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
          const tagOpts = (result.tags || [])
            .filter((tag) => tag.state !== false)
            .map((tag) => ({
              value: tag.id,
              label: tag.name,
            }));
          setCategoryOptions(categoryOpts);
          setProviderOptions(providerOpts);
          setTagOptions(tagOpts);
        }
      }
    };

    loadDropdownData();
  }, [fetchDropdownData, dropdowns.categories, dropdowns.providers, dropdowns.tags]);

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
      
      // Extract language codes from extra_langName to build dynamic visibility options
      const langNameData = data.fullData?.extra_langName || data.fullData?.langName;
      let extractedCodes = [];
      
      if (langNameData) {
        try {
          const parsed = typeof langNameData === 'string' 
            ? JSON.parse(langNameData) 
            : langNameData;
          
          if (parsed && typeof parsed === 'object') {
            // Extract all keys (language codes) from the langName object
            extractedCodes = Object.keys(parsed)
              .map(key => {
                const code = typeof key === 'string' ? parseInt(key, 10) : Number(key);
                return !isNaN(code) ? code : null;
              })
              .filter(code => code !== null && code >= 0 && code <= 43)
              .sort((a, b) => a - b);
          }
        } catch (e) {
          console.warn("Failed to parse langName data:", e);
        }
      }
      
      // Build visibility options from extracted language codes
      const dynamicVisibilityOptions = extractedCodes.length > 0
        ? extractedCodes.map(code => ({
            value: code,
            label: languageCodeMap[code] || `Language ${code}`,
          }))
        : [];
      
      setVisibilityOptions(dynamicVisibilityOptions);
      
      setLoading(false);
      setUploadingImage(false);
    } else {
      // Reset loading when modal closes
      setLoading(false);
      setUploadingImage(false);
      setUploadedImagePath(null);
      setVisibilityOptions([]);
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
      const normalizedTags = Array.isArray(tags)
        ? tags
            .map((tagId) =>
              typeof tagId === "string" ? parseInt(tagId, 10) : Number(tagId)
            )
            .filter((tagId) => !Number.isNaN(tagId))
        : [];
      if (onOk) {
        await onOk({
          zhName: zhName.trim(),
          enName: enName.trim(),
          provider: provider || undefined,
          category: category || undefined,
          tags: normalizedTags,
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

  // Language code to name mapping (0-43)
  const languageCodeMap = {
    0: "English",
    1: "Traditional Chinese",
    2: "Simplify Chinese",
    3: "Thai",
    4: "Indonesia",
    5: "Japanese",
    6: "Korea",
    7: "Vietnamese",
    8: "Deutsch",
    9: "Espanol",
    10: "Francais",
    11: "Russia",
    12: "Portuguese",
    13: "Burmese",
    14: "Danish",
    15: "Finnish",
    16: "Italian",
    17: "Dutch",
    18: "Norwegian",
    19: "Polish",
    20: "Romanian",
    21: "Swedish",
    22: "Turkish",
    23: "Bulgarian",
    24: "Czech",
    25: "Greek",
    26: "Hungarian",
    27: "Brazilian Portugese",
    28: "Slovak",
    29: "Georgian",
    30: "Latvian",
    31: "Ukrainian",
    32: "Estonian",
    33: "Filipino",
    34: "Cambodian",
    35: "Lao",
    36: "Malay",
    37: "Cantonese",
    38: "Tamil",
    39: "Hindi",
    40: "European Spanish",
    41: "Azerbaijani",
    42: "Brunei Darussalam",
    43: "Croatian",
  };

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
