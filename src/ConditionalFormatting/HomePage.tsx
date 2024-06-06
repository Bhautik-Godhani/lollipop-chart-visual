import React, { useEffect } from "react";
import "./ConditionalFormatting.less";
import { rankingTypes } from "./ConditionRecord";
import { CopyIcon, DeleteIcon, EditIcon, PlusIcon, SixDot } from "../settings-pages/SettingsIcons";
import { Button, Column, PopupModHeader, Row, SwitchOption } from "@truviz/shadow/dist/Components";
import { categoryComparisionOptions, measureComparisionOptions } from "@truviz/shadow/dist/Components/Editor/constants";
import { Components } from "@truviz/shadow/dist/types/EditorTypes";
import { cloneDeep } from "lodash";

const GetActionMenuUI = (
  index: number,
  rule: any,
  activeMenuRowIndex: number,
  menuPosition: { x: number, y: number },
  setMenuPosition: React.Dispatch<React.SetStateAction<any>>,
  setActiveMenuRowIndex: React.Dispatch<React.SetStateAction<any>>,
  addRule: (...any) => any,
  editRule: (...any) => any,
  setRules: React.Dispatch<React.SetStateAction<any>>,
  setShowConfirmPrompt: (...any) => any
) => {
  return <div className={`context-menu-wrapper`}
    onClick={(e) => {
      setMenuPosition({ x: e.clientX, y: e.clientY });
      setActiveMenuRowIndex(index);
      e.stopPropagation();
    }}
  >
    <img src={require("../../assets/icons/context-menu-icon.svg")} alt="" />
    <div className="context-menu" style={{ left: menuPosition.x - 100, top: menuPosition.y, display: `${activeMenuRowIndex == index ? `flex` : `none`}` }}>
      <div className="context-menu-item edit-menu-item" onClick={() => { editRule(index); }}>
        <EditIcon
          style={{ marginRight: "10px", cursor: "pointer" }}
          fill="var(--activeIconsColor)"
        />
        Edit
      </div>
      <div className="context-menu-item delete-menu-item" onClick={(e) => {
        e.stopPropagation();
        setActiveMenuRowIndex(-1);
        const clonedRule = cloneDeep(rule);
        clonedRule.isDuplicateRule = true;
        addRule(clonedRule);
      }}>
        <CopyIcon
          style={{ marginRight: "10px", cursor: "pointer" }}
          fill="var(--activeIconsColor)"
        />
        Duplicate
      </div>
      <div className="context-menu-item delete-menu-item" onClick={(e) => {
        e.stopPropagation();
        setActiveMenuRowIndex(-1);
        setShowConfirmPrompt({ show: true, id: index })
      }}>
        <DeleteIcon
          style={{ marginRight: "10px", cursor: "pointer" }}
          fill="var(--activeIconsColor)"
        />
        Delete
      </div>
    </div>
  </div >
}

const RulesList = ({
  rules,
  addRule,
  setRules,
  createRule,
  handleDrag,
  handleDrop,
  editRule,
  setShowConfirmPrompt,
  closeCurrentSettingHandler,
  isSupportApplyOn,
  applyOnCategories
}) => {
  const [activeMenuRowIndex, setActiveMenuRowIndex] = React.useState(-1);
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveMenuRowIndex(-1);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  return (
    <>
      <div>
        <div
          className={"section section-separator section-pb section-add-button-wrapper clickable"}
        >
          <span className="section-add-button-wrapper-text">Add New Rule</span>
          <Button
            text={<PlusIcon fill="var(--blackColor" />}
            variant={"primary"}
            classNames={["btn-action", "section-add-button-wrapper-button"]}
            clickHandler={() => createRule()}
          />
        </div>
        <div className="section-draggable-rows section-conditional-formatting">
          {rules.map((rule, index) => {
            return (
              <div
                className={`draggable-row-container`}
                draggable={true}
                data-id={index}
                onDragOver={(ev) => ev.preventDefault()}
                onDragStart={handleDrag}
                onDrop={handleDrop}
              >
                <div className="draggable-row-wrapper">
                  <SixDot fill="#8a8a8a" style={{ minWidth: "6px", marginRight: "11px", cursor: "move" }} />
                  <div className="rule-title-wrapper">
                    <div className="rule-info">
                      <div className="rule-color" style={{ backgroundColor: rule.conditions[0].color }}></div>
                      {isSupportApplyOn && (
                        <div className="rule-count">{applyOnCategories.filter(element => rule.applyOnCategories.includes(element.value)).length}</div>
                      )}
                    </div>
                    <div className="draggable-row-wrapper-title" title={createRuleNameTitle(rule.conditions[0])}>
                      {RuleName(rule, rule.conditions[0])}
                    </div>
                  </div>

                  {GetActionMenuUI(index, rule, activeMenuRowIndex, menuPosition, setMenuPosition, setActiveMenuRowIndex, addRule, editRule, setRules, setShowConfirmPrompt)}

                </div>
              </div>
            );
          })}
        </div>
        <div className={`config-btn-wrapper flex-end`}>
          <div className="btn-group">
            <Button text={"Close"} variant={"secondary"} clickHandler={() => closeCurrentSettingHandler()} />
          </div>
        </div>
      </div >
    </>
  );
};


