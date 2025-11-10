import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash } from "lucide-react"

interface Material {
  name: string
  weight: string
}

interface MaterialInputProps {
  materials: Material[]
  onChange: (materials: Material[]) => void
  guaranteedWeight: string
  onGuaranteedWeightChange: (weight: string) => void
}

export function MaterialInput({ materials, onChange, guaranteedWeight, onGuaranteedWeightChange }: MaterialInputProps) {
  const addMaterial = () => {
    onChange([...materials, { name: "", weight: "" }])
  }

  

  const updateMaterial = (index: number, field: keyof Material, value: string) => {
    const updatedMaterials = materials.map((material, i) => {
      if (i === index) {
        return { ...material, [field]: field === "weight" ? value : value }
      }
      return material
    })
    onChange(updatedMaterials)
  }

  const removeMaterial = (index: number) => {
    onChange(materials.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Guaranteed Weight (MT)</label>
        <Input
          type="text"
          value={guaranteedWeight}
          onChange={(e) => onGuaranteedWeightChange(e.target.value)}
          placeholder="Guaranteed Weight"
        />
      </div>
      {materials.map((material, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Input
            placeholder="Material Name"
            value={material.name}
            onChange={(e) => updateMaterial(index, "name", e.target.value)}
          />
          <Input
            type="text"
            placeholder="Weight (MT)"
            value={material.weight}
            onChange={(e) => updateMaterial(index, "weight", e.target.value)}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeMaterial(index)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addMaterial}>
        <Plus className="h-4 w-4 mr-2" /> Add Material
      </Button>
    </div>
  )
}

