import React, { useEffect, useMemo, useRef } from "react";
import {
  Table as AntTable,
  Switch,
  Space,
  Button,
  Modal,
  Select,
  Spin,
} from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import TagEditModal from "../../../Modal/TagEditModal";
import { useAppContext } from "../../../../contexts";
import { useNotification } from "../../../../contexts/NotificationContext";
import "./style.css";

const iconOptions = [
  { value: "HOT", label: "HOT" },
  { value: "NEW", label: "NEW" },
];

const GameTagTable = () => {
  const {
    state,
    fetchGameTags,
    addGameTagsItem,
    updateGameTagsItem,
    openGameTagsAddEditModal,
    closeGameTagsAddEditModal,
    openGameTagsDeleteModal,
    closeGameTagsDeleteModal,
    confirmDeleteGameTagsItem,
  } = useAppContext();
  const { notifySuccess, notifyError } = useNotification();

  const { dataSource, modals, loading, error } = state.gameTags;
  const { isAddEditModalOpen, isDeleteModalOpen, editingItem } = modals;
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (dataSource.length === 0 && !loading && !error && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchGameTags();
    }
  }, [dataSource.length, loading, error, fetchGameTags]);

  const columns = useMemo(
    () => [
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
        width: 120,
        align: "center",
        render: (icon, record) => (
          <div className="tag-badge-container">
            <Select
              value={icon}
              onChange={async (value) => {
                const result = await updateGameTagsItem(record.key, {
                  name: record.name,
                  icon: value,
                  state: record.state,
                });
                if (result.success) {
                  notifySuccess("Tag updated", `"${record.name}" icon changed.`);
                } else {
                  notifyError(result.error || "Failed to update tag");
                }
              }}
              className={`icon-select icon-select-${(icon || "hot").toLowerCase()}`}
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
        width: 120,
        align: "center",
        render: (_, record) => (
          <Switch
            checked={record.state}
            onChange={async (checked) => {
              const result = await updateGameTagsItem(record.key, {
                name: record.name,
                icon: record.icon,
                state: checked,
              });
              if (result.success) {
                notifySuccess(
                  "Tag updated",
                  `"${record.name}" is now ${checked ? "active" : "inactive"}.`
                );
              } else {
                notifyError(result.error || "Failed to update tag");
              }
            }}
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
              onClick={() => openGameTagsAddEditModal(record)}
            >
              Edit
            </p>
            <p
              className="delete-link"
              onClick={() => openGameTagsDeleteModal(record)}
            >
              Delete
            </p>
          </Space>
        ),
      },
    ],
    [openGameTagsAddEditModal, openGameTagsDeleteModal, updateGameTagsItem, notifySuccess, notifyError]
  );

  const handleSave = async (data) => {
    const trimmedName = data.name?.trim();
    if (!trimmedName) {
      notifyError("Tag name is required");
      return;
    }

    try {
      if (editingItem) {
        const result = await updateGameTagsItem(editingItem.key, {
          name: trimmedName,
          icon: data.icon,
          state: editingItem.state,
        });
        if (result.success) {
          notifySuccess("Tag updated successfully", `"${trimmedName}" saved.`);
          closeGameTagsAddEditModal();
        } else {
          notifyError(result.error || "Failed to update tag");
        }
      } else {
        const result = await addGameTagsItem({
          name: trimmedName,
          icon: data.icon || "HOT",
          state: true,
        });
        if (result.success) {
          notifySuccess("Tag added successfully", `"${trimmedName}" created.`);
          closeGameTagsAddEditModal();
        } else {
          notifyError(result.error || "Failed to create tag");
        }
      }
    } catch (err) {
      console.error("Error saving tag:", err);
      notifyError(err.message || "Failed to save tag");
    }
  };

  const handleDeleteOk = async () => {
    const result = await confirmDeleteGameTagsItem();
    if (result.success) {
      notifySuccess("Deletion was successful", "The tag has been removed.");
    } else {
      notifyError(result.error || "Failed to delete tag");
    }
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
            onClick={() => openGameTagsAddEditModal()}
          >
            + Create
          </Button>
        </div>
      </div>

      <div className="line"></div>
      <div className="table-wrapper">
        {loading && dataSource.length === 0 ? (
          // Show spinner while loading on initial load
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <Spin size="large" tip="Loading tags..." />
          </div>
        ) : error ? (
          // Show error state
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
              flexDirection: "column",
            }}
          >
            <p style={{ color: "red", marginBottom: "16px" }}>Error: {error}</p>
            <Button
              type="primary"
              onClick={() => {
                hasFetchedRef.current = false;
                fetchGameTags();
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <AntTable
            columns={columns}
            dataSource={dataSource}
            loading={loading && dataSource.length > 0}
            pagination={false}
            className="game-category-table"
            rowClassName="table-row"
            bordered={false}
            size="small"
            scroll={{ x: "max-content", y: 106 * 5 }}
            locale={{
              emptyText: (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "#999",
                  }}
                >
                  <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                    No tags found
                  </p>
                  <p style={{ fontSize: "14px", marginBottom: "16px" }}>
                    Get started by creating your first tag
                  </p>
                  <Button
                    type="primary"
                    onClick={() => openGameTagsAddEditModal()}
                  >
                    + Create Tag
                  </Button>
                </div>
              ),
            }}
          />
        )}
      </div>
      <div className="table-pagination">
        <div></div>
        <div className="main-pagination">
          <div>Total {state.gameTags.pagination.totalItems}</div>
        </div>
      </div>

      <TagEditModal
        open={isAddEditModalOpen}
        onOk={handleSave}
        onCancel={closeGameTagsAddEditModal}
        initialData={editingItem}
      />

      <Modal
        title={null}
        open={isDeleteModalOpen}
        onOk={handleDeleteOk}
        onCancel={closeGameTagsDeleteModal}
        okText="确定"
        cancelText="取消"
        centered
        closable
        className="delete-confirm-modal"
        width={480}
      >
        <div className="delete-modal-content">
          <div className="delete-modal-header">
            <div className="delete-warning-icon">
              <ExclamationCircleFilled />
            </div>
            <span className="delete-modal-question">
              Should the tag be removed?
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GameTagTable;

