import DropdownSelect from './DropdownSelect';
import { PET_SPECIES, type PetSpecies } from '../constants/petSpecies';

const SPECIES_OPTIONS = PET_SPECIES.map((species) => ({
  value: species,
  label: species,
}));

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
      options={SPECIES_OPTIONS}
      onChange={onChange}
    />
  );
}
