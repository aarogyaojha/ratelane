import * as React from "react"
import { cn } from "@/lib/utils"

export const Select = ({ onValueChange, defaultValue, children, className }: any) => {
  let options: any[] = []
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    const childProps = child.props as any;
    if (child.type === SelectContent) {
      options = React.Children.toArray(childProps.children)
    } else if (childProps?.children) {
        React.Children.forEach(childProps.children, innerChild => {
            if (React.isValidElement(innerChild) && innerChild.type === SelectContent) {
                const innerProps = innerChild.props as any;
                options = React.Children.toArray(innerProps.children)
            }
        })
    }
  })

  return (
    <select 
      className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none", className)}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      defaultValue={defaultValue}
    >
      {options}
    </select>
  )
}

export const SelectTrigger = ({ children, className }: any) => null;
export const SelectValue = ({ placeholder, children }: any) => null;
export const SelectContent = ({ children }: any) => <>{children}</>;
export const SelectItem = React.forwardRef<HTMLOptionElement, any>(({ value, children }, ref) => <option ref={ref} value={value}>{children}</option>);
