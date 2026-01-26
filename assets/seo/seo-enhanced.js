/**
 * Enhanced SEO Field Controller with Inline Real-time Analysis
 * v1.1.1 - Improved UX with inline indicators and progress bar
 */

class SeoSnippet {
    constructor(container) {
        console.log('[SEO Analyzer] Initializing v1.1.1...');
        this.container = container;
        this.analyzer = new SeoAnalyzer();
        
        this.defaultsData = {
            title: this.container.dataset.baseTitle,
            url: this.container.dataset.baseUrl,
            description: this.container.dataset.baseDescription,
            slug: this.container.dataset.baseSlug,
        };
        
        this.targetElements = {
            url: document.querySelector('.seo_snippet span.url'),
            title: document.querySelector('.seo_snippet .title'),
            description: document.querySelector('.seo_snippet .description')
        };

        this.inputs = {
            title: document.querySelector(`[name="${this.container.dataset.fieldTitle}"]`),
            slug: document.querySelector(`[name="${this.container.dataset.fieldSlug}"]`),
            description: document.querySelector(`[name="${this.container.dataset.fieldDescription}"]`)
        };

        // Find all content fields
        this.contentFields = this.findContentFields();

        this.seoFieldsInputs = {
            title: document.querySelector('#seofields-title'),
            description: document.querySelector('#seofields-description'),
            keyphrase: document.querySelector('#seofields-keyphrase'),
            keywords: document.querySelector('#seofields-keywords'),
            shortlink: document.querySelector('#seofields-shortlink'),
            canonical: document.querySelector('#seofields-canonical'),
            robots: document.querySelector('#seofields-robots'),
            og: document.querySelector('#seofields-og'),
        };

        this.seoField = document.querySelector(`[name="${this.container.dataset.seoField}"]`);
        this.seoData = this.seoField.value ? JSON.parse(this.seoField.value) : {};

        this.init();
        this.initEvents();
        this.initAnalysis();
    }

