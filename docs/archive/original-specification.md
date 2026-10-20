# Jev Flow

An interactive decision playground that shows how AI turns incoming messages into structured workflow decisions.

Paste a message, run Jev, and watch the selected route light up on a visual canvas. Change the message or confidence threshold to see how the workflow behaves differently.

> Project status: specification, not a completed application.
> The setup commands scaffold the project. The implementation checklist describes what must be built before the demo works.

## 1. What we are building

Jev Flow is a personal learning project and portfolio demo.

The user plays the role of someone designing a support automation workflow. They provide a message; Jev evaluates its category and urgency; application code uses those results to select a simulated action.

Example input:

> I was charged twice and my renewal is tomorrow. Please help.

Illustrative workflow:

Incoming message → Billing → Urgent → Review queue

The interface shows:

- The selected category and urgency.
- The model’s confidence, where supplied by the API.
- The active route through the workflow.
- The application rule that selected the final action.
- Measured request duration.
- The structured response in an expandable inspector.

All actions are simulated. “Review queue” means displaying a card in the demo, not creating a ticket in another service.

Jev results may be wrong. Confidence is a model estimate, not a guarantee.

## 2. What Jev does

Jev evaluates questions with predefined answer types, such as choices, scores, and booleans.

In this project, Jev answers:

1. Which category best matches this message?
2. How urgent is it?

Our application then applies explicit rules to those answers.

Jev does not:

- Build the website.
- Write free-form replies.
- Access an inbox.
- Send messages.
- Issue refunds.
- Execute workflow actions.

Explanations shown in the UI come from application rules and templates, not invented model reasoning.

Official model reference:
https://vercel.com/ai-gateway/models/jev

## 3. Access and accounts

| Item | Why it is needed |
| --- | --- |
| GitHub account | Store the repository |
| Node.js and npm | Run the application locally |
| Vercel Hobby account | Deploy the personal demo |
| Vercel AI Gateway key | Make live Jev requests locally |

No separate TypeSafe key is planned when using Jev through AI Gateway.

No email, Slack, banking, or other integrations are required.

For deployment, grant Vercel access only to this repository when GitHub offers that choice.

Data flow in live mode:

Browser → Local Next.js server → Vercel AI Gateway → Jev → Results

The message and category descriptions are sent to the model provider. Use fictional examples rather than private messages.

Data flow in public sample mode:

Browser → Bundled sample fixture → Animated workflow

Sample mode does not call a model.

## 4. Free-cost design

The project must remain usable without paid services.

### Local live mode

Use available Vercel AI Gateway free credits.

Vercel currently documents monthly free credits, but account eligibility, model availability, and terms can change. Verify the current dashboard before enabling live mode.

- Do not purchase credits for this project.
- Leave automatic top-up disabled.
- Do not add a paid provider key as a fallback.
- Do not upgrade to Pro for this demo.
- If free Jev access is unavailable, use sample mode.
- Stop live use when the available free allowance is exhausted.

If available in the dashboard, set a small API-key budget, such as $1 per month. Budgets limit consumption; they do not grant free credit.

The old Jev launch promotion is not the basis of this plan.

### Public deployment

Deploy sample mode on Vercel Hobby with live requests disabled.

Visitors can explore the workflow without spending model credits.

Hobby is intended for personal, non-commercial projects and has usage limits. Use the provided `vercel.app` domain.

This is a $0-out-of-pocket design under the applicable free-tier limits, not a promise of unlimited free hosting or perpetual free API access.

References:

- https://vercel.com/docs/ai-gateway/pricing
- https://vercel.com/docs/ai-gateway/observability-and-spend/budgets
- https://vercel.com/docs/plans/hobby

## 5. The user experience

### Layout

Desktop:

- Left: message editor and example selector.
- Center: branching workflow canvas.
- Right: decision details and simulated action.
- Bottom: expandable JSON inspector.

