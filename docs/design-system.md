# Design system

The app uses **Tailwind CSS v4** and **shadcn/ui** ("new-york" style on Radix primitives, Lucide
icons). Dark mode comes from `next-themes`, using a `.dark` class and the system default.
Tokens are CSS variables in `src/app/globals.css`, and components consume them through
Tailwind utilities (`bg-primary`, `text-muted-foreground`, …).

## Brand

- **Primary: amber**, `oklch(0.812 0.165 78.2)` (≈ `#FBB217`). Text on primary is black, in
  both themes. This is the default color scheme; users can pick another (see "Color schemes").
- **Everything else is neutral grayscale.** The accent is the only hue, so use it sparingly for
  primary actions, focus, highlights and the GWA accent. Always use the tokens (`bg-primary`,
  `text-primary`, `var(--chart-line)`), never a fixed amber, so every scheme works.
- **Logo:** a line-art calculator on a black tile, drawn as SVG in
  `components/layout/brand-mark.tsx` with `--logo-tile` and `--logo-mark`, so it follows the
  scheme. The original artwork (`src/assets/images/gwa-calculator.jpg`) and the PNG app icons
  stay amber.

| Token | Light | Dark |
|---|---|---|
| `--background` / `--card` | `oklch(1 0 0)` white | `oklch(0.178 0 0)` |
| `--foreground` | `oklch(0.178 0 0)` | white |
| `--primary` | amber `oklch(0.812 0.165 78.2)` | same |
| `--secondary` | `oklch(0.178 0 0)` (near-black) | same |
| `--muted` / `--muted-foreground` | `0.898` / `0.321` | `0.321` / `0.898` |
| `--accent` | `0.97` | `0.269` |
| `--border` / `--input` | `0.922` | `0.285` / `0.349` |
| `--destructive` | `oklch(0.587 0.222 26.3)` | `oklch(0.670 0.217 23.9)` |
| `--chart-1 … 5` | amber ramp, light → `--primary` | same |
| `--radius` | `0.625rem` | same |

**Semantic tokens** are defined for light and dark in `globals.css` and exposed as Tailwind
colors:

| Token | Use |
|---|---|
| `--honor`, `--honor-foreground`, `--honor-border` | Honor badges (`components/shared/honor-badge.tsx`); amber tint |
| `--chart-line` | The GWA trend line: amber-700 in light mode (≥ 3:1 on white), brand amber in dark |
| `--status-new`, `--status-improved`, `--status-fixed` | Dots in the "What's new" dialog |

Show honors only through `HonorBadge`. Its `compact` prop shows just the medal on phones while
keeping the name available to screen readers.

## Color schemes

`src/features/appearance/` lets users pick **Amber** (default), **Pink**, **Red**, **Green**,
**Teal**, **Blue**, **Purple**, **Black**, or a **custom** accent, in light, dark, or system mode.

- **Only the accent changes.** A scheme overrides `--primary`, `--primary-foreground`,
  `--sidebar-primary(-foreground)`, `--chart-line`, `--chart-1 … 5`, `--logo-tile` and
  `--logo-mark`. Surfaces, text, destructive and semantic colors stay the same.
- **Honors stay gold** in every scheme: the `--honor*` tokens are the achievement color.
- **Derived, never hand-tuned:** `lib/derive-scheme.ts` computes each mode from one seed color
  and guarantees WCAG AA: button text ≥ 4.5:1 on the accent (white preferred in light mode when
  the color only needs a small darkening, black otherwise), the trend line ≥ 3:1 on the page,
  and a visible logo (when the accent is too dark for the black tile, tile and glyph swap).
  Tests check every preset and a spread of custom colors.
- **No flash:** an inline script in `<head>` restores the saved scheme's stylesheet before the
  first paint (`lib/scheme-script.ts`); next-themes does the same for `.dark`.
- **Saved** on the device, and on the signed-in user's profile (`appearance`) so other devices
  match. The browser-tab favicon is recolored too; PNG app icons can't be.
- **Printed reports** use the scheme's light-mode shades on paper (`reports/lib/palette.ts`).

## Share images

