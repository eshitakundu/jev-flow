"use client";

import { useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Code2,
  Command,
  FileText,
  GitBranch,
  Inbox,
  LoaderCircle,
  Mail,
  MessageSquare,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { sampleFixtures } from "@/lib/fixtures";
import { routeEvaluation } from "@/lib/routing";
import { buildQuestions, defaultDescriptions } from "@/lib/validation";
import { categories, type Evaluation } from "@/lib/types";
import { WorkflowCanvas } from "@/components/workflow-canvas";

const people = [
  {
    name: "Maya Chen",
    initials: "MC",
    color: "peach",
    subject: "A copy of my latest invoice",
    company: "Northstar Studio",
    time: "9:41 AM",
    hint: "Routine request",
    tag: "Billing",
    id: "JF-1001",
  },
  {
    name: "Alex Morgan",
    initials: "AM",
    color: "blue",
    subject: "Locked out before my presentation",
    company: "Fieldwork",
    time: "9:38 AM",
    hint: "Time-sensitive",
    tag: "Account access",
    id: "JF-1002",
  },
  {
    name: "Sam Rivera",
    initials: "SR",
    color: "pink",
    subject: "Something’s wrong with my plan",
    company: "Orbit Labs",
    time: "9:32 AM",
    hint: "Ambiguous request",
    tag: "General",
    id: "JF-1003",
  },
];
type Run = {
  evaluation: Evaluation;
  message: string;
  subject: string;
  time: string;
};
type Tab = "message" | "trace" | "data";

export default function Home() {
  const [mode, setMode] = useState<"sample" | "live">("sample");
  const [fixtureId, setFixtureId] = useState(sampleFixtures[0].id);
  const [message, setMessage] = useState(sampleFixtures[0].message);
  const [descriptions, setDescriptions] = useState(defaultDescriptions);
  const [threshold, setThreshold] = useState(80);
  const [result, setResult] = useState<Evaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const dialogRef = useRef<HTMLElement>(null);
  const [error, setError] = useState("");
  const [stale, setStale] = useState(false);
  const [replay, setReplay] = useState(0);
  const [history, setHistory] = useState<Run[]>([]);
  const [tab, setTab] = useState<Tab>("message");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "tested">("all");
  const [dialog, setDialog] = useState<"rules" | "history" | "help" | null>(
    null,
  );
  const index = sampleFixtures.findIndex((item) => item.id === fixtureId);
  const person =
    index >= 0
      ? people[index]
      : {
          name: "Your test message",
          initials: "YT",
          color: "violet",
          subject: "Custom support request",
          company: "Local experiment",
          time: "Draft",
          hint: "Custom input",
          tag: "Custom",
          id: "JF-DRAFT",
        };
  const fixture = sampleFixtures[index];
  const route = result && !stale ? routeEvaluation(result, threshold) : null;
  const tested = new Set(history.map((item) => item.subject));
  const visibleFixtures = sampleFixtures
    .map((item, i) => ({ ...item, person: people[i] }))
    .filter(
      (item) =>
        `${item.message} ${item.person.name} ${item.person.subject}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (filter === "all" || tested.has(item.person.subject)),
    );

  function invalidate() {
    if (result) setStale(true);
    setError("");
  }
  function selectScenario(id: string) {
    const next = sampleFixtures.find((item) => item.id === id)!;
    setFixtureId(id);
    setMessage(next.message);
    setResult(null);
    setStale(false);
    setError("");
    setTab("message");
  }
  function changeMode(next: "sample" | "live") {
    if (busy || next === mode) return;
    setMode(next);
    setResult(null);
    setStale(false);
    setError("");
    if (next === "sample") selectScenario(fixture?.id ?? sampleFixtures[0].id);
  }
  function compose() {
    if (busy) return;
    setMode("live");
    setFixtureId("custom");
    setMessage("");
    setResult(null);
    setStale(false);
    setError("");
    setTab("message");
  }
  async function run() {
    if (pending.current || !message.trim()) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setResult(null);
    setStale(false);
    try {
      let evaluation: Evaluation;
      if (mode === "sample") evaluation = fixture.evaluation;
      else {
        const response = await fetch("/api/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, descriptions }),
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Request failed.");
        evaluation = body;
      }
      setResult(evaluation);
      setReplay((n) => n + 1);
      setHistory((items) =>
        [
          {
            evaluation,
            message,
            subject: person.subject,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...items,
        ].slice(0, 10),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  function reset() {
    selectScenario(sampleFixtures[0].id);
    setMode("sample");
    setThreshold(80);
    setDescriptions(defaultDescriptions);
    setHistory([]);
    setQuery("");
    setFilter("all");
  }

  return (
    <div className="workbench">
      <aside className="sidebar" inert={dialog ? true : undefined}>
        <a className="logo" href="#" aria-label="Jev Flow home">
          <span className="logo-symbol">
            <GitBranch size={21} />
          </span>
          <span>
            jev<span className="logo-light">flow</span>
          </span>
        </a>
        <div className="workspace-switch">
          <span className="workspace-icon">P</span>
          <div>
            <b>Personal workspace</b>
            <small>Jev playground</small>
          </div>
          <ChevronDown size={13} />
        </div>
        <nav aria-label="Workspace navigation">
          <button
            aria-label="Test inbox"
            className="nav-item active"
            onClick={() => setDialog(null)}
          >
            <Inbox size={17} />
            <span>Test inbox</span>
            <span className="nav-count">3</span>
          </button>
          <button
            aria-label="Run history"
            className="nav-item"
            onClick={() => setDialog("history")}
          >
            <Activity size={17} />
            <span>Run history</span>
            {history.length > 0 && (
              <span className="nav-count">{history.length}</span>
            )}
          </button>
          <button
            aria-label="Routing rules"
            className="nav-item"
            onClick={() => setDialog("rules")}
          >
            <SlidersHorizontal size={17} />
            <span>Routing rules</span>
          </button>
        </nav>
        <div className="sidebar-divider" />
        <div className="sidebar-caption">About this inbox</div>
        <p className="sidebar-description">
          A safe place to test how Jev makes support decisions.
        </p>
        <div className="sidebar-note">
          <span className="small-orbit" />
          <span>
            Fictional messages
            <br />
            <b>Simulated actions</b>
          </span>
        </div>
        <div className="sidebar-bottom">
          <div className="free-note">
            <ShieldCheck size={17} />
            <div>
              <b>Free model only</b>
              <span>No paid fallback</span>
            </div>
          </div>
          <button
            aria-label="How this works"
            className="nav-item"
            onClick={() => setDialog("help")}
          >
            <CircleHelp size={17} />
            <span>How this works</span>
          </button>
          <div className="profile">
            <span className="profile-avatar">Y</span>
            <div>
              <b>Your experiment</b>
              <small>Local workspace</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-workspace" inert={dialog ? true : undefined}>
        <header className="app-header">
          <div className="breadcrumb">
            <Inbox size={16} />
            <span>Workspace</span>
            <ChevronRight size={13} />
            <b>Test inbox</b>
          </div>
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Run history"
              onClick={() => setDialog("history")}
            >
              <Activity size={17} />
            </button>
            <span className="local-status">
              <i /> Running locally
            </span>
            <button
              className="icon-button"
              aria-label="How this works"
              onClick={() => setDialog("help")}
            >
              <CircleHelp size={18} />
            </button>
          </div>
        </header>
        <div className="inbox-heading">
          <div>
            <h1>
              Test inbox <span>3</span>
            </h1>
            <p>Give every message the right next step.</p>
          </div>
          <button className="primary-button" onClick={compose} disabled={busy}>
            <Plus size={16} /> New test message
          </button>
        </div>
        <div className="experiment-bar">
          <div className="mode-control" aria-label="Evaluation mode">
            <button
              aria-pressed={mode === "sample"}
              className={mode === "sample" ? "selected" : ""}
              disabled={busy}
              onClick={() => changeMode("sample")}
            >
              <FileText size={13} /> Sample
            </button>
            <button
              aria-pressed={mode === "live"}
              className={mode === "live" ? "selected" : ""}
              disabled={busy}
              onClick={() => changeMode("live")}
            >
              <Zap size={13} /> Live Jev
            </button>
          </div>
          <span className="mode-description">
            {mode === "sample"
              ? "Sample data. No model calls."
              : "Real Jev via OpenCode’s free model."}
          </span>
          <button className="policy-link" onClick={() => setDialog("rules")}>
            <Settings2 size={14} />
            <span>Review below {threshold}%</span>
          </button>
        </div>

        <div className="inbox-workspace">
          <section className="message-list" aria-label="Test messages">
            <div className="list-search">
              <Search size={15} />
              <input
                aria-label="Search messages"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages…"
              />
              <kbd>⌕</kbd>
            </div>
            <div className="list-filters">
              <button
                aria-pressed={filter === "all"}
                className={filter === "all" ? "current" : ""}
                onClick={() => setFilter("all")}
              >
                All messages <span>3</span>
              </button>
              <button
                aria-pressed={filter === "tested"}
                className={filter === "tested" ? "current" : ""}
                onClick={() => setFilter("tested")}
              >
                Tested{" "}
                <span>
                  {people.filter((p) => tested.has(p.subject)).length}
                </span>
              </button>
            </div>
            <div className="ticket-list">
              {visibleFixtures.map((item) => (
                <button
                  className={`ticket ${fixtureId === item.id ? "ticket-selected" : ""}`}
                  disabled={busy}
                  key={item.id}
                  onClick={() => selectScenario(item.id)}
                >
                  <div className="ticket-top">
                    <span className={`avatar ${item.person.color}`}>
                      {item.person.initials}
                    </span>
                    <strong>{item.person.name}</strong>
                    <time>{item.person.time}</time>
                  </div>
                  <h2>{item.person.subject}</h2>
                  <p>{item.message}</p>
                  <div className="ticket-bottom">
                    <span className="ticket-tag">{item.person.tag}</span>
                    <span>
                      {tested.has(item.person.subject) ? (
                        <>
                          <Check size={11} /> Tested
                        </>
                      ) : (
                        item.person.hint
                      )}
                    </span>
                  </div>
                </button>
              ))}
              {visibleFixtures.length === 0 && (
                <div className="list-empty">
                  <Search size={20} />
                  <b>No messages found</b>
                  <p>
                    {filter === "tested"
                      ? "Run a decision to add a tested message."
                      : "Try a different search."}
                  </p>
                  <button
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                  >
                    Show all messages
                  </button>
                </div>
              )}
            </div>
            <div className="list-foot">
              <ShieldCheck size={13} />
              <span>3 fictional scenarios. Zero inbox access.</span>
            </div>
          </section>

          <section className="message-detail" aria-label="Selected message">
            <div className="message-toolbar">
              <span>
                <Mail size={14} />
                {person.id}
              </span>
              <span className="fictional-label">Fictional message</span>
            </div>
            <div className="message-title">
              <h2>{person.subject}</h2>
              <div className="sender">
                <span className={`avatar ${person.color}`}>
                  {person.initials}
                </span>
                <div>
                  <b>{person.name}</b>
                  <span>
                    {person.company} <span className="sender-separator">/</span>{" "}
                    To Support
                  </span>
                </div>
                <time>{person.time}</time>
              </div>
            </div>
            <div
              className="detail-tabs"
              role="tablist"
              aria-label="Message views"
            >
              {(
                [
                  { id: "message", label: "Message", icon: MessageSquare },
                  { id: "trace", label: "Decision trace", icon: GitBranch },
                  { id: "data", label: "Request data", icon: Code2 },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={tab === item.id}
                  aria-controls={`view-${item.id}`}
                  id={`tab-${item.id}`}
                  className={tab === item.id ? "selected" : ""}
                  onClick={() => setTab(item.id)}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              ))}
            </div>
            <div
              className="detail-content"
              role="tabpanel"
              id={`view-${tab}`}
              aria-labelledby={`tab-${tab}`}
            >
              {tab === "message" && (
                <>
                  <div className="message-body">
                    <div className="message-greeting">Hi team,</div>
                    <label htmlFor="message" className="sr-only">
                      Support message
                    </label>
                    <textarea
                      id="message"
                      className="message-editor"
                      maxLength={4000}
                      disabled={busy}
                      readOnly={mode === "sample"}
                      placeholder="Write a fictional support message to test Jev…"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        invalidate();
                      }}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                          e.preventDefault();
                          void run();
                        }
                      }}
                    />
                    <p className="message-signoff">
                      Thanks,
                      <br />
                      {person.name.split(" ")[0]}
                    </p>
                  </div>
                  <div className="message-context">
                    <div className="context-icon">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <b>
                        {mode === "sample"
                          ? "Try the decision, then change the rules"
                          : "Ready for a real Jev decision"}
                      </b>
                      <p>
                        {mode === "sample"
                          ? "Start with this example. Switch to Live Jev to edit the message and test the actual model."
                          : "Jev will choose a team and assess urgency in one request. Only fictional text should go here."}
                      </p>
                    </div>
                  </div>
                </>
              )}
              {tab === "trace" && (
                <>
                  <div className="trace-intro">
                    <div>
                      <h3>Follow the decision</h3>
                      <p>
                        Jev returns both answers together. Your rules choose the
                        destination.
                      </p>
                    </div>
                    <button
                      className="quiet-button"
                      disabled={!route || busy}
                      onClick={() => setReplay((n) => n + 1)}
                    >
                      <RotateCcw size={13} /> Replay
                    </button>
                  </div>
                  <div className="trace-canvas">
                    <WorkflowCanvas
                      evaluation={stale ? null : result}
                      route={route}
                      replay={replay}
                    />
                  </div>
                  <p className="trace-caption">
                    Application routing only. This is not a view of Jev’s hidden
                    reasoning.
                  </p>
                </>
              )}
              {tab === "data" && (
                <div className="data-view">
                  <h3>What we send</h3>
                  <p>
                    {mode === "sample"
                      ? "This is the equivalent request blueprint. Sample mode sends nothing."
                      : "The key stays on the server and is never included here."}
                  </p>
                  <pre>
                    {JSON.stringify(
                      {
                        model:
                          mode === "sample"
                            ? "sample fixture — no request"
                            : "jev-1.13-free",
                        state: message,
                        questions: buildQuestions(descriptions),
                      },
                      null,
                      2,
                    )}
                  </pre>
                  <h3>
                    {stale
                      ? "Previous result · input has changed"
                      : "What came back"}
                  </h3>
                  <pre>
                    {JSON.stringify(
                      { evaluation: result, threshold, route },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              )}
            </div>
            {error && (
              <div className="request-error" role="alert">
                <b>Decision couldn’t run</b>
                <p>{error}</p>
              </div>
            )}
            {stale && (
              <div className="stale-note" role="status">
                Input changed. Run a new decision to update the result.
              </div>
            )}
            <div className="message-action">
              <div>
                <span
                  className={`source-dot ${mode === "live" ? "live" : ""}`}
                />
                <span>
                  {mode === "sample" ? "Sample fixture" : "jev-1.13-free"}
                  <small>
                    {mode === "sample"
                      ? "No model request"
                      : "One request · two questions"}
                  </small>
                </span>
              </div>
              <button
                className="primary-button run-button"
                disabled={busy || !message.trim()}
                onClick={run}
              >
                {busy ? (
                  <LoaderCircle size={15} className="spin" />
                ) : (
                  <Sparkles size={15} />
                )}{" "}
                {busy ? "Asking Jev…" : "Run decision"}
                {!busy && (
                  <kbd>
                    <Command size={10} /> ↵
                  </kbd>
                )}
              </button>
            </div>
          </section>

          <aside className="decision-inspector" aria-label="Decision result">
            <div className="inspector-heading">
              <h2>Decision</h2>
              <span className={`result-state ${route ? "complete" : ""}`}>
                {busy
                  ? "Evaluating"
                  : stale
                    ? "Outdated"
                    : route
                      ? "Complete"
                      : "Not run"}
              </span>
            </div>
            {!route ? (
              <div className="empty-decision">
                <div className="decision-orbit">
                  <GitBranch size={27} />
                  <span>
                    <Sparkles size={11} />
                  </span>
                </div>
                <h3>
                  {busy
                    ? "Reading your message"
                    : stale
                      ? "Ready for another look"
                      : "Let’s find its next step"}
                </h3>
                <p>
                  {busy
                    ? "Jev is answering two typed questions. The result will appear here."
                    : "Run a decision to see the team, urgency, and the rule that picks the queue."}
                </p>
                {!busy && (
                  <span className="empty-arrow">
                    <ArrowDown size={14} /> Start with Run decision
                  </span>
                )}
              </div>
            ) : (
              <div className="decision-result" aria-live="polite">
                <div
                  className={`route-result ${route.destination === "Human review" ? "needs-review" : ""}`}
                >
                  <span className="route-icon">
                    {route.destination === "Human review" ? (
                      <ShieldCheck size={20} />
                    ) : route.destination === "Priority queue" ? (
                      <Zap size={20} />
                    ) : (
                      <CheckCheck size={20} />
                    )}
                  </span>
                  <span className="result-label">Simulated destination</span>
                  <h3>{route.destination}</h3>
                  <p>{route.team}</p>
                </div>
                <div className="answer-list">
                  {[
                    {
                      label: "Team",
                      value: result!.category,
                      confidence: result!.categoryConfidence,
                    },
                    {
                      label: "Urgency",
                      value: result!.urgency,
                      confidence: result!.urgencyConfidence,
                    },
                  ].map((item) => (
                    <div className="answer-row" key={item.label}>
                      <div className="answer-label">
                        <span>{item.label}</span>
                        <b>
                          {item.confidence === undefined
                            ? "Unavailable"
                            : `${item.confidence.toFixed(1)}%`}
                        </b>
                      </div>
                      <strong>{item.value}</strong>
                      <div className="probability-track">
                        <span
                          className={
                            (item.confidence ?? -1) < threshold ? "below" : ""
                          }
                          style={{ width: `${item.confidence ?? 0}%` }}
                        />
                        <i style={{ left: `${Math.min(threshold, 99)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rule-explanation">
                  <span>
                    <GitBranch size={13} /> Applied rule
                  </span>
                  <p>{route.reason}</p>
                </div>
                <button className="trace-link" onClick={() => setTab("trace")}>
                  View decision trace <ArrowRight size={14} />
                </button>
              </div>
            )}
            <div className="policy-control">
              <div>
                <label htmlFor="threshold">Review threshold</label>
                <b>{threshold}%</b>
              </div>
              <input
                id="threshold"
                type="range"
                min="0"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
              <div className="range-labels">
                <span>Automate more</span>
                <span>Review more</span>
              </div>
              <p>
                Adjust the route using this result.
                <br />
                No additional model call.
              </p>
            </div>
            <div className="inspector-meta">
              <div>
                <span>Model request time</span>
                <b>
                  {result && !stale && result.latencyMs !== undefined
                    ? `${result.latencyMs.toLocaleString()} ms`
                    : "—"}
                </b>
              </div>
              <div>
                <span>Result source</span>
                <b>
                  {result && !stale
                    ? result.source === "sample"
                      ? "Sample fixture"
                      : "Live Jev"
                    : "Awaiting run"}
                </b>
              </div>
              <p>
                {result?.source === "live" && !stale
                  ? "Percentages show the selected answers’ probabilities. They are not guarantees."
                  : "Sample probabilities are illustrative. No model is called in Sample mode."}
              </p>
            </div>
          </aside>
        </div>
        <footer className="workspace-footer">
          <span>
            <ShieldCheck size={12} /> Nothing is sent to a real support queue.
          </span>
          <button disabled={busy} onClick={reset}>
            <RotateCcw size={12} /> Reset experiment
          </button>
        </footer>
      </main>

      {dialog && (
        <div className="dialog-backdrop" onClick={() => setDialog(null)}>
          <section
            ref={dialogRef}
            className={`workspace-dialog ${dialog === "rules" ? "rules-dialog" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setDialog(null);
              if (e.key === "Tab") {
                const focusable =
                  dialogRef.current?.querySelectorAll<HTMLElement>(
                    "button:not(:disabled), a[href], textarea:not(:disabled), input:not(:disabled)",
                  );
                if (!focusable?.length) return;
                const first = focusable[0],
                  last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            <header>
              <div>
                <span className="dialog-icon">
                  {dialog === "rules" ? (
                    <SlidersHorizontal size={19} />
                  ) : dialog === "history" ? (
                    <Activity size={19} />
                  ) : (
                    <CircleHelp size={19} />
                  )}
                </span>
                <h2 id="dialog-title">
                  {dialog === "rules"
                    ? "Routing rules"
                    : dialog === "history"
                      ? "Run history"
                      : "A useful test for Jev"}
                </h2>
              </div>
              <button
                autoFocus
                className="icon-button"
                aria-label="Close dialog"
                onClick={() => setDialog(null)}
              >
                <X size={19} />
              </button>
            </header>
            <div className="dialog-body">
              {dialog === "rules" && (
                <>
                  <p className="dialog-description">
                    Jev picks the answers. These application rules decide what
                    happens next.
                  </p>
                  <ol className="policy-steps">
                    <li>
                      Missing answer probability <ArrowRight size={13} />
                      <b>Human review</b>
                    </li>
                    <li>
                      Either probability below {threshold}%{" "}
                      <ArrowRight size={13} />
                      <b>Human review</b>
                    </li>
                    <li>
                      Both pass + urgent <ArrowRight size={13} />
                      <b>Priority queue</b>
                    </li>
                    <li>
                      Both pass + normal <ArrowRight size={13} />
                      <b>Standard queue</b>
                    </li>
                  </ol>
                  <h3>Team descriptions</h3>
                  <p className="dialog-description">
                    {mode === "sample"
                      ? "Read-only in Sample mode. Switch to Live Jev to edit the criteria."
                      : "Tell Jev what belongs to each team. Changes require a new run."}
                  </p>
                  <div className="description-fields">
                    {categories.map((category) => (
                      <label key={category}>
                        {category}
                        <textarea
                          maxLength={300}
                          disabled={busy}
                          readOnly={mode === "sample"}
                          value={descriptions[category]}
                          onChange={(e) => {
                            setDescriptions({
                              ...descriptions,
                              [category]: e.target.value,
                            });
                            invalidate();
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </>
              )}
              {dialog === "history" && (
                <>
                  <p className="dialog-description">
                    Your last ten runs, kept in memory. Refreshing clears this
                    notebook.
                  </p>
                  {history.length ? (
                    <div className="run-list">
                      {history.map((item, i) => (
                        <article key={i}>
                          <span className="history-icon">
                            <Check size={15} />
                          </span>
                          <div>
                            <h3>{item.subject}</h3>
                            <p>
                              {item.evaluation.category} /{" "}
                              {item.evaluation.urgency}
                            </p>
                            <small>
                              {item.evaluation.source === "sample"
                                ? "Sample fixture"
                                : "Live Jev"}{" "}
                              · {item.time}
                            </small>
                          </div>
                          <span className="history-probability">
                            {item.evaluation.categoryConfidence?.toFixed(1) ??
                              "—"}
                            %
                          </span>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="history-empty">
                      <Activity size={28} />
                      <h3>No decisions yet</h3>
                      <p>
                        Run your first message and the result will appear here.
                      </p>
                      <button
                        className="primary-button"
                        onClick={() => setDialog(null)}
                      >
                        Back to inbox
                      </button>
                    </div>
                  )}
                </>
              )}
              {dialog === "help" && (
                <div className="help-content">
                  <p>
                    Support triage is a real use for a decision model: choose a
                    team, recognize urgency, and let a person handle
                    uncertainty.
                  </p>
                  <h3>Try this experiment</h3>
                  <p>
                    Select Sam’s ambiguous message and run it in Sample mode. At
                    80% it needs human review. Lower the threshold to 65% and
                    watch the route change without a new request.
                  </p>
                  <h3>Test the real model</h3>
                  <p>
                    Switch to Live Jev and run one fictional message. The server
                    calls OpenCode’s <code>jev-1.13-free</code> once with both
                    questions. Free access is a limited-time provider offer.
                    Failures stay visible; no paid model is substituted.
                  </p>
                  <h3>See exactly what happened</h3>
                  <p>
                    Decision trace shows the application route. Request data
                    shows the typed questions, response, and rule. Neither
                    reveals or invents model reasoning. Destinations are always
                    simulated.
                  </p>
                  <a
                    className="documentation-link"
                    href="https://opencode.ai/v2/docs/console/models/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    OpenCode model and access documentation{" "}
                    <ArrowRight size={14} />
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