Mobile:

- Stack the same sections vertically.
- Keep the canvas readable with pan/zoom or a compact layout.

### Main controls

- Sample / Live mode indicator.
- Example selector.
- Message text area.
- Run decision button.
- Confidence threshold slider.
- Editable category descriptions in live mode.
- Replay animation button.
- Reset button.

### Workflow nodes

1. Incoming message.
2. Category decision.
3. Urgency decision.
4. Confidence gate.
5. Simulated destination.

Category choices:

- Billing.
- Account access.
- Technical issue.
- General question.

Urgency choices:

- Urgent.
- Normal.

Destinations:

- Human review.
- Priority queue.
- Standard queue.

### Routing rules

Apply rules in this order:

1. If a required confidence value is unavailable, send to Human review.
2. If category or urgency confidence is below the user’s threshold, send to Human review.
3. Otherwise, if urgency is Urgent, send to Priority queue.
4. Otherwise, send to Standard queue.

Default threshold: 80%.

Display the category as the destination team, for example:

“Billing / Priority queue”

Confidence refers to the selected answer for each question. Do not multiply probabilities or invent a combined model-confidence score.

If the SDK exposes confidence differently, document the mapping and adapt the UI honestly.

### Changing the threshold

Changing the threshold must recalculate the application route using the existing model result.

It must not make another API request.

Changing the message or category descriptions makes the previous result stale. Require a new run before presenting it as a result for the edited input.

### Animation

Animate the selected path after the response arrives.

The animation represents application routing. It is not a visualization of Jev’s internal reasoning or sequential model calls.

Prefer one model request containing both questions.

Honor reduced-motion preferences.

## 6. Sample mode versus live mode

### Sample mode

- Works without any API key.
- Offers a fixed set of fictional messages.
- Uses deterministic bundled fixtures.
- Always shows “Sample data — no model call”.
- Allows threshold changes and animation replay.
- Locks message/category editing, with an explanation that live mode enables custom inputs.
- Displays latency as unavailable, not a fake measured value.
- Identifies fixture confidence values as illustrative.

Include examples that demonstrate:

1. A confident normal request.
2. A confident urgent request.
3. An ambiguous request routed to Human review.

Never silently replace a failed live request with a sample result.

### Live mode

- Accepts a custom message.
- Calls the server-side Jev adapter.
- Displays actual returned values.
- Measures server request duration separately from the animation.
- Shows a clear error for unavailable credits, configuration problems, or provider failures.
- Does not retry automatically or fall back to another paid model.

## 7. Technical stack

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- React Flow via `@xyflow/react`.
- Vercel AI SDK.
- Zod for request validation.
- Lucide icons.
- Vitest for routing and validation tests.
- npm and a committed lockfile.

No database, user accounts, payments, email integration, or background jobs are needed.

Use React Flow’s own transitions or CSS for animation.

Store at most the last 10 runs in browser memory. Refreshing the page clears them.

## 8. Suggested repository structure

```text
jev-flow/
├── README.md
├── docs/
│   └── demo.gif
└── web/
    ├── .env.example
    ├── .env.local             # ignored; never commit
    ├── package.json
    ├── package-lock.json
    ├── public/
    └── src/
        ├── app/
        │   ├── page.tsx
        │   ├── layout.tsx
        │   └── api/
        │       └── evaluate/
        │           └── route.ts
        ├── components/
        │   ├── message-editor.tsx
        │   ├── workflow-canvas.tsx
        │   ├── decision-panel.tsx
        │   └── response-inspector.tsx
        └── lib/
            ├── types.ts
            ├── validation.ts
            ├── routing.ts
            ├── routing.test.ts
            ├── fixtures.ts
            └── jev.server.ts
```

The implementing session may refine filenames while preserving the architecture.

## 9. Manual step 1: create and clone the repository

Create a GitHub repository named:

`jev-flow`

Add this README when creating it, or save this file after cloning.

