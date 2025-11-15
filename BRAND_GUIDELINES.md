# Jorb Core - Brand Guidelines

## Brand Identity

### Brand Essence

**Jorb Core** represents the future of autonomous AI systems - intelligent, reliable, and scalable. Our brand communicates enterprise-grade sophistication combined with approachable innovation.

### Brand Personality

- **Intelligent**: Advanced, thoughtful, and sophisticated
- **Reliable**: Enterprise-grade, secure, and trustworthy
- **Innovative**: Cutting-edge, forward-thinking
- **Accessible**: User-friendly, well-documented
- **Professional**: Clean, modern, polished

## Logo System

### Primary Logo

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██╗ ██████╗ ██████╗ ██████╗      ██████╗ ██████╗ ██████╗███████╗
║   ██║██╔═══██╗██╔══██╗██╔══██╗    ██╔════╝██╔═══██╗██╔══██╗██╔════╝
║   ██║██║   ██║██████╔╝██████╔╝    ██║     ██║   ██║██████╔╝█████╗
║  ██ ║██║   ██║██╔══██╗██╔══██╗    ██║     ██║   ██║██╔══██╗██╔══╝
║  ╚═══╝╚██████╔╝██║  ██║██████╔╝    ╚██████╗╚██████╔╝██║  ██║███████╗
║       ╚═════╝ ╚═╝  ╚═╝╚═════╝      ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### Logo Variations

1. **Full Logo**: Text with icon (primary use)
2. **Icon Only**: For app icons, favicons, small spaces
3. **Wordmark Only**: For headers, documentation
4. **Monochrome**: For print, single-color applications

### Logo Usage Rules

✅ **Do:**
- Maintain minimum clear space (equal to height of logo)
- Use on contrasting backgrounds
- Scale proportionally
- Use approved color variants

❌ **Don't:**
- Distort or stretch
- Add effects or shadows
- Change colors arbitrarily
- Place on busy backgrounds

## Color Palette

### Primary Colors

```
Primary Blue
HEX: #2563EB
RGB: 37, 99, 235
CMYK: 84, 58, 0, 8
Usage: Primary actions, links, headers

Primary Dark
HEX: #1E40AF
RGB: 30, 64, 175
CMYK: 83, 63, 0, 31
Usage: Hover states, emphasis

Primary Light
HEX: #DBEAFE
RGB: 219, 234, 254
CMYK: 14, 8, 0, 0
Usage: Backgrounds, highlights
```

### Secondary Colors

```
Accent Purple
HEX: #7C3AED
RGB: 124, 58, 237
CMYK: 48, 76, 0, 7
Usage: Secondary actions, accents

Success Green
HEX: #10B981
RGB: 16, 185, 129
CMYK: 91, 0, 30, 27
Usage: Success states, confirmations

Warning Amber
HEX: #F59E0B
RGB: 245, 158, 11
CMYK: 0, 36, 96, 4
Usage: Warnings, alerts

Error Red
HEX: #EF4444
RGB: 239, 68, 68
CMYK: 0, 72, 72, 6
Usage: Errors, critical states
```

### Neutral Colors

```
Dark Gray (Text)
HEX: #1F2937
RGB: 31, 41, 55
CMYK: 44, 25, 0, 78

Medium Gray
HEX: #6B7280
RGB: 107, 114, 128
CMYK: 16, 11, 0, 50

Light Gray
HEX: #F3F4F6
RGB: 243, 244, 246
CMYK: 1, 1, 0, 4

White
HEX: #FFFFFF
RGB: 255, 255, 255
```

## Typography

### Primary Typeface: Inter

```
Headings: Inter Bold (700)
Subheadings: Inter Semi-Bold (600)
Body: Inter Regular (400)
Code/Technical: Inter Medium (500)
```

**Why Inter?**
- Excellent readability at all sizes
- Modern, professional appearance
- Optimized for digital interfaces
- Open source and widely supported

### Type Scale

```
Display: 60px/72px - Inter Bold
H1: 48px/56px - Inter Bold
H2: 36px/44px - Inter Semi-Bold
H3: 30px/36px - Inter Semi-Bold
H4: 24px/32px - Inter Semi-Bold
H5: 20px/28px - Inter Medium
H6: 18px/28px - Inter Medium
Body Large: 18px/28px - Inter Regular
Body: 16px/24px - Inter Regular
Body Small: 14px/20px - Inter Regular
Caption: 12px/16px - Inter Regular
```

### Code Typeface: JetBrains Mono

```
All code blocks, terminals, API responses
Font: JetBrains Mono Regular (400)
Sizes: 14px-16px
Line height: 1.5-1.6
```

## Icon System

### Style Guidelines

- **Style**: Outline/stroke-based icons
- **Stroke Weight**: 2px
- **Corner Radius**: 2px
- **Grid**: 24x24px base
- **Export**: SVG, PNG (1x, 2x, 3x)

### Icon Library

Use icons from:
1. **Heroicons** (primary) - https://heroicons.com
2. **Lucide** (secondary) - https://lucide.dev

### Icon Usage

