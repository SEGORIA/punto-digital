"use client";

import { motion } from "motion/react";
import { CheckCircle2, Clock } from "lucide-react";

export function OrderStatusIcon({ pending }: { pending: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -30, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
      className="mx-auto w-fit"
    >
      {pending ? (
        <Clock className="text-brand animate-pulse" size={56} />
      ) : (
        <CheckCircle2 className="text-success" size={56} />
      )}
    </motion.div>
  );
}
