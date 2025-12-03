"use client"

import { useState, useEffect, useRef } from "react"
import { Bot, User, ArrowUp, Loader, AlertTriangle, CheckCircle } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/enlight/header"
import { InitialDashboard } from "@/components/enlight/initial-dashboard"
import { SalesLineChart, PerformanceBarChart, SimpleWaterfallChart } from "@/components/enlight/charts"
import { LightbulbIcon } from "@/components/icons/lightbulb-icon"
import { EmailDialog } from "@/components/enlight/email-dialog"
import { SentimentAnalysisWidget } from "@/components/enlight/sentiment-analysis-widget"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

type Message = {
  id: number
  role: "user" | "ai"
  text?: string
  chartType?: "line-single" | "line-comparison" | "bar" | "sentiment" | "waterfall"
  chartData?: any
  chartLines?: { key: string, color: string }[]
  proactiveSuggestion?: string
  emailAction?: boolean
  investigationText?: string
  jiraAction?: boolean
  simulation?: {
    disclaimer: string
  }
}

const DEMO_SCRIPT = [
  {
    user: "Show me the weekly sales for the new Bleu eau de parfum since its launch in July.",
    ai: {
      text: "Here are the weekly sales for the 'Bleu eau de parfum' since its launch on July 1st. Sales show an average week-over-week growth of 22%, accelerating in August.",
      chartType: "line-single",
      chartData: [
        { name: "Jul 1", 'Bleu eau de parfum': 150000 }, { name: "Jul 8", 'Bleu eau de parfum': 180000 },
        { name: "Jul 15", 'Bleu eau de parfum': 175000 }, { name: "Jul 22", 'Bleu eau de parfum': 210000 },
        { name: "Jul 29", 'Bleu eau de parfum': 250000 }, { name: "Aug 5", 'Bleu eau de parfum': 310000 },
        { name: "Aug 12", 'Bleu eau de parfum': 350000 }, { name: "Aug 19", 'Bleu eau de parfum': 390000 },
        { name: "Aug 26", 'Bleu eau de parfum': 420000 }, { name: "Sep 2", 'Bleu eau de parfum': 450000 },
        { name: "Sep 9", 'Bleu eau de parfum': 480000 }, { name: "Sep 16", 'Bleu eau de parfum': 520000 }
      ],
      chartLines: [{ key: "Bleu eau de parfum", color: "hsl(var(--primary))" }],
    },
  },
  {
    user: "Now compare that to the N°5 eau de parfum for the same period.",
    ai: {
      text: "Comparison is ready. The 'Bleu eau de parfum' started slower but has now overtaken the 'N°5 eau de parfum' in weekly revenue as of mid-August.",
      chartType: "line-comparison",
      chartData: [
        { name: "Jul 1", 'Bleu eau de parfum': 150000, 'N°5 eau de parfum': 220000 }, { name: "Jul 8", 'Bleu eau de parfum': 180000, 'N°5 eau de parfum': 230000 },
        { name: "Jul 15", 'Bleu eau de parfum': 175000, 'N°5 eau de parfum': 210000 }, { name: "Jul 22", 'Bleu eau de parfum': 210000, 'N°5 eau de parfum': 240000 },
        { name: "Jul 29", 'Bleu eau de parfum': 250000, 'N°5 eau de parfum': 260000 }, { name: "Aug 5", 'Bleu eau de parfum': 310000, 'N°5 eau de parfum': 280000 },
        { name: "Aug 12", 'Bleu eau de parfum': 350000, 'N°5 eau de parfum': 290000 }, { name: "Aug 19", 'Bleu eau de parfum': 390000, 'N°5 eau de parfum': 310000 },
        { name: "Aug 26", 'Bleu eau de parfum': 420000, 'N°5 eau de parfum': 320000 }, { name: "Sep 2", 'Bleu eau de parfum': 450000, 'N°5 eau de parfum': 330000 },
        { name: "Sep 9", 'Bleu eau de parfum': 480000, 'N°5 eau de parfum': 340000 }, { name: "Sep 16", 'Bleu eau de parfum': 520000, 'N°5 eau de parfum': 350000 }
      ],
      chartLines: [
        { key: "Bleu eau de parfum", color: "hsl(var(--primary))" },
        { key: "N°5 eau de parfum", color: "hsl(var(--chart-2))" }
      ],
    },
  },
  {
    user: "What's the performance vs plan for our 'Eyewear' category in the APAC region last quarter, and which country is the main driver?",
    ai: {
      text: "For Q3, the Eyewear category in the APAC region finished **18% above plan**. The main growth driver was **Japan, which overperformed by 35%**, largely due to the success of the 'Summer 2025' collection campaign.",
      chartType: "bar",
      chartData: [
        { country: "Japan", performance: 35 },
        { country: "S. Korea", performance: 18 },
        { country: "Singapore", performance: -2 },
        { country: "Australia", performance: 11 },
        { country: "China", performance: 15 },
      ],
      proactiveSuggestion: "While Japan is overperforming, the Singapore market is currently 2% below plan for the category. Data suggests a correlation with lower stock levels of high-demand sunglass models.",
      emailAction: true,
    },
  },
    {
    user: "How is our new fragrance 'Chance eau tendre' being perceived by customers online?",
    ai: {
      text: "Overall sentiment for 'Chance eau tendre' is **88% positive**. Customers are frequently praising its 'long-lasting scent' and 'unique bottle design'. However, I've identified a recurring minor theme around the packaging being 'difficult to open'.",
      chartType: "sentiment",
    },
  },
  {
    ai_alert: {
      alertText: "**Critical Alert:** I've detected a 40% drop in the conversion rate for the 'Lunettes Oeil de Chat' product page in the last 3 hours.",
      investigationText: "The conversion drop correlates directly with a **300% spike in page load time** for that specific product page, beginning at approximately 2:15 PM CEST. This was triggered by a recent image asset update. The high latency is likely causing significant user frustration and cart abandonment.",
      jiraAction: true,
    }
  },
    {
    user: "We are planning our Q1 2026 budget. Simulate the potential revenue impact of a 15% increase in the marketing budget for the 'Watches' category in North America.",
    ai: {
      text: "Based on historical campaign ROI and our market elasticity model, a 15% increase in the North American marketing budget for Watches in Q1 is projected to generate an additional **$4.2M to $6.5M in revenue**. The model gives this forecast an 85% confidence score.",
      chartType: "waterfall",
      chartData: [
        { name: 'Q1 Plan', value: 28 },
        { name: 'Projected Uplift', value: 5.35 },
        { name: 'New Forecast', value: 33.35 }
      ],
      simulation: {
        disclaimer: "This forecast assumes stable competitor spending and economic conditions. Would you like to see a detailed breakdown of the model's assumptions or run a simulation with different budget scenarios?"
      }
    }
  }
]