`src/features/share/` renders a 1080×1350 (post) or 1080×1920 (story) image from one template
(`components/templates/`) in one of eight moods, each with color variants plus "My theme".
Inline pixel styles, the GWA in mono with tabular figures, stickers only in the top band, and
always the footer "GWA Calculator · host · Unofficial, just for fun".

- **Studio layout:** the preview stays in view and the options sit in four tabs (Look, Mood,
  Caption, Show), beside the preview on desktop and under it on phones, where only the open tab
  scrolls and chip rows swipe sideways. Swipe the preview or use its arrows for the next mood;
  🎲 Surprise me (`lib/surprise.ts`) changes the style, mood, colors and caption but keeps what's
  shown and the user's own caption. A one-time tip (`gwa_share_tip_seen`) points at the tabs.
  On phones the footer is one row (Share, Download, Copy caption) and the site links move to the
  Caption tab.
- **Captions:** one file per mood in `content/captions/`, each with English and Taglish lines
  in three groups: `honor` (shown only with an honor), `progress` (only without one), and
  `any`. Shuffle steps through the result's own lines, then the `any` ones: 20 per mood,
  language and result (a test checks the count). Copy rules apply: short (42 characters at
  most), playful but kind, no em dashes.
- **The user's own caption:** "My own" takes up to 80 characters and is remembered on the
  device (`gwa_share_caption`). The layout estimates its lines (`lib/caption-lines.ts`, from
  measured font widths) and gives a long one room: subject rows go first, then the caption is
  set smaller.

- **Sizes:** `lib/share-layout.ts` holds the size table per format (roomy, or compact when
  subjects or the trend show) and works out how many subject rows fit under everything else;
  the rest become "+N more". Text uses explicit line heights so the budget holds in every font.
  The GWA's size is capped by its length, since Martian Mono figures are wide.
- **Exact GWA:** on by default. Off shows only the whole number (`1.**`), on the image and in
  the shared text, through `shareGwa` in `lib/share-text.ts`. Never format the shared GWA
  another way. The boarding pass also hides its "0.04 to go" distance, which would give it away.
- **Styles:** `classic` (`templates/classic-template.tsx`), `receipt`, `card` (a trading card
  with up to three earned badges), and `pass` (a boarding pass to the next honor, from
  `nextStop`). `share-template.tsx` picks one. The receipt has its own row budget
  (`lib/style-layouts.ts`); the card and pass fit by design (a flexible art window, a caption
  sized with `fitCaption`). Every style keeps the footer, and the receipt and pass also print
  "Not an official record". They are playful formats, never a real store, airline, or school.
- **Seasonal moods:** Pasko (Sept 1 to Jan 6), Valentine's (Feb 1–14), Recognition (Mar 1 to
  Jun 30), Spooky (Oct 15 to Nov 2), from `lib/seasons.ts`. The picker shows them only in
  season; they follow the same caption rules.

## Achievements and Wrapped

- **Badges:** an earned badge is the accent color with its icon on `bg-primary`; a locked one is
  grey with a lock, its hint, and a progress bar ("15 of 21 units"). Keep names short and
  hints in plain words.
- **Wrapped slides:** dark backgrounds lit by one color, the user's scheme accent for the big
  numbers, light Taglish copy, and the share footer on every slide. Term bars carry no
  numbers, so they never reveal a GWA.

## Typography

These fonts are loaded with `next/font/google` in `src/app/layout.tsx`. The font variables sit
on `<html>`, so `:root` can resolve them.

| Role | Font | Utility |
|---|---|---|
| UI text | Roboto | `font-sans` (default) |
| Editorial / long-form accents | Roboto Serif | `font-serif` |
| Numbers: GWA, grades, units | Martian Mono | `font-mono` |

- **The GWA itself:** always `font-mono font-bold`, with tabular figures. The hero GWA is
  `text-6xl`.
- **Headings:** `font-bold` or `font-extrabold`, with `tracking-tight`.

## Components

- Use the shadcn primitive first (`src/components/ui/`). Add new ones with
  `npx shadcn@latest add <name>`, and don't hand-edit generated files beyond small fixes.
  Check the imports after adding: CLI 4.23 rewrote `@/lib/utils` to a package named `cn`, so
  `drawer.tsx` was written by hand. Its header is left-aligned on purpose (shadcn centers it).
  The CLI did the same for `slider.tsx` (and added the `cn` package); both were fixed by hand.
  The slider also passes `aria-label` and `aria-valuetext` to its thumb.
