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
import { IReferenceLinesSettings } from "../visual-settings.interface";
import { EditIcon, PlusIcon, ReferenceLinePlaceholderIcon, TrashIcon } from "./SettingsIcons";
import { Visual } from "../visual";
import { ShadowUpdateOptions } from "@truviz/shadow/dist/types/ShadowUpdateOptions";

const UIReferenceLines = (
  shadow: Visual,
  vizOptions: ShadowUpdateOptions,
  id: number,
  isDetailsOpen: boolean,
  initialStates: IReferenceLinesSettings[],
  mappedInitialState: any[],
  initAdd: (...args: any) => any,
  onAdd: (...args: any) => any,
  onUpdate: (...args: any) => any,
  closeAddEdit: (...args: any) => any,
  closeCurrentSettingHandler: (...args: any) => any,
  setInitialStates: React.Dispatch<React.SetStateAction<IReferenceLinesSettings>>
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
                text="Add New Reference Line"
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

  const [initialStates, setInitialStates] = React.useState(_initialStates);

  const applyChanges = (configValues) => {
    shadow.persistProperties(sectionName, propertyName, configValues);
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
    return (initialStates || []).map((row, rowIndex) => {
      const text = `Line on ${row.axis} ${row.type === "ranking" ? `at ranking ${row.rank}` : `at value ${row.value}`}`;
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