const EmptyRulesScreen = ({ createRule, closeCurrentSettingHandler }) => {
  return (
    <>
      <div className="section section-preview-image">
        <img src={require("../../assets/icons/preview-conditional-formatting.svg")} />
        <Button text={"Add New Rule"} variant={"primary"} clickHandler={() => createRule()} />
      </div>
      <div className={`config-btn-wrapper flex-end`}>
        <div className="btn-group">
          <Button text={"Cancel"} variant={"secondary"} clickHandler={() => closeCurrentSettingHandler()} />
          <Button text={"Save"} variant={"primary"} disabled={true} clickHandler={() => { }} />
        </div>
      </div>
    </>
  );
};

const deleteRuleHandler = (showConfirmPrompt: any, deleteRule: (...any) => any, setShowConfirmPrompt: (...any) => any) => {
  deleteRule(showConfirmPrompt.id);
  setShowConfirmPrompt({
    show: false,
    id: null,
  });
};

const handleDrag = (ev, setDragId: (...any) => any) => {
  setDragId(ev.currentTarget.getAttribute("data-id"));
};

const handleDrop = (ev, dragId: number, setRules: React.Dispatch<React.SetStateAction<any>>, updateRules: React.Dispatch<React.SetStateAction<any>>) => {
  const idOfDroppedBox = +dragId;
  const idOfDroppedOnBox = +ev.currentTarget.getAttribute("data-id");
  setRules((d) => {
    const newStateElements = [...d];
    const elementToBeMoved = newStateElements[idOfDroppedBox];

    if (idOfDroppedBox > idOfDroppedOnBox) {
      newStateElements.splice(idOfDroppedBox, 1);
      newStateElements.splice(idOfDroppedOnBox, 0, elementToBeMoved);
    } else {
      newStateElements.splice(idOfDroppedOnBox + 1, 0, elementToBeMoved);
      newStateElements.splice(idOfDroppedBox, 1);
    }
    updateRules(newStateElements);
    return newStateElements;
  });
};

const createRuleNameTitle = (condition) => {
  let title = '';
  if (condition.valueType === 'value') {
    title = condition.operator === '<>' ? `when Value from ${condition.staticValue} to ${condition.secondaryStaticValue}` : `when Value is ${measureComparisionOptions.find(d => d.value === condition.operator)?.label.split(') ')[1]} ${condition.staticValue}`
  } else if (condition.valueType === 'ranking') {
    title = `when Ranking is ${rankingTypes.find(d => d.value === condition.rankingType)?.kind} {condition.staticRankingValue}`
  } else if (condition.valueType === 'percent') {
    title = condition.operator === '<>' ? `when % from ${condition.staticPercentValue} to ${condition.secondaryStaticPercentValue}` : `when % is ${measureComparisionOptions.find(d => d.value === condition.operator)?.label.split(') ')[1]} ${condition.percentValue}`
  }
  return title;
}

function RuleName(rule, condition: any) {
  if (!rule.name.includes('CFR-')) {
    return <><span>{rule.name && rule.name.length > 30 ? rule.name.substring(0, 30) + '...' : rule.name}</span></>
  } else {
    return <>
      {!rule?.isEditableRuleName && (
        <>
          {condition.valueType === "value" && (
            <>
              <span> when </span>
              <span className="highlighted-text"> Value </span>
              {condition.operator === '<>' ?
                (
                  <>
                    <span> From </span>
                    <span className="highlighted-text">  {condition.staticValue} </span>
                    <span> to </span>
                    <span className="highlighted-text">  {condition.secondaryStaticValue} </span>
                  </>
                ) : (
                  <>
                    <span> {condition.applyTo === 'measure' ? measureComparisionOptions.find(d => d.value === condition.operator).showLabel : categoryComparisionOptions.find(d => d.value === condition.operator).showLabel} </span>
                    <span className="highlighted-text"> {condition.staticValue} </span>
                  </>
                )}
            </>
          )}

          {condition.valueType === "ranking" && (
            <>
              <span> when </span>
              <span className="highlighted-text"> Ranking </span>
              <span> is </span>
              <span className="highlighted-text"> {rankingTypes.find(d => d.value === condition.rankingType)?.kind} {condition.staticRankingValue} </span>
            </>
          )}

          {condition.valueType === "percent" && (
            <>
              <span> when </span>
              <span className="highlighted-text"> % </span>
              {
                condition.operator === '<>' ? (
                  <>
                    <span> From </span>
                    <span className="highlighted-text">  {condition.staticPercentValue} </span>
                    <span> to </span>
                    <span className="highlighted-text">  {condition.secondaryStaticPercentValue} </span>
                  </>
                ) : (
                  <>
                    <span> {measureComparisionOptions.find(d => d.value === condition.operator).showLabel} </span>
                    <span className="highlighted-text">  {condition.percentValue} </span>
                  </>
                )
              }
            </>
          )}

          {rule.isDuplicateRule && (
            <span> - Copy </span>
          )}
        </>
      )}

      {rule?.isEditableRuleName && (
        rule?.name
      )
      }

    </>
  }
}