- For app-wide patterns, compose primitives in `src/components/shared/`.
- **Layout width:** the main content is `max-w-3xl` (account uses `max-w-2xl`) with `px-4`.
  Content pages (legal, guides) use `content-page-layout` and its PROSE typography.
- **Icons:** Lucide, at `size-4` inline and `size-5` in headers. An icon-only button needs an
  `aria-label`.
- **Motion:** `motion` is used for small flourishes: the rolling GWA (`AnimatedNumber`), the
  fireworks on the congratulations dialog, and a one-shot `ConfettiBurst` for improvements.
  All of them turn off with `prefers-reduced-motion`, and so do vibrations (`buzz` in
  `src/lib/haptics.ts`, for saves, honors, badges, and improvements only). Respect it in
  anything new.

## Overlays and the mobile shell

Below `md` (768px) the app behaves like a phone app; from `md` up nothing changes.

- **Tasks become bottom sheets, decisions stay dialogs.**
  - **Tasks** are forms, menus, pickers, and long content. Build them with
    `ResponsiveDialog` (`components/shared/responsive-dialog.tsx`): a centered `Dialog` on
    desktop, a `vaul` `Drawer` on phones. `FormDialog` already uses it.
    - In a sheet the footer stacks full width with the primary action on top. Check
      `useResponsiveDialogIsDrawer()` to reorder buttons.
  - **Menus** are a `MenuGroup[]` model (`components/shared/menu-types.ts`) rendered by
    `ResponsiveMenu`: a `DropdownMenu` on desktop, an action sheet with 48px rows on phones.
    - Item kinds are `action`, `toggle` (a checkbox item or a `Switch` row), and `link`.
    - Use `mode="menu"` or `mode="sheet"` when the trigger only shows at one breakpoint.
  - **Decisions** (reset, delete, merge, celebration, delete account) stay `AlertDialog`s on
    every screen. When a menu item opens one, keep the dialog's `open` state beside the menu,
    not nested inside it.
  - The avatar crop stays a dialog, because dragging to crop would fight the sheet's
    drag-to-close.
- **Mobile shell:**
  - `MainNav variant="bar"` is a fixed bottom tab bar, rendered by `AppShell`, which pads the
    page bottom to clear it.
  - The calculator's Current tab adds a floating "Add subject" button (`add-subject-fab.tsx`).
  - Subject rows open an action sheet on tap, and their inline buttons show from `md` up.
  - Toasts sit above both, via `--toast-bottom` in `globals.css`.
- **Safe areas:** `viewportFit: "cover"` is set in `app/layout.tsx`. Anything pinned to the
  bottom pads with `env(safe-area-inset-bottom)`.
- **Breakpoints in CSS first:** show or hide layout with `md:hidden` / `hidden md:flex`, so
  nothing flashes on load. Use `useIsMobile()` only to choose which overlay to open.
- **Touch targets:** at least 40px on phones, for example `max-md:size-10` on icon buttons.

## Print and email design language

Printable reports (`src/features/reports/`) and transactional emails
(`functions/src/lib/email/templates/`) share one look, separate from the app UI:

- **Header band:** a dark `zinc-900` band (`#18181b`) with the logomark and app name, an amber
  dot accent, and white text.
- **Accent:** a 4 px amber stripe (`#eab308`) under the header. In reports the accent, stripe,
  trend ink and logo glyph follow the user's color scheme (`--report-*` variables); emails stay
  amber.
- **Surfaces:** white paper with `zinc-50` (`#fafafa`) callouts and panels, and `zinc-200`
  (`#e4e4e7`) hairlines.
- **Ink:** `zinc-900` for body text, `zinc-500` for labels and captions.
- **Figures:** GWA and grades in a monospace with tabular numerals.
- **Footer:** app name, app URL and the personal-reference disclaimer, in small muted text.

Print adds a few constraints: no external fonts or images (everything is inline), and
`print-color-adjust: exact` wherever a background carries meaning. See the
`printable-reports` skill for the rest.
