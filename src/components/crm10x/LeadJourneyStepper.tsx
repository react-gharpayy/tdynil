import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { useQuotationsQuery } from "@/lib/crm10x/quotations";
import { useCheckins } from "@/lib/checkins/store";
import { useDossierReadiness } from "@/lib/crm10x/dossier-readiness";
import type { Lead } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Circle, Lock, ChevronRight, ClipboardCheck,
  Calendar, MessageSquare, FileText, IndianRupee, KeyRound, ArrowRight,
} from "lucide-react";

export type JourneyTab =
  | "dossier" | "tour" | "post" | "quote" | "checkin";

type StepState = "done" | "active" | "todo" | "locked";

interface Step {
  key: JourneyTab;
  label: string;
  icon: typeof Calendar;
  state: StepState;
  cta: string;
  hint?: string;
}

export function LeadJourneyStepper({
  lead, currentTab, onJump,
}: {
  lead: Lead;
  currentTab: string;
  onJump: (tab: JourneyTab) => void;
}) {
  const tours = useApp((s) => s.tours);
  const { data: leadQuotes = [] } = useQuotationsQuery(lead.id);
  const checkin = useCheckins((s) => s.checkins.find((c) => c.leadId === lead.id));
  const dossier = useDossierReadiness(lead);

  const steps: Step[] = useMemo(() => {
    const leadTours = tours.filter((t) => t.leadId === lead.id);
    const openTour = leadTours.find((t) => t.status === "scheduled");
    const completedTour = leadTours.find((t) => t.status === "completed");
    const pendingPost = leadTours.find((t) => t.status === "completed" && !t.postTour.filledAt);
    const paidQuote = leadQuotes.find((q) => q.status === "paid");
    const sentQuote = leadQuotes.find((q) => q.status === "sent");

    const dossierDone = dossier.ready;
    const tourDone = !!completedTour || !!openTour;
    const postDone = !!completedTour && !pendingPost;
    const bookingDone = lead.stage === "booked" || !!paidQuote;
    const checkinDone = !!checkin && (checkin.stage === "moved_in" || checkin.stage === "settled");

    const order = [
      { key: "dossier" as const, done: dossierDone, unlock: true, label: "Dossier", icon: ClipboardCheck, cta: "Fill Dossier",
        hint: dossierDone ? "Complete" : `${dossier.filledCount}/${dossier.totalCount} fields` },
      { key: "tour" as const, done: tourDone, unlock: dossierDone, label: "Tour", icon: Calendar,
        cta: openTour ? "Manage tour" : "Schedule tour",
        hint: openTour ? "Scheduled" : completedTour ? "Completed" : "Pending" },
      { key: "post" as const, done: postDone, unlock: tourDone, label: "Post-tour", icon: MessageSquare,
        cta: pendingPost ? "Fill post-tour" : "Review",
        hint: pendingPost ? "Pending" : postDone ? "Complete" : "Awaiting" },
      { key: "quote" as const, done: bookingDone, unlock: postDone || tourDone, label: "Quote", icon: IndianRupee,
        cta: bookingDone ? "View booking" : "Send quote",
        hint: bookingDone ? "Booked" : sentQuote ? "Sent" : "Pending" },
      { key: "checkin" as const, done: checkinDone, unlock: bookingDone, label: "Check-in", icon: KeyRound,
        cta: checkinDone ? "View" : "Start check-in",
        hint: checkin ? checkin.stage.replace(/_/g, " ") : bookingDone ? "Pending" : "Locked" },
    ];

    let foundActive = false;
    return order.map((o): Step => {
      let state: StepState;
      if (o.done) state = "done";
      else if (!o.unlock) state = "locked";
      else if (!foundActive) { state = "active"; foundActive = true; }
      else state = "todo";
      return { key: o.key, label: o.label, icon: o.icon, state, cta: o.cta, hint: o.hint };
    });
  }, [tours, lead, leadQuotes, checkin, dossier.ready, dossier.filledCount, dossier.totalCount]);

  const activeStep = steps.find((s) => s.state === "active") ?? steps.find((s) => s.state === "todo");
  const nextLabel = activeStep ? activeStep.cta : "All steps complete";

  return (
    <div className="border-b border-border bg-muted/20 px-5 py-3 space-y-2.5">
      {/* Step row with arrows */}
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-thin">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isCurrent = currentTab === s.key;
          const tone =
            s.state === "done" ? "border-success/50 bg-success/10 text-success"
            : s.state === "active" ? "border-accent bg-accent/15 text-accent-foreground ring-1 ring-accent"
            : s.state === "locked" ? "border-border bg-muted/40 text-muted-foreground opacity-60"
            : "border-border bg-card text-muted-foreground";
          return (
            <div key={s.key} className="flex items-center shrink-0">
              <button
                onClick={() => s.state !== "locked" && onJump(s.key)}
                disabled={s.state === "locked"}
                aria-current={isCurrent ? "step" : undefined}
                className={`group flex flex-col items-center gap-1 rounded-md border px-2 py-1.5 min-w-[68px] transition-all ${tone} ${isCurrent ? "scale-[1.04] shadow-sm" : ""} ${s.state === "locked" ? "cursor-not-allowed" : "hover:brightness-110"}`}
                title={s.state === "locked" ? "Complete previous step first" : s.label}
              >
                <div className="flex items-center gap-1">
                  {s.state === "done" ? <CheckCircle2 className="h-3.5 w-3.5" />
                    : s.state === "locked" ? <Lock className="h-3 w-3" />
                    : <Icon className="h-3.5 w-3.5" />}
                  <span className="text-[10px] font-semibold whitespace-nowrap">{s.label}</span>
                </div>
                {s.hint && <span className="text-[9px] opacity-80 whitespace-nowrap leading-none">{s.hint}</span>}
              </button>
              {i < steps.length - 1 && (
                <ChevronRight className={`h-3.5 w-3.5 mx-0.5 shrink-0 ${steps[i + 1].state === "locked" ? "text-muted-foreground/40" : "text-muted-foreground"}`} />
              )}
            </div>
          );
        })}
      </div>

      {activeStep && (
        <Button
          onClick={() => onJump(activeStep.key)}
          className="w-full h-14 rounded-2xl font-semibold text-[15px] gap-2 bg-foreground text-background hover:bg-foreground/90 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.35)] transition-all active:scale-[0.99] group"
        >
          <span className="opacity-60 font-normal">Next step</span>
          <span className="opacity-40">·</span>
          <span>{nextLabel}</span>
          <ArrowRight className="h-4 w-4 ml-0.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      )}
    </div>
  );
}