function HomePage({
  rules,
  setRules,
  addRule,
  createRule,
  deleteRule,
  editRule,
  updateRules,
  conditionalFormattingIcon,
  closeCurrentSettingHandler,
  isSupportApplyOn,
  applyOnCategories,
  setSelectedApplyOnCategoryState
}) {
  const [showConfirmPrompt, setShowConfirmPrompt] = React.useState({
    show: false,
    id: null,
  });

  const [dragId, setDragId] = React.useState(-1);
  const [filteredRules, setFilteredRules] = React.useState(rules);
  const [selectedApplyOnCategory, setSelectedApplyOnCategory] = React.useState("all");

  useEffect(() => {
    setFilteredRules(rules);
  }, [rules]);

  return (
    <>
      <PopupModHeader
        title={Components.ConditionalFormatting}
        icon={conditionalFormattingIcon}
        closeSettingsPopup={closeCurrentSettingHandler}
      />
      {showConfirmPrompt.show ? (
        <>
          <div className="section section-delete-alert">
            <img src={require("../../assets/icons/delete-alert-icon.svg")} />
            <p className="section-delete-alert-text">Delete the rule?</p>
            <p className="section-delete-alert-subtext">
              <span
                className="section-delete-alert-subtext-color"
                style={{ background: rules?.[showConfirmPrompt.id]?.conditions?.[0]?.color }}
              ></span>
              <span className="section-delete-alert-subtext-text">
                {rules?.[showConfirmPrompt.id]?.isDuplicateRule ? RuleName(rules?.[showConfirmPrompt.id], rules?.[showConfirmPrompt.id]?.conditions[0]) : RuleName(rules?.[showConfirmPrompt.id], rules?.[showConfirmPrompt.id]?.conditions[0])}
              </span>
            </p>
          </div>
          <div className={`config-btn-wrapper flex-end`}>
            <div className="btn-group">
              <Button text={"Yes"} variant={"secondary"} clickHandler={() => deleteRuleHandler(showConfirmPrompt, deleteRule, setShowConfirmPrompt)} />
              <Button
                text={"No"}
                variant={"primary"}
                clickHandler={() => setShowConfirmPrompt({ show: false, id: null })}
              />
            </div>
          </div>
        </>
      ) : (rules.length > 0) ? (
        <>
          {(isSupportApplyOn && applyOnCategories?.length > 0) && (
            <Row>
              <Column>
                <SwitchOption
                  value={selectedApplyOnCategory}
                  optionsList={[{ label: "All", value: "all" }, ...applyOnCategories]}
                  handleChange={(value) => {
                    setSelectedApplyOnCategory(value);
                    setSelectedApplyOnCategoryState(value);
                    const newRules = value === "all" ? [...rules] : [...rules].filter(d => d.applyOnCategories.includes(value));
                    setFilteredRules(newRules);
                  }}
                />
              </Column>
            </Row>
          )}

          <RulesList
            rules={filteredRules}
            addRule={addRule}
            setRules={setRules}
            createRule={createRule}
            handleDrag={(ev) => handleDrag(ev, setDragId)}
            handleDrop={(ev) => handleDrop(ev, dragId, setRules, updateRules)}
            editRule={editRule}
            setShowConfirmPrompt={setShowConfirmPrompt}
            closeCurrentSettingHandler={closeCurrentSettingHandler}
            isSupportApplyOn={isSupportApplyOn}
            applyOnCategories={applyOnCategories}
          />
        </>
      ) : (
        <EmptyRulesScreen createRule={createRule} closeCurrentSettingHandler={closeCurrentSettingHandler} />
      )}
    </>
  );
}

export default HomePage;