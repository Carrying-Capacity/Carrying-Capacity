# CSS Architecture Refactoring Plan

## Implementation Status

### ✅ Completed
- Enhanced design-system.css with missing tokens (accent, warning, gradients, hover states, breakpoints)

### 🔄 In Progress
- Comment 1: Replace hardcoded colors with design tokens
- Comment 6: Consolidate animations
- Comment 8: Global box-sizing reset

### 📋 Planned (High Priority)
- Comment 2: Extract shared glass/card/badge/button utilities
- Comment 3: Adopt CSS cascade layers
- Comment 4: Normalize breakpoints to 640/768/1024
- Comment 5: Align page padding to --header-height
- Comment 7: Unify modal styling
- Comment 9: Standardize button system
- Comment 10: Create .container utility
- Comment 11: Reduce effects on mobile + prefers-reduced-motion
- Comment 12: Scrollbar styling utilities

### 📋 Planned (Medium Priority)
- Comment 13: Logical properties for RTL support
- Comment 15: Section spacing/typography utilities
- Comment 16: Unify card hover/active states
- Comment 17: Migrate to Tailwind responsive utilities

### 📋 Planned (Low Priority - Tooling)
- Comment 14: Add Stylelint configuration

## Key Files Modified
1. src/styles/design-system.css - Enhanced with comprehensive tokens
2. src/styles/animations.css - (To be created) Shared keyframes
3. src/styles/components.css - (To be created) Reusable component utilities
4. src/index.css - (To be updated) Global resets and layers

## Migration Strategy
1. Infrastructure first: animations, resets, layers
2. Token replacement: systematic color/spacing/shadow updates
3. Component utilities: extract patterns
4. Page-by-page migration: Home → FrontEnd → others
5. Cleanup: remove duplicates, run Stylelint

## Notes
- Maintain visual parity during refactoring
- Test responsive behavior at each breakpoint
- Verify accessibility (reduced motion, contrast)
- Keep git commits atomic per comment
