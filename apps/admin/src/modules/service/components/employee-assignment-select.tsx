import * as React from 'react';
import { useEmployees } from '@/modules/employee/employee.hooks';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EmployeeAssignmentSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: boolean;
}

export function EmployeeAssignmentSelect({ selectedIds = [], onChange, error }: EmployeeAssignmentSelectProps) {
  const [open, setOpen] = React.useState(false);
  const { data: employeesData, isLoading } = useEmployees({ isActive: true, limit: 100 });

  const employees = employeesData?.data || [];
  
  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((currentId) => currentId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : id;
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          role="combobox"
          aria-expanded={open}
          className={cn("w-full flex h-8 items-center justify-between rounded-[min(var(--radius-md),12px)] border border-input bg-background px-2.5 py-1 text-[0.8rem] text-foreground shadow-sm hover:bg-muted font-normal outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", error && "border-destructive")}
        >
          {selectedIds.length > 0 ? (
            <span className="truncate">
              {selectedIds.length} employee(s) selected
            </span>
          ) : (
            <span className="text-muted-foreground">Select employees...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search employees..." />
            <CommandList>
              <CommandEmpty>{isLoading ? "Loading employees..." : "No employee found."}</CommandEmpty>
              <CommandGroup>
                {employees.map((employee) => (
                  <CommandItem
                    key={employee.id}
                    value={`${employee.firstName} ${employee.lastName}`}
                    onSelect={() => handleSelect(employee.id)}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedIds.includes(employee.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Avatar className="h-6 w-6">
                      {employee.profileImageId ? (
                        <AvatarImage src={`/api/v1/media/${employee.profileImageId}`} alt={employee.firstName} />
                      ) : (
                        <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <span>{employee.firstName} {employee.lastName}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{employee.role?.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedIds.map(id => {
            const emp = employees.find(e => e.id === id);
            return (
              <Badge key={id} variant="secondary" className="gap-1">
                {emp && (
                  <Avatar className="h-4 w-4 mr-1">
                    <AvatarImage src={emp.profileImageId ? `/api/v1/media/${emp.profileImageId}` : ''} />
                    <AvatarFallback className="text-[10px]">{emp.firstName[0]}{emp.lastName[0]}</AvatarFallback>
                  </Avatar>
                )}
                {getEmployeeName(id)}
                <button
                  type="button"
                  onClick={() => handleSelect(id)}
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <span className="text-muted-foreground hover:text-foreground">×</span>
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
