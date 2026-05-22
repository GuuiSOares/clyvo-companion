import DropdownSelect from './DropdownSelect';
import { WELLNESS_OPTIONS, type PetActivityLevel } from '../constants/activityLevels';

type Props = {
  value: PetActivityLevel | null;
  onChange: (value: PetActivityLevel) => void;
};

export default function ActivitySelector({ value, onChange }: Props) {
  return (
    <DropdownSelect
      label="Como está o comportamento dele em casa hoje?"
      helperText="Conte o que você percebeu no dia a dia — não precisa ser termo técnico."
      placeholder="Escolha a opção mais próxima"
      value={value}
      options={WELLNESS_OPTIONS}
      onChange={onChange}
    />
  );
}
