# Accessibility Statement & Conformance Guide

## Commitment to Accessibility

The **KavachTrust** platform is committed to ensuring digital accessibility for all users, including defense personnel, procurement officers, quality auditors, and inspectors with visual, auditory, motor, or cognitive disabilities.

Our design and engineering practices are guided by the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA**, the **U.S. Section 508 Standards**, and the **Guidelines for Indian Government Websites (GIGW 3.0 / IS 17802)**.

---

## Conformance Status

| Standard | Target Conformance | Status |
| :--- | :--- | :--- |
| **WCAG 2.1 Level A** | Mandatory Baseline | :white_check_mark: Fully Supported |
| **WCAG 2.1 Level AA** | Target Goal | :white_check_mark: Supported |
| **WCAG 2.1 Level AAA** | Selected Criteria (Contrast & Target Size) | :large_blue_circle: Partially Supported |
| **Section 508 / EN 301 549** | Government / Enterprise Accessibility | :white_check_mark: Supported |

---

## Architectural Accessibility Pillars (POUR)

KavachTrust is engineered around the four foundational principles of accessibility:

### 1. Perceivable (Information & User Interface)

- **Color Contrast Ratios**:
  - Text and interactive elements maintain a contrast ratio of at least **4.5:1** against adjacent backgrounds for normal text and **3.0:1** for large text (18pt+ or bold 14pt+).
  - UI components, badges (e.g., `VERIFIED`, `PENDING`, `QUARANTINED`), and border delimiters meet the **3:1** minimum graphical object contrast requirement.
  - Information is never conveyed through color alone; status badges accompany text labels with distinct glyphs/icons and screen-readable descriptions.
- **Adaptive Color Themes**:
  - High-clarity dark and light modes tailored for both low-illumination operations rooms and high-glare field environments.
- **Text Scaling & Responsive Layout**:
  - Supports browser text zoom up to **200%** without horizontal truncation, overlapping containers, or broken functionality.
- **Non-Text Content & Iconography**:
  - Visual icons (Lucide React) carry `aria-hidden="true"` when paired with descriptive text.
  - Standalone icon buttons (such as search, close, copy hash, download) declare explicit `aria-label` or `title` attributes.

---

### 2. Operable (Navigation & Interaction)

- **Full Keyboard Navigation**:
  - Every interactive component—navigation menus, tab lists, search bars, filter dropdowns, modal windows, and data tables—is fully operable via the keyboard (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Arrow` keys, and `Esc`).
- **Focus Indicators (`focus-visible`)**:
  - Distinct, high-visibility focus rings (`outline-2 outline-offset-2 ring-primary`) highlight active elements without relying on low-contrast browser default focus outlines.
- **Modal Focus Trapping & Restoration**:
  - Dialog windows, evidence upload drawers, and confirmation modals trap keyboard focus within the modal while open.
  - Pressing `Escape` immediately dismisses overlay dialogs and returns focus to the triggering element.
- **Touch & Click Target Sizes**:
  - Interactive targets meet or exceed the recommended **44 × 44 CSS pixels** minimum target area, ensuring usability on touchscreens and handheld rugged tablets.

---

### 3. Understandable (Predictability & Error Prevention)

- **Consistent Navigation Structure**:
  - Standardized application shell: Global Header with user profile and quick actions, Collapsible Navigation Sidebar, and Main Content Region tagged with HTML5 landmark tags (`<header>`, `<nav>`, `<main>`, `<aside>`).
- **Descriptive Form Labels & Error Messaging**:
  - All input fields have programmatic `<label>` associations using `htmlFor` and matching `id` attributes.
  - Form validation errors are programmatically bound via `aria-describedby` and `aria-invalid="true"`.
  - Error messages provide clear guidance on required formats (e.g., serial number constraints, SHA-256 hash syntax, wallet address format).
- **Domain Terminology Clarity**:
  - Technical terms (e.g., *Soulbound Token (SBT)*, *Merkle Root*, *DID Document*, *Hash Chain*) provide descriptive tooltips and informational badges for onboarding non-technical operators.

---

### 4. Robust (Compatibility & Assistive Technology)

- **Semantic HTML5 Core**:
  - Built using native HTML elements (`<button>`, `<input>`, `<table>`, `<article>`) rather than unsemantic `<div>` click handlers, providing out-of-the-box keyboard and assistive technology compatibility.
- **WAI-ARIA Attributes**:
  - Dynamic elements utilize correct ARIA patterns:
    - `aria-expanded` on accordion headers, dropdowns, and collapsible sidebars.
    - `aria-live="polite"` for non-disruptive notifications, toast alerts, and blockchain transaction progress status.
    - `aria-live="assertive"` for critical security alerts or inspection rejections.
    - `role="status"` and `role="alert"` for transaction mining feedback.
- **Screen Reader Compatibility**:
  - Tested with **NVDA** (Windows), **JAWS** (Windows), and **VoiceOver** (macOS / iOS).

---

## Sensory & Motion Accommodations

- **Reduced Motion Support**:
  - Respects the operating system's `prefers-reduced-motion` media query. When active, all non-essential page transitions, spring animations, and continuous loaders automatically fall back to instant transitions.
- **Seizure & Flashing Safeguards**:
  - No interface element flashes more than three times per second, well within safety thresholds for photosensitive epilepsy.

---

## Accessibility Verification Matrix

| Area | Testing Tool / Technique | Standard / Target | Pass Rate |
| :--- | :--- | :--- | :--- |
| **Automated Static Analysis** | Axe-Core, Lighthouse Audits | 0 Critical / Serious Violations | 100% |
| **Color Contrast** | WebAIM Color Contrast Checker | WCAG AA (≥ 4.5:1 body, ≥ 3.0:1 large) | Pass |
| **Keyboard Navigation** | Manual Tab / Enter / Esc audit | Complete navigation without mouse | Pass |
| **Screen Readers** | NVDA (Chrome/Edge), VoiceOver (Safari) | Accurate readout of forms, tables, modals | Pass |
| **Motion Sensitivity** | `prefers-reduced-motion` emulation | Smooth motion disabled on trigger | Pass |

---

## How to Report Accessibility Barriers

We welcome feedback and reports on accessibility barriers. If you encounter any difficulty navigating or accessing content in KavachTrust, please submit a report:

- **Email**: `accessibility@kavachtrust.gov.in`
- **GitHub**: Open an issue labeled `accessibility`
- **Include**:
  - The URL or page path where the barrier occurred (e.g., `/app/evidence/upload`).
  - The assistive technology used (e.g., NVDA, keyboard only, zoom at 175%).
  - A description of the issue and expected behavior.

We strive to review and triage all accessibility tickets within **48 business hours**.
