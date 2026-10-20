# Jev Flow design revision

Brief: make a useful app for testing Jev, replacing the presentation-like three-step page.

Direction: an inbox workbench. A short message list and selected message form the primary surface; decisions occupy a quiet inspector. Trace and JSON are secondary tabs. No introductory hero, numbered panels, repeated marketing cards, or decorative process labels.

Tokens: ink #252935, canvas #f5f6f8, surface #ffffff, line #e7e9ee, iris #635bda, amber #b77918. DM Sans is the interface typeface, with system monospace only for JSON. Left-aligned text; 13–15px body, 24px page title. One accent reserved for action and selection. Warm avatar colors identify fictional senders, never status.

Layout:

    workspace navigation | inbox list | selected message | decision inspector
                                      message / trace / data

At narrower desktop widths collapse navigation labels; on mobile stack list, message, and decision. Retain visible labels and keyboard focus. Existing free-model restriction, explicit sample labeling, stale-state handling, threshold rerouting, and server validation remain.

Critique of first draft: a giant hero and three equal panels made explanation compete with the task. Replace them with unequal work surfaces, message search, actual scenario selection, a functional rules drawer, and a session history view. Avoid adding KPI cards: three sample messages do not justify an analytics dashboard.

## Final art direction from user

Halftone print, with deep pink accents. Tokens: ink #242420, paper #fffdf6, canvas #f2efe5, line #cfcdc3, deep pink #bb155d, review amber #886018. Typography: DM Sans, with heavy headings, normal body, and monospace only for JSON. Print texture is confined to peripheral surfaces, stamps, selected-message corners, the empty-decision graphic, and workflow grid. Text surfaces stay clear. Square corners, ink borders, and offset shadows replace the rounded-card treatment. Functionality and honest live/sample labeling remain primary.