```
Small: 16x16px (UI elements)
Medium: 24x24px (standard)
Large: 32x32px (features)
Hero: 48x48px+ (marketing)
```

## UI Components

### Buttons

**Primary Button**
```css
background: #2563EB
color: #FFFFFF
border-radius: 8px
padding: 12px 24px
font: Inter Semi-Bold 16px
hover: #1E40AF
```

**Secondary Button**
```css
background: transparent
color: #2563EB
border: 2px solid #2563EB
border-radius: 8px
padding: 12px 24px
font: Inter Semi-Bold 16px
hover: background #DBEAFE
```

**Ghost Button**
```css
background: transparent
color: #6B7280
padding: 12px 24px
font: Inter Medium 16px
hover: color #1F2937
```

### Forms

**Input Fields**
```css
border: 1px solid #D1D5DB
border-radius: 8px
padding: 12px 16px
font: Inter Regular 16px
focus: border #2563EB, ring 4px #DBEAFE
```

**Labels**
```css
font: Inter Medium 14px
color: #374151
margin-bottom: 8px
```

### Cards

```css
background: #FFFFFF
border: 1px solid #E5E7EB
border-radius: 12px
padding: 24px
box-shadow: 0 1px 3px rgba(0,0,0,0.1)
hover: box-shadow 0 4px 6px rgba(0,0,0,0.1)
```

## Spacing System

```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
4xl: 96px
```

## Grid System

```
Desktop: 12 columns, 24px gutter
Tablet: 8 columns, 16px gutter
Mobile: 4 columns, 16px gutter

Max width: 1280px
Container padding: 24px (mobile), 48px (desktop)
```

## Imagery

### Photography Style

- **Tone**: Clean, bright, professional
- **Subjects**: Technology, collaboration, innovation
- **Treatment**: Slight desaturation, high contrast
- **Avoid**: Stock-looking, overly posed

### Illustrations

- **Style**: Modern, geometric, minimal
- **Colors**: Use brand palette
- **Line weight**: 2-3px strokes
- **Purpose**: Explain concepts, guide users

## Voice & Tone

### Voice Characteristics

- **Professional but approachable**
- **Technical yet accessible**
- **Confident without arrogance**
- **Helpful and educational**

### Writing Guidelines

✅ **Do:**
- Use active voice
- Be concise and clear
- Explain technical terms
- Use examples
- Be inclusive

❌ **Don't:**
- Use jargon without explanation
- Be condescending
- Make assumptions
- Use humor inappropriately
- Overuse exclamation marks

### Example Tone

**Good**: "Jorb Core helps you build intelligent agents that can reason, remember, and execute complex tasks autonomously."

**Bad**: "Our revolutionary AI will blow your mind with its incredible capabilities!"

## Application Examples

### Website Header

```
Logo (left) + Navigation (center) + CTA Button (right)
Background: White
Border-bottom: 1px solid #E5E7EB
Height: 72px
Padding: 0 48px
```

### Hero Section

```
Heading: Inter Bold 60px, #1F2937
Subheading: Inter Regular 20px, #6B7280
CTA Buttons: Primary + Secondary
Background: Gradient from #F9FAFB to #FFFFFF
Spacing: 96px vertical padding
```

### Code Blocks

```
Background: #1F2937
Text: #F9FAFB
Font: JetBrains Mono 14px
Border-radius: 8px
Padding: 24px
Line numbers: #6B7280
Syntax highlighting: Use VS Code Dark+ theme
```

## Brand Applications

### Business Cards

```
Front: Logo + Name + Title
Back: Contact info + QR code
Size: 3.5" x 2"
Paper: Premium matte finish
```

### Email Signatures

```
Name: Inter Semi-Bold 16px, #1F2937
Title: Inter Regular 14px, #6B7280
Logo: 120px width
Links: #2563EB
```

### Social Media

```
Profile Image: Icon only version
Cover: Logo + tagline
Post Images: 1200x630px
Colors: Brand palette
Watermark: Logo in corner (20% opacity)
```

## File Naming Conventions

```
Logo files:
- jorb-core-logo-primary.svg
- jorb-core-logo-white.svg
- jorb-core-icon-primary.svg
- jorb-core-wordmark.svg

Screenshots:
- jorb-screenshot-dashboard-{date}.png
- jorb-screenshot-api-docs-{date}.png

Marketing:
- jorb-hero-banner-{variant}.png
- jorb-feature-{name}.png
```

## Brand Review Checklist

Before publishing any branded material:

- [ ] Logo used correctly
- [ ] Colors match brand palette
- [ ] Typography follows guidelines
- [ ] Spacing consistent
- [ ] Tone appropriate
- [ ] No spelling/grammar errors
- [ ] Accessible (WCAG 2.1 AA minimum)
- [ ] Responsive (mobile-friendly)
- [ ] High resolution assets
- [ ] Proper file formats

## Contact

For brand questions or approval:
- Brand Team: brand@jorb.ai
- Marketing: marketing@jorb.ai

---

**Version**: 1.0
**Last Updated**: 2025-01-15
**Next Review**: 2025-07-15
