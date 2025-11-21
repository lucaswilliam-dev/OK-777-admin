import React, { useState, useEffect } from "react";
import { Button, Modal, Input, Select } from "antd";
import "./TagEditModal.css";

const iconOptions = [
  { value: "HOT", label: "HOT" },
  { value: "NEW", label: "NEW" },
];

const TagEditModal = ({
  open,
  onOk,
  onCancel,
  initialData = null,
}) => {
  const safeData = initialData || {};
  
  const [name, setName] = useState(safeData.name || "");
  const [icon, setIcon] = useState(safeData.icon || "HOT");

  useEffect(() => {
    if (open) {
      const data = initialData || {};
      setName(data.name || "");
      setIcon(data.icon || "HOT");
    }
  }, [open, initialData]);

  const handleOk = () => {
    if (onOk) {
      onOk({
        name,
        icon,
      });
    }
  };

  const handleCancel = () => {
    const data = initialData || {};
    setName(data.name || "");
    setIcon(data.icon || "HOT");
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      className="tag-edit-modal"
      width={500}
      closable={true}
      maskClosable={false}
    >
      <div className="tag-modal-form">
        <div className="form-item-row form-item-name">
          <label className="form-label">Name</label>
          <Input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Slot"
          />
        </div>

        <div className="form-item-row form-item-icon">
          <label className="form-label">Icon</label>
          <div className="form-input-wrapper">
            <Select
              className={`icon-select icon-select-${icon.toLowerCase()}`}
              value={icon}
              onChange={setIcon}
              dropdownClassName="tag-icon-dropdown"
            >
              {iconOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  <span
                    className={`tag-badge ${
                      option.value === "HOT" ? "tag-badge-hot" : "tag-badge-new"
                    }`}
                  >
                    {option.label}
                  </span>
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

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

export default TagEditModal;

