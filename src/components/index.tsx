import React, { useEffect } from "react";
import {
  Button,
  Input,
  QRCode,
  Space,
  message,
  Statistic,
  Typography,
} from "antd";
import "./index.css";
import { loadFromLocalStore, saveToLocalStore } from "./localStore";
import { Res, changeOneResName, useHooks } from "./useHooks";
import { EditOutlined, EnterOutlined } from "@ant-design/icons";
import styles from "../app/page.module.css";
const { Title, Link } = Typography;
React.version;
const { TextArea } = Input;

// 生成二维码模块
export const QrCode = () => {
  const { text, setText, ress, setRess, bottomDivRef, onGenBtnClick } =
    useHooks();

  return (
    <div className="fragment">
      <div className="top-view">
        <TextArea
          rows={4}
          placeholder="Please input QR link"
          maxLength={1000}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <Button 
        // style={{marginTop: '12px'}} 
        block 
        onClick={onGenBtnClick}
      >
        Create QR Code
      </Button>
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
  const onNameClick = () => {
    setIsInputing(true);
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

  return (
    <div className="feature-view" key={index}>
      <QRCode value={item.url} size={256} />
      <div className="feature-info">
        <div
          className="feature-info-link"
          // style={{ color: isDark ? "#ffffffd9" : "" }}
        >
          {!isInputing && (
            <p
              onMouseEnter={() => setEditIconVisible(true)}
              onMouseLeave={() => setEditIconVisible(false)}
              className="qrcode-name"
              onClick={onNameClick}
            >
              {name ? name : "QR Name"}
              {/* {editIconVisible && <EditOutlined />} */}
              <EditOutlined />
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
              style={{
                // background: isDark ? "#1f1f1f" : "white",
                // color: isDark ? "#dddddd" : "rgba(0,0,0,.9)",
              }}
            />
          )}
          <div className={styles.description}>
            <p>
              {item.url}
            </p>
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
          <Button style={{ fontSize: "12px" }} size="small">
            Copy
          </Button>
          &nbsp;
          <Button style={{ fontSize: "12px" }} size="small">
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
