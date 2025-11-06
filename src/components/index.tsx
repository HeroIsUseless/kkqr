import React, { useEffect } from "react";
import {
  Button,
  Input,
  QRCode,
  Space,
  message,
  Statistic,
  Typography,
  Modal,
} from "antd";
import "./index.css";
import { loadFromLocalStore, saveToLocalStore } from "./localStore";
import { Res, changeOneResName, useHooks } from "./useHooks";
import { EditOutlined, EnterOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import styles from "../app/page.module.css";
const { Title, Link } = Typography;
React.version;
const { TextArea } = Input;

// 生成二维码模块
export const QrCode = () => {
  const { text, setText, ress, setRess, bottomDivRef, onGenBtnClick } =
    useHooks();
  const [helpModalVisible, setHelpModalVisible] = React.useState(false);

  const showHelpModal = () => {
    setHelpModalVisible(true);
  };

  const handleHelpModalClose = () => {
    setHelpModalVisible(false);
  };

  return (<>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <h1>History QR Code</h1>
      <QuestionCircleOutlined 
        style={{ fontSize: '20px', cursor: 'pointer' }} 
        onClick={showHelpModal} 
      />
    </div>
    <Modal
      title="二维码生成器使用帮助"
      open={helpModalVisible}
      onCancel={handleHelpModalClose}
      footer={null}
    >
      <div style={{ padding: '20px' }}>
        <p><strong>如何使用二维码生成器：</strong></p>
        <ol>
          <li>在输入框中输入URL或文本</li>
          <li>点击Create QR Code按钮生成二维码</li>
          <li>生成的二维码将显示在下方</li>
          <li>点击二维码可查看更大尺寸</li>
          <li>您可以重命名、删除、复制或下载您的二维码</li>
          <li>所有二维码都保存在浏览器本地，下次访问时仍然可用。</li>
        </ol>
        <p>v1.0.1</p>
      </div>
    </Modal>
    <br />
    <div className="fragment">
      <div className="top-view" style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '256px' }}>
          <TextArea
            rows={4}
            placeholder="Please input QR link"
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button
            onClick={onGenBtnClick}
          >
            Create QR Code
          </Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '256px' }}>
          {text && <QRCode value={text} size={256} />}
        </div>
      </div>
      <div ref={bottomDivRef} className="bottom-view">
        {ress.length > 0 &&
          ress.map((item, index) => {
            return (
              <ItemView
                item={item}
                key={item.id}
                index={index}
                // isDark={appConfig.isDark}
                ress={ress}
                setRess={setRess}
              />
            );
          })}
      </div>
    </div>
  </>
  );
};

const ItemView = (props: {
  item: Res;
  index: number;
  // isDark: boolean;
  ress: Res[];
  setRess: Function;
}) => {
  const { item, index } = props;
  const [isInputing, setIsInputing] = React.useState(false);
  const [name, setName] = React.useState(item.name);
  const [editIconVisible, setEditIconVisible] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const onNameClick = () => {
    setIsInputing(true);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const onPressEnter = (e: any) => {
    let inputText = e.target.value;
    if (!inputText) {
      inputText = "";
    }
    setEditIconVisible(false);
    setName(inputText || name);
    changeOneResName(item.id, inputText);
    setIsInputing(false);
  };

  const onDelBtnClick = () => {
    const newRess = props.ress.filter((res) => res.id !== props.item.id);
    props.setRess(newRess);
    saveToLocalStore("fragment-qrcode-res", JSON.stringify(newRess));
  };

  const onCopyBtnClick = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      message.success('Link copied to clipboard');
    } catch (error) {
      message.error('Failed to copy link');
    }
  };

  const onDownloadBtnClick = () => {
    const canvas = document.querySelector(`#qrcode-${item.id} canvas`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${name || 'qrcode'}-${item.id}.png`;
      link.href = url;
      link.click();
      message.success('QR Code downloaded');
    } else {
      message.error('Failed to download QR Code');
    }
  };

  return (
    <div
      className="feature-view"
      key={index}
      onMouseEnter={() => setEditIconVisible(true)}
      onMouseLeave={() => setEditIconVisible(false)}
    >
      <div 
        onClick={showModal} 
        style={{ 
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <div 
          id={`qrcode-${item.id}`}
          style={{
            filter: editIconVisible ? 'none' : 'blur(9px)',
            transition: 'filter 0.3s ease'
          }}
        >
          <QRCode value={item.url} size={256} />
        </div>
      </div>

      <Modal
        title={name || "QR Code"}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width="100%"
        style={{ top: 0, maxWidth: "100vw" }}
        bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
      >
        <QRCode value={item.url} size={500} />
        <p style={{ marginTop: '20px', wordBreak: 'break-all', textAlign: 'center' }}>{item.url}</p>
      </Modal>

      <div className="feature-info">
        <div
          className="feature-info-link"
        // style={{ color: isDark ? "#ffffffd9" : "" }}
        >
          {!isInputing && (
            <p className="qrcode-name" onClick={onNameClick}>
              {name ? name : "QR Name"}
              {editIconVisible && <EditOutlined />}
            </p>
          )}
          {isInputing && (
            <Input
              size="small"
              onPressEnter={onPressEnter}
              defaultValue={name}
              autoFocus={true}
              placeholder="Please input QR name, press enter to save"
              suffix={<EnterOutlined />}
              className="qrcode-input"
              style={
                {
                  // background: isDark ? "#1f1f1f" : "white",
                  // color: isDark ? "#dddddd" : "rgba(0,0,0,.9)",
                }
              }
            />
          )}
          <div className={styles.description} style={{ marginTop: "4px" }}>
            <p>{item.url}</p>
          </div>
        </div>
        <div>
          <Button
            style={{ fontSize: "12px" }}
            size="small"
            onClick={onDelBtnClick}
          >
            Delete
          </Button>
          {/* &nbsp;
          <Button style={{ fontSize: "12px" }} size="small">
            编辑
          </Button> */}
          &nbsp;
          <Button 
            style={{ fontSize: "12px" }} 
            size="small"
            onClick={onCopyBtnClick}
          >
            Copy
          </Button>
          &nbsp;
          <Button 
            style={{ fontSize: "12px" }} 
            size="small"
            onClick={onDownloadBtnClick}
          >
            Download
          </Button>
          {/* &nbsp;
          <Button style={{ fontSize: "12px" }} size="small">
            分析
          </Button> */}
        </div>
        <div className="feature-info-time">create at {item.time}</div>
      </div>
    </div>
  );
};
