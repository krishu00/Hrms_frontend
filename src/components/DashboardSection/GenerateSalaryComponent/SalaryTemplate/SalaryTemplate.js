import React, { useState, useEffect } from "react";
import "../../../ComponentsCss/GenerateSalaryComponent/SalaryTemplate/salaryTemplate.css";
import { IoArrowBack } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { usePopup } from "../../../../context/popup-context/Popup";
import { Popup } from "../../../Utils/Popup/Popup";

const getComponentKey = (component) =>
  component?.component_id ||
  component?.componentId ||
  component?._id ||
  component?.component;

const getDefaultFormula = (component) =>
  component?.formula_description?.trim?.() ||
  component?.default_formula?.trim?.() ||
  "";

const getDisplayFormula = (component, componentFormulas) =>
  componentFormulas[getComponentKey(component)] ??
  component?.formula_value?.trim?.() ??
  component?.formula_description?.trim?.() ??
  component?.default_formula?.trim?.() ??
  "";

const getFormulaForSubmit = (component, componentFormulas) =>
  getDisplayFormula(component, componentFormulas)?.trim?.() || "";

const normalizeTemplateComponent = (component) => ({
  ...component,
  componentId: component.componentId || component.component_id,
  component:
    component.component ||
    component.componentId ||
    component.component_id ||
    component._id,
  formula_description: component.formula_description || "",
  default_formula: component.default_formula || "",
});

const buildHydratedTemplateFromResponse = (
  savedTemplate,
  templateComponents,
  componentFormulas
) => ({
  ...savedTemplate,
  components: (savedTemplate.components || []).map((savedComponent) => {
    const matchingComponent = templateComponents.find(
      (component) => getComponentKey(component) === getComponentKey(savedComponent)
    );

    return normalizeTemplateComponent({
      ...matchingComponent,
      ...savedComponent,
      componentId: getComponentKey(savedComponent),
      component: getComponentKey(savedComponent),
      formula_value:
        savedComponent.formula_value ??
        getFormulaForSubmit(savedComponent, componentFormulas),
    });
  }),
});

