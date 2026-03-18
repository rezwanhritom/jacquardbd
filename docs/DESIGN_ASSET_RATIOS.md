# Jacquard — responsive image & video ratios

Use this doc to **gather and export** photos and videos before those sections exist in the app.  
Breakpoints are conceptual for design (**mobile** = phone portrait, **tablet** = tablet / small laptop, **desktop** = large wide screens).

**General rules**

- Export **2×** sizes where noted for retina.
- Anything shown with **cover** cropping: keep faces, logos, and type in the **center ~70–80%**.
- **One ratio per “slot”** (e.g. every hero slide the same ratio) avoids awkward jumps when the UI is responsive.

---

## 1. Multiple home banner images

Rotating / carousel hero banners. **Use the same aspect ratio for every slide** so swapping slides doesn’t reflow the layout.

| Screen | Aspect ratio | Role | Suggested export size |
|--------|--------------|------|------------------------|
| **Mobile** | **4 : 5** | Tall hero that fits viewport height | **1080 × 1350** or **1440 × 1800** (@2×) |
| **Tablet** | **16 : 9** | Wide strip (landscape) | **1920 × 1080** or **2560 × 1440** |
| **Desktop** | **21 : 9** (preferred) or **16 : 9** | Cinematic full-width | **2560 × 1097** (21:9) or **1920 × 1080** (16:9) |

**Implementation note:** The live home hero today uses **4:5 on mobile** and a **21:9-style height on desktop**. When you add **multiple** banners, either:

- ship **one file per breakpoint** per slide (mobile / tablet / desktop crops), or  
- ship **widest master** (21:9) + **4:5 mobile crop** and let dev map them per breakpoint.

**Optional banner video** (later): match the **same frame** as the static banner for that slide (**9:16** mobile loop vs **16:9**/**21:9** desktop — see §5).

---

## 2. Campaign images & videos (home + campaign page)

### 2a. Full-width campaign strip (e.g. under hero on home)

| Screen | Aspect ratio | Suggested export |
|--------|--------------|------------------|
| **Mobile** | **16 : 9** | **1920 × 1080** |
| **Tablet** | **16 : 9** | **1920 × 1080** |
| **Desktop** | **21 : 9** or **3 : 1** | **2560 × 1097** or **2400 × 800** |

### 2b. Campaign page — featured hero / top banner

Same as **2a** so one master can reuse on home and campaign page.

### 2c. Campaign page — grid tiles / cards / thumbnails

| Screen | Aspect ratio | Suggested export |
|--------|--------------|------------------|
| **Mobile** | **4 : 5** or **1 : 1** | **1080 × 1350** or **1080 × 1080** |
| **Tablet** | **4 : 5** | **1200 × 1500** |
| **Desktop** | **16 : 9** or **4 : 5** | **1920 × 1080** or **1200 × 1500** |

Pick **one** card ratio per campaign for consistency, unless art direction needs mixed grids (then label assets “landscape” vs “portrait”).

### 2d. Campaign video (embedded, not full-screen story)

| Screen | Aspect ratio | Resolution |
|--------|--------------|------------|
| **All** | **16 : 9** | **1920 × 1080** min; **3840 × 2160** if 4K |

Poster/thumbnail: **16 : 9**, same frame as video start.

---

## 3. Story pictures & videos (home page)

Storytelling blocks (e.g. brand narrative, founder, craft). Often **vertical on phone**, **wider on desktop**.

### 3a. Story images

| Screen | Aspect ratio | Suggested export |
|--------|--------------|------------------|
| **Mobile** | **9 : 16** (full-bleed story) **or** **4 : 5** (card) | **1080 × 1920** or **1080 × 1350** |
| **Tablet** | **4 : 5** or **16 : 9** | **1200 × 1500** or **1920 × 1080** |
| **Desktop** | **16 : 9** (wide panel) **or** **4 : 5** (tall column) | **1920 × 1080** or **1200 × 1500** |

If you use **one** image per story: prefer **4 : 5** — it crops reasonably to both vertical mobile strips and desktop columns. For **Reels-style** mobile only, master **9 : 16** and add a **16 : 9** crop for desktop.

### 3b. Story video

| Screen | Aspect ratio | Resolution |
|--------|--------------|------------|
| **Mobile** | **9 : 16** (vertical) | **1080 × 1920** |
| **Tablet / desktop** | **16 : 9** | **1920 × 1080** |

**Ideal:** deliver **two masters** (9:16 + 16:9) or one **16 : 9** with safe center action if only horizontal is possible.

---

## 4. Behind the scenes (PDP — end of product description)

Photo grids and optional video **below** the product story.

### 4a. BTS photos

| Type | Mobile | Tablet | Desktop | Suggested export |
|------|--------|--------|---------|------------------|
| **Wide** (process, set, group) | **16 : 9** | **16 : 9** | **16 : 9** | **1920 × 1080** min |
| **Portrait** (detail, portrait) | **3 : 4** | **3 : 4** | **3 : 4** | **1200 × 1600** min |

Mixing both in one gallery is fine; name files clearly (`bts-wide-*`, `bts-portrait-*`).

### 4b. BTS video

| Screen | Aspect ratio | Resolution |
|--------|--------------|------------|
| **All** | **16 : 9** | **1920 × 1080** min |

---

## 5. Video encoding (all types)

| Use | Format | Notes |
|-----|--------|--------|
| Web | **H.264 + AAC**, MP4 | Short loops **&lt; 15 MB** on mobile when possible |
| Poster | PNG/JPEG, **same ratio** as video | First frame or branded still |

---

## Quick reference table

| Asset | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| **Hero banners (each slide)** | **4 : 5** | **16 : 9** | **21 : 9** or **16 : 9** |
| **Campaign full-width** | **16 : 9** | **16 : 9** | **21 : 9** / **3 : 1** |
| **Campaign cards** | **4 : 5** / **1 : 1** | **4 : 5** | **16 : 9** / **4 : 5** |
| **Campaign video** | **16 : 9** | **16 : 9** | **16 : 9** |
| **Story image** | **9 : 16** or **4 : 5** | **4 : 5** / **16 : 9** | **16 : 9** / **4 : 5** |
| **Story video** | **9 : 16** | **16 : 9** | **16 : 9** |
| **BTS wide photo** | **16 : 9** | **16 : 9** | **16 : 9** |
| **BTS portrait photo** | **3 : 4** | **3 : 4** | **3 : 4** |
| **BTS video** | **16 : 9** | **16 : 9** | **16 : 9** |

---

*When UI for stories, multi-banner, campaign page grids, and PDP BTS is built, wireframes may narrow choices (e.g. fixed card height). These ratios stay a safe default for responsive layouts.*
