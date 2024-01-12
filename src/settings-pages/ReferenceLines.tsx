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
} from "@truviz/shadow/dist/Components";
import { EditIcon, PlusIcon, ReferenceLinePlaceholderIcon, TrashIcon } from "./SettingsIcons";
import { Visual } from "../visual";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";
import { IReferenceLineSettings } from "../visual-settings.interface";
import { EReferenceType } from "../enum";
import { persistProperties } from "../methods/methods";
import { GetFormattedNumber } from "../methods/NumberFormat.methods";

const UIReferenceLines = (
  shadow: Visual,
  vizOptions: ShadowUpdateOptions,
  id: number,
  isDetailsOpen: boolean,
  initialStates: IReferenceLineSettings[],
  mappedInitialState: any[],
  initAdd: (...args: any) => any,
  onAdd: (...args: any) => any,
  onUpdate: (...args: any) => any,
  closeAddEdit: (...args: any) => any,
  closeCurrentSettingHandler: (...args: any) => any,
  setInitialStates: React.Dispatch<React.SetStateAction<IReferenceLineSettings[]>>
) => {
  return <>
    {
      !isDetailsOpen && initialStates.length === 0 && (
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
      )
    }

    {
      !isDetailsOpen && initialStates.length > 0 && (
        <>
          <Row>
            <Column>
              <IconButton
                text="Add New Reference Line/Band"
                icon={<PlusIcon fill="var(--blackColor)" />}
                onClick={() => initAdd()}
              />
            </Column>
          </Row>
          <Separator />
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
      )
    }

    {
      isDetailsOpen && (
        <>
          <AddReferenceLine
            shadow={shadow}
            details={typeof id === "number" ? initialStates[id] : {}}
            onAdd={onAdd}
            onUpdate={onUpdate}
            index={id}
            closeCurrentSettingHandler={closeAddEdit}
            vizOptions={vizOptions}
          />
        </>
      )
    }
  </>
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

  const [initialStates, setInitialStates] = React.useState((shadow as Visual).referenceLinesData);

  const applyChanges = (configValues) => {
    persistProperties(shadow, sectionName, propertyName, configValues);
    // closeCurrentSettingHandler();
  };

  const [id, setId] = React.useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const initAdd = () => {
    setId(null);
    setIsDetailsOpen(true);
  };
  const initEdit = (index) => {
    setId(index);
    setIsDetailsOpen(true);
  };

  const closeAddEdit = () => {
    setId(null);
    setIsDetailsOpen(false);
  };

  const onAdd = (details) => {
    initialStates.push(details);
    setInitialStates([...initialStates]);
    applyChanges(initialStates);
    closeAddEdit();
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

      if (row.referenceType === EReferenceType.REFERENCE_BAND) {
        text = `Band on ${row.lineValue1.axis} ${row.lineValue1.type === "ranking" ? `at ranking from ${row.lineValue1.rank} 
        to ${row.lineValue2.rank}` : `at value from ${isValue1TypeNumber ? GetFormattedNumber(+row.lineValue1.value, shadow.numberSettings, undefined, true) : row.lineValue1.value} to ${isValue2TypeNumber ? GetFormattedNumber(+row.lineValue2.value, shadow.numberSettings, undefined, true) : row.lineValue2.value}`}`;
      } else {
        text = `Line on ${row.lineValue1.axis} ${row.lineValue1.type === "ranking" ? `at ranking ${row.lineValue1.rank}` : `at value ${isValue1TypeNumber ? GetFormattedNumber(+row.lineValue1.value, shadow.numberSettings, undefined, true) : row.lineValue1.value}`}`;
      }

      return {
        name: rowIndex.toString(),
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
              onDelete(i);
            },
          },
        ],
        id: rowIndex.toString(),
      };
    });
  }, [initialStates]);

  return (
    <>
      {UIReferenceLines(shadow, vizOptions, id, isDetailsOpen, initialStates, mappedInitialState, initAdd, onAdd, onUpdate, closeAddEdit, closeCurrentSettingHandler, setInitialStates)}
    </>
  );
};

export default ReferenceLines;
