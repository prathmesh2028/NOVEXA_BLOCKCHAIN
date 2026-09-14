FINAL FIGMA PROMPT

Absolutely bro. The previous prompt was detailed, but it can be pushed much further by making it function like a **complete product-design specification + Figma execution protocol**, so the AI has almost nothing left to guess.

Use this **overdriven version**:

```text
╔══════════════════════════════════════════════════════════════════════╗
║          BEL-DEFENCE-ASSET-TRUST — MASTER FIGMA FRONTEND            ║
║             OVERDRIVE DESIGN GENERATION SPECIFICATION               ║
╚══════════════════════════════════════════════════════════════════════╝


ROLE
======================================================================

You are simultaneously acting as:

- Principal Product Designer
- Senior UX Architect
- Enterprise SaaS Designer
- Cybersecurity Product Designer
- Defence Technology Product Designer
- Blockchain UX Specialist
- Design-System Architect
- Information Architect
- Interaction Designer
- Responsive Web Designer
- Accessibility Specialist
- Figma Component Architect
- Figma Variables Specialist
- Developer-Handoff Specialist
- Product Strategist

Your ONLY responsibility is to create the COMPLETE FRONTEND
DESIGN SYSTEM and USER EXPERIENCE in Figma for our actual product.

You are NOT being asked to:

- write React code
- write backend code
- design PostgreSQL
- design FastAPI
- implement Solidity
- design smart-contract internals
- create infrastructure
- invent unsupported business workflows

You ARE being asked to design the COMPLETE visual and interactive
frontend that can later be implemented using:

React
+
Vite
+
TypeScript
+
Chakra UI

and passed through:

FIGMA DESIGN
→ FIGMA MAKE
→ FRONTEND CODE
→ ANTIGRAVITY / AI CODING AGENT
→ WORKING PRODUCT


======================================================================
1. PRODUCT IDENTITY
======================================================================

PRODUCT NAME:

BEL-DEFENCE-ASSET-TRUST

PROJECT:

SIH 2026 PS 26125

“Blockchain-Based Secure Platform for Identity, Access Control,
and Digital Asset Management”

PRIMARY PURPOSE:

Build a secure, verifiable frontend for managing defence-related
digital asset records, technical evidence, certification, blockchain
records, identity, permissions, lifecycle history, and auditing.

PRIMARY PROTOTYPE ASSET:

Synthetic Electronic Fuze batch.

IMPORTANT:

This is a prototype representation.

Never visually imply that the UI represents confidential,
classified, or real operational BEL records.


======================================================================
2. THE CENTRAL PRODUCT IDEA
======================================================================

The product revolves around one central question:

“WHO performed WHAT action,
ON WHICH asset,
USING WHAT evidence,
UNDER WHICH permission,
AND CAN THAT HISTORY BE VERIFIED?”

Everything in the frontend should support this mental model.

The major trust chain is:

IDENTITY
↓
ROLE
↓
PERMISSION
↓
ASSET
↓
EVIDENCE
↓
LIFECYCLE EVENT
↓
CERTIFICATION
↓
BLOCKCHAIN RECORD
↓
AUDIT
↓
VERIFICATION


======================================================================
3. CURRENT MVP ROLES
======================================================================

THERE ARE EXACTLY FOUR ROLES IN THE CURRENT FRONTEND.

DO NOT INTRODUCE ADDITIONAL ROLES.

--------------------------------------------------

ROLE 1 — ADMIN

Mental model:

“Control, governance and system oversight.”

Admin can view/manage:

- users
- roles
- permissions
- assets
- certifications
- blockchain activity
- audit activity
- security events
- system status

Admin UI should feel:

authoritative
structured
information-dense
controlled

--------------------------------------------------

ROLE 2 — NFT CREATOR

Mental model:

“Review eligible asset records and create trusted digital certification.”

NFT Creator can:

- see eligible assets
- review evidence
- review asset history
- review technical information
- create certification
- initiate minting
- monitor blockchain transaction
- inspect certification
- inspect certification history
- perform authorized revocation where available

NFT Creator should NOT feel like a crypto trader.

--------------------------------------------------

ROLE 3 — TECHNICIAN

Mental model:

“Create and maintain accurate technical records.”

Technician can:

- view assigned assets
- register asset/batch information
- add technical information
- submit evidence
- record inspections
- update permitted lifecycle states
- submit records for certification
- inspect asset history

Technician UI should prioritize:

speed
clarity
accuracy
workflow completion

--------------------------------------------------

ROLE 4 — AUDITOR

Mental model:

“Investigate and verify.”

Auditor can:

- search assets
- inspect history
- inspect evidence
- verify evidence integrity
- inspect certification
- inspect blockchain record
- verify actor identity
- inspect role/action history
- identify mismatches
- review audit trail

Auditor UI should prioritize:

evidence
comparison
traceability
investigation
verification

===============================================================
4. ROLE PERSONALITY MODEL
======================================================================

Do NOT merely give each role a different dashboard title.

Each role must have a different information priority.

ADMIN
→ control first

NFT CREATOR
→ certification first

TECHNICIAN
→ workflow first

AUDITOR
→ verification first


===============================================================
5. VISUAL PERSONALITY
======================================================================

The product should visually communicate:

TRUST
PRECISION
SECURITY
ACCOUNTABILITY
TECHNICAL CREDIBILITY
INSTITUTIONAL MATURITY

Target feeling:

“High-trust enterprise security infrastructure.”

Not:

“Crypto startup.”

Not:

“Gaming interface.”

Not:

“Generic AI dashboard.”

Not:

“Military game HUD.”


======================================================================
6. VISUAL STYLE
======================================================================

Use a premium restrained defence-technology aesthetic.

Think:

modern enterprise security platform
+
aerospace engineering software
+
identity verification system
+
high-trust institutional product

Avoid:

- neon cyberpunk
- excessive gradients
- excessive glassmorphism
- glowing borders everywhere
- giant 3D blockchain cubes
- random holographic effects
- fake military HUDs
- camouflage
- excessive military imagery
- excessive rounded cards
- meaningless floating elements
- generic SaaS illustrations
- crypto trading aesthetics


======================================================================
7. DESIGN LANGUAGE
======================================================================

The design should communicate seriousness through structure rather
than decoration.

Use:

- strong grid
- disciplined spacing
- clear hierarchy
- restrained color
- precise alignment
- compact metadata
- meaningful status
- predictable interaction
- technical transparency


======================================================================
8. COLOR SYSTEM
======================================================================

Create a complete semantic color system.

Base:

- deep navy
- charcoal
- slate
- neutral white
- cool gray

Semantic:

SUCCESS
Verified
Completed
Trusted

WARNING
Pending
Needs attention

ERROR
Failed
Rejected
Mismatch

INFO
Informational

LOCKED
Restricted
Non-transferable

Do not use color as the sole indicator.

Every semantic color must also have:

- icon
- text
- shape/context


======================================================================
9. TYPOGRAPHY SYSTEM
======================================================================

Create a complete type hierarchy.

Include:

Display
H1
H2
H3
H4
Page title
Section title
Card title
Body large
Body
Body small
Label
Caption
Metadata
Numeric KPI
Technical text

Use monospace selectively for:

- transaction hash
- token ID
- contract address
- DID
- asset identifiers
- evidence fingerprint

Technical identifiers must never visually dominate the interface.


======================================================================
10. SPACING SYSTEM
======================================================================

Create a predictable spacing scale.

Include:

2
4
8
12
16
20
24
32
40
48
64
80

Use semantic spacing rather than arbitrary spacing.

The entire product should feel rhythmically consistent.


======================================================================
11. SHAPE + ELEVATION
======================================================================

Create:

- input radius
- button radius
- card radius
- modal radius
- panel radius

Use restrained rounding.

Avoid making everything look like a floating pill.

Create a subtle elevation hierarchy.


======================================================================
12. APPLICATION SHELL
======================================================================

Design the master authenticated application shell.

Desktop:

LEFT:
Primary navigation

TOP:
Breadcrumb / contextual heading / search / notifications / profile

CENTER:
Main content

OPTIONAL RIGHT:
Contextual information/actions

The shell must support all four roles.


======================================================================
13. RESPONSIVE SHELL
======================================================================

Desktop:

Sidebar visible.

Tablet:

Sidebar collapsible.

Mobile:

Convert navigation into an appropriate mobile pattern.

Do not simply scale the desktop shell.


======================================================================
14. ROLE-AWARE NAVIGATION
======================================================================

ADMIN:

Dashboard
Users
Roles & Permissions
Assets
Certifications
Blockchain
Audit Logs
System Activity
Settings

NFT CREATOR:

Dashboard
Eligible Assets
Certification Queue
Certifications
Blockchain Transactions
History

TECHNICIAN:

Dashboard
My Assets
Register Asset
Technical Records
Evidence
Inspections
Lifecycle

AUDITOR:

Dashboard
Search
Verification
Assets
Evidence Integrity
Certifications
Blockchain Proof
Audit Trail


======================================================================
15. GLOBAL SEARCH
======================================================================

Create a global search experience.

Searchable concepts:

- Asset ID
- Batch ID
- Certification ID
- NFT Token ID
- DID
- transaction hash
- user

States:

- empty
- typing
- suggestions
- loading
- results
- no results
- error

Search results must show why each result matched.


======================================================================
16. AUTHENTICATION
======================================================================

Design the complete authentication journey.

Screens:

01 Login
02 OTP / verification
03 Loading
04 Invalid credentials
05 OTP invalid
06 Session expired
07 Account disabled
08 Logout confirmation

The experience must feel secure and calm.

Do not make authentication visually intimidating.


======================================================================
17. IDENTITY
======================================================================

Create identity components.

User identity card:

Name
Role
Identity status
DID
Credential status
Wallet

DID example:

did:bel:actor:001

Create:

- full DID
- shortened DID
- copy action
- verified indicator
- technical details drawer

The interface should make cryptographic identity understandable
without oversimplifying it.


======================================================================
18. PROFILE
======================================================================

Profile should include:

Identity
Role
DID
Wallet
Security
Session
Recent activity

Admin gets additional management capabilities elsewhere.

Do not mix personal account settings with system administration.


======================================================================
19. WALLET
======================================================================

Design all wallet states.

DISCONNECTED
CONNECTING
CONNECTED
WRONG NETWORK
USER REJECTED
TRANSACTION PENDING
TRANSACTION CONFIRMED
TRANSACTION FAILED

Show:

network
address
status

Use progressive disclosure.


======================================================================
20. DASHBOARD PHILOSOPHY
======================================================================

A dashboard is NOT:

8 statistic cards
+
chart
+
activity table.

Every dashboard must answer:

“What does this user need to know?”

“What requires attention?”

“What should they do next?”

===============================================================
21. ADMIN DASHBOARD
======================================================================

Primary hierarchy:

1. System health
2. Actions requiring attention
3. Users
4. Asset/certification overview
5. Security events
6. Blockchain status
7. Recent activity

Do not fabricate real organizational statistics.

Use synthetic demonstration data.


======================================================================
22. NFT CREATOR DASHBOARD
======================================================================

Primary hierarchy:

1. Ready for certification
2. Requires review
3. Recent certifications
4. Pending transactions
5. Certification history

Primary CTA:

Create Certification


======================================================================
23. TECHNICIAN DASHBOARD
======================================================================

Primary hierarchy:

1. Assigned assets
2. Pending work
3. Missing evidence
4. Inspection tasks
5. Recent records

Primary CTA:

Register / Update Asset


======================================================================
24. AUDITOR DASHBOARD
======================================================================

Primary hierarchy:

1. Assets requiring verification
2. Failed / suspicious records
3. Recent certifications
4. Evidence integrity
5. Audit activity

Primary CTA:

Verify Asset


======================================================================
25. ASSET LIST
======================================================================

Build a professional enterprise asset table.

Fields:

Asset ID
Batch
Asset type
Lifecycle state
Evidence status
Certification
Verification
Last activity
Actions

Features:

Search
Filter
Sort
Pagination
Row action
Column behavior

States:

Loading
Empty
No results
Error
Normal
Selected


======================================================================
26. ASSET DETAIL
======================================================================

This is one of the MOST IMPORTANT screens.

The user should immediately understand:

WHAT IS IT?
WHAT STATE IS IT IN?
IS IT VERIFIED?
WHAT EVIDENCE SUPPORTS IT?
HAS IT BEEN CERTIFIED?
WHAT HAPPENED?

Header:

Asset title
Asset ID
Batch
Lifecycle state
Verification state

Sections/tabs:

Overview
Technical
Evidence
Lifecycle
Certification
Blockchain
Audit Trail


======================================================================
27. ASSET OVERVIEW
======================================================================

Include:

Asset identity
Technical summary
Current state
Responsible actor
Evidence status
Certification state
Verification status


======================================================================
28. TECHNICAL RECORD
======================================================================

Technician-oriented details.

Use:

- structured fields
- grouped specifications
- edit states
- validation
- required fields
- read-only states

Do not present technical data as giant paragraphs.


======================================================================
29. LIFECYCLE
======================================================================

Visualize:

UNREGISTERED
↓
SUPPLIER_DECLARED
↓
RECEIVED
↓
INSPECTION_RECORDED
↓
ACCEPTED_FOR_ASSEMBLY

Alternative:

INSPECTION_RECORDED
↓
REJECTED_QUARANTINED

Current state must be extremely obvious.

Completed state:
✓

Current:
ACTIVE

Upcoming:
NEUTRAL

Rejected:
ERROR


======================================================================
30. TECHNICIAN ASSET REGISTRATION
======================================================================

Create a serious multi-step form.

STEP 1
Asset identity

STEP 2
Batch information

STEP 3
Technical information

STEP 4
Evidence

STEP 5
Inspection

STEP 6
Review

STEP 7
Submit

Every step must support:

- validation
- autosave/save status
- incomplete fields
- previous/next
- cancel
- confirmation


======================================================================
31. EVIDENCE SYSTEM
======================================================================

Evidence is a CORE product object.

Create:

Evidence list
Evidence upload
Evidence details
Evidence verification
Evidence history

Evidence metadata:

Filename
Type
Uploaded by
Date
Asset
Event
Fingerprint
Integrity status


======================================================================
32. EVIDENCE UPLOAD
======================================================================

Create a premium upload component.

States:

Idle
Dragging
Uploading
Processing
Hashing
Complete
Failed
Invalid
Duplicate

Display simple explanation:

“Evidence fingerprint”
“Used to detect changes to this file later.”

Allow:

Remove
Retry
View details


======================================================================
33. EVIDENCE DETAIL
======================================================================

Show:

Document preview if appropriate
File metadata
Fingerprint
Uploader
Associated asset
Associated event
Integrity status
History

Technical details should be expandable.


======================================================================
34. CERTIFICATION QUEUE
======================================================================

NFT Creator gets a dedicated queue.

Statuses:

Eligible
Needs review
Incomplete
Ready
Processing
Certified
Failed
Revoked

Use powerful filters.

Create a high-quality review table/list.


======================================================================
35. CERTIFICATION REVIEW
======================================================================

Before minting, NFT Creator should see:

Asset
Technical details
Evidence
Lifecycle
Identity
Permissions
Previous certification
Warnings

Then:

Certification Summary

Everything important should be visible before committing.


======================================================================
36. MINTING FLOW
======================================================================

The minting flow must be exceptionally polished.

STEP 1
Select asset

STEP 2
Review eligibility

STEP 3
Review evidence

STEP 4
Review certification information

STEP 5
Connect wallet

STEP 6
Confirm wallet

STEP 7
Transaction submitted

STEP 8
Waiting for confirmation

STEP 9
Certification confirmed

STEP 10
View certification

Each state must have distinct UI.

===============================================================
37. TRANSACTION UX
======================================================================

Show:

Action
Asset
Network
Contract
Status
Transaction hash

Possible states:

Ready
Wallet confirmation
Submitted
Pending
Confirmed
Failed
Rejected

Provide:

Copy hash
View on Etherscan


======================================================================
38. CERTIFICATION DETAIL
======================================================================

Create an authoritative certification interface.

Show:

Certification name
Asset
Batch
State
Issued by
Issued time
Token ID
Contract
Network
Transaction
Verification

Add a clear visual:

NON-TRANSFERABLE CERTIFICATION

Explain:

“This digital certification represents the recorded certification
state of this asset/batch. It is not a physical ownership record.”

===============================================================
39. SOULBOUND UX
======================================================================

Do NOT show:

Buy
Sell
Trade
Market
Price
Transfer

Instead show:

Transfer
LOCKED

Explanation:

“This certification is non-transferable.”

The visual should communicate permanence without feeling punitive.


======================================================================
40. AUDITOR VERIFICATION
======================================================================

Auditor should have an investigator-style workflow.

SEARCH
↓
SELECT ASSET
↓
INSPECT IDENTITY
↓
INSPECT EVIDENCE
↓
INSPECT LIFECYCLE
↓
INSPECT CERTIFICATION
↓
INSPECT BLOCKCHAIN
↓
VERIFY
↓
RESULT


======================================================================
41. VERIFICATION CENTER
======================================================================

Create a dedicated verification experience.

Display:

Identity
Evidence
Lifecycle
Certification
Blockchain
History integrity

Each should have:

✓ VERIFIED
⚠ REVIEW
✕ FAILED
— UNAVAILABLE

Never use color alone.


======================================================================
42. SUCCESSFUL VERIFICATION
======================================================================

Create a visually strong success state.

Example:

ASSET VERIFIED

Identity
✓ Verified

Evidence
✓ Fingerprint matches

Lifecycle
✓ Valid sequence

Certification
✓ Valid

Blockchain
✓ Transaction confirmed

History
✓ No detected modification


======================================================================
43. FAILED VERIFICATION
======================================================================

Create multiple realistic failure modes.

Example:

VERIFICATION FAILED

Evidence
✕ Fingerprint mismatch

or:

CERTIFICATION REQUIRES REVIEW

Blockchain
⚠ Unable to confirm transaction

or:

ACCESS RESTRICTED

You do not have permission to inspect this record.

===============================================================
44. AUDIT TRAIL
======================================================================

Build a strong chronological event interface.

Each event:

Actor
Role
Action
Asset
Evidence
Timestamp
Result
Blockchain reference

Example:

TECHNICIAN
Updated technical record

12 Sep 2026 • 10:32

Evidence fingerprint generated

Then:

NFT CREATOR
Certification created

12 Sep 2026 • 11:05

Blockchain transaction confirmed

Events should expand into technical detail.


======================================================================
45. BLOCKCHAIN DETAILS
======================================================================

Do NOT make a crypto explorer.

Instead create a compact verification panel.

Show:

Network
Contract
Token ID
Block
Transaction
Status
Confirmation
Explorer link

Technical details can expand.

===============================================================
46. ADMIN USER MANAGEMENT
======================================================================

Create:

User list
User detail
Create user
Edit user
Role assignment
Disable user
Activity

User table:

Name
Role
Identity
Status
Last active
Actions


======================================================================
47. ROLE MANAGEMENT
======================================================================

Create a clear permission-management interface.

Avoid hundreds of tiny permissions.

Use understandable role capabilities.

Show:

Role
Description
Capabilities
Users assigned


======================================================================
48. PERMISSION DENIED EXPERIENCE
======================================================================

Never silently fail.

Create:

ACCESS RESTRICTED

You do not have permission to perform this action.

Show:

Required permission
Current role

Where useful:

Return to dashboard
Go back


======================================================================
49. NOTIFICATION CENTER
======================================================================

Create:

Unread
Read
Critical
Warning
Informational

Examples:

Certification ready
Certification confirmed
Transaction pending
Transaction failed
Evidence mismatch
Role changed
Security event


======================================================================
50. SEARCH / FILTER SYSTEM
======================================================================

Every major list should support appropriate search/filter behavior.

Design:

Filter drawer
Active filter chips
Clear all
Saved state if useful
No results
Loading
Error

Do not overload filters.


======================================================================
51. TABLE SYSTEM
======================================================================

Create one master table system with variants.

Support:

Default
Hover
Selected
Sorted
Loading
Empty
Error
Dense
Responsive

Long technical IDs:

show shortened version

provide:

Copy

===============================================================
52. STATUS DESIGN SYSTEM
======================================================================

Reusable statuses:

Verified
Pending
Processing
Ready
Needs Review
Failed
Rejected
Revoked
Locked
Mismatch
Unavailable
Connected
Disconnected


======================================================================
53. ERROR SYSTEM
======================================================================

Create meaningful error UX.

Examples:

Wallet rejected transaction
Wrong network
Wallet disconnected
Transaction failed
Evidence upload failed
Evidence mismatch
Asset unavailable
Session expired
Unauthorized action
Duplicate certification
Blockchain unavailable

Every error must explain:

WHAT
WHY
NEXT STEP


======================================================================
54. EMPTY STATES
======================================================================

Every major list needs an empty state.

Examples:

No assets
No evidence
No certifications
No audit events
No search results
No blockchain transactions

Each empty state:

icon/visual
title
explanation
CTA if applicable


======================================================================
55. LOADING SYSTEM
======================================================================

Design:

- page skeleton
- card skeleton
- table skeleton
- detail skeleton
- verification loading
- transaction loading
- upload progress
- blockchain processing

Use spinners only when appropriate.


======================================================================
56. MODALS
======================================================================

Create modal patterns for:

Confirmation
Destructive action
Mint confirmation
Revocation
Role change
Wallet connection
Technical details
Audit event details

Every modal must have:

Title
Context
Consequence
Primary action
Secondary/cancel


======================================================================
57. TOASTS
======================================================================

Design:

Success
Warning
Error
Info

Examples:

“Evidence uploaded successfully.”

“Transaction submitted.”

“Certification confirmed.”

“Evidence fingerprint does not match.”

===============================================================
58. NOTIFICATION BEHAVIOR
======================================================================

Define:

- icon
- hierarchy
- duration
- persistent critical state
- dismiss
- action

Critical security messages should not disappear immediately.


======================================================================
59. FORMS
======================================================================

Create a complete form system.

Fields:

Text
Number
Select
Search
Date
Textarea
File
Radio
Checkbox
Toggle

States:

Default
Focus
Filled
Error
Disabled
Loading
Success


======================================================================
60. DESTRUCTIVE ACTIONS
======================================================================

For:

Revoke
Disable
Delete
Remove
Role change
Critical blockchain actions

use deliberate confirmation.

Explain consequences.

Never hide destructive actions beside harmless buttons without distinction.


======================================================================
61. INFORMATION DENSITY
======================================================================

Admin and Auditor screens may be denser.

Technician screens should prioritize workflow.

NFT Creator screens should prioritize decisions.

Do not use identical card density everywhere.


======================================================================
62. TWO-LAYER INFORMATION ARCHITECTURE
======================================================================

This is a CORE UX principle.

Layer 1:

Human-readable information.

Layer 2:

Technical verification details.

Example:

PRIMARY:

Evidence verified

SECONDARY:

Fingerprint
SHA-256
...
Copy

This principle should be used throughout:

Identity
Evidence
Blockchain
Certification
Audit


======================================================================
63. DATA VISUALIZATION
======================================================================

Use charts only if they answer useful questions.

Examples:

Certification activity
Verification outcomes
Lifecycle distribution
System activity

No decorative charts.


======================================================================
64. RESPONSIVE DESIGN
======================================================================

Create genuine responsive layouts.

At minimum:

Desktop
1440px

Tablet
1024px

Mobile
390px

Also account for flexible intermediate widths.

Mobile must not merely shrink desktop.

Define:

What collapses?
What stacks?
What disappears?
What becomes a drawer?
What becomes a bottom sheet?
What becomes scrollable?
What remains sticky?


======================================================================
65. MOBILE PRIORITY
======================================================================

The following must remain excellent on mobile:

Asset search
Asset detail
Evidence
Verification
Certification status
Primary actions

Use thumb-friendly controls.

===============================================================
66. ACCESSIBILITY
======================================================================

Design for:

keyboard
focus
contrast
screen-reader semantics
touch
text scaling

Never communicate meaning through color alone.


======================================================================
67. MICROCOPY
======================================================================

All visible text must be meaningful.

Avoid:

Click here
Continue
Submit
Something went wrong
Data unavailable

unless genuinely appropriate.

Prefer:

Create certification
Upload evidence
Verify asset
Confirm mint
Review evidence
Open audit trail


======================================================================
68. SYNTHETIC DATA
======================================================================

Use believable synthetic examples.

Asset:
EF-2026-00421

Batch:
EF-BATCH-2026-017

DID:
did:bel:actor:001

Transaction:
0x8A42...19F2

These examples MUST NOT imply they are actual BEL production identifiers.

===============================================================
69. REAL-WORLD DATA STATES
======================================================================

Design for content that is:

short
long
missing
duplicated
invalid
slow
failed
partially complete

The interface must remain stable.


======================================================================
70. INFORMATION SECURITY UX
======================================================================

Never expose more sensitive information than required.

Use:

- masking
- truncation
- progressive disclosure
- role-aware visibility

Technical identifiers may have:

Show full
Copy
Expand


======================================================================
71. TRUST SIGNALS
======================================================================

Use subtle trust indicators.

Examples:

Verified
Signed
Blockchain confirmed
Evidence matched
Role authorized
Identity verified

Do not fill every screen with security badges.

Trust should feel integrated into the system.


======================================================================
72. DESIGN SYSTEM COMPONENT ARCHITECTURE
======================================================================

Create:

FOUNDATIONS
↓
PRIMITIVES
↓
COMPONENTS
↓
PATTERNS
↓
PAGE TEMPLATES
↓
ROLE FLOWS

Recommended structure:

01 Foundations
02 Tokens
03 Icons
04 Primitive components
05 Composite components
06 Data components
07 Security components
08 Role components
09 Page patterns
10 Screens
11 Prototypes


======================================================================
73. SPECIALIZED COMPONENT LIBRARY
======================================================================

Create reusable components:

IdentityCard
IdentityBadge
RoleBadge
PermissionBadge
AssetCard
AssetState
EvidenceCard
EvidenceFingerprint
EvidenceStatus
LifecycleStepper
CertificationCard
CertificationStatus
NFTCertificate
WalletStatus
NetworkBadge
BlockchainTransaction
VerificationResult
IntegrityIndicator
AuditTimeline
AuditEvent
PermissionMatrix
SecurityAlert
TechnicalMetadata


======================================================================
74. COMPONENT VARIANTS
======================================================================

Every important component should have meaningful variants.

Button:

Primary
Secondary
Ghost
Danger
Loading
Disabled

Badge:

Verified
Warning
Failed
Pending
Locked

Verification:

Verified
Review
Failed
Unavailable

Blockchain:

Disconnected
Pending
Confirmed
Failed

Wallet:

Disconnected
Connecting
Connected
Wrong Network


======================================================================
75. FIGMA VARIABLES
======================================================================

Use semantic naming.

Examples:

color.background.canvas
color.background.surface
color.background.elevated

color.text.primary
color.text.secondary
color.text.muted

color.action.primary
color.action.secondary

color.status.success
color.status.warning
color.status.error
color.status.info

spacing.xs
spacing.sm
spacing.md
spacing.lg
spacing.xl

radius.sm
radius.md
radius.lg


======================================================================
76. AUTO LAYOUT
======================================================================

Use Auto Layout extensively.

Use constraints correctly.

Use components and variants.

Never rely on arbitrary manual placement when a real layout system
would be more appropriate.


======================================================================
77. SCREEN INVENTORY
======================================================================

The final Figma file should contain, at minimum, polished screens
covering:

AUTH

Login
OTP
Authentication Error
Session Expired


ADMIN

Dashboard
Users
User Detail
Roles
Permissions
Assets
System Activity
Blockchain Activity
Audit Logs
Settings


NFT CREATOR

Dashboard
Eligible Assets
Certification Queue
Asset Review
Evidence Review
Certification Summary
Wallet Connection
Mint Confirmation
Transaction Pending
Transaction Confirmed
Transaction Failed
Certification Detail
Certification History


TECHNICIAN

Dashboard
My Assets
Asset List
Asset Detail
Register Asset
Technical Form
Evidence Upload
Evidence Detail
Inspection
Review & Submit
Submission Success


AUDITOR

Dashboard
Search
Search Results
Asset Detail
Evidence Verification
Certification Verification
Blockchain Verification
Audit Trail
Verification Result
Verification Failed


SHARED

Notifications
Profile
Security
Access Restricted
Not Found
System Error
Maintenance
Empty States
Loading States


======================================================================
78. SCREEN PRIORITY
======================================================================

TIER 1 — CRITICAL

Asset Detail
Evidence
Certification
Verification
Audit Trail
Role Dashboards

TIER 2

Management
Search
Blockchain details
Users
Settings

TIER 3

Secondary/support states


======================================================================
79. PRIMARY END-TO-END STORY
======================================================================

The entire product design should support this narrative:

TECHNICIAN
creates/updates asset

↓

TECHNICIAN
adds evidence

↓

SYSTEM
records evidence fingerprint

↓

ASSET
moves through lifecycle

↓

NFT CREATOR
reviews evidence

↓

NFT CREATOR
creates certification

↓

WALLET
confirms blockchain action

↓

BLOCKCHAIN
confirms transaction

↓

CERTIFICATION
becomes visible

↓

AUDITOR
opens the asset

↓

AUDITOR
verifies evidence

↓

AUDITOR
verifies certification

↓

AUDITOR
verifies blockchain record

↓

AUDITOR
sees final verification result


======================================================================
80. JUDGE-COMPREHENSION MODE
======================================================================

A person unfamiliar with blockchain must understand the product
within seconds.

Whenever the UI introduces:

DID
hash
NFT
transaction
blockchain
wallet

provide understandable context.

Example:

“Evidence fingerprint”
rather than only:
“SHA-256”

Then allow:

View technical details


======================================================================
81. LIVE DEMO MODE
======================================================================

Because this product will be used in an SIH demonstration,
create interfaces that are excellent for live presentation.

Important screens should have:

- clear focal point
- obvious status
- obvious next action
- clean transitions
- readable technical proof
- minimal confusion

The demo story should never depend on explaining a messy interface verbally.


======================================================================
82. NO FAKE PRODUCT CLAIMS
======================================================================

Never use UI copy implying:

“BEL verified this”
“DGQA approved this”
“Government certified this”

unless explicitly part of a proposed/synthetic workflow.

The interface should use neutral wording such as:

“Certification recorded”

“Verification completed”

“Authorized action”

“Synthetic demonstration data”


======================================================================
83. FUTURE-SCALABILITY
======================================================================

The visual system should support future additional roles without redesigning
the entire application.

Use:

role-aware navigation
permission-aware controls
shared feature modules
reusable status system

But DO NOT create those future roles now.


======================================================================
84. DESIGN FILE ORGANIZATION
======================================================================

Organize the actual Figma file as:

01 — COVER
02 — PRODUCT OVERVIEW
03 — FOUNDATIONS
04 — VARIABLES
05 — ICONS
06 — COMPONENTS
07 — PATTERNS
08 — AUTHENTICATION
09 — ADMIN
10 — NFT CREATOR
11 — TECHNICIAN
12 — AUDITOR
13 — SHARED ASSET SYSTEM
14 — EVIDENCE
15 — CERTIFICATION
16 — BLOCKCHAIN
17 — VERIFICATION
18 — AUDIT
19 — RESPONSIVE
20 — STATES
21 — USER FLOWS
22 — PROTOTYPE
23 — DEVELOPER HANDOFF


======================================================================
85. FRAME NAMING
======================================================================

Use explicit naming.

Examples:

Desktop / Admin / Dashboard
Desktop / Technician / Asset Detail
Desktop / NFT Creator / Certification Review
Desktop / Auditor / Verification

Mobile / Technician / Asset Detail
Mobile / Auditor / Verification

State / Evidence / Upload / Error
State / Blockchain / Transaction / Pending


======================================================================
86. PROTOTYPE CONNECTIONS
======================================================================

Connect real journeys.

At minimum:

TECHNICIAN FLOW
Login
→ Dashboard
→ Asset
→ Evidence
→ Inspection
→ Submit
→ Success

NFT CREATOR FLOW
Login
→ Eligible Asset
→ Review
→ Certification
→ Wallet
→ Mint
→ Pending
→ Confirmed

AUDITOR FLOW
Login
→ Search
→ Asset
→ Evidence
→ Certification
→ Blockchain
→ Verify
→ Result

ADMIN FLOW
Login
→ Dashboard
→ Users
→ User
→ Permissions
→ Audit


======================================================================
87. INTERACTION QUALITY
======================================================================

Prototype:

hover
click
expand
collapse
modal
tabs
search
filter
navigation
confirmation
success
failure

The prototype should demonstrate behavior, not just appearance.


======================================================================
88. DEVELOPER HANDOFF
======================================================================

Every component must be implementation-aware.

Provide:

- component states
- variants
- spacing
- responsive behavior
- typography
- interaction intent
- reusable patterns

The final design should be understandable to:

human frontend developer
AND
AI coding agent.


======================================================================
89. FIGMA MAKE COMPATIBILITY
======================================================================

This is CRITICAL.

Figma Make will eventually consume this design.

Therefore:

- keep component hierarchy logical
- avoid obscure visual tricks
- keep content structure explicit
- maintain consistent naming
- use recognizable interface patterns
- make relationships between pages obvious
- make repeated components truly reusable
- make states visually distinct
- avoid ambiguity

The visual design must communicate the intended implementation.


======================================================================
90. IMPLEMENTATION REALISM
======================================================================

Ask for every screen:

Can React implement this?

Can Chakra UI reasonably implement this?

Can the responsive behavior be represented?

Can component states be represented?

Can this be maintained?

If not, simplify.


======================================================================
91. PERFORMANCE-AWARE DESIGN
======================================================================

Avoid visual choices that unnecessarily increase:

image weight
animation complexity
layout complexity
rendering cost

Use:

simple graphics
compact UI
progressive disclosure
skeleton loading

where appropriate.


======================================================================
92. MOTION
======================================================================

Motion should communicate:

progress
status
navigation
confirmation
completion

Use subtle transitions.

Do NOT animate everything.

Suggested motion philosophy:

fast
restrained
predictable


======================================================================
93. ICONOGRAPHY
======================================================================

Use one coherent icon family.

Icons should support comprehension.

Do not randomly mix icon styles.


======================================================================
94. ILLUSTRATION SYSTEM
======================================================================

Use illustrations only where useful:

empty states
authentication
system errors
verification success

No generic stock illustrations.


======================================================================
95. TABLE + MOBILE TRANSFORMATION
======================================================================

Never blindly squeeze desktop tables into mobile.

Choose appropriately:

horizontal scroll
priority columns
card transformation
stacked details
expandable rows

Make the decision per table.


======================================================================
96. FORGOTTEN STATES CHECK
======================================================================

Before finalizing, explicitly verify that the design includes:

NO DATA
LOADING
SUCCESS
ERROR
PARTIAL
PROCESSING
LOCKED
RESTRICTED
EXPIRED
REVOKED
MISMATCH
NOT VERIFIED
OFFLINE
WRONG NETWORK
WALLET REJECTED
TRANSACTION FAILED
PERMISSION DENIED


======================================================================
97. FINAL PRODUCT FEEL
======================================================================

When someone opens this application, they should immediately think:

“This is a serious secure system.”

NOT:

“This is a blockchain demo.”

The blockchain should feel like infrastructure supporting trust.

The user experience should remain human.


======================================================================
98. FINAL DESIGN PRINCIPLES
======================================================================

PRINCIPLE 1
Clarity before decoration.

PRINCIPLE 2
Trust before novelty.

PRINCIPLE 3
Evidence before claims.

PRINCIPLE 4
Role before generic navigation.

PRINCIPLE 5
State before static screenshots.

PRINCIPLE 6
User workflow before visual gimmicks.

PRINCIPLE 7
Technical detail should be available but not overwhelming.

PRINCIPLE 8
Security should be understandable.

PRINCIPLE 9
Every important action should have visible consequences.

PRINCIPLE 10
Every screen must answer “what should I do next?”


======================================================================
99. FINAL INTERNAL QA
======================================================================

Before finishing the design, perform a complete internal audit.

CHECK:

PRODUCT
[ ] Actual BEL-DEFENCE-ASSET-TRUST product represented
[ ] No generic SaaS interpretation

ROLES
[ ] Exactly four roles
[ ] Admin
[ ] NFT Creator
[ ] Technician
[ ] Auditor

UX
[ ] Different role workflows
[ ] Complete primary journeys
[ ] No dead ends

SECURITY
[ ] Permission states
[ ] Restricted states
[ ] Sensitive action confirmation

BLOCKCHAIN
[ ] Understandable
[ ] No crypto marketplace behavior

NFT
[ ] Certification record
[ ] Non-transferable
[ ] No trading

EVIDENCE
[ ] Evidence central to workflow
[ ] Hash/fingerprint understandable

AUDIT
[ ] Actor
[ ] Action
[ ] Asset
[ ] Time
[ ] Evidence
[ ] Result

RESPONSIVE
[ ] Desktop
[ ] Tablet behavior
[ ] Mobile

ACCESSIBILITY
[ ] Contrast
[ ] Focus
[ ] Labels
[ ] Non-color status

DESIGN SYSTEM
[ ] Variables
[ ] Tokens
[ ] Components
[ ] Variants
[ ] States

FIGMA
[ ] Logical sections
[ ] Clear frame names
[ ] Auto Layout
[ ] Constraints
[ ] Reusable components

FIGMA MAKE
[ ] Clear hierarchy
[ ] Clear interactions
[ ] Implementable design

DEMO
[ ] Judge can understand product
[ ] Main story is visually obvious

QUALITY
[ ] No generic AI aesthetic
[ ] No unnecessary visual noise
[ ] No unsupported claims
[ ] No irrelevant features


======================================================================
100. ABSOLUTE FINAL INSTRUCTION
======================================================================

DO NOT STOP AT A FEW GOOD-LOOKING SCREENS.

Design the PRODUCT SYSTEM.

The output must feel like an entire real application that happens
to have blockchain infrastructure underneath it.

Think through:

PRODUCT
→ INFORMATION ARCHITECTURE
→ ROLE MODEL
→ NAVIGATION
→ USER FLOWS
→ SCREENS
→ COMPONENTS
→ STATES
→ EDGE CASES
→ RESPONSIVE BEHAVIOR
→ ACCESSIBILITY
→ PROTOTYPE
→ DEVELOPER HANDOFF

before considering the work complete.

The result should be good enough that:

A designer can inspect it.

A developer can build it.

An AI coding agent can understand it.

An SIH judge can navigate it.

A cybersecurity professional can trust its UX.

A non-blockchain person can understand it.

===============================================================
FINAL COMMAND
===============================================================

NOW DESIGN THE COMPLETE FRONTEND FOR:

BEL-DEFENCE-ASSET-TRUST

CURRENT ROLES:

ADMIN
NFT CREATOR
TECHNICIAN
AUDITOR

PRIMARY ASSET:

SYNTHETIC ELECTRONIC FUZE BATCH

CORE STORY:

IDENTITY
→ AUTHORIZATION
→ ASSET
→ EVIDENCE
→ LIFECYCLE
→ CERTIFICATION
→ BLOCKCHAIN
→ AUDIT
→ VERIFICATION

Create a complete, production-quality, responsive, reusable,
high-trust Figma frontend design system.

DO NOT GENERATE CODE.

DO NOT DESIGN BACKEND.

DO NOT ADD EXTRA ROLES.

DO NOT TURN IT INTO A CRYPTO APP.

DO NOT TURN IT INTO A GENERIC ADMIN TEMPLATE.

DO NOT STOP AT STATIC SCREENS.

DESIGN THE COMPLETE PRODUCT EXPERIENCE.
```