# Bolt Enhanced SEO Extension v1.1.2

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Bolt CMS](https://img.shields.io/badge/Bolt%20CMS-5%20%7C%206-blue)](https://boltcms.io)
[![PHP Version](https://img.shields.io/badge/PHP-%3E%3D8.1-blue)](https://php.net)
[![Version](https://img.shields.io/badge/version-1.1.2-green.svg)](CHANGELOG.md)

Enhanced SEO extension for Bolt CMS 5/6 with **real-time SEO analysis**, comprehensive meta tag management, and Google search preview.

## ✨ What's New in v1.1.2

🎯 **Keywords Field Scoring** - Keywords now contribute to SEO score!
- **Conditional weighting** - Only scored when enabled (maxlength > 0)
- **Smart detection** - 7-15 keywords = optimal score
- **Auto-normalization** - Score adjusts when keywords disabled
- **11 Comprehensive Checks** - Added keywords analysis

### What's New in v1.1.0

🎯 **Real-time SEO Analyzer** - Get instant feedback as you write!
- **Live SEO Score (0-100)** with visual circle indicator
- **10 Automated Checks** running in real-time
- **Focus Keyphrase Analysis** - Optimize for your target keyword
- **Smart Suggestions** - Actionable improvements as you type
- **Content Quality Checks** - Length, density, links analysis

## Features

✅ **Real-time SEO Analyzer** ⭐ Enhanced in v1.1.2
   - Live scoring (0-100) with color-coded feedback
   - 11 comprehensive SEO checks (added Keywords check)
   - Focus keyphrase optimization
   - Content analysis & suggestions
   - Conditional scoring based on configuration
   
✅ **Custom SEO Field Type** - Dedicated `seo` field for all content types
✅ **Google Search Preview** - Real-time SERP preview as you type
✅ **Meta Tag Management** - Title, description, keywords, canonical, robots
✅ **Open Graph Support** - Facebook/LinkedIn social media optimization
✅ **Multi-language Support** - Works with Bolt's localization system
✅ **Template Integration** - Simple Twig functions for frontend output
✅ **Flexible Configuration** - Extensive YAML configuration options
✅ **No Database Changes** - Stores SEO data as JSON in fields

## Installation

### Via Composer (Recommended)

```bash
composer require brandefy-studio/bolt-enhanced-seo
```

### Manual Installation

1. Download the latest release
2. Extract to `vendor/brandefy-studio/bolt-enhanced-seo`
3. Run `composer dump-autoload`

## Setup

### Step 1: Add SEO Field to ContentTypes

Edit `config/bolt/contenttypes.yaml`:

```yaml
pages:
    name: Pages
    singular_name: Page
    fields:
        title:
            type: text
            class: large
            group: content
        
        slug:
            type: slug
            uses: title
            group: content
        
        body:
            type: html
            group: content
        
        # Add SEO field
        seo:
            type: seo
            group: "SEO"
```

### Step 2: Add Meta Tags to Templates

Edit your base template (e.g., `templates/base.html.twig`):

```twig
<!DOCTYPE html>
<html lang="{{ app.request.locale }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    {# SEO Title #}
    <title>{{ seo.title() }}</title>
    
    {# All SEO Meta Tags #}
    {{ seo.metatags()|raw }}
    
    {# Your other head content #}
</head>
<body>
    {{ block('content') }}
</body>
</html>
```

### Step 3: Clear Cache

```bash
php bin/console cache:clear
```

## Usage

### Real-time SEO Analyzer (v1.1.2+)

The SEO Analyzer provides instant feedback as you write content:

#### SEO Score
- **0-49** (Red) - Needs significant improvement
- **50-79** (Orange) - Good, but can be better
- **80-100** (Green) - Excellent SEO optimization!

#### 11 Automated Checks

1. **SEO Title Length** - Optimal: 30-60 characters
2. **Meta Description Length** - Optimal: 120-160 characters
3. **Focus Keyphrase in Title** - Best at start of title
4. **Focus Keyphrase in Description** - Should appear naturally
5. **Focus Keyphrase in URL** - Improves relevance
6. **Keywords** (Conditional) - 7-15 relevant keywords (only when enabled)
7. **Focus Keyphrase in Content** - Use 3+ times naturally
8. **Keyphrase Density** - Optimal: 0.5-2.5% (avoid keyword stuffing)
9. **Content Length** - Minimum 300 words, optimal 800+
10. **External Links** - Link to authoritative sources (1-3 links)
11. **Internal Links** - Link to related pages (2-5 links)

#### How to Use

1. **Set Focus Keyphrase**: Enter your target keyword/phrase
2. **Write Content**: The analyzer updates as you type
3. **Check Score**: Watch the score circle in the sidebar
4. **Follow Suggestions**: Review the improvement panel
5. **Optimize**: Make changes to improve your score

### In Backend

1. Edit any content that has the `seo` field
2. Click on the **"SEO" tab**
3. Fill in SEO fields:
   - **SEO Title** - Custom title for search engines (50-60 chars recommended)
   - **Meta Description** - Brief description (120-156 chars recommended)
   - **Meta Keywords** - Comma-separated keywords (optional)
   - **Google Preview** - Live preview of how it appears in search results
   - **Shortlink** - Alias/shortlink for the page
   - **Canonical Link** - Override canonical URL
   - **Meta Robots** - Control indexing (index/noindex, follow/nofollow)
   - **Open Graph Type** - Social media type (website, article, etc.)

### In Templates

```twig
{# Basic usage #}
<title>{{ seo.title() }}</title>
{{ seo.metatags()|raw }}

{# Individual meta tags #}
<meta name="description" content="{{ seo.description() }}">
<meta name="keywords" content="{{ seo.keywords() }}">
<meta name="robots" content="{{ seo.robots() }}">
<link rel="canonical" href="{{ seo.canonical() }}">

{# Open Graph #}
<meta property="og:title" content="{{ seo.title() }}">
<meta property="og:description" content="{{ seo.description() }}">
<meta property="og:type" content="{{ seo.ogtype() }}">
<meta property="og:image" content="{{ seo.image() }}">
```

## Configuration

Edit `config/extensions/brandefy-bolt-enhanced-seo.yaml`:

```yaml
# Title separator: "Page Title | Site Name"
title_separator: "|"

# Title postfix (leave empty to use sitename from config)
# Set to false to disable postfix
title_postfix: ''

# Length limits for SEO fields
title_length: 70
description_length: 158
keywords_length: 0  # Set to 255 to enable keywords field and scoring

# Default fields to use for SEO data
fields:
    slug: ['slug']
    title: ['title', 'name']
    description: ['introduction', 'teaser', 'description', 'body']
    keywords: []
    image: ['image']

# Default values
default:
    title: ""
    description: ""
    keywords: ""
    ogtype: "website"
    robots: "index, follow"

# Override defaults for specific routes
#override_default:
#    homepage:
#        title: 'Custom Homepage Title'
#        description: 'Custom Description'
#        robots: 'index, follow'
#        ogtype: 'website'
#        canonical: 'https://example.com'

# Custom template for meta tags output
#templates:
#    meta: _partials/_metatags.html.twig
```

## API Reference

### Twig Functions

#### `seo.title()`
Returns the SEO title with optional postfix.

**Priority**:
1. Override configuration for route
2. SEO field `title` value
3. Content `title` field
4. Default title from config
5. Site name from Bolt config

#### `seo.description()`
Returns the meta description, trimmed to configured length.

**Priority**:
1. Override configuration
2. SEO field `description` value
3. Content description/teaser/intro field
4. Default description
5. Site payoff from Bolt config

#### `seo.keywords()`
Returns meta keywords (if enabled).

#### `seo.canonical()`
Returns the canonical URL.

**Priority**:
1. Override configuration
2. SEO field `canonical` value
3. Default canonical from config
4. Current request URI

#### `seo.robots()`
Returns robots meta directive.

**Priority**:
1. Override configuration
2. SEO field `robots` value
3. Default robots from config
4. `"index, follow"`

#### `seo.image()`
Returns OG image URL.

**Priority**:
1. Override configuration
2. Content image field
3. Default image from config

#### `seo.ogtype()`
Returns Open Graph type.

**Priority**:
1. Override configuration
2. SEO field `og` value
3. Default ogtype from config
4. `"website"`

#### `seo.metatags()`
Outputs all meta tags using the configured template.

## Customizing Meta Tags Output

To customize the meta tags template:

1. Copy `vendor/brandefy-studio/bolt-enhanced-seo/templates/_metatags.html.twig` to your theme
2. Edit `config/extensions/brandefy-bolt-enhanced-seo.yaml`:
   ```yaml
   templates:
       meta: _partials/_metatags.html.twig
   ```
3. Customize your template

## Multi-language Support

The extension works seamlessly with Bolt's localization:

```yaml
# config/bolt/config.yaml
locales:
    en:
        label: English
        slug: en
    fr:
        label: Français
        slug: fr

# config/bolt/contenttypes.yaml
pages:
    fields:
        title:
            type: text
            localize: true
        
        seo:
            type: seo
            group: "SEO"
            # SEO data is automatically localized
```

## Troubleshooting

### SEO Tab Not Showing

1. Verify field is added to contenttype:
   ```yaml
   seo:
       type: seo
       group: "SEO"
   ```
2. Clear cache: `php bin/console cache:clear`
3. Check field type is registered (should auto-register)

### Meta Tags Not Appearing

1. Verify templates include `{{ seo.metatags()|raw }}`
2. Check that content has `seo` field
3. Verify extension is installed: `composer show brandefy-studio/bolt-enhanced-seo`

### JavaScript/CSS Not Loading

The extension automatically copies assets on installation. If assets are missing:

```bash
php bin/console bolt:copy-assets
```

Or manually copy `vendor/brandefy-studio/bolt-enhanced-seo/assets/` to `public/assets/`

## Compatibility

- **Bolt CMS**: 5.x and 6.x
- **PHP**: 8.1 or higher
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Roadmap

### v1.1.0 (Complete)
- Real-time SEO score analysis
- Character count indicators with color coding
- Content length recommendations

### v1.2.0 (Planned)
- Readability analysis (Flesch Reading Ease)
- Focus keyphrase analysis
- Enhanced Google SERP preview

### v2.0.0 (Future)
- Schema.org markup generator
- Redirect manager
- Sitemap generator
- Content insights dashboard

## Migration from AppoloDev/bolt-seo

This extension is a fork of the original AppoloDev/bolt-seo with enhanced features and updated namespace.

**Existing installations**: Simply update your `composer.json`:

```json
{
    "require": {
        "brandefy-studio/bolt-enhanced-seo": "^1.0"
    }
}
```

Run `composer update` and clear cache. All existing SEO data is preserved.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Credits

- **Original Extension**: [AppoloDev/bolt-seo](https://github.com/AppoloDev/bolt-seo)
- **Enhanced By**: Brandefy Creative Studio
- **Bolt CMS**: [boltcms.io](https://boltcms.io)

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

- **Documentation**: [GitHub Wiki](https://github.com/brandefy-studio/bolt-enhanced-seo/wiki)
- **Issues**: [GitHub Issues](https://github.com/brandefy-studio/bolt-enhanced-seo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/brandefy-studio/bolt-enhanced-seo/discussions)

---

Made with ❤️ by [Brandefy Studio](https://brandefycreative.com)
