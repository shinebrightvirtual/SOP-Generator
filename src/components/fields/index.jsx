import TextField from "./TextField.jsx";
import TextareaField from "./TextareaField.jsx";
import SelectField from "./SelectField.jsx";
import StepListField from "./StepListField.jsx";
import DetailedStepsField from "./DetailedStepsField.jsx";
import BulletListField from "./BulletListField.jsx";

export { TextField, TextareaField, SelectField, StepListField, DetailedStepsField, BulletListField };

export function renderField(field, data, onChange) {
  const val = data[field.key];
  switch (field.type) {
    case "text":
    case "date":
      return <TextField key={field.key} field={field} value={val} onChange={onChange} />;
    case "textarea":
      return <TextareaField key={field.key} field={field} value={val} onChange={onChange} />;
    case "select":
      return <SelectField key={field.key} field={field} value={val} onChange={onChange} />;
    case "steplist":
      return <StepListField key={field.key} field={field} value={val} onChange={onChange} />;
    case "detailedsteps":
      return <DetailedStepsField key={field.key} field={field} value={val} onChange={onChange} />;
    case "bulletlist":
      return <BulletListField key={field.key} field={field} value={val} onChange={onChange} />;
    default:
      return null;
  }
}
