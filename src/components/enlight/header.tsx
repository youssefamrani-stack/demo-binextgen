"use client"

export function Header() {
  return (
    <header className="flex items-center h-20 px-6 border-b shrink-0 bg-background/80 backdrop-blur-sm z-10">
      <div className="flex items-center gap-4">
        <div className="font-headline tracking-wider">
            <span className="text-2xl font-semibold text-foreground">CHANEL</span>
        </div>
        <div className="h-6 w-px bg-border"></div>
        <span className="text-xl font-light tracking-widest text-foreground">
          Insights
        </span>
      </div>
    </header>
  )
}