In a terminal:

```bash
git clone https://github.com/YOUR_USERNAME/jev-flow.git
cd jev-flow
```

Replace `YOUR_USERNAME`.

Open this repository folder in your editor or coding assistant.

## 10. Manual step 2: install prerequisites

Install the current Node.js LTS release supported by Next.js from:

https://nodejs.org/

Verify:

```bash
node --version
npm --version
git --version
```

If a command is missing, finish installing that tool and reopen the terminal.

## 11. Manual step 3: scaffold the app

From the repository root:

```bash
npx create-next-app@latest web --ts --tailwind --eslint --app --src-dir --use-npm --import-alias "@/*"
cd web
npm install ai @xyflow/react zod lucide-react
npm install --save-dev vitest
```

Accept normal defaults for any additional scaffolding questions.

If `web/package.json` already exists, do not scaffold again. Instead run:

```bash
cd web
npm ci
```

These commands create the foundation, not the completed Jev Flow application.

## 12. Implementation handoff for a new coding session

Give the coding session this instruction:

> Read the root README.md and implement Jev Flow in web/.
> Treat the README as the project specification.
> First finish and verify sample mode, then implement the live Jev adapter.
> Inspect existing files before scaffolding or replacing anything.
> Verify the current Jev evaluation API and SDK compatibility against
> official documentation and installed package types. Do not guess the
> choice-question syntax or response shape.
> Use server-side credentials and an explicit ENABLE_LIVE_JEV guard.
> Public deployment must work in sample mode with live calls disabled,
> even if Vercel provides automatic OIDC credentials.
> Do not add paid services, external integrations, or a second model.
> Run meaningful routing/validation tests, lint, and a production build.
> Update this README with the actual commands, verified SDK versions,
> completed features, and remaining limitations.
> Do not claim live Jev was tested unless a real request succeeded.
> Ask me to enter credentials locally when needed; never ask me to paste
> API keys into chat.

### Implementation phases

#### Phase A: complete the sample experience

- Build the three-panel interface.
- Create custom workflow nodes and branching edges.
- Add the three required sample fixtures.
- Implement the pure routing function.
- Add threshold-driven rerouting.
- Add animation replay without a network request.
- Add the structured-response inspector.
- Add responsive styles and reduced-motion support.

#### Phase B: add the live integration

- Verify the current official evaluation API.
- Check whether installed `ai` supports the documented
  `experimental_evaluate` API.
- Install a documented compatible release if necessary and commit the lockfile.
- Put SDK-specific code in `jev.server.ts`.
- Use model ID `typesafe-ai/jev`.
- Ask category and urgency questions in one request when supported.
- Normalize the provider response into the app’s own types.
- Preserve missing confidence as missing.
- Validate messages and category descriptions server-side.
- Allow up to 4,000 message characters.
- Allow four category descriptions of up to 300 characters each.
- Reject oversized request bodies, including requests bypassing the UI.
- Keep the model ID and question schema under server control.
- Use a bounded timeout and no automatic retries.
- Return sanitized errors without secrets or raw internal exceptions.
- Do not log message contents.
- Disable duplicate submissions while a request is pending.

#### Phase C: enforce the free public-demo boundary

- Gate live requests on the server with `ENABLE_LIVE_JEV`.
- If false, return a clear disabled response before calling any provider.
- Default live mode to disabled.
- Require an explicit API key for this app’s live adapter.
- Do not treat ambient Vercel OIDC credentials as permission to call Jev.
- Public deployment uses sample mode only.
- Do not claim a browser counter or in-memory server counter is a durable spending cap.

#### Phase D: verify and polish

- Test all routing branches and confidence boundary cases.
- Test invalid/oversized input.
- Verify the disabled endpoint never calls the provider.
- Verify sample mode makes no model requests.
- Handle loading, errors, stale results, and reset.
- Add npm scripts for tests and lint.
- Run lint, tests, and a production build.
- Inspect the application in a browser.

## 13. Manual step 4: try sample mode first

After Phase A is implemented:

```bash
cd web
npm run dev
```

If already inside `web`, omit `cd web`.

Open:

http://localhost:3000

Confirm that you can:

1. Select a sample message.
2. Run the sample decision.
3. Watch its route animate.
4. Move the threshold and see the route update.
5. Inspect the sample JSON.

No account credentials are needed for this step.

## 14. Manual step 5: check free Jev access

1. Sign in to Vercel.
2. Choose your personal Hobby account/team.
3. Open AI Gateway.
4. Inspect your credit balance and free-tier eligibility.
5. Check whether `typesafe-ai/jev` is available to your account.
6. Confirm automatic top-up is disabled.
7. Do not purchase credits or start a paid upgrade.
8. Create a dedicated API Gateway key for this project.
9. If supported, give that key a small monthly budget.

If free access is unavailable, stop here and continue using sample mode. The rest of the app and deployment can still be completed.

Authentication documentation:

https://vercel.com/docs/ai-gateway/authentication-and-byok

## 15. Manual step 6: configure local live mode

Create `web/.env.local`:

```dotenv
AI_GATEWAY_API_KEY=replace_with_your_key
ENABLE_LIVE_JEV=true
```

Do not add `NEXT_PUBLIC_` to the API key name.

The implementing session must also create `web/.env.example`:

```dotenv
AI_GATEWAY_API_KEY=
ENABLE_LIVE_JEV=false
```

Ensure `web/.gitignore` ignores local secrets and allows the example:

```gitignore
.env*
!.env.example
```

From the repository root, verify:

```bash
git check-ignore web/.env.local
```

Expected output:

```text
web/.env.local
```

Restart the development server after editing environment variables.

Never paste the API key into a GitHub issue, README, screenshot, GIF, or chat.

## 16. Manual step 7: test a real request

Once the live adapter is implemented:

1. Start the app locally.
2. Select Live mode.
3. Enter a fictional support message.
4. Click Run decision once.
5. Confirm a real result appears.
6. Confirm the UI identifies it as live.
7. Open AI Gateway usage and verify the request was recorded.
8. Check its actual credit consumption.
9. Move the confidence slider.
10. Confirm moving the slider does not create another Gateway request.

If the request fails, keep the error visible. Do not present sample data as a successful live response.

Do not assert a particular category or confidence will always be returned.

## 17. Manual step 8: final verification

The implementation must provide these commands:

```bash
npm run lint
npm run test
npm run build
```

Run them from `web/`.

Then test the production build locally:

```bash
npm run start
```

Stop the development server first if it occupies the same port.

Verify:

- Sample mode works without a key.
- Live mode is disabled when `ENABLE_LIVE_JEV=false`.
- Live mode works locally only when correctly configured.
- Confidence threshold changes do not call the API.
- Edited messages mark old results stale.
- Missing confidence routes to Human review.
- Failed live calls show an error.
- Provider timing is not confused with animation duration.
- No keys appear in browser code or responses.
- The layout works on a narrow screen.
- Reduced-motion preferences are respected.

## 18. Manual step 9: commit and push

From the repository root:

```bash
git status
```

Check that `.env.local` is not listed for addition.

Then:

```bash
git add README.md web
git diff --cached --stat
git commit -m "Build Jev Flow decision playground"
git push
```

Review staged files before committing if anything unexpected appears.

## 19. Manual step 10: deploy the free public demo

1. Open Vercel.
2. Choose Add New → Project.
3. Connect GitHub if needed.
4. Import `jev-flow`.
5. Select your Hobby account/team.
6. Set Root Directory to `web`.
7. Confirm Next.js is detected.
8. Keep the normal framework build settings.
9. Add this environment variable:

```dotenv
ENABLE_LIVE_JEV=false
```