export default function SalaryTemplate({
  mode = "add",
  initialData = {},
  onCancel,
  onSubmitData,
}) {
  const [componentsList, setComponentsList] = useState([]);
  const [templateComponents, setTemplateComponents] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [componentFormulas, setComponentFormulas] = useState({});
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const isView = mode === "view";

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/salary-component/get_all`
        );
        setComponentsList(response.data.data);
      } catch (error) {
        console.error("Failed to fetch salary components", error);
      }
    };

    fetchComponents();

    // Pre-fill data if editing or viewing
    if (initialData && (mode === "edit" || mode === "view")) {
      setTemplateName(initialData.name || "");
      setDescription(initialData.description || "");
      setEffectiveDate(initialData.effective_date?.split("T")[0] || "");
      setTemplateComponents(
        (initialData.components || []).map(normalizeTemplateComponent)
      );
      const formulas = {};
      initialData.components?.forEach((comp) => {
        if (comp.formula_value) {
          formulas[getComponentKey(comp)] = comp.formula_value;
        }
      });
      setComponentFormulas(formulas);
    }
  }, [initialData, mode]);

  useEffect(() => {
    if (!componentsList.length || !initialData?.components?.length) return;
    if (!(mode === "edit" || mode === "view")) return;

    setTemplateComponents((prev) =>
      prev.map((component) => {
        const componentKey = getComponentKey(component);
        const matchedMasterComponent = componentsList.find(
          (masterComponent) => getComponentKey(masterComponent) === componentKey
        );

        if (!matchedMasterComponent) {
          return component;
        }

        return normalizeTemplateComponent({
          ...matchedMasterComponent,
          ...component,
          componentId: componentKey,
          component: componentKey,
          formula_description:
            component.formula_description ||
            component.default_formula ||
            matchedMasterComponent.formula_description ||
            "",
        });
      })
    );
  }, [componentsList, initialData, mode]);

  const handleAddComponent = (component) => {
    if (isView) return;
    const normalizedComponent = normalizeTemplateComponent(component);
    const componentKey = getComponentKey(normalizedComponent);

    if (!templateComponents.find((c) => getComponentKey(c) === componentKey)) {
      setTemplateComponents((prev) => [...prev, normalizedComponent]);
    }
  };

  const handleRemoveComponent = (componentId) => {
    if (isView) return;
    setTemplateComponents(
      templateComponents.filter((c) => getComponentKey(c) !== componentId)
    );
    const updated = { ...componentFormulas };
    delete updated[componentId];
    setComponentFormulas(updated);
  };

  const handleFormulaChange = (componentId, value) => {
    if (isView) return;
    setComponentFormulas({ ...componentFormulas, [componentId]: value });
  };

  const buildTemplatePayload = () => ({
    name: templateName,
    description,
    effective_date: effectiveDate,
    components: templateComponents.map((component, index) => ({
      component_id: getComponentKey(component),
      component: getComponentKey(component),
      order: index + 1,
      calculation_type: component.calculation_type || "Inherit",
      formula_value: getFormulaForSubmit(component, componentFormulas),
    })),
  });

  const handleSubmit = async () => {
    const payload = buildTemplatePayload();

    try {
      if (mode === "edit") {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/salary-template/updateTemplate/${initialData._id}`,
          payload
        );
        const updatedTemplate = buildHydratedTemplateFromResponse(
          response.data.data,
          templateComponents,
          componentFormulas
        );
        setShowPopup(true);
        setMessage("Template updated successfully!");
        // alert("Template updated successfully!");
        setTimeout(() => {
          setShowPopup(false);
        }, 3000);
        onSubmitData(updatedTemplate);
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/salary-template/add_salary_template`,
          payload
        );
        const createdTemplate = buildHydratedTemplateFromResponse(
          response.data.data,
          templateComponents,
          componentFormulas
        );
        setShowPopup(true);
        setMessage("Template created successfully!");
        setTimeout(() => {
          setShowPopup(false);
        }, 3000);
        // alert("Template created successfully!");
        onSubmitData(createdTemplate);
      }
    } catch (error) {
      console.error("Failed to save salary template", error);
      setShowPopup(true);
      setMessage(error.response?.data?.message || "Error saving template.");
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  return (
    <div className="salary_temp_outer">
      <div className="temp_back_btn_container">
        <button type="button" onClick={onCancel} className="back_btn_temp">
          <IoArrowBack style={{ fontSize: 22 }} />
        </button>
        <div className="create_head">
          <h3>
            {isView ? "View" : mode === "edit" ? "Edit" : "Create"} Template
          </h3>
        </div>
      </div>

      <div className="Temp_name">
        <label>
          <strong>Template Name:</strong>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
            disabled={isView}
          />
        </label>
        <br />
        <label>
          <strong>Description:</strong>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            disabled={isView}
          />
        </label>
        <label>
          Effective Date:
          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            disabled={isView}
          />
        </label>
      </div>

      <div className="all_copm_Outer">
        <div className="all_comp_table">
          <table>
            <thead>
              <tr>
                <th>All Components</th>
              </tr>
            </thead>
            <tbody>
              {componentsList.map((component) => (
                <tr key={component._id}>
                  <td
                    style={{ cursor: isView ? "default" : "pointer" }}
                    onClick={() => handleAddComponent(component)}
                  >
                    {component.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="all_comp_table">
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Formula</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {templateComponents.length === 0 ? (
                <tr>
                  <td colSpan="3">No components added yet</td>
                </tr>
              ) : (
                templateComponents.map((component) => (
                  <tr key={getComponentKey(component)}>
                    <td>{component.name}</td>
                    <td>
                      <input
                        type="text"
                        value={getDisplayFormula(component, componentFormulas)}
                        title={getDisplayFormula(component, componentFormulas)}
                        onChange={(e) =>
                          handleFormulaChange(
                            getComponentKey(component),
                            e.target.value
                          )
                        }
                        disabled={isView}
                        placeholder={getDefaultFormula(component) || "Enter formula"}
                      />
                    </td>
                    <td>
                      {!isView && (
                        <button
                          title="Delete"
                          onClick={() =>
                            handleRemoveComponent(getComponentKey(component))
                          }
                        >
                          <MdDelete />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isView && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button className="submit_template_btn" onClick={handleSubmit}>
            {mode === "edit" ? "Update Template" : "Submit Template"}
          </button>
        </div>
      )}
      {showPopup && <Popup />}
    </div>
  );
}
