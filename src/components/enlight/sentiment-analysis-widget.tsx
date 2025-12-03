"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

const sentimentData = {
  score: 88,
  breakdown: [
    { name: "Positive", value: 88, color: "bg-green-500" },
    { name: "Neutral", value: 10, color: "bg-yellow-500" },
    { name: "Negative", value: 2, color: "bg-red-500" },
  ],
  wordCloud: [
    { text: "long-lasting", size: 9 },
    { text: "elegant bottle", size: 8 },
    { text: "jasmine", size: 7 },
    { text: "unique", size: 8 },
    { text: "perfect for evening", size: 6 },
    { text: "sophisticated", size: 5 },
    { text: "difficult cap", size: 3 },
    { text: "good quality", size: 6 },
    { text: "stylish", size: 7 },
  ],
}

export function SentimentAnalysisWidget() {
  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="text-base font-medium text-muted-foreground">Customer Sentiment: Chance eau tendre</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-5xl font-bold text-green-400">{sentimentData.score}%</p>
            <p className="text-sm font-medium text-green-400/80">Positive</p>
          </div>
        </div>

        <div className="space-y-2">
          {sentimentData.breakdown.map((item) => (
            <div key={item.name} className="grid grid-cols-[1fr_2fr_auto] items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground">{item.name}</span>
              <Progress value={item.value} className={`h-2 [&>div]:${item.color}`} />
              <span className="font-mono text-muted-foreground">{item.value}%</span>
            </div>
          ))}
        </div>

        <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-background/30 p-4">
           {sentimentData.wordCloud.map((word, i) => (
             <motion.div
                key={word.text}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="absolute text-foreground/80"
                style={{
                  fontSize: `${word.size * 3 + 8}px`,
                  top: `${Math.random() * 80}%`,
                  left: `${Math.random() * 80}%`,
                  fontWeight: word.size > 7 ? 600 : 400,
                  color: word.size > 7 ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                }}
             >
                {word.text}
             </motion.div>
           ))}
        </div>
      </CardContent>
    </Card>
  )
}

    