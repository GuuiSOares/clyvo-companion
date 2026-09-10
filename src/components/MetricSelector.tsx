import DropdownSelect from './DropdownSelect';
import { HEALTH_METRIC_OPTIONS, type HealthMetric } from '../constants/healthMetrics';

type Props = {
  value: HealthMetric | null;
  onChange: (value: HealthMetric) => void;
};

export default function MetricSelector({ value, onChange }: Props) {
  return (
    <DropdownSelect
      label="O que você mediu hoje?"
      helperText="Esse dado entra no prontuário e o veterinário consegue ver."
      placeholder="Peso, alimentação, exercício, temperatura ou batimentos"
      value={value}
      options={HEALTH_METRIC_OPTIONS}
      onChange={onChange}
    />
  );
}
