import * as React from "react"
import InputError from "@/components/input-error"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormInputProps extends React.ComponentProps<"input"> {
    label?: string;
    error?: string;
    id: string;
    description?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, className, id, description, ...props }, ref) => {
        
        const isEmail = props.type === 'email';
        const isNumber = props.type === 'number';
        
        return (
            <div className="grid gap-1.5 transition-all duration-200">
                {label && (
                    <Label 
                        htmlFor={id} 
                        className={cn(
                            "text-sm font-semibold transition-colors",
                            error ? "text-red-500" : "text-slate-700 dark:text-slate-300"
                        )}
                    >
                        {label}
                    </Label>
                )}
                
                <div className="relative group">
                    <Input
                        id={id}
                        ref={ref}
                        className={cn(
                            "transition-all duration-200 focus-visible:ring-offset-0",
                            error 
                                ? "border-red-500 bg-red-50/10 focus-visible:ring-red-200 ring-1 ring-red-500" 
                                : "border-slate-200 hover:border-slate-300 dark:border-slate-800 focus-visible:ring-blue-100",
                            className
                        )}
                        aria-invalid={error ? "true" : "false"}
                        onKeyDown={(e) => {
                            if (isNumber) {
                                const isModifierKey = e.ctrlKey || e.metaKey || e.altKey;
                                const isAllowedKey = [
                                    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 
                                    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                                    'Home', 'End'
                                ].includes(e.key);
                                
                                if (!isModifierKey && !isAllowedKey && !/[0-9]/.test(e.key)) {
                                    e.preventDefault();
                                }
                            }
                            if (props.onKeyDown) props.onKeyDown(e);
                        }}
                        {...props}
                    />
                </div>
                
                {description && !error && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{description}</p>
                )}
                
                <InputError message={error} className="mt-0" />
            </div>
        )
    }
)

FormInput.displayName = "FormInput"

export { FormInput }
