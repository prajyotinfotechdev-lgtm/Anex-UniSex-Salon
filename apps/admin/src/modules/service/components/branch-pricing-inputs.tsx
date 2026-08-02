import * as React from 'react';
import { useBranches } from '@/modules/employee/employee.hooks';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BranchPricing {
  branchId: string;
  price: number;
}

interface BranchPricingInputsProps {
  value: BranchPricing[];
  onChange: (value: BranchPricing[]) => void;
}

export function BranchPricingInputs({ value = [], onChange }: BranchPricingInputsProps) {
  const { data: branchesData, isLoading } = useBranches();
  const branches = branchesData?.data || [];

  const handleToggle = (branchId: string, isChecked: boolean) => {
    if (isChecked) {
      onChange([...value, { branchId, price: 0 }]);
    } else {
      onChange(value.filter(v => v.branchId !== branchId));
    }
  };

  const handlePriceChange = (branchId: string, priceStr: string) => {
    const price = parseFloat(priceStr);
    onChange(value.map(v => v.branchId === branchId ? { ...v, price: isNaN(price) ? 0 : price } : v));
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading branches...</div>;
  }

  if (branches.length === 0) {
    return <div className="text-sm text-muted-foreground">No branches found.</div>;
  }

  return (
    <div className="space-y-4">
      {branches.map(branch => {
        const selected = value.find(v => v.branchId === branch.id);
        const isSelected = !!selected;

        return (
          <div key={branch.id} className="flex items-center justify-between gap-4 p-3 border rounded-md bg-card">
            <div className="flex items-center gap-3">
              <Checkbox 
                id={`branch-${branch.id}`}
                checked={isSelected}
                onCheckedChange={(checked) => handleToggle(branch.id, !!checked)}
              />
              <Label htmlFor={`branch-${branch.id}`} className="font-medium cursor-pointer">
                {branch.name}
              </Label>
            </div>
            
            {isSelected && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Price Override</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-32 h-8"
                  value={selected.price || ''}
                  onChange={(e) => handlePriceChange(branch.id, e.target.value)}
                  placeholder="e.g. 15.00"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
