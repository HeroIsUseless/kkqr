"use client";
import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { QRCodeSVG } from "qrcode.react";
import "./index.css";
import { loadFromLocalStore, saveToLocalStore } from "./localStore";
import { Res, changeOneResName, useHooks, showToast } from "./useHooks";
import styles from "../app/page.module.css";

export const QrCode = () => {
  const { text, setText, ress, setRess, bottomDivRef, onGenBtnClick } =
    useHooks();
  const [helpModalVisible, setHelpModalVisible] = React.useState(false);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <h1>History QR Code</h1>
        <button
          onClick={() => setHelpModalVisible(true)}
          className="icon-button"
          aria-label="Help"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </button>
      </div>

      <Transition appear show={helpModalVisible} as={React.Fragment}>
        <Dialog
          as="div"
          className="modal-overlay"
          onClose={() => setHelpModalVisible(false)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="modal-backdrop" />
          </Transition.Child>

          <div className="modal-container">
            <div className="modal-inner">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="modal-panel">
                  <Dialog.Title as="h3" className="modal-title">
                    二维码生成器使用帮助
                  </Dialog.Title>
                  <div className="modal-content">
                    <p>
                      <strong>如何使用二维码生成器：</strong>
                    </p>
                    <ol>
                      <li>在输入框中输入URL或文本</li>
                      <li>点击Create QR Code按钮生成二维码</li>
                      <li>生成的二维码将显示在下方</li>
                      <li>点击二维码可查看更大尺寸</li>
                      <li>您可以重命名、删除、复制或下载您的二维码</li>
                      <li>
                        所有二维码都保存在浏览器本地，下次访问时仍然可用。
                      </li>
                    </ol>
                    <p>v1.0.1</p>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => setHelpModalVisible(false)}
                    >
                      关闭
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <br />
      <div className="fragment">
        <div className="top-view" style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              minHeight: "256px",
            }}
          >
            <textarea
              rows={10}
              placeholder="Please input QR link"
              maxLength={1000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="textarea"
              style={{ flex: 1 }}
            />
            <button onClick={onGenBtnClick} className="button button-primary">
              Create QR Code
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "256px",
            }}
          >
            {text && <QRCodeSVG value={text} size={256} />}
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
  ress: Res[];
  setRess: Function;
}) => {
  const { item, index } = props;
  const [isInputing, setIsInputing] = React.useState(false);
  const [name, setName] = React.useState(item.name);
  const [editIconVisible, setEditIconVisible] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const onPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      let inputText = (e.target as HTMLInputElement).value;
      if (!inputText) {
        inputText = "";
      }
      setEditIconVisible(false);
      setName(inputText || name);
      changeOneResName(item.id, inputText);
      setIsInputing(false);
    }
  };

  const onDelBtnClick = () => {
    const newRess = props.ress.filter((res) => res.id !== props.item.id);
    props.setRess(newRess);
    saveToLocalStore("fragment-qrcode-res", JSON.stringify(newRess));
  };

  const onCopyBtnClick = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      showToast("Link copied to clipboard", "success");
    } catch (error) {
      showToast("Failed to copy link", "error");
    }
  };

  const onDownloadBtnClick = () => {
    const svg = document.querySelector(
      `#qrcode-${item.id} svg`
    ) as SVGElement;
    if (svg) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `${name || "qrcode"}-${item.id}.png`;
        link.href = url;
        link.click();
        showToast("QR Code downloaded", "success");
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    } else {
      showToast("Failed to download QR Code", "error");
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
        onClick={() => setIsModalOpen(true)}
        style={{
          cursor: "pointer",
          position: "relative",
        }}
      >
        <div
          id={`qrcode-${item.id}`}
          style={{
            filter: editIconVisible ? "none" : "blur(9px)",
            transition: "filter 0.3s ease",
          }}
        >
          <QRCodeSVG value={item.url} size={256} />
        </div>
      </div>

      <Transition appear show={isModalOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="modal-overlay"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="modal-backdrop" />
          </Transition.Child>

          <div className="modal-container modal-fullscreen">
            <div className="modal-inner">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="modal-panel modal-panel-fullscreen">
                  <Dialog.Title as="h3" className="modal-title">
                    {name || "QR Code"}
                  </Dialog.Title>
                  <div className="modal-content modal-content-center">
                    <QRCodeSVG value={item.url} size={500} />
                    <p
                      style={{
                        marginTop: "20px",
                        wordBreak: "break-all",
                        textAlign: "center",
                      }}
                    >
                      {item.url}
                    </p>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => setIsModalOpen(false)}
                    >
                      关闭
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <div className="feature-info">
        <div className="feature-info-link">
          {!isInputing && (
            <p className="qrcode-name" onClick={() => setIsInputing(true)}>
              {name ? name : "QR Name"}
              {editIconVisible && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="inline-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              )}
            </p>
          )}
          {isInputing && (
            <input
              type="text"
              onKeyDown={onPressEnter}
              defaultValue={name}
              autoFocus={true}
              placeholder="Please input QR name, press enter to save"
              className="input qrcode-input"
            />
          )}
          <div className={styles.description} style={{ marginTop: "4px" }}>
            <p>{item.url}</p>
          </div>
        </div>
        <div className="button-group">
          <button className="button button-small" onClick={onDelBtnClick}>
            Delete
          </button>
          <button className="button button-small" onClick={onCopyBtnClick}>
            Copy
          </button>
          <button className="button button-small" onClick={onDownloadBtnClick}>
            Download
          </button>
        </div>
        <div className="feature-info-time">create at {item.time}</div>
      </div>
    </div>
  );
};
