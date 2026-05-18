import DropdownSelect from './DropdownSelect';
import { ACTIVITY_LEVELS, type PetActivityLevel } from '../constants/activityLevels';

type Props = {
  value: PetActivityLevel | null;
  onChange: (value: PetActivityLevel) => void;
};

export default function ActivitySelector({ value, onChange }: Props) {
  return (
    <DropdownSelect
      label="Como está a atividade dele hoje?"
      placeholder="Selecione uma opção"
      value={value}
      options={ACTIVITY_LEVELS}
      onChange={onChange}
    />
  );
}
