import * as React from "react";
import { get, isEmpty } from "lodash";
import copy from "copy-to-clipboard";
import { Button, Column, ConditionalWrapper, Footer, IconButton, InputControl, Label, Quote, RadioOption, Row, Tab, Tabs } from "@truviz/shadow/dist/Components";
import { CopyExportIcon, GreenCheckmark, ImportSuccessfulUploadIcon, ImportUploadClose, ImportUploadIcon } from "./SettingsIcons";
import TooltipElement from "@truviz/shadow/dist/Components/Label/TooltipElement";

const ImportExport = ({ shadow, vizOptions, closeCurrentSettingHandler, compConfig: { sectionName, propertyName } }) => {
  const [notification, setNotification] = React.useState("");
  const initNotification = text => {
    setNotification(text);
    setTimeout(() => {
      setNotification("");
    }, 4000);
  };

  const initialState = vizOptions.formatTab[sectionName][propertyName];

  const [isThemeApplied, setIsThemeApplied] = React.useState(initialState === "THEME_APPLIED");

  const [showDownloadNote, setShowDownloadNote] = React.useState(false);

  const onDrop = React.useCallback(acceptedFiles => {
    const reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(acceptedFiles[0]);
  }, []);

  const onReaderLoad = event => {
    applyThemeJson(event.target.result);
  };

  const urlData = React.useMemo(() => {
    const config = get(vizOptions, "formatTab.config") || {};
    var jsonse = JSON.stringify(config);
    var blob = new Blob([jsonse], { type: "application/json" });
    return URL.createObjectURL(blob);
  }, [vizOptions.formatTab]);

  const jsonString = React.useMemo(() => {
    const config = get(vizOptions, "formatTab.config") || {};
    return JSON.stringify(config);
  }, [vizOptions.formatTab]);

  const applyThemeJson = json => {
    try {
      const obj = typeof json === "object" ? json : JSON.parse(json);
      const keys = Object.keys(get(vizOptions, "formatTab.config") || {});
      keys.forEach(el => {
        if (obj.hasOwnProperty(el)) {
          shadow.persistProperties("config", el, obj[el]);
        }
        else {
          throw "Invalid JSON file"
        }
      });
      initNotification("Theme applied successfully");
      shadow.persistProperties(sectionName, propertyName, "THEME_APPLIED");
      closeCurrentSettingHandler();
    } catch (e) {
      setDetails(s => ({ ...s, status: "FAILED" }));
      console.log("Error parsing file");
      shadow.persistProperties(sectionName, propertyName, "FAILED");
      initNotification("Error parsing file");
    }
  };

  const copyTheme = () => {
    const config = get(vizOptions, "formatTab.config") || {};
    copy(JSON.stringify(config));
    setCopyThemeText("Copied");
  };

  const downloadTheme = () => {
    const config = get(vizOptions, "formatTab.config") || {};

    shadow.downloadService.exportVisualsContentExtended(JSON.stringify(config), "Theme.json", "json", "xlsx file").then((result) => {
      if (!result.downloadCompleted) {
        setShowDownloadNote(true);
      }
    }).catch((e) => {
      console.log(e);
    });
  }

  const [copyThemeText, setCopyThemeText] = React.useState("Copy");

  const [details, setDetails] = React.useState({
    view: "import",
    value: "",
    status: "INIT",
  });

  const hiddenFileInput = React.useRef(null);

  const [selectedTab, setSelectedTab] = React.useState("import");

  React.useEffect(() => {
    setCopyThemeText("Copy");
  }, [selectedTab]);

  const changeValue = v => setDetails(s => ({ ...s, ...v }));

  const IMPORT_OPTIONS = [
    {
      value: "import",
      label: "Import",
    },
    {
      value: "paste",
      label: "Paste",
    },
  ];

  const uploadHandler = e => {
    const file = get(e, "target.files");
    fileHandler(file);
  };

  const fileHandler = file => {
    if (isEmpty(file)) {
      changeValue({ value: "", status: "FAILED" });
      return;
    }
    if (file && file[0]) {
      var reader = new FileReader();
      reader.onload = function (event) {
        try {
          const val = JSON.parse(event.target.result as any);
          changeValue({ value: val, status: "VALID" });
        } catch (e) {
          changeValue({ value: "", status: "FAILED" });
        }
      };
      reader.readAsText(file[0]);
    }
  };

  const changeView = v =>
    setDetails(s => ({
      ...s,
      value: "",
      status: "INIT",
      view: v,
    }));

  const clearUploadStatus = () => {
    setDetails({
      view: "import",
      value: "",
      status: "INIT",
    });
  };

  const handleUploadClick = event => {
    hiddenFileInput.current.click();
  };

  return (
    <>
      <Row>
        <Column>
          <Tabs selected={selectedTab} onChange={tab => setSelectedTab(tab)}>
            <Tab identifier="import" title="Import">
              {
                isThemeApplied ? <ThemeAlreadyApplied onUploadNew={() => setIsThemeApplied(false)} /> :
                  <>
                    <Row>
                      <Column>
                        <RadioOption
                          value={details.view}
                          optionsList={IMPORT_OPTIONS}
                          handleChange={value => changeView(value)}
                        />
                      </Column>
                    </Row>

                    <ConditionalWrapper visible={details.view === "import"}>
                      <Row>
                        <Column>
                          <div className="theme-import-upload">
                            {details.status !== "VALID" && (
                              <>
                                <ImportUploadIcon />
                                <div>
                                  <Button clickHandler={handleUploadClick} text="Upload" variant="primary" />
                                  <input
                                    type="file"
                                    ref={hiddenFileInput}
                                    onChange={uploadHandler}
                                    style={{ display: "none" }}
                                    accept="application/json"
                                  />
                                </div>
                              </>
                            )}

                            {details.status === "VALID" && (
                              <>
                                <div className="theme-import-upload-success">
                                  <div className="theme-import-upload-success-close" onClick={clearUploadStatus}>
                                    <ImportUploadClose />
                                  </div>
                                  <ImportSuccessfulUploadIcon />
                                </div>

                                <div className="theme-import-upload-label">
                                  <Label text="File Uploaded Successfully." />
                                </div>
                              </>
                            )}

                            {details.status === "FAILED" && (
                              <div className="theme-import-upload-label">
                                <Label text="Import Failed. Please try again with a valid file." appearance="error" textEllipsis={false} />
                              </div>
                            )}
                          </div>
                        </Column>
                      </Row>
                    </ConditionalWrapper>

                    <ConditionalWrapper visible={details.view === "paste"}>
                      <Row>
                        <Column>
                          <InputControl
                            type="textarea"
                            value={details.value}
                            handleChange={(value: any) => {
                              changeValue({ value });
                            }}
                            rows={17}
                            placeholder="Paste the JSON here.."
                          />
                          {details.status === "FAILED" && (
                            <div className="theme-import-upload-label">
                              <Label text="Import Failed." appearance="error" />
                              <Label text="Please try again with a valid file." appearance="error" />
                            </div>
                          )}
                        </Column>
                      </Row>
                    </ConditionalWrapper>
                  </>
              }
            </Tab>
            <Tab identifier="export" title="Export">
              <Row>
                <Column>
                  <IconButton text={copyThemeText} icon={copyThemeText === "Copy" ? <CopyExportIcon fill="var(--blackColor)" /> : <GreenCheckmark fill="var(--blackColor)" />} onClick={copyTheme} style={{ flexDirection: "row-reverse" }} iconStyle={{ marginLeft: 0, marginRight: "8px" }} />
                </Column>
                <Column style={{ display: "flex", justifyContent: "flex-end" }}>
                  <TooltipElement tooltip={showDownloadNote ? 'Right click and select "Save link as" to download' : ''} style={{ textAlign: "left" }} alignTooltipTextTo="left">
                    {!shadow.isPowerBIDesktop && <a href={urlData} download={"export.json"} onClick={() => downloadTheme()} className="export-to-file-link">
                      EXPORT
                    </a>}
                  </TooltipElement>
                </Column>
              </Row>

              <Row>
                <Column>
                  <div className="theme-export-modal-code">
                    <pre>{jsonString}</pre>
                  </div>
                </Column>
              </Row>

              {/* <Row>
                <Column>
                  <div className="export-to-file">
                    <a href={urlData} download={"export.json"} className="export-to-file-link">
                      Export
                    </a>
                    <Button text={"Download Theme"} clickHandler={downloadTheme} />
                    <span className="export-to-file-subtext">Right click {`>`} “Save Link As...“ to download</span>
                  </div>
                </Column>
              </Row> */}

              {showDownloadNote &&
                <Row>
                  <Column>
                    <Quote>
                      <strong>Note:</strong> It's not possible to save files directly from Power BI Visuals, but this dialog will assist you with producing a valid JSON template that you can copy/paste and save elsewhere for others to use
                    </Quote>
                  </Column>
                </Row>
              }
            </Tab>
          </Tabs>
        </Column>
      </Row>

      {selectedTab === "import" && (
        <Footer
          cancelButtonHandler={closeCurrentSettingHandler}
          saveButtonConfig={{
            isDisabled: false,
            text: "IMPORT",
            handler: () => applyThemeJson(details.value)
          }}
          resetButtonHandler={() => {
            setIsThemeApplied(false);
          }}
        />
      )}

      {selectedTab === "export" && (
        <Footer cancelButtonHandler={closeCurrentSettingHandler} isShowSaveButton={false}
          resetButtonHandler={() => {
            setIsThemeApplied(false);
          }}
        />
      )}
    </>
    // <div>
    //   <div className="mb-10 export-import-container">
    //     <button className={`mb-10 btn-primary btn`} {...getRootProps()}>
    //       <input {...getInputProps()} />
    //       Import Theme (JSON)
    //     </button>
    //     <div className="export-import-container-export">
    //       <a href={urlData} download={"export.json"} className="export-import-container-export-link mb-10">
    //         Export Theme (JSON)
    //       </a>
    //       <div className="export-import-container-export-text">Right Click {`>`} "Save link as..." to download</div>
    //     </div>
    //   </div>
    //   <div className="mb-10" style={{color: "#ffffff"}}>
    //     {notification}
    //   </div>
    // </div>
  );
};
export default ImportExport;


