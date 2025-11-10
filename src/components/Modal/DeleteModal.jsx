import React from "react";
import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import "../MainContent/GameCategory/Table/style.css";

const DeleteModal = ({ open, onOk, onCancel }) => {
  return (
    <Modal
      title={null}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
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
  );
};

export default DeleteModal;
