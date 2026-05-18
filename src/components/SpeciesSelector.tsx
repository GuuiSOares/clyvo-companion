import DropdownSelect from './DropdownSelect';
import { PET_SPECIES, type PetSpecies } from '../constants/petSpecies';

type Props = {
  value: PetSpecies | null;
  onChange: (value: PetSpecies) => void;
};

export default function SpeciesSelector({ value, onChange }: Props) {
  return (
    <DropdownSelect
      label="Tipo de animal"
      placeholder="Selecione a espécie"
      value={value}
      options={PET_SPECIES}
      onChange={onChange}
    />
  );
}