const ThemeAlreadyApplied = ({ onUploadNew }) => {
  return <Row>
    <Column>
      <div style={{
        padding: "60px 0",
        border: "1px solid var(--bordersColor)",
        borderRadius: "4px",
        display: 'flex',
        flexDirection: "column",
        alignItems: 'center',
      }}>
        <svg style={{ marginTop: 'auto', marginBottom: '10px' }} width="44" height="48" viewBox="0 0 44 48" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M18.1315 19.8631C18.704 19.5784 19.3513 19.418 20.0366 19.418H34.1327C36.4682 19.418 38.3616 21.2809 38.3616 23.5789V34.6749C38.3616 36.973 36.4682 38.8359 34.1327 38.8359H29.3202C29.5772 37.9419 29.7534 37.0145 29.8407 36.0619H34.1327C34.9112 36.0619 35.5423 35.4409 35.5423 34.6749V30.5139H29.3202C29.0422 29.5468 28.6697 28.6187 28.2132 27.7399H35.5423V23.5789C35.5423 22.8129 34.9112 22.192 34.1327 22.192H24.2654V22.9053C22.5051 21.4748 20.4183 20.4193 18.1315 19.8631ZM12.9886 19.4802C12.0204 19.566 11.0779 19.7394 10.1693 19.9923V5.54799C10.1693 2.48392 12.6938 0 15.8078 0H28.7361C29.8577 0 30.9333 0.438389 31.7264 1.21873L42.7614 12.0767C43.5545 12.8571 44 13.9154 44 15.019V38.8359C44 41.9 41.4756 44.3839 38.3616 44.3839H26.3597C27.0747 43.532 27.6975 42.6024 28.2132 41.6099H38.3616C39.9186 41.6099 41.1808 40.3679 41.1808 38.8359V16.644H31.3135C28.978 16.644 27.0847 14.781 27.0847 12.483V2.77399H15.8078C14.2508 2.77399 12.9886 4.01595 12.9886 5.54799V19.4802ZM31.3135 13.87H40.5969L29.9039 3.34851V12.483C29.9039 13.249 30.535 13.87 31.3135 13.87ZM4.01069 44.0536C-1.3369 38.7918 -1.3369 30.2608 4.01069 24.999C9.35828 19.7372 18.0284 19.7372 23.376 24.999C28.7236 30.2608 28.7236 38.7918 23.376 44.0536C18.0284 49.3154 9.35828 49.3154 4.01069 44.0536ZM19.2686 28.476C19.8935 27.8413 20.9065 27.8413 21.5314 28.476C22.1562 29.1106 22.1562 30.1394 21.5314 30.7741L11.9314 40.524C11.3065 41.1586 10.2935 41.1586 9.66863 40.524L6.46863 37.2741C5.84379 36.6394 5.84379 35.6106 6.46863 34.976C7.09347 34.3414 8.10653 34.3414 8.73137 34.976L10.8 37.0769L19.2686 28.476Z" fill="#4C9E72" />
        </svg>
        <Label text="Theme is applied" />
        <div className={`btn-primary`}
          style={{
            color: "var(--blackColor)",
            backgroundColor: "#E8CA3B",
            padding: "6px 12px",
            fontWeight: 500,
            fontSize: "11px",
            borderRadius: "4px",
            border: "none",
            textTransform: "uppercase",
            cursor: "pointer",
            marginBottom: 'auto'
          }}
          onClick={() => onUploadNew()}
        >
          Upload New Theme
        </div>
      </div>
    </Column>
  </Row>
}