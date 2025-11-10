import React, { useState } from "react";
import { Table as AntTable, Switch, Space, Button, Modal, Select } from "antd";
import AddOrEditModal from "../../../Modal/AddOrEditModal";
import { ExclamationCircleFilled } from "@ant-design/icons";
import "./style.css";

const Table = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const totalItems = 2;

  const [dataSource, setDataSource] = useState([
    {
      key: "1",
      id: 23,
      name: "Hot",
      icon: "HOT",
      state: true,
      createTime: "2021-02-28 10:30",
    },
    {
      key: "2",
      id: 25,
      name: "New",
      icon: "NEW",
      state: true,
      createTime: "2021-02-28 10:30",
    },
  ]);

  const handleStateChange = (record, checked) => {
    setDataSource(
      dataSource.map((item) =>
        item.key === record.key ? { ...item, state: checked } : item
      )
    );
  };

  const handleIconChange = (record, value) => {
    setDataSource(
      dataSource.map((item) =>
        item.key === record.key ? { ...item, icon: value } : item
      )
    );
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
              createModalShow();
              // You can set editing item here if needed
            }}
          >
            Edit
          </p>
          <p
            className="delete-link"
            onClick={() => {
              showDeleteModal();
              // You can set item to delete here if needed
            }}
          >
            Delete
          </p>
        </Space>
      ),
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const createModalShow = () => {
    setIsModalOpen(true);
  };

  const showDeleteModal = () => {
    console.log("Delete modal triggered");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteOk = () => {
    console.log("Delete confirmed");
    setIsDeleteModalOpen(false);
    // Add your delete logic here
  };

  const handleDeleteCancel = () => {
    console.log("Delete cancelled");
    setIsDeleteModalOpen(false);
  };

  const handleOk = (data) => {
    // Handle form submission here
    console.log("Name:", data.name);
    console.log("Visibility:", data.visibility);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
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
      <AddOrEditModal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        initialName=""
        initialVisibility={["EN", "ZH"]}
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
              Should the game be removed from game provider?
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Table;
