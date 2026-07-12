"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CategoryIcon } from "@/components/category-icon";

export function CategoryCard({
  slug,
  name,
  icon,
  count,
}: {
  slug: string;
  name: string;
  icon?: string | null;
  count: number;
}) {
  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}>
      <Link
        href={`/tienda?categoria=${slug}`}
        className="group flex flex-col items-center gap-2 rounded-xl border border-border px-4 py-6 text-center hover:border-brand hover:shadow-lg transition-[border-color,box-shadow]"
      >
        <CategoryIcon
          icon={icon}
          size={26}
          className="text-muted group-hover:text-brand transition-colors"
        />
        <span className="text-sm font-medium group-hover:text-brand transition-colors">
          {name}
        </span>
        <span className="text-xs text-muted">{count} productos</span>
      </Link>
    </motion.div>
  );
}