10. Do not add `AI_GATEWAY_API_KEY` to this public deployment.
11. Apply the disabled setting to Production and Preview environments.
12. Click Deploy.
13. Open the resulting `vercel.app` URL.

The server-side disabled guard is required even without a key because deployment environments may provide other authentication automatically.

Verify the deployed site:

- Opens in sample mode.
- Clearly labels sample data.
- Runs all bundled examples.
- Reroutes when the threshold changes.
- Does not offer functional public live access.
- Rejects direct live-endpoint requests without contacting Jev.

If Vercel requests a paid feature or upgrade, do not accept it for this project. Review the configuration instead.

After deployment, future pushes normally trigger new deployments through the GitHub integration.

## 20. Manual step 11: record the README GIF

Record the local live version if you want to demonstrate actual Jev usage.

Suggested sequence:

1. Show the Live mode badge.
2. Paste a short fictional message.
3. Click Run decision.
4. Show the active route and actual confidence.
5. Adjust the threshold to demonstrate rule-based rerouting.
6. Open the JSON inspector.

Only show a route change if it actually happens. Choose examples after testing; model results are not guaranteed.

Alternatively, record sample mode and leave the “Sample data” badge visible.

Keep the recording around 10–20 seconds. Hide terminals, environment files, and account settings.

Save the GIF at:

```text
docs/demo.gif
```

Once the file exists, add this near the top of the README:

```markdown
![Jev Flow workflow demonstration](docs/demo.gif)
```

Also add the actual deployed URL:

```markdown
[Try the interactive sample demo](https://YOUR-DEPLOYMENT.vercel.app)
```

Label whether the GIF shows live Jev or sample data.

Commit the recording:

```bash
git add docs/demo.gif README.md
git commit -m "Add demo recording and deployment link"
git push
```

## 21. Troubleshooting

### The page is still the default Next.js starter

Scaffolding is complete, but the app implementation has not been done.
Follow the implementation handoff in section 12.

### The Jev evaluation import does not exist

Check the official model example and installed SDK version.
Do not replace Jev with a chat-generation call or invent an API.
Use a documented compatible SDK release.

### Live mode says disabled

Check `ENABLE_LIVE_JEV` and restart the local server.
Public deployment is intentionally configured this way.

### Authentication fails

Check the local key, its account/team, and whether it was revoked.
Do not expose the key while debugging.

### Credits or model access are unavailable

Return to sample mode. Do not buy credits to finish this project.

### Threshold changes do not change the route

The selected answers may still pass or fail both thresholds.
Use the ambiguous sample fixture to demonstrate the boundary.

### A deployment environment variable was changed

Redeploy so the new configuration takes effect.

### Live results differ from the GIF

Model outputs can vary with input, model updates, and service behavior.
The GIF is one observed run, not a guaranteed response.

## 22. Definition of done

- [ ] Sample mode works without credentials.
- [ ] The canvas animates real application routing.
- [ ] Categories and urgency are visible.
- [ ] Threshold changes reroute without another model call.
- [ ] Sample and live results are clearly distinguished.
- [ ] Actions are explicitly simulated.
- [ ] Live Jev is verified locally, or marked unverified if free access is unavailable.
- [ ] Input validation and routing tests pass.
- [ ] Lint and production build pass.
- [ ] Secrets are excluded from Git.
- [ ] Public sample deployment works on Vercel Hobby.
- [ ] Public live requests are disabled server-side.
- [ ] README has the real deployment link.
- [ ] README has a correctly labeled GIF.
- [ ] No paid service is required to explore the deployed demo.

## 23. Future scope

Only after the initial version is complete:

- Compare two messages side by side.
- Add more workflow presets.
- Export a local run as JSON.
- Add category-probability charts if the API exposes full distributions.

Real inbox integrations, autonomous actions, public live inference, and
commercial hosting are separate projects with additional access and
operational requirements.