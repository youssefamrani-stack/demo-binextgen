"use client"

import { KpiCard } from "@/components/enlight/kpi-card"
import { PerformanceGauge } from "@/components/enlight/charts"
import { LightbulbIcon } from "@/components/icons/lightbulb-icon"
import { motion } from "framer-motion"

export function InitialDashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-light">
          Good morning, Sömayya.
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is your daily performance brief.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <KpiCard title="Total Revenue (Q3 YTD)" value="€4.2B" change="+8.2%" changeType="increase" />
        </motion.div>
        <motion.div variants={itemVariants}>
            <KpiCard title="Performance vs. Plan (Q3 YTD)" value="109%">
                <div className="absolute bottom-4 right-4 h-12 w-[calc(100%-2rem)]">
                    <PerformanceGauge value={109} />
                </div>
            </KpiCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <div className="h-full rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-center relative overflow-hidden bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <LightbulbIcon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-primary/90">Proactive Alert</h3>
                <p className="text-sm text-foreground/80 mt-2">
                  'Allure Homme Sport' fragrance is showing a <strong className="font-semibold text-primary/90">30% higher sales velocity</strong> than anticipated in the North America region, creating a potential stockout risk.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