const DRAFT_EMAIL = {
  recipient: "country.manager.sg@example.com",
  subject: "Action Plan for Eyewear Category Performance in Singapore",
  body: "Hi [Manager Name],\n\nHope you're well.\n\nFollowing a review of our Q3 performance for the Eyewear category, I wanted to highlight a point for attention. While the APAC region is performing well overall (+18% vs plan), our Singapore market is currently tracking at -2% for the quarter in this category.\n\nOur initial analysis suggests a possible correlation with low stock levels for key seasonal sunglass models, particularly from the 'Summer 2025' collection.\n\nCould you please review the current stock situation? I'd be happy to connect with the central logistics team to expedite a replenishment order if needed. Let's schedule a brief call to discuss a plan to get back on track.\n\nBest regards,\n\nSömayya\nHead Of Insights"
}

export function EnlightDemo() {
  const [step, setStep] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showProactiveAlert, setShowProactiveAlert] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const currentStepConfig = DEMO_SCRIPT[step];
    if (currentStepConfig?.ai_alert && !isLoading) {
      setTimeout(() => {
        setShowProactiveAlert(true);
      }, 10000);
    }
    const targetQuery = currentStepConfig?.user || ""
    if (isTyping && targetQuery) {
      let i = 0
      setInputValue("")
      const typingInterval = setInterval(() => {
        setInputValue(targetQuery.substring(0, i))
        i++
        if (i > targetQuery.length) {
          clearInterval(typingInterval)
          setIsTyping(false)
        }
      }, 50)
      return () => clearInterval(typingInterval)
    } else {
      setInputValue(targetQuery);
    }
  }, [step, isTyping, isLoading])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading || isTyping || step >= DEMO_SCRIPT.length || !DEMO_SCRIPT[step].user) return;

    const currentStep = DEMO_SCRIPT[step]
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: currentStep.user },
    ])
    setIsLoading(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ai", ...currentStep.ai },
      ])
      setIsLoading(false)
      setStep(step + 1)
      setIsTyping(true)
    }, 1500)
  }

  const handleInvestigate = () => {
    setShowProactiveAlert(false);
    const alertStep = DEMO_SCRIPT[step]?.ai_alert;
    if (!alertStep) return;

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        role: "ai",
        text: alertStep.investigationText,
        jiraAction: alertStep.jiraAction,
      }
    ]);
    
    toast({
      description: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Jira Ticket EN-4582 Created</span>
        </div>
      )
    });

    setTimeout(() => {
      setStep(step + 1);
      setIsTyping(true);
    }, 1000);
  }

  const handleDraftEmail = () => {
    setShowEmailDialog(true)
  }

  const handleReset = () => {
    setMessages([])
    setStep(0)
    setIsTyping(true)
  }

  const alertStep = DEMO_SCRIPT[step]?.ai_alert;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <Header />

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {messages.length === 0 && !isLoading ? (
              <InitialDashboard />
            ) : (
              <AnimatePresence>
                <div className="space-y-6">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-start gap-4 ${message.role === "user" ? "justify-end" : ""}`}
                    >
                      {message.role === "ai" && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><Bot className="w-5 h-5 text-primary" /></div>}
                      <div className={`max-w-xl rounded-lg p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                        {message.text && <p className="text-sm" dangerouslySetInnerHTML={{__html: message.text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary/90">$1</strong>')}}></p>}
                        {message.chartType && (
                          <div className="mt-4">
                            {(message.chartType === 'line-single' || message.chartType === 'line-comparison') && <SalesLineChart data={message.chartData} lines={message.chartLines!} />}
                            {message.chartType === 'bar' && <PerformanceBarChart data={message.chartData} />}
                            {message.chartType === 'sentiment' && <SentimentAnalysisWidget />}
                             {message.chartType === 'waterfall' && <SimpleWaterfallChart data={message.chartData} />}
                          </div>
                        )}
                        {message.proactiveSuggestion && (
                           <div className="mt-4 p-4 border-l-2 border-primary bg-primary/10 rounded-r-lg">
                               <div className="flex items-start gap-3">
                                   <LightbulbIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                   <div>
                                       <h4 className="font-semibold text-sm text-primary/90">Proactive Suggestion</h4>
                                       <p className="text-sm mt-1">{message.proactiveSuggestion}</p>
                                       {message.emailAction && (
                                           <div className="mt-4 space-x-2">
                                               <Button size="sm" onClick={handleDraftEmail}>Yes, draft email</Button>
                                               <Button size="sm" variant="ghost">No, thanks</Button>
                                           </div>
                                       )}
                                   </div>
                               </div>
                           </div>
                        )}
                        {message.jiraAction && (
                          <div className="mt-4 p-3 border-l-2 border-green-500 bg-green-500/10 rounded-r-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <p className="text-sm">I have automatically created a **P1 (High Priority) Jira ticket #EN-4582** for the web development team with all the relevant diagnostic data attached. They have been notified.</p>
                            </div>
                          </div>
                        )}
                        {message.simulation && (
                          <div className="mt-4 text-sm text-muted-foreground italic">
                            <p>{message.simulation.disclaimer}</p>
                          </div>
                        )}
                      </div>
                      {message.role === "user" && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center"><User className="w-5 h-5 text-muted-foreground" /></div>}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-4"
                    >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><Bot className="w-5 h-5 text-primary" /></div>
                        <div className="max-w-xl rounded-lg p-4 bg-card flex items-center">
                            <Loader className="w-5 h-5 text-primary animate-spin" />
                            <span className="ml-2 text-sm text-muted-foreground">Generating response...</span>
                        </div>
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl mx-auto p-4">
            {step >= DEMO_SCRIPT.length && !isLoading && (
                <div className="text-center">
                    <Button onClick={handleReset}>Start Demo Over</Button>
                </div>
            )}
            {step < DEMO_SCRIPT.length && DEMO_SCRIPT[step].user && (
              <form onSubmit={handleSendMessage} className="relative">
                <Input
                  value={inputValue}
                  readOnly
                  placeholder="Ask a question about your business..."
                  className="pr-12 h-12 text-base"
                />
                <Button type="submit" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2" disabled={isLoading || isTyping}>
                  <ArrowUp className="w-5 h-5" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
      {showEmailDialog && <EmailDialog isOpen={showEmailDialog} onClose={() => setShowEmailDialog(false)} email={DRAFT_EMAIL} />}
      {alertStep && (
        <AlertDialog open={showProactiveAlert}>
          <AlertDialogContent className="border-destructive">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Critical Alert
              </AlertDialogTitle>
              <AlertDialogDescription className="py-4 text-base" dangerouslySetInnerHTML={{__html: alertStep.alertText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => {
                setShowProactiveAlert(false);
                setStep(step + 1);
                setIsTyping(true);
              }}>Dismiss</Button>
              <AlertDialogAction onClick={handleInvestigate} className="bg-destructive hover:bg-destructive/90">
                Investigate Root Cause
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
