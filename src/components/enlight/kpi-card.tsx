import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  change?: string
  changeType?: "increase" | "decrease"
  children?: React.ReactNode
}

export function KpiCard({ title, value, change, changeType, children }: KpiCardProps) {
  return (
    <Card className="h-full relative">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-semibold">{value}</div>
        {change && (
          <p
            className={cn(
              "text-xs text-muted-foreground mt-1",
              changeType === "increase" && "text-green-400",
              changeType === "decrease" && "text-red-400"
            )}
          >
            {change} vs. previous quarter
          </p>
        )}
        {children}
      </CardContent>
    </Card>
  )
}
