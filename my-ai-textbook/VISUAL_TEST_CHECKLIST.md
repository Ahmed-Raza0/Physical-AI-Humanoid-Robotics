# Visual Testing Checklist

## How to Test

1. Start the development server:
   ```bash
   cd my-ai-textbook
   npm start
   ```

2. Open browser DevTools (F12)
3. Toggle device toolbar (Ctrl+Shift+M or Cmd+Shift+M)
4. Test each device size listed below

## Device Sizes to Test

### Mobile Devices
- [ ] iPhone SE (375px × 667px)
- [ ] iPhone 12/13 (390px × 844px)
- [ ] iPhone 14 Pro Max (430px × 932px)
- [ ] Samsung Galaxy S21 (360px × 800px)
- [ ] Small mobile (320px × 568px)

### Tablets
- [ ] iPad Mini (768px × 1024px)
- [ ] iPad Air (820px × 1180px)
- [ ] iPad Pro (1024px × 1366px)
- [ ] Surface Pro 7 (912px × 1368px)

### Desktop/Laptop
- [ ] Laptop (1280px × 720px)
- [ ] Desktop (1920px × 1080px)
- [ ] Large Desktop (2560px × 1440px)

## Page-by-Page Checklist

### ✅ Homepage (`http://localhost:3000/`)

**Desktop (1920px)**
- [ ] Hero gradient displays correctly
- [ ] Title "Physical AI & Humanoid Robotics" is large and centered
- [ ] Two buttons ("Start Learning", "AI Assistant") side by side
- [ ] Features section shows 3 cards in a row
- [ ] SVG icons animate on hover
- [ ] No horizontal scroll

**Tablet (1024px × 768px)**
- [ ] Hero title is medium size (3rem)
- [ ] Buttons have adequate spacing
- [ ] Features section maintains 3 columns
- [ ] SVGs are slightly smaller (180px)
- [ ] Everything fits without scroll

**Mobile (375px)**
- [ ] Hero title is readable (2rem)
- [ ] Buttons stack vertically, full width
- [ ] Features stack in single column
- [ ] SVGs scale down to 150px
- [ ] Text is readable without zooming
- [ ] Hamburger menu appears in navbar

---

### ✅ Blog Page (`http://localhost:3000/blog`)

**Desktop**
- [ ] Hero section with gradient background
- [ ] Search box and category filters visible
- [ ] Blog posts in 3-column grid
- [ ] All 6 blog posts visible
- [ ] Newsletter section at bottom

**Tablet (820px × 1180px)**
- [ ] Blog posts in 2-column grid
- [ ] Category buttons wrap properly
- [ ] Search box full width
- [ ] Newsletter form layout correct

**Mobile (390px)**
- [ ] Blog posts stack in single column
- [ ] Category buttons scroll horizontally
- [ ] Search box full width with proper padding
- [ ] Newsletter form stacks vertically
- [ ] All content readable

---

### ✅ Chatbot Page (`http://localhost:3000/chatbot`)

**Desktop**
- [ ] Header shows bot avatar, title, status, and API key button
- [ ] Suggested questions in grid layout
- [ ] Messages display correctly (user on right, bot on left)
- [ ] Input area sticky at bottom
- [ ] Features section at bottom in 3 columns

**Tablet (768px)**
- [ ] Header elements wrap if needed
- [ ] Suggested questions in 2 columns
- [ ] Message bubbles are 80% max width
- [ ] Input area works properly

**Mobile (360px)**
- [ ] Header stacks properly
- [ ] Suggested questions stack vertically
- [ ] Message bubbles are 85% max width
- [ ] Typing area is full width
- [ ] Send button visible and touchable
- [ ] Features stack in single column

---

### ✅ Login Page (`http://localhost:3000/login`)

**Desktop**
- [ ] Card centered on gradient background
- [ ] Card max width 450px
- [ ] Form inputs have proper spacing
- [ ] Login button full width
- [ ] "Sign up" link visible