    findContentFields() {
        const fields = [];
        
        // Find all textarea, redactor, and article fields (exclude SEO fields)
        const selectors = [
            'textarea:not([id*="seofields"])',
            '[data-redactor]',
            'input[type="text"][name*="[body]"]',
            'textarea[name*="[body]"]',
            'textarea[name*="[content]"]',
            'textarea[name*="[text]"]',
            '.redactor-box textarea',
            '.editor textarea'
        ];

        selectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(field => {
                    // Exclude SEO fields
                    if (!field.name || (!field.name.includes('[seo]') && !field.id.includes('seofields'))) {
                        fields.push(field);
                    }
                });
            } catch(e) {
                // Selector not supported, skip
            }
        });

        // Check for CKEditor instances
        if (typeof CKEDITOR !== 'undefined') {
            for (let instance in CKEDITOR.instances) {
                const editor = CKEDITOR.instances[instance];
                fields.push({
                    type: 'ckeditor',
                    instance: editor,
                    getValue: () => editor.getData(),
                    addEventListener: (event, callback) => editor.on(event, callback)
                });
            }
        }

        return fields;
    }

    getContentFromFields() {
        let content = '';
        
        this.contentFields.forEach(field => {
            try {
                if (field.getValue) {
                    content += ' ' + field.getValue();
                } else if (field.value) {
                    content += ' ' + field.value;
                } else if (field.innerHTML) {
                    content += ' ' + field.innerHTML;
                }
            } catch(e) {
                // Field not accessible
            }
        });

        return content;
    }

    init() {
        const defaultsData = Object.assign({}, this.defaultsData);
        if (this.seoData.title) {
            defaultsData.title = this.seoData.title;
        }
        if (this.seoData.description) {
            defaultsData.description = this.seoData.description;
        }
        
        if (this.targetElements.title) {
            this.targetElements.title.innerHTML = defaultsData.title;
        }
        if (this.targetElements.url) {
            this.targetElements.url.innerHTML = defaultsData.url.replace('REPLACE', defaultsData.slug);
        }
        if (this.targetElements.description) {
            this.targetElements.description.innerHTML = defaultsData.description;
        }
    }

    initEvents() {
        // Content field events
        if (this.inputs.title) {
            this.inputs.title.addEventListener('keyup', () => {
                this.changeTarget('title');
                this.runAnalysis();
            });
        }

        if (this.inputs.description) {
            this.inputs.description.addEventListener('keyup', () => {
                this.changeTarget('description');
                this.runAnalysis();
            });
        }

        if (this.inputs.slug) {
            this.inputs.slug.addEventListener('keyup', () => {
                const defaultsData = Object.assign({}, this.defaultsData);
                if (this.targetElements.url) {
                    this.targetElements.url.innerHTML = defaultsData.url.replace('REPLACE', this.inputs.slug.value);
                }
                this.runAnalysis();
            });
        }

        // Listen to content fields
        this.contentFields.forEach(field => {
            if (field.addEventListener) {
                if (field.type === 'ckeditor') {
                    field.addEventListener('change', () => this.runAnalysis());
                } else {
                    field.addEventListener('keyup', () => this.runAnalysis());
                    field.addEventListener('change', () => this.runAnalysis());
                }
            }
        });

        // SEO field events
        Object.keys(this.seoFieldsInputs).forEach((key) => {
            const input = this.seoFieldsInputs[key];
            if (!input) return;

            let eventName = 'keyup';
            if (key === 'robots' || key === 'og') {
                eventName = 'change';
            }

            input.addEventListener(eventName, () => {
                this.changeTarget(key);
                this.runAnalysis();
            });
        });
    }

    initAnalysis() {
        // Create progress bar at top
        this.createProgressBar();
        
        // Create inline indicators
        this.createInlineIndicators();
        
        // Run initial analysis
        setTimeout(() => this.runAnalysis(), 500);
        
        // Auto-run analysis every 3 seconds
        setInterval(() => this.runAnalysis(), 3000);
    }

    createProgressBar() {
        console.log('[SEO Analyzer] Creating progress bar...');
        
        // Find the form-set-fields container (more flexible approach)
        let seoFieldSet = this.container.closest('.form-set-fields');
        
        // Fallback: try to find it by looking for the parent of seo fields
        if (!seoFieldSet) {
            const titleInput = document.querySelector('#seofields-title');
            if (titleInput) {
                seoFieldSet = titleInput.closest('.form-set-fields');
            }
        }
        
        // Another fallback: find any form-set-fields that contains our snippet
        if (!seoFieldSet) {
            seoFieldSet = this.container.closest('.form-set')?.querySelector('.form-set-fields');
        }
        
        if (!seoFieldSet) {
            console.error('[SEO Analyzer] Could not find form-set-fields container');
            return;
        }
        console.log('[SEO Analyzer] Found form-set-fields, inserting progress bar');

        const progressBar = document.createElement('div');
        progressBar.className = 'seo-progress-wrapper';
        progressBar.innerHTML = `
            <div class="seo-progress-header">
                <span class="seo-progress-label">SEO Score</span>
                <span class="seo-progress-score" id="seo-progress-score">0/100</span>
            </div>
            <div class="seo-progress-bar">
                <div class="seo-progress-fill" id="seo-progress-fill" style="width: 0%"></div>
            </div>
            <div class="seo-progress-status" id="seo-progress-status">Start optimizing your content...</div>
        `;
        
        seoFieldSet.insertBefore(progressBar, seoFieldSet.firstChild);
    }

    createInlineIndicators() {
        console.log('[SEO Analyzer] Creating inline indicators...');
        
        // Title indicator - find by input ID
        const titleInput = document.querySelector('#seofields-title');
        if (titleInput) {
            const titleHelper = titleInput.closest('.form-group')?.querySelector('.form--helper');
            if (titleHelper && !titleHelper.querySelector('#seo-title-indicator')) {
                const indicator = document.createElement('div');
                indicator.id = 'seo-title-indicator';
                indicator.className = 'seo-inline-indicator';
                titleHelper.appendChild(indicator);
                console.log('[SEO Analyzer] Title indicator added');
            }
        }

        // Description indicator
        const descInput = document.querySelector('#seofields-description');
        if (descInput) {
            const descHelper = descInput.closest('.form-group')?.querySelector('.form--helper');
            if (descHelper && !descHelper.querySelector('#seo-description-indicator')) {
                const indicator = document.createElement('div');
                indicator.id = 'seo-description-indicator';
                indicator.className = 'seo-inline-indicator';
                descHelper.appendChild(indicator);
                console.log('[SEO Analyzer] Description indicator added');
            }
        }

        // Keyphrase indicator
        const keyphraseInput = document.querySelector('#seofields-keyphrase');
        if (keyphraseInput) {
            const keyphraseHelper = keyphraseInput.closest('.form-group')?.querySelector('.form--helper');
            if (keyphraseHelper && !keyphraseHelper.querySelector('#seo-keyphrase-indicator')) {
                const indicator = document.createElement('div');
                indicator.id = 'seo-keyphrase-indicator';
                indicator.className = 'seo-inline-indicator';
                keyphraseHelper.appendChild(indicator);
                console.log('[SEO Analyzer] Keyphrase indicator added');
            }
        }

        // Content analysis section (after snippet)
        const snippetField = this.container.closest('.form-group');
        if (snippetField && !document.querySelector('#seo-content-analysis')) {
            const contentAnalysis = document.createElement('div');
            contentAnalysis.id = 'seo-content-analysis';
            contentAnalysis.className = 'seo-content-analysis';
            contentAnalysis.innerHTML = `
                <h4 class="seo-section-title">Content Analysis</h4>
                <div id="seo-content-checks" class="seo-content-checks"></div>
            `;
            snippetField.parentNode.insertBefore(contentAnalysis, snippetField.nextSibling);
            console.log('[SEO Analyzer] Content analysis section added');
        }
    }

    runAnalysis() {
        const data = {
            title: this.seoFieldsInputs.title?.value || this.inputs.title?.value || '',
            description: this.seoFieldsInputs.description?.value || this.inputs.description?.value || '',
            keyphrase: this.seoFieldsInputs.keyphrase?.value || '',
            slug: this.inputs.slug?.value || '',
            content: this.getContentFromFields()
        };

        const results = this.analyzer.analyze(data);
        this.updateAnalysisUI(results);
    }

    updateAnalysisUI(results) {
        this.updateProgressBar(results.score);
        this.updateTitleIndicator(results.checks.titleLength, results.checks.keyphraseInTitle);
        this.updateDescriptionIndicator(results.checks.descriptionLength, results.checks.keyphraseInDescription);
        this.updateKeyphraseIndicator(results.checks);
        this.updateContentAnalysis(results.checks);
    }

    updateProgressBar(score) {
        const fill = document.getElementById('seo-progress-fill');
        const scoreText = document.getElementById('seo-progress-score');
        const status = document.getElementById('seo-progress-status');
        
        if (!fill) return;

        fill.style.width = score + '%';
        scoreText.textContent = score + '/100';
        
        fill.className = 'seo-progress-fill';
        if (score >= 80) {
            fill.classList.add('seo-excellent');
            status.textContent = '✓ Excellent SEO optimization!';
            status.className = 'seo-progress-status seo-status-good';
        } else if (score >= 60) {
            fill.classList.add('seo-good');
            status.textContent = '⚠ Good, but can be improved';
            status.className = 'seo-progress-status seo-status-warning';
        } else if (score >= 40) {
            fill.classList.add('seo-fair');
            status.textContent = '⚠ Needs improvement';
            status.className = 'seo-progress-status seo-status-warning';
        } else {
            fill.classList.add('seo-poor');
            status.textContent = '✗ Significant improvements needed';
            status.className = 'seo-progress-status seo-status-bad';
        }
    }

    updateTitleIndicator(lengthCheck, keyphraseCheck) {
        const indicator = document.getElementById('seo-title-indicator');
        if (!indicator) return;

        const length = lengthCheck.value;
        const hasKeyphrase = keyphraseCheck.value;
        
        let html = `<div class="seo-check-inline">`;
        html += `<span class="seo-badge seo-badge-${lengthCheck.status}">${length} chars</span>`;
        if (hasKeyphrase) {
            html += `<span class="seo-badge seo-badge-good">✓ Keyphrase</span>`;
        } else if (keyphraseCheck.status !== 'neutral') {
            html += `<span class="seo-badge seo-badge-bad">✗ Keyphrase</span>`;
        }
        html += `</div>`;
        indicator.innerHTML = html;
    }

    updateDescriptionIndicator(lengthCheck, keyphraseCheck) {
        const indicator = document.getElementById('seo-description-indicator');
        if (!indicator) return;

        const length = lengthCheck.value;
        const hasKeyphrase = keyphraseCheck.value;
        
        let html = `<div class="seo-check-inline">`;
        html += `<span class="seo-badge seo-badge-${lengthCheck.status}">${length} chars</span>`;
        if (hasKeyphrase) {
            html += `<span class="seo-badge seo-badge-good">✓ Keyphrase</span>`;
        } else if (keyphraseCheck.status !== 'neutral') {
            html += `<span class="seo-badge seo-badge-bad">✗ Keyphrase</span>`;
        }
        html += `</div>`;
        indicator.innerHTML = html;
    }

    updateKeyphraseIndicator(checks) {
        const indicator = document.getElementById('seo-keyphrase-indicator');
        if (!indicator) return;

        const inTitle = checks.keyphraseInTitle.value;
        const inDesc = checks.keyphraseInDescription.value;
        const inUrl = checks.keyphraseInSlug.value;
        const inContent = checks.keyphraseInContent.value > 0;
        
        let html = `<div class="seo-check-inline"><span class="seo-badge-label">Used in:</span>`;
        html += `<span class="seo-badge ${inTitle ? 'seo-badge-good' : 'seo-badge-bad'}">${inTitle ? '✓' : '✗'} Title</span>`;
        html += `<span class="seo-badge ${inDesc ? 'seo-badge-good' : 'seo-badge-bad'}">${inDesc ? '✓' : '✗'} Description</span>`;
        html += `<span class="seo-badge ${inUrl ? 'seo-badge-good' : 'seo-badge-warning'}">${inUrl ? '✓' : '⚠'} URL</span>`;
        html += `<span class="seo-badge ${inContent ? 'seo-badge-good' : 'seo-badge-bad'}">${inContent ? '✓' : '✗'} Content</span>`;
        html += `</div>`;
        
        indicator.innerHTML = html;
    }

    updateContentAnalysis(checks) {
        const container = document.getElementById('seo-content-checks');
        if (!container) return;

        let html = '<div class="seo-checks-grid">';
        
        html += this.createCheckCard('Content Length', checks.contentLength.message, checks.contentLength.status, '📝');
        html += this.createCheckCard('Keyphrase Density', checks.keyphraseDensity.message, checks.keyphraseDensity.status, '🎯');
        html += this.createCheckCard('Internal Links', checks.internalLinks.message, checks.internalLinks.status, '🔗');
        html += this.createCheckCard('External Links', checks.externalLinks.message, checks.externalLinks.status, '🌐');
        
        html += '</div>';
        container.innerHTML = html;
    }

    createCheckCard(title, message, status, icon) {
        return `
            <div class="seo-check-card seo-check-${status}">
                <span class="seo-check-icon">${icon}</span>
                <div class="seo-check-content">
                    <div class="seo-check-title">${title}</div>
                    <div class="seo-check-message">${message}</div>
                </div>
            </div>
        `;
    }

    changeTarget(field) {
        if (field === 'title' || field === 'description') {
            if (
                this.inputs[field] &&
                this.inputs[field].value.length > 0 &&
                (!this.seoFieldsInputs[field] || this.seoFieldsInputs[field].value.length === 0)
            ) {
                if (this.targetElements[field]) {
                    this.targetElements[field].innerHTML = this.inputs[field].value;
                }
            } else if (this.seoFieldsInputs[field] && this.seoFieldsInputs[field].value.length > 0) {
                if (this.targetElements[field]) {
                    this.targetElements[field].innerHTML = this.seoFieldsInputs[field].value;
                }
            } else {
                if (this.targetElements[field]) {
                    this.targetElements[field].innerHTML = this.defaultsData[field];
                }
            }
        }

        if (this.seoFieldsInputs[field]) {
            this.seoData[field] = this.seoFieldsInputs[field].value;
            this.seoField.value = JSON.stringify(this.seoData);
        }
    }
}

// Initialize immediately if DOM is ready, or wait for it
function initSeoSnippet() {
    const seoSnippet = document.querySelector('.seo_snippet');
    if (seoSnippet && !seoSnippet.dataset.seoInitialized) {
        seoSnippet.dataset.seoInitialized = 'true';
        new SeoSnippet(seoSnippet);
    }
}

// Try multiple initialization methods for Bolt's dynamic loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSeoSnippet);
} else {
    // DOM already loaded, init immediately
    initSeoSnippet();
}

// Also listen for Turbo navigation (Bolt uses Turbo)
document.addEventListener('turbo:load', initSeoSnippet);
document.addEventListener('turbo:render', initSeoSnippet);

// Fallback: Check periodically for 5 seconds
let attempts = 0;
const checkInterval = setInterval(() => {
    if (attempts++ > 50) {
        clearInterval(checkInterval);
        return;
    }
    if (document.querySelector('.seo_snippet') && !document.querySelector('.seo_snippet').dataset.seoInitialized) {
        initSeoSnippet();
        clearInterval(checkInterval);
    }
}, 100);
