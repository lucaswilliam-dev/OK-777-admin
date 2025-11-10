import React from "react";
import { Table as AntTable, Switch, Space, Button, Modal, Select } from "antd";
import TagEditModal from "../../../Modal/TagEditModal";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useAppContext } from "../../../../contexts";
import "./style.css";

const Table = () => {
  const {
    state,
    updateGameTagsItem,
    addGameTagsItem,
    openGameTagsAddEditModal,
    closeGameTagsAddEditModal,
    openGameTagsDeleteModal,
    closeGameTagsDeleteModal,
    confirmDeleteGameTagsItem,
  } = useAppContext();

  const { dataSource, modals } = state.gameTags;
  const { isAddEditModalOpen, isDeleteModalOpen, editingItem } = modals;

  const handleStateChange = (record, checked) => {
    updateGameTagsItem(record.key, { state: checked });
  };

  const handleIconChange = (record, value) => {
    updateGameTagsItem(record.key, { icon: value });
  };

  const iconOptions = [
    { value: "HOT", label: "HOT" },
    { value: "NEW", label: "NEW" },
  ];

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 150,
      align: "left",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
      align: "left",
    },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      width: 100,
      align: "center",
      render: (icon, record) => (
        <div className="tag-badge-container">
          <Select
            value={icon}
            onChange={(value) => handleIconChange(record, value)}
            className={`icon-select icon-select-${icon.toLowerCase()}`}
            dropdownClassName="icon-select-dropdown"
            size="small"
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
      ),
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Switch
          checked={record.state}
          onChange={(checked) => handleStateChange(record, checked)}
          className="state-switch"
        />
      ),
    },
    {
      title: "CreateTime",
      dataIndex: "createTime",
      key: "createTime",
      width: 180,
      align: "center",
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <p
            className="edit-link"
            onClick={() => {
              openGameTagsAddEditModal(record);
            }}
          >
            Edit
          </p>
          <p
            className="delete-link"
            onClick={() => {
              openGameTagsDeleteModal(record);
            }}
          >
            Delete
          </p>
        </Space>
      ),
    },
  ];

  const createModalShow = (tag = null) => {
    openGameTagsAddEditModal(tag);
  };

  const handleDeleteOk = () => {
    console.log("Delete confirmed");
    confirmDeleteGameTagsItem();
  };

  const handleDeleteCancel = () => {
    console.log("Delete cancelled");
    closeGameTagsDeleteModal();
  };

  const handleOk = (data) => {
    // Handle form submission here
    console.log("Name:", data.name);
    console.log("Icon:", data.icon);
    if (editingItem) {
      // Update existing tag
      updateGameTagsItem(editingItem.key, {
        name: data.name,
        icon: data.icon,
      });
    } else {
      // Add new tag
      const newTag = {
        key: Date.now().toString(),
        id: Date.now(),
        name: data.name,
        icon: data.icon,
        state: true,
        createTime: new Date().toLocaleString(),
      };
      addGameTagsItem(newTag);
    }
    closeGameTagsAddEditModal();
  };

  const handleCancel = () => {
    closeGameTagsAddEditModal();
  };

  return (
    <div className="table-container">
      <div className="content-header">
        <div className="header-left">
          <h2 className="page-title">Game Tags</h2>
          <div></div>
        </div>
        <div className="function-elements">
          <div></div>
          <Button
            type="primary"
            className="create-button"
            onClick={createModalShow}
          >
            + Create
          </Button>
        </div>
      </div>

      <div className="line"></div>
      <div className="table-wrapper">
        <AntTable
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          className="game-category-table"
          rowClassName="table-row"
          bordered={false}
          size="small"
          scroll={{ x: "max-content", y: 106 * 5 }}
        />
      </div>
      <TagEditModal
        open={isAddEditModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        initialData={editingItem}
      />
      <Modal
        title={null}
        open={isDeleteModalOpen}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="确定"
        cancelText="取消"
        centered
        closable={true}
        className="delete-confirm-modal"
        width={480}
      >
        <div className="delete-modal-content">
          <div className="delete-modal-header">
            <div className="delete-warning-icon">
              <ExclamationCircleFilled />
            </div>
            <span className="delete-modal-question">
              Are you sure you want to Delete tag?
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Table;
