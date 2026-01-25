# Installation Instructions

## Requirements

- Bolt CMS 5.x or 6.x
- PHP 8.2 or higher
- Composer

## Installation via Composer

1. **Install the package**:
   ```bash
   composer require brandefy-studio/bolt-enhanced-seo
   ```

2. **Clear cache**:
   ```bash
   php bin/console cache:clear
   ```

3. **Add SEO field to your contenttypes** in `config/bolt/contenttypes.yaml`:
   ```yaml
   pages:
       fields:
           # ... your other fields ...
           seo:
               type: seo
               group: "SEO"
   ```

4. **Add to templates** in `templates/base.html.twig`:
   ```twig
   <head>
       <title>{{ seo.title() }}</title>
       {{ seo.metatags()|raw }}
   </head>
   ```

5. **Done!** Edit any content and you'll see the SEO tab.

## Manual Installation

1. **Download** the latest release from GitHub

2. **Extract** to `vendor/brandefy-studio/bolt-enhanced-seo/`

3. **Update** your `composer.json`:
   ```json
   {
       "autoload": {
           "psr-4": {
               "Brandefy\\BoltEnhancedSeo\\": "vendor/brandefy-studio/bolt-enhanced-seo/src/"
           }
       }
   }
   ```

4. **Run**:
   ```bash
   composer dump-autoload
   ```

5. **Follow steps 2-5** from Composer installation above

## Verification

Check that the extension is installed:

```bash
composer show brandefy-studio/bolt-enhanced-seo
```

You should see:
```
name     : brandefy-studio/bolt-enhanced-seo
descrip. : Enhanced SEO extension for Bolt 5 with...
versions : * v1.0.0
```

## Troubleshooting

### Extension not found after installation

Run:
```bash
composer dump-autoload
php bin/console cache:clear --no-warmup
php bin/console cache:warmup
```

### Assets not loading

Run:
```bash
php bin/console bolt:copy-assets
```

Or manually copy:
```bash
cp -r vendor/brandefy-studio/bolt-enhanced-seo/assets/* public/assets/
```

### SEO tab not appearing

1. Verify field is in contenttype YAML
2. Check field type is exactly `seo` (lowercase)
3. Clear browser cache
4. Check console for JavaScript errors (F12)

## Next Steps

- Read the [README.md](README.md) for full documentation
- See [Configuration](#configuration) for customization options
- Check [examples/](examples/) for template examples

## Getting Help

- GitHub Issues: https://github.com/brandefy-studio/bolt-enhanced-seo/issues
- Bolt Community: https://bolt.cm/community
