import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "#/utils/classname";
import type { TCategory, TSource } from "#/services/spendings/type";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-(--lagoon) focus-visible:ring-[3px] focus-visible:ring-(--lagoon)/25 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        // base
        default:
          "border-(--lagoon)/25 bg-(--lagoon)/12 text-(--lagoon-deep) [a&]:hover:bg-(--lagoon)/20",
        secondary:
          "border-(--line) bg-(--surface) text-(--sea-ink-soft) [a&]:hover:bg-(--lagoon)/8 [a&]:hover:text-(--sea-ink)",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive [a&]:hover:bg-destructive/15",
        outline:
          "border-(--line) bg-transparent text-(--sea-ink) [a&]:hover:bg-(--lagoon)/8",
        ghost:
          "border-transparent bg-transparent text-(--sea-ink-soft) [a&]:hover:bg-(--lagoon)/8 [a&]:hover:text-(--sea-ink)",
        link: "border-transparent bg-transparent text-(--lagoon-deep) underline-offset-4 [a&]:hover:underline",

        // category
        "category-food":
          "border-orange-300/50 bg-orange-50/80 text-orange-700 dark:border-orange-700/40 dark:bg-orange-950/60 dark:text-orange-300",
        "category-transportation":
          "border-blue-300/50 bg-blue-50/80 text-blue-700 dark:border-blue-700/40 dark:bg-blue-950/60 dark:text-blue-300",
        "category-entertainment":
          "border-purple-300/50 bg-purple-50/80 text-purple-700 dark:border-purple-700/40 dark:bg-purple-950/60 dark:text-purple-300",
        "category-shopping":
          "border-pink-300/50 bg-pink-50/80 text-pink-700 dark:border-pink-700/40 dark:bg-pink-950/60 dark:text-pink-300",
        "category-others":
          "border-(--line) bg-(--surface) text-(--sea-ink-soft)",

        // source
        "source-manual":
          "border-(--lagoon)/30 bg-(--lagoon)/10 text-(--lagoon-deep)",
        "source-free-text":
          "border-sky-300/50 bg-sky-50/80 text-sky-700 dark:border-sky-700/40 dark:bg-sky-950/60 dark:text-sky-300",
        "source-receipt":
          "border-amber-300/50 bg-amber-50/80 text-amber-700 dark:border-amber-700/40 dark:bg-amber-950/60 dark:text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const CATEGORY_LABELS: Record<TCategory, string> = {
  FOOD_DINING: "Food & Dining",
  TRANSPORTATION: "Transportation",
  ENTERTAINMENT: "Entertainment",
  SHOPPING: "Shopping",
  OTHERS: "Others",
};

const SOURCE_LABELS: Record<TSource, string> = {
  MANUAL: "Manual",
  FREE_TEXT: "Free Text",
  RECEIPT: "Receipt",
};

const CATEGORY_VARIANT: Record<
  TCategory,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  FOOD_DINING: "category-food",
  TRANSPORTATION: "category-transportation",
  ENTERTAINMENT: "category-entertainment",
  SHOPPING: "category-shopping",
  OTHERS: "category-others",
};

const SOURCE_VARIANT: Record<
  TSource,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  MANUAL: "source-manual",
  FREE_TEXT: "source-free-text",
  RECEIPT: "source-receipt",
};

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

function CategoryBadge({
  category,
  className,
}: {
  category: TCategory;
  className?: string;
}) {
  return (
    <Badge variant={CATEGORY_VARIANT[category]} className={className}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}

function SourceBadge({
  source,
  className,
}: {
  source: TSource;
  className?: string;
}) {
  return (
    <Badge variant={SOURCE_VARIANT[source]} className={className}>
      {SOURCE_LABELS[source]}
    </Badge>
  );
}

export {
  Badge,
  badgeVariants,
  CategoryBadge,
  SourceBadge,
  CATEGORY_LABELS,
  SOURCE_LABELS,
  CATEGORY_VARIANT,
  SOURCE_VARIANT,
};
