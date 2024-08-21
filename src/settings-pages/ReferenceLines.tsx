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
import { GetFormattedNumber } from "../methods/NumberFormat.methods";
import { isEmpty } from "lodash";

const UIDeletePage = (contentShown, mappedInitialState, deletedRuleId, setContentShown, closeCurrentSettingHandler, initialStates, setInitialStates: any, applyChanges: any, closeAddEdit: any) => {
  return <>
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
            onDelete(deletedRuleId, initialStates, setInitialStates, applyChanges, closeAddEdit);
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
  </>
}

const UIHomePage = (contentShown, closeCurrentSettingHandler, selectedLineType, setSelectedLineType, setIsDetailsOpen, isDetailsOpen, initialStates,
  mappedInitialState, setInitialStates, setContentShown, setId
) => {
  const LineTypeTabs = getLineTypeTabs(initialStates);
  return <>
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

      {UILineBand(selectedLineType, isDetailsOpen, initialStates, mappedInitialState, setInitialStates, closeCurrentSettingHandler, setContentShown, setId, setIsDetailsOpen)}
    </ConditionalWrapper>
  </>
}

const UILineBand = (selectedLineType, isDetailsOpen, initialStates, mappedInitialState, setInitialStates, closeCurrentSettingHandler, setContentShown: any, setId: any, setIsDetailsOpen: any) => {
  return <>
    <ConditionalWrapper visible={selectedLineType === ELineTypeTabs.Line}>
      {!isDetailsOpen && (initialStates.filter(d => d.referenceType === EReferenceType.REFERENCE_LINE)).length === 0 && (
        <>
          <Row>
            <Column style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "12px" }}>
              <ReferenceLinePlaceholderIcon />
            </Column>
          </Row>

          <Row>
            <Column style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Button text="Add New Line" variant="primary" clickHandler={() => initAdd(setContentShown, setId, setIsDetailsOpen)} />
            </Column>
          </Row>

          {UIFooter(closeCurrentSettingHandler)}
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
                  onClick={() => initAdd(setContentShown, setId, setIsDetailsOpen)}
                />
              </Column>
            </Row>
            <Separator />
            <Row>
              <Column>
                <DraggableRows data={mappedInitialState.filter(d => d.row.referenceType === EReferenceType.REFERENCE_LINE)} setData={setInitialStates} />
              </Column>
            </Row>
            {UIFooter(closeCurrentSettingHandler)}
          </>
        )
      }
    </ConditionalWrapper>

    <ConditionalWrapper visible={selectedLineType === ELineTypeTabs.Band}>
      {!isDetailsOpen && (initialStates.filter(d => d.referenceType === EReferenceType.REFERENCE_BAND)).length === 0 && (
        <>
          <Row>
            <Column style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "12px" }}>
              <ReferenceBandPlaceholderIcon />
            </Column>
          </Row>

          <Row>
            <Column style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Button text="Add New Band" variant="primary" clickHandler={() => initAdd(setContentShown, setId, setIsDetailsOpen)} />
            </Column>
          </Row>

          {UIFooter(closeCurrentSettingHandler)}
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
                  onClick={() => initAdd(setContentShown, setId, setIsDetailsOpen)}
                />
              </Column>
            </Row>
            <Separator />
            <Row>
              <Column>
                <DraggableRows data={mappedInitialState.filter(d => d.row.referenceType === EReferenceType.REFERENCE_BAND)} setData={setInitialStates} />
              </Column>
            </Row>

            {UIFooter(closeCurrentSettingHandler)}
          </>
        )
      }
    </ConditionalWrapper>
  </>
}

const initAdd = (setContentShown, setId, setIsDetailsOpen) => {
  setContentShown(() => "form");
  setId(null);
  setIsDetailsOpen(true);
};

const initEdit = (index, setContentShown, setId, setIsDetailsOpen) => {
  setContentShown(() => "form");
  setId(index);
  setIsDetailsOpen(true);
};

const closeAddEdit = (setId, setIsDetailsOpen) => {
  setId(null);
  setIsDetailsOpen(false);
};

const onAdd = (details: IReferenceLineSettings, selectedLineType, initialStates, setInitialStates, applyChanges, closeAddEdit) => {
  details.uid = new Date().getTime().toString();
  details.referenceType = selectedLineType as any;
  initialStates.push(details);
  setInitialStates([...initialStates]);
  applyChanges(initialStates);
  closeAddEdit();
};

const showConfirmPrompt = (index, setContentShown, setDeletedRuleId) => {
  setContentShown(() => "deletePage");
  setDeletedRuleId(index);
};

