# Collaboration Section - Fixed Layout

## ✅ New Layout Structure

```
┌─────────────────────────────────────────────┐
│                                             │
│        TRUSTED BY THE BEST                  │  ← Title (ABOVE everything)
│                                             │
├─────────────────────────────────────────────┤
│ ////// NRG1-SNP-TT ////// COLLABORATIONS... │  ← First Tape (scrolling →)
├─────────────────────────────────────────────┤
│                                             │
│  [Logo] [Logo] [Logo] [Logo] [Logo] ...    │  ← Brands Rail (scrolling →)
│                                             │
├─────────────────────────────────────────────┤
│ ////// NRG1-SNP-TT ////// COLLABORATIONS... │  ← Second Tape (scrolling ←)
├─────────────────────────────────────────────┤
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📊 Component Hierarchy

```tsx
<section className="collab-section">
    {/* 1. TITLE - Outside tapes */}
    <div className="collab-header">
        <h2>TRUSTED BY THE BEST</h2>
    </div>

    {/* 2. FIRST TAPE */}
    <Tape label="COLLABORATIONS..." reverse={false}/>

    {/* 3. BRANDS RAIL */}
    <div className="collab-content">
        <div className="brands">
            <div className="brands-rail">
                {/* Logo tiles */}
            </div>
        </div>
    </div>

    {/* 4. SECOND TAPE */}
    <Tape label="COLLABORATIONS..." reverse/>
</section>
```

---

## 🎯 Example: MTEC Collaboration

### When User Clicks MTEC Logo:

**Component loads:** `/content/collaborations/mtec.md`

**Modal shows:**

```
┌──────────────────────────────────────┐
│              [ X ]                   │
│                                      │
│            [MTEC LOGO]               │
│                                      │
│   MTEC - Institute of Micro         │
│      Systems Technology              │
│                                      │
│    [RESEARCH ASSISTANT]              │
│                                      │
│ Established: 2024                    │
│ Duration: Ongoing                    │
│ Role: Research Assistant             │
├──────────────────────────────────────┤
│                                      │
│ Research assistant at Hamburg        │
│ University of Technology...          │
│                                      │
│ KEY OUTCOMES:                        │
│ ▸ Contributing to microsystems       │
│   technology research                │
│ ▸ Working with advanced fabrication  │
│ ▸ Collaborating with international   │
│   research teams                     │
│                                      │
│ FULL STORY:                          │
│                                      │
│ ## Introduction                      │
│ Since 2024, I've been working...    │
│                                      │
│ ## The Institute                     │
│ MTEC focuses on...                   │
│                                      │
│ [Visit Website →]                    │
│                                      │
└──────────────────────────────────────┘
```

---

## 📁 Files for MTEC Example

### 1. Data (collaborators.ts):
```typescript
```

### 2. Markdown File (mtec.md):
```markdown
---
name: MTEC - Institute of Micro Systems Technology
description: Research assistant at Hamburg University of Technology...
established: 2024
duration: Ongoing
role: Research Assistant
outcomes:
- Contributing to microsystems technology research
- Working with advanced fabrication techniques
- Collaborating with international research teams
---

## Introduction

Since 2024, I've been working as a research assistant...

## The Institute

MTEC focuses on the development...
```

---

## ✨ What Changed

### ❌ Old Layout:
```
[First Tape]
   ↓
[TITLE] ← Between tapes and brands (wrong!)
   ↓
[Brands]
   ↓
[Second Tape]
```

### ✅ New Layout:
```
[TITLE] ← Above everything (correct!)
   ↓
[First Tape]
   ↓
[Brands]
   ↓
[Second Tape]
```

---

## 🎨 Visual Spacing

```css
.collab-section {
    padding: 80px 0;  /* Section breathing room */
}

.collab-header {
    margin: 0 auto 60px;  /* Title → 60px gap → First Tape */
    padding: 0 100px;
}

/* First Tape renders naturally */

.collab-content {
    /* Brands render naturally after tape */
}

/* Second Tape renders naturally */
```

---

## 🚀 Complete Example Flow

1. **User scrolls to section**
    - Sees "TRUSTED BY THE BEST" title

2. **Sees first tape scrolling right →**
    - "////// NRG1-SNP-TT ////// COLLABORATIONS..."

3. **Sees logos scrolling right →**
    - Hovers over MTEC logo
    - Caption appears: "RESEARCH ASSISTANT"
    - Corner icon animates in

4. **Clicks MTEC logo**
    - Modal opens with loading spinner
    - Loads `/content/collaborations/mtec.md`
    - Shows full story with outcomes, metadata, markdown content

5. **Scrolls down to read full story**
    - Sees rich markdown formatting
    - Headings, lists, quotes, emphasis

6. **Clicks "Visit Website"**
    - Opens MTEC institute website in new tab

7. **Presses ESC or clicks outside**
    - Modal closes smoothly

---

## 📦 Generated Files

**[mtec.md](computer:///mnt/user-data/outputs/mtec.md)** - Example markdown story for MTEC

Perfect example of how a collaboration story should look! 🎯