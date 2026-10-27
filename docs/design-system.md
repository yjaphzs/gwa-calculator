# Design system

The app uses **Tailwind CSS v4** and **shadcn/ui** ("new-york" style on Radix primitives, Lucide
icons). Dark mode comes from `next-themes`, using a `.dark` class and the system default.
Tokens are CSS variables in `src/app/globals.css`, and components consume them through
Tailwind utilities (`bg-primary`, `text-muted-foreground`, …).

## Brand

- **Primary: amber**, `oklch(0.812 0.165 78.2)` (≈ `#FBB217`). Text on primary is black, in
  both themes.
- **Everything else is neutral grayscale.** Amber is the only hue, so use it sparingly for
  primary actions, focus, highlights and the GWA accent.
- **Logo:** an amber line-art calculator on black (`src/assets/images/gwa-calculator.jpg`,
  100×100).

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
- For app-wide patterns, compose primitives in `src/components/shared/`.
- **Layout width:** the main content is `max-w-3xl` (account uses `max-w-2xl`) with `px-4`.
  Content pages (legal, guides) use `content-page-layout` and its PROSE typography.
- **Icons:** Lucide, at `size-4` inline and `size-5` in headers. An icon-only button needs an
  `aria-label`.
- **Motion:** `motion` is used for small flourishes, and the fireworks run only on the
  congratulations dialog. Respect `prefers-reduced-motion` in anything new.

## Print and email design language

Printable reports (`src/features/reports/`) and transactional emails
(`functions/src/lib/email/templates/`) share one look, separate from the app UI:

- **Header band:** a dark `zinc-900` band (`#18181b`) with the logomark and app name, an amber
  dot accent, and white text.
- **Accent:** a 4 px amber stripe (`#eab308`) under the header.
- **Surfaces:** white paper with `zinc-50` (`#fafafa`) callouts and panels, and `zinc-200`
  (`#e4e4e7`) hairlines.
- **Ink:** `zinc-900` for body text, `zinc-500` for labels and captions.
- **Figures:** GWA and grades in a monospace with tabular numerals.
- **Footer:** app name, app URL and the personal-reference disclaimer, in small muted text.

Print adds a few constraints: no external fonts or images (everything is inline), and
`print-color-adjust: exact` wherever a background carries meaning. See the
`printable-reports` skill for the rest.