const onDelete = (index, initialStates, setInitialStates, applyChanges, closeAddEdit) => {
  initialStates.splice(index, 1);
  setInitialStates([...initialStates]);
  applyChanges(initialStates);
  closeAddEdit();
};

const onUpdate = (index, details, initialStates, setInitialStates, applyChanges, closeAddEdit) => {
  initialStates[index] = details;
  setInitialStates([...initialStates]);
  applyChanges(initialStates);
  closeAddEdit();
};

const UIFooter = (closeCurrentSettingHandler: () => void) => {
  return (
    <Footer
      cancelButtonHandler={() => {
        closeCurrentSettingHandler();
      }}
      cancelButtonText="CLOSE"
      isShowResetButton={false}
      isShowSaveButton={false}
    />
  );
};

const UIForm = (vizOptions, contentShown, shadow, details, selectedLineType, filteredInitialStates, id, initialStates, closeCurrentSettingHandler, setContentShown) => {
  return <>
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
}

const getLineTypeTabs = (initialStates) => {
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

  return LineTypeTabs;
}


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
    shadow.persistProperties(sectionName, propertyName, configValues);
    // closeCurrentSettingHandler();
  };

  const [id, setId] = React.useState(null);
  const [deletedRuleId, setDeletedRuleId] = React.useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedLineType, setSelectedLineType] = React.useState(ELineTypeTabs.All);
  const [contentShown, setContentShown] = React.useState("homePage");

  const mappedInitialState = React.useMemo(() => {
    return (initialStates || []).map((row: IReferenceLineSettings, rowIndex) => {
      let text;
      let isValue1TypeNumber = parseFloat(row.lineValue1.value).toString().length > 0 && parseFloat(row.lineValue1.value).toString() !== "NaN";

      if (shadow.isHorizontalChart) {
        if (row.lineValue1.axis === EXYAxisNames.Y && shadow.isDateCategoryNames) {
          isValue1TypeNumber = false;
        }
      } else {
        if (row.lineValue1.axis === EXYAxisNames.X && shadow.isDateCategoryNames) {
          isValue1TypeNumber = false;
        }
      }

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
        text = `Band on ${getAxisName(row.lineValue1.axis)}-Axis ${row.lineValue1.type === "ranking" ? `at ranking from ${row.lineValue1.rank} 
        to ${row.lineValue2.rank}` : `at value from ${isValue1TypeNumber ? GetFormattedNumber(shadow, +row.lineValue1.value, shadow.numberSettings, undefined, true, true) : shadow.getTooltipCategoryText(row.lineValue1.value)} to ${isValue2TypeNumber ? GetFormattedNumber(shadow, +row.lineValue2.value, shadow.numberSettings, undefined, true, true) : shadow.getTooltipCategoryText(row.lineValue2.value)}`}`;
      } else {
        text = `Line on ${getAxisName(row.lineValue1.axis)}-Axis ${row.lineValue1.type === "ranking" ? `at ranking ${row.lineValue1.rank}` : `at value ${isValue1TypeNumber ? GetFormattedNumber(shadow, +row.lineValue1.value, shadow.numberSettings, undefined, true, true) : shadow.getTooltipCategoryText(row.lineValue1.value)}`}`;
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
              initEdit(i, setContentShown, setId, setIsDetailsOpen);
            },
            toExecuteOnTitleClick: true,
          },
          {
            icon: <TrashIcon />,
            onClick: i => {
              showConfirmPrompt(i, setContentShown, setDeletedRuleId);
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

  React.useEffect(() => {
    setContentShown(() => "homePage");
  }, []);

  const filteredInitialStates = selectedLineType !== ELineTypeTabs.All ? initialStates.filter(d => d.referenceType === (selectedLineType as any)) : initialStates;
  const details: IReferenceLineSettings = typeof id === "number" ? filteredInitialStates[id] : {} as any;

  return (
    <>
      {UIDeletePage(contentShown, mappedInitialState, deletedRuleId, setContentShown, closeCurrentSettingHandler, initialStates, setInitialStates, applyChanges, closeAddEdit)}
      {UIHomePage(contentShown, closeCurrentSettingHandler, selectedLineType, setSelectedLineType, setIsDetailsOpen, isDetailsOpen, initialStates, mappedInitialState, setInitialStates, setContentShown, setId)}
      {UIForm(vizOptions, contentShown, shadow, details, selectedLineType, filteredInitialStates, id, initialStates, closeCurrentSettingHandler, setContentShown)}
    </>
  );
};

export default ReferenceLines;
