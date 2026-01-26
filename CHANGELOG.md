# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] - 2026-01-26

### Changed - UX Improvements 🎨
- **Progress Bar** replaces circular score display at top of SEO tab
- **Inline Indicators** - Analysis results appear under each field
- **Single Column Layout** - Removed cluttered sidebar
- **Cleaner UI** - More space, less cramped appearance
- **Better Content Detection** - Analyzes all textarea, redactor, and article fields
- **Mobile Responsive** - Optimized for all screen sizes

### Added
- Progress bar with gradient colors (red/orange/green)
- Inline badges under title/description showing character count and keyphrase status
- Keyphrase usage indicators (Title, Description, URL, Content)
- Content analysis cards grid (length, density, links)
- CKEditor support for content analysis
- Dark mode support (follows system preference)
- High contrast mode support
- Reduced motion support for accessibility

### Fixed
- Content fields now properly detected (textarea, redactor, article types)
- Analysis accounts for all content fields, not just body
- Mobile layout no longer cramped
- Better spacing and visual hierarchy

## [1.1.0] - 2026-01-26

### Added - Real-time SEO Analyzer 🎯
- **Comprehensive SEO Scoring** (0-100) with visual circle indicator
- **10 Automated SEO Checks**:
  - SEO Title Length (30-60 chars optimal)
  - Meta Description Length (120-160 chars optimal)
  - Focus Keyphrase in Title
  - Focus Keyphrase in Description  
  - Focus Keyphrase in URL/Slug
  - Focus Keyphrase in Content
  - Keyphrase Density (0.5-2.5% optimal)
  - Content Length (300+ words minimum)
  - External Links Detection
  - Internal Links Detection
- **Focus Keyphrase Field** - Set main keyword for optimization
- **Visual Feedback** - Color-coded checks (green✓/yellow!/red✗)
- **Live Analysis** - Updates as you type, every 2 seconds
- **Improvement Suggestions** - Actionable feedback panel
- **Sidebar Analysis Panel** - Sticky panel with all metrics

### Changed
- Enhanced 2-column layout (content/analysis split)
- Improved character counters with color coding
- Better Google snippet preview styling
- Reorganized field order for better UX

### Technical
- `seo-analyzer.js` - New analysis engine (400+ lines)
- `seo-enhanced.js` - Enhanced controller with live updates
- `seo-analyzer.css` - Analysis UI styles
- Weighted scoring algorithm for accurate SEO assessment
- Auto-refresh analysis every 2 seconds
- Content field detection from editor

## [1.0.0] - 2026-01-25

### Initial Release
- Custom SEO field type
- Google Search Preview  
- Meta tags management
- Open Graph support
- Multi-language support
- Twig template integration
- PHP 8.1+ support
- Bolt 5 & 6 compatible

---
Based on [AppoloDev/bolt-seo](https://github.com/AppoloDev/bolt-seo)
