"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer"

// Detect touch/mobile device
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

// Context to share open state + items between Select parts for mobile sheet
const SelectMobileContext = React.createContext(null);

// Wrap Select root to track open state for mobile bottom sheet
function SelectWithMobile({ children, value, onValueChange, ...props }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [sheetItems, setSheetItems] = React.useState([]);

  if (!isMobile) {
    return <SelectPrimitive.Root value={value} onValueChange={onValueChange} {...props}>{children}</SelectPrimitive.Root>;
  }

  return (
    <SelectMobileContext.Provider value={{ open, setOpen, sheetItems, setSheetItems, value, onValueChange }}>
      <SelectPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        open={false}
        onOpenChange={(o) => { if (o) setOpen(true); }}
        {...props}
      >
        {children}
      </SelectPrimitive.Root>
      {/* Bottom Sheet for mobile */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[70vh]">
          <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b">
            <span className="font-semibold text-sm text-foreground">Pilih opsi</span>
            <DrawerClose asChild>
              <button className="p-1 rounded-full hover:bg-muted"><X className="w-4 h-4" /></button>
            </DrawerClose>
          </div>
          <div
            className="overflow-y-auto py-2"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
          >
            {sheetItems.map((item) => (
              <button
                key={item.value}
                onClick={() => { onValueChange?.(item.value); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors hover:bg-accent",
                  value === item.value && "text-primary font-semibold"
                )}
              >
                {item.label}
                {value === item.value && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </SelectMobileContext.Provider>
  );
}

// Separate component so hooks are always called unconditionally
function SelectContentMobileSync({ children, mobileCtx }) {
  React.useEffect(() => {
    const items = [];
    React.Children.forEach(children, (child) => {
      if (!child) return;
      if (child.props?.children) {
        React.Children.forEach(child.props.children, (c) => {
          if (c?.props?.value !== undefined) {
            items.push({ value: c.props.value, label: c.props.children });
          }
        });
      }
      if (child.props?.value !== undefined) {
        items.push({ value: child.props.value, label: child.props.children });
      }
    });
    mobileCtx.setSheetItems(items);
  });
  return null;
}

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => {
  const mobileCtx = React.useContext(SelectMobileContext);

  if (mobileCtx) {
    return <SelectContentMobileSync children={children} mobileCtx={mobileCtx} />;
  }

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn("p-1", position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props} />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  SelectWithMobile as Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}