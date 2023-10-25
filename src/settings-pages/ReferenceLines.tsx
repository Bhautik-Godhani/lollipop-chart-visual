import { faGripVertical, faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { EReferenceLineComputation, EReferenceLinesType, EXYAxisNames } from "../enum";
import AddReferenceLine from "./AddReferenceLine";
import * as d3 from "d3";
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

const ReferenceLines = (props) => {
  const {
    shadow,
    compConfig: { sectionName, propertyName },
    closeCurrentSettingHandler,
    vizOptions,
  } = props;
  let _initialStates = vizOptions.formatTab[sectionName][propertyName];
  const DEFAULT_VALUE = [];
  const [dragId, setDragId] = React.useState(-1);

  const SingleBox = ({ initEdit, el, removeReferenceLine, i, handleDrag, handleDrop }) => {
    return (
      <div
        className="reference-line-desc-container-all"
        onClick={() => {
          initEdit(i);
        }}
        data-id={i}
        onDragOver={(ev) => ev.preventDefault()}
        onDragStart={handleDrag}
        onDrop={handleDrop}
        draggable={true}
      >
        <FontAwesomeIcon icon={faGripVertical} color="#f1c912" style={{ marginRight: "10px" }} />
        <div className="reference-line-desc-container">
          <div className="reference-line-desc-container-text">
            Reference line on {el.axis} Axis at {getValue(el)}
            {el.type === "value"
              ? `value ${parseFloat(el.value)?.toFixed(2)}`
              : `index ${el.rank} from ${el.rankOrder}`}
          </div>
          <div className="reference-line-desc-container-icons">
            <FontAwesomeIcon icon={faPencilAlt} color="#f1c912" style={{ marginLeft: "10px", fontSize: "16px" }} />
            <FontAwesomeIcon
              icon={faTrash}
              color="#f1c912"
              style={{ marginLeft: "10px", fontSize: "16px" }}
              onClick={(e) => {
                e.stopPropagation();
                removeReferenceLine(e, i);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const getValue = (rLine: IReferenceLinesSettings): void => {
    if (rLine.type === EReferenceLinesType.Value && rLine.axis === EXYAxisNames.Y) {
      let values = [];

      const isSubCategoryMeasure = shadow.categoricalSubCategoriesList.includes(rLine.measureName);
      const isCategoricalReferenceLinesMeasure = shadow.categoricalReferenceLinesNames.includes(rLine.measureName);

      if (isSubCategoryMeasure && shadow.isHasSubcategories) {
        const measureIndex = shadow.chartData[0].subCategories.findIndex((s) => s.category === rLine.measureName);
        values = shadow.chartData.map((d) => d.subCategories[measureIndex].value);
      }

      if (isCategoricalReferenceLinesMeasure) {
        const referenceLineData = shadow.categoricalReferenceLinesValues.filter(
          (d) => d.source.displayName === rLine.measureName
        );
        values = referenceLineData.reduce((arr, cur) => [...arr, ...cur.values], []);
      }

      if (!isSubCategoryMeasure && !isCategoricalReferenceLinesMeasure) {
        values = shadow.chartData.map((d) => d.value);
      }

      switch (rLine.computation) {
        case EReferenceLineComputation.Min:
          rLine.value = d3.min(values, (d: any) => d) + "";
          break;
        case EReferenceLineComputation.Max:
          rLine.value = d3.max(values, (d: any) => d) + "";
          break;
        case EReferenceLineComputation.Average:
          rLine.value = d3.mean(values, (d: any) => d) + "";
          break;
        case EReferenceLineComputation.Median:
          rLine.value = d3.median(values, (d: any) => d) + "";
          break;
        case EReferenceLineComputation.Fixed:
          rLine.value = rLine.value;
          break;
      }
    } else {
      rLine.value = rLine.value;
    }
  };

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

  const removeReferenceLine = (e, index) => {
    e.stopPropagation();
    onDelete(index);
  };

  const handleDrag = (ev) => {
    setDragId(ev.currentTarget.getAttribute("data-id"));
  };

  const handleDrop = (ev) => {
    const idOfDroppedBox = +dragId;
    const idOfDroppedOnBox = +ev.currentTarget.getAttribute("data-id");
    setInitialStates((d) => {
      const newState = [...d];
      const elementToBeMoved = newState[idOfDroppedBox];

      if (idOfDroppedBox > idOfDroppedOnBox) {
        newState.splice(idOfDroppedBox, 1);
        newState.splice(idOfDroppedOnBox, 0, elementToBeMoved);
      } else {
        newState.splice(idOfDroppedOnBox + 1, 0, elementToBeMoved);
        newState.splice(idOfDroppedBox, 1);
      }

      applyChanges([...newState]);
      return [...newState];
    });
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
      {!isDetailsOpen && initialStates.length === 0 && (
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

      {!isDetailsOpen && initialStates.length > 0 && (
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
      )}

      {isDetailsOpen && (
        <>
          <AddReferenceLine
            shadow={shadow}
            details={typeof id === "number" ? initialStates[id] : {}}
            onAdd={onAdd}
            onDelete={onDelete}
            onUpdate={onUpdate}
            index={id}
            closeCurrentSettingHandler={closeAddEdit}
            vizOptions={vizOptions}
          />
        </>
      )}
    </>
  );
};

export default ReferenceLines;
