import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "!bg-white !text-black font-semibold hover:!bg-[#e5e5e5] border border-white/20 shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
        secondary:
          "!bg-[#18181b] !text-[#f4f4f5] border border-white/15 hover:!bg-[#27272a] hover:!text-white hover:border-white/25 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        outline:
          "!bg-black/50 !text-[#f4f4f5] border border-white/15 hover:!bg-white/[0.08] hover:!text-white hover:border-white/30 font-medium backdrop-blur-sm",
        ghost:
          "!bg-transparent !text-[#a1a1aa] hover:!bg-white/[0.06] hover:!text-white font-medium",
        linear:
          "!bg-gradient-to-b !from-[#5e6ad2] !to-[#4c57c2] !text-white border border-white/20 font-semibold shadow-[0_0_24px_rgba(94,106,210,0.4)] hover:!from-[#6b77df] hover:!to-[#5561ce]",
        destructive:
          "bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/30 focus-visible:border-destructive/40 font-medium",
        link: "text-primary underline-offset-4 hover:underline font-medium",
      },
      size: {
        default:
          "h-9 gap-2 px-4 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const resolvedNativeButton =
    nativeButton ?? (props.render ? false : undefined);

  return (
    <ButtonPrimitive
      data-slot="button"
      nativeButton={resolvedNativeButton}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