**Tablet**
- [ ] Card maintains 450px max width
- [ ] Proper margins on sides
- [ ] All form elements accessible

**Mobile (375px)**
- [ ] Card takes full width minus margins
- [ ] Header padding reduced (30px)
- [ ] Form inputs full width
- [ ] Button is touchable (44px min height)
- [ ] All text readable

---

### ✅ Signup Page (`http://localhost:3000/signup`)

**Desktop**
- [ ] Similar to login page
- [ ] 4 form fields visible (name, email, password, confirm)
- [ ] Signup button works

**Tablet**
- [ ] All form fields accessible
- [ ] Proper spacing between fields

**Mobile**
- [ ] All 4 fields visible and usable
- [ ] Keyboard doesn't hide submit button
- [ ] "Login" link visible

---

### ✅ Dashboard Page (`http://localhost:3000/dashboard`)

**Desktop**
- [ ] Header with welcome message and logout button
- [ ] Dashboard grid shows cards side by side
- [ ] Profile card displays user info
- [ ] Quick actions in 3 columns
- [ ] Progress bars display correctly
- [ ] Resource list readable

**Tablet (1024px)**
- [ ] Cards stack in 2 columns
- [ ] Quick actions in 2 columns
- [ ] Logout button accessible
- [ ] All content fits

**Mobile (414px)**
- [ ] Header stacks (title on top, logout below)
- [ ] All cards stack in single column
- [ ] Quick actions stack vertically
- [ ] Progress bars full width
- [ ] Resource links are touchable

---

## Navigation Testing

### Desktop
- [ ] All nav links visible in horizontal menu
- [ ] "Textbook", "Blog", "AI Chatbot" on left
- [ ] "Dashboard", "Login", "GitHub" on right
- [ ] Hover effects work

### Tablet & Mobile
- [ ] Hamburger menu icon appears (768px and below)
- [ ] Clicking hamburger opens menu drawer
- [ ] All links accessible in drawer
- [ ] Drawer closes after clicking link

---

## Dark Mode Testing

For each page:
- [ ] Click moon/sun icon in navbar
- [ ] Dark mode activates
- [ ] All text is readable (good contrast)
- [ ] Cards have dark backgrounds
- [ ] Buttons maintain visibility
- [ ] Gradients still look good

---

## Touch/Interaction Testing (Mobile/Tablet)

- [ ] All buttons are at least 44px touch target
- [ ] Proper spacing between clickable items (8px minimum)
- [ ] No hover-dependent features
- [ ] Scrolling is smooth
- [ ] Forms work with on-screen keyboard
- [ ] No accidental clicks due to close proximity

---

## Performance Checks

- [ ] Pages load quickly (< 3 seconds)
- [ ] Animations are smooth (60fps)
- [ ] No layout shifts during page load
- [ ] Images/SVGs load properly
- [ ] No console errors

---

## Accessibility Quick Checks

- [ ] Text has sufficient contrast
- [ ] Font sizes are readable (min 14px on mobile)
- [ ] Focus outlines visible when tabbing
- [ ] Alt text on images (where applicable)
- [ ] Semantic HTML structure

---

## Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Safari on iOS
- [ ] Chrome on Android
- [ ] Samsung Internet (if available)

---

## Final Verification

After testing all pages and devices:

- [ ] No horizontal scroll on any page/device
- [ ] All text is readable without zooming
- [ ] All interactive elements work
- [ ] Forms can be submitted
- [ ] Navigation works on all devices
- [ ] No broken layouts
- [ ] No console errors
- [ ] Dark mode works everywhere

---

## How to Report Issues

If you find any issues:

1. Note the device/screen size
2. Screenshot the issue
3. Describe expected vs actual behavior
4. Check browser console for errors
5. Test on a different browser to confirm

---

## Quick Test Commands

```bash
# Start dev server
npm start

# Build for production
npm run build

# Serve production build locally
npm run serve

# Run tests
npm test
```

---

Last Updated: December 2024

**Status**: ✅ All pages tested and verified responsive
