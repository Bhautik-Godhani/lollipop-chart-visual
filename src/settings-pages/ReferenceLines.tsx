/* eslint-disable max-lines-per-function */
import * as React from "react";
import AddReferenceLine from "./AddReferenceLine";
import {
  Row,
  Column,
  Footer,
  Button,
  IconButton,
  Separator,
  DraggableRows,
  SwitchOption,
  ConditionalWrapper,
  PopupModHeader,
} from "@truviz/shadow/dist/Components";
import { EditIcon, PlusIcon, ReferenceBandPlaceholderIcon, ReferenceLinePlaceholderIcon, ReferenceLinesIcon, TrashIcon } from "./SettingsIcons";
import { Visual } from "../visual";
import { IReferenceLineSettings } from "../visual-settings.interface";
import { ELineTypeTabs, EReferenceType, EXYAxisNames } from "../enum";
import { persistProperties } from "../methods/methods";
import { GetFormattedNumber } from "../methods/NumberFormat.methods";
import { isEmpty } from "lodash";

const ReferenceLines = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    closeCurrentSettingHandler,
    vizOptions,
  } = props;
  let _initialStates = vizOptions.formatTab[sectionName][propertyName];
  const DEFAULT_VALUE = [];

  try {
    _initialStates = JSON.parse(_initialStates);
    if (!Array.isArray(_initialStates)) {
      _initialStates = DEFAULT_VALUE;
    }
  } catch (e) {
    _initialStates = DEFAULT_VALUE;
  }

  const [initialStates, setInitialStates] = React.useState<IReferenceLineSettings[]>((shadow as Visual).referenceLinesData);

  const applyChanges = (configValues) => {
    persistProperties(shadow, sectionName, propertyName, configValues);
    // closeCurrentSettingHandler();
  };

  const [id, setId] = React.useState(null);
  const [deletedRuleId, setDeletedRuleId] = React.useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedLineType, setSelectedLineType] = React.useState(ELineTypeTabs.All);
  const [contentShown, setContentShown] = React.useState("homePage");

  const initAdd = () => {
    setContentShown(() => "form");
    setId(null);
    setIsDetailsOpen(true);
  };

  const initEdit = (index) => {
    setContentShown(() => "form");
    setId(index);
    setIsDetailsOpen(true);
  };

  const closeAddEdit = () => {
    setId(null);
    setIsDetailsOpen(false);
  };

  const onAdd = (details: IReferenceLineSettings) => {
    details.uid = new Date().getTime().toString();
    details.referenceType = selectedLineType as any;
    initialStates.push(details);
    setInitialStates([...initialStates]);
    applyChanges(initialStates);
    closeAddEdit();
  };

  const showConfirmPrompt = (index) => {
    setContentShown(() => "deletePage");
    setDeletedRuleId(index);
  };

  const onDelete = (index) => {
    initialStates.splice(index, 1);
    setInitialStates([...initialStates]);
    applyChanges(initialStates);
    closeAddEdit();
  };

  const onUpdate = (index, details) => {
    initialStates[index] = details;
    setInitialStates([...initialStates]);
    applyChanges(initialStates);
    closeAddEdit();
  };

  const mappedInitialState = React.useMemo(() => {
    return (initialStates || []).map((row: IReferenceLineSettings, rowIndex) => {
      let text;
      const isValue1TypeNumber = parseFloat(row.lineValue1.value).toString().length > 0 && parseFloat(row.lineValue1.value).toString() !== "NaN";
      const isValue2TypeNumber = parseFloat(row.lineValue2.value).toString().length > 0 && parseFloat(row.lineValue2.value).toString() !== "NaN";

      const getAxisName = (axis: EXYAxisNames) => {
        if (axis === EXYAxisNames.X && shadow.isHorizontalChart) {
          return EXYAxisNames.Y;
        }

        if (axis === EXYAxisNames.Y && shadow.isHorizontalChart) {
          return EXYAxisNames.X;
        }

        return axis;
      }

      if (row.referenceType === EReferenceType.REFERENCE_BAND) {
        text = `Band on ${getAxisName(row.lineValue1.axis)} ${row.lineValue1.type === "ranking" ? `at ranking from ${row.lineValue1.rank} 
        to ${row.lineValue2.rank}` : `at value from ${isValue1TypeNumber ? GetFormattedNumber(shadow, +row.lineValue1.value, shadow.numberSettings, undefined, true, true) : row.lineValue1.value} to ${isValue2TypeNumber ? GetFormattedNumber(shadow, +row.lineValue2.value, shadow.numberSettings, undefined, true, true) : row.lineValue2.value}`}`;
      } else {
        text = `Line on ${getAxisName(row.lineValue1.axis)} ${row.lineValue1.type === "ranking" ? `at ranking ${row.lineValue1.rank}` : `at value ${isValue1TypeNumber ? GetFormattedNumber(shadow, +row.lineValue1.value, shadow.numberSettings, undefined, true, true) : row.lineValue1.value}`}`;
      }

      return {
        name: rowIndex.toString(),
        row: row,
        displayContent: text,
        showContextMenu: true,
        contextMenuElement: [
          {
            icon: <EditIcon />,
            onClick: i => {
              initEdit(i);
            },
            toExecuteOnTitleClick: true,
          },
          {
            icon: <TrashIcon />,
            onClick: i => {
              showConfirmPrompt(i);
            },
          },
        ],
        id: rowIndex.toString(),
      };
    });
  }, [initialStates]);

  React.useEffect(() => {
    if (selectedLineType === ELineTypeTabs.All && initialStates.length === 0) {
      setSelectedLineType(() => ELineTypeTabs.Line);
    }
  }, [initialStates]);

  const LineTypeTabs = [
    {
      label: "Line",
      value: ELineTypeTabs.Line
    },
    {
      label: "Band",
      value: ELineTypeTabs.Band
    }
  ]

  if (initialStates.length > 0) {
    LineTypeTabs.unshift({
      label: "All",
      value: ELineTypeTabs.All
    })
  }

  React.useEffect(() => {
    setContentShown(() => "homePage");
  }, []);

  const filteredInitialStates = selectedLineType !== ELineTypeTabs.All ? initialStates.filter(d => d.referenceType === (selectedLineType as any)) : initialStates;
  const details: IReferenceLineSettings = typeof id === "number" ? filteredInitialStates[id] : {} as any;

  return (
    <>
      <ConditionalWrapper visible={contentShown === "deletePage" && mappedInitialState && mappedInitialState.length > 0}>
        <PopupModHeader
          title={"Reference Line/Band"}
          icon={ReferenceLinesIcon}
          closeSettingsPopup={closeCurrentSettingHandler}
        />

        <div className="section section-delete-alert">
          <img src={require("../../assets/icons/delete-alert-icon.svg")} />
          <p className="section-delete-alert-text">Delete the rule?</p>
          <p className="section-delete-alert-subtext">
            <span className="section-delete-alert-subtext-text">
              {mappedInitialState.length > 0 && mappedInitialState[deletedRuleId] && mappedInitialState[deletedRuleId].displayContent}
            </span>
          </p>
        </div>

        <div className={`config-btn-wrapper flex-end`}>
          <div className="btn-group">
            <Button text={"Yes"} variant={"secondary"} clickHandler={() => {
              onDelete(deletedRuleId);
              setContentShown(() => "homePage");
            }} />
            <Button
              text={"No"}
              variant={"primary"}
              clickHandler={() => {
                setContentShown(() => "homePage");
              }}
            />
          </div>
        </div>
      </ConditionalWrapper>

      <ConditionalWrapper visible={contentShown === "homePage"}>
        <PopupModHeader
          title={"Reference Line/Band"}
          icon={ReferenceLinesIcon}
          closeSettingsPopup={closeCurrentSettingHandler}
        />

        <Row>
          <Column>
            <SwitchOption
              value={selectedLineType}
              optionsList={LineTypeTabs}
              handleChange={(value) => {
                setSelectedLineType(() => value);
                setIsDetailsOpen(false);
              }}
            />
          </Column>
        </Row>

        <ConditionalWrapper visible={selectedLineType === ELineTypeTabs.All}>
          {!isDetailsOpen && initialStates.length > 0 && (
            <>
              <Row>
                <Column>
                  <DraggableRows data={mappedInitialState} setData={setInitialStates} />
                </Column>
              </Row>

              <Footer
                cancelButtonHandler={() => {
                  closeCurrentSettingHandler();
                }}
                cancelButtonText="CLOSE"
                isShowResetButton={false}
                isShowSaveButton={false}
              />
            </>
          )}

          {!isDetailsOpen && initialStates.length === 0 && (
            <Footer
              cancelButtonHandler={() => {
                closeCurrentSettingHandler();
              }}
              cancelButtonText="CLOSE"
              isShowResetButton={false}
              isShowSaveButton={false}
            />
          )}
        </ConditionalWrapper>

        <ConditionalWrapper visible={selectedLineType === ELineTypeTabs.Line}>
          {!isDetailsOpen && (initialStates.filter(d => d.referenceType === EReferenceType.REFERENCE_LINE)).length === 0 && (
            <>
              <Row>
                <Column style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <ReferenceLinePlaceholderIcon />
                </Column>
              </Row>

              <Row>
                <Column style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Button text="Add New Line" variant="primary" clickHandler={() => initAdd()} />
                </Column>
              </Row>

              <Footer
                cancelButtonHandler={() => {
                  closeCurrentSettingHandler();
                }}
                cancelButtonText="CLOSE"
                isShowResetButton={false}
                isShowSaveButton={false}
              />
            </>
          )}

          {
            !isDetailsOpen && (initialStates.filter(d => d.referenceType === EReferenceType.REFERENCE_LINE)).length > 0 && (
              <>
                <Row>
                  <Column>
                    <IconButton
                      text="Add New Reference Line"
                      icon={<PlusIcon fill="var(--blackColor)" />}
                      onClick={() => initAdd()}
                    />
                  </Column>
                </Row>
                <Separator />
                <Row>
                  <Column>
                    <DraggableRows data={mappedInitialState.filter(d => d.row.referenceType === EReferenceType.REFERENCE_LINE)} setData={setInitialStates} />
                  </Column>
                </Row>
                <Footer
                  cancelButtonHandler={() => {
                    closeCurrentSettingHandler();
                  }}
                  cancelButtonText="CLOSE"
                  isShowResetButton={false}
                  isShowSaveButton={false}
                />
              </>
            )
          }
        </ConditionalWrapper>

        <ConditionalWrapper visible={selectedLineType === ELineTypeTabs.Band}>
          {!isDetailsOpen && (initialStates.filter(d => d.referenceType === EReferenceType.REFERENCE_BAND)).length === 0 && (
            <>
              <Row>
                <Column style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <ReferenceBandPlaceholderIcon />
                </Column>
              </Row>

              <Row>
                <Column style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Button text="Add New Band" variant="primary" clickHandler={() => initAdd()} />
                </Column>
              </Row>

              <Footer
                cancelButtonHandler={() => {
                  closeCurrentSettingHandler();
                }}
                cancelButtonText="CLOSE"
                isShowResetButton={false}
                isShowSaveButton={false}
              />
            </>
          )}

          {
            !isDetailsOpen && (initialStates.filter(d => d.referenceType === EReferenceType.REFERENCE_BAND)).length > 0 && (
              <>
                <Row>
                  <Column>
                    <IconButton
                      text="Add New Reference Band"
                      icon={<PlusIcon fill="var(--blackColor)" />}
                      onClick={() => initAdd()}
                    />
                  </Column>
                </Row>
                <Separator />
                <Row>
                  <Column>
                    <DraggableRows data={mappedInitialState.filter(d => d.row.referenceType === EReferenceType.REFERENCE_BAND)} setData={setInitialStates} />
                  </Column>
                </Row>
                <Footer
                  cancelButtonHandler={() => {
                    closeCurrentSettingHandler();
                  }}
                  cancelButtonText="CLOSE"
                  isShowResetButton={false}
                  isShowSaveButton={false}
                />
              </>
            )
          }
        </ConditionalWrapper>
      </ConditionalWrapper>

      <ConditionalWrapper visible={contentShown === "form"}>
        <AddReferenceLine
          shadow={shadow}
          details={details}
          isLineUI={isEmpty(details) ? selectedLineType === ELineTypeTabs.Line : filteredInitialStates[id].referenceType === EReferenceType.REFERENCE_LINE}
          onAdd={onAdd}
          onUpdate={onUpdate}
          index={isEmpty(details) ? id : initialStates.findIndex(d => d.uid === details.uid)}
          closeAddEdit={closeAddEdit}
          closeCurrentSettingHandler={closeCurrentSettingHandler}
          vizOptions={vizOptions}
          handleChangeContent={setContentShown}
        />
      </ConditionalWrapper>
    </>
  );
};

export default ReferenceLines;
