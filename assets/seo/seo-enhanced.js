/**
 * Enhanced SEO Field Controller with Real-time Analysis
 * v1.1.0
 */

class SeoSnippet {
    constructor(container) {
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
            description: document.querySelector(`[name="${this.container.dataset.fieldDescription}"]`),
            content: document.querySelector(`[name="${this.container.dataset.fieldContent}"]`) ||
                    document.querySelector('[name="fields[body]"]') ||
                    document.querySelector('textarea[name*="body"]')
        };

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
            this.inputs.title.addEventListener('keyup', () => this.changeTarget('title'));
        }

        if (this.inputs.description) {
            this.inputs.description.addEventListener('keyup', () => this.changeTarget('description'));
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

        if (this.inputs.content) {
            this.inputs.content.addEventListener('keyup', () => this.runAnalysis());
        }

        // SEO field events
        Object.keys(this.seoFieldsInputs).forEach((key) => {
            const input = this.seoFieldsInputs[key];
            if (!input) return;

            let eventName = 'keyup';
            if (key === 'robots') {
                eventName = 'change';
            }

            input.addEventListener(eventName, () => {
                this.changeTarget(key);
                this.runAnalysis();
            });
        });
    }

    initAnalysis() {
        // Create analysis UI
        this.createAnalysisUI();
        
        // Run initial analysis
        this.runAnalysis();
        
        // Auto-run analysis every 2 seconds if content changed
        setInterval(() => this.runAnalysis(), 2000);
    }

    createAnalysisUI() {
        const analysisContainer = document.getElementById('seo-analysis-container');
        if (!analysisContainer) return;

        analysisContainer.innerHTML = `
            <div class="seo-score-panel">
                <div class="seo-score-circle">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#e0e0e0" stroke-width="8"/>
                        <circle id="seo-score-progress" cx="60" cy="60" r="54" fill="none" 
                                stroke="#4caf50" stroke-width="8" 
                                stroke-dasharray="339.292" stroke-dashoffset="339.292"
                                transform="rotate(-90 60 60)" 
                                style="transition: stroke-dashoffset 0.5s ease, stroke 0.5s ease"/>
                        <text id="seo-score-text" x="60" y="68" text-anchor="middle" 
                              font-size="32" font-weight="bold" fill="#333">0</text>
                    </svg>
                </div>
                <div class="seo-score-label">SEO Score</div>
            </div>
            
            <div class="seo-checks-panel">
                <h4>SEO Analysis</h4>
                <div id="seo-checks-list" class="seo-checks-list"></div>
            </div>
            
            <div class="seo-feedback-panel" id="seo-feedback-panel" style="display:none;">
                <h4>Improvements</h4>
                <div id="seo-feedback-list" class="seo-feedback-list"></div>
            </div>
        `;
    }

    runAnalysis() {
        const data = {
            title: this.seoFieldsInputs.title?.value || this.inputs.title?.value || '',
            description: this.seoFieldsInputs.description?.value || this.inputs.description?.value || '',
            keyphrase: this.seoFieldsInputs.keyphrase?.value || '',
            slug: this.inputs.slug?.value || '',
            content: this.inputs.content?.value || ''
        };

        const results = this.analyzer.analyze(data);
        this.updateAnalysisUI(results);
    }

    updateAnalysisUI(results) {
        // Update score circle
        const scoreCircle = document.getElementById('seo-score-progress');
        const scoreText = document.getElementById('seo-score-text');
        
        if (scoreCircle && scoreText) {
            const circumference = 339.292;
            const offset = circumference - (results.score / 100) * circumference;
            scoreCircle.style.strokeDashoffset = offset;
            
            // Color based on score
            if (results.score >= 80) {
                scoreCircle.style.stroke = '#4caf50'; // Green
            } else if (results.score >= 50) {
                scoreCircle.style.stroke = '#ff9800'; // Orange
            } else {
                scoreCircle.style.stroke = '#f44336'; // Red
            }
            
            scoreText.textContent = results.score;
        }

        // Update checks list
        const checksList = document.getElementById('seo-checks-list');
        if (checksList) {
            checksList.innerHTML = '';
            
            Object.keys(results.checks).forEach(checkName => {
                const check = results.checks[checkName];
                const checkItem = document.createElement('div');
                checkItem.className = `seo-check-item seo-check-${check.status}`;
                
                let icon = '✓';
                if (check.status === 'bad') icon = '✗';
                else if (check.status === 'warning') icon = '!';
                else if (check.status === 'neutral') icon = '○';
                
                checkItem.innerHTML = `
                    <span class="seo-check-icon">${icon}</span>
                    <span class="seo-check-name">${this.analyzer.checks[checkName].name}</span>
                    <span class="seo-check-message">${check.message}</span>
                `;
                
                checksList.appendChild(checkItem);
            });
        }

        // Update feedback
        const feedbackPanel = document.getElementById('seo-feedback-panel');
        const feedbackList = document.getElementById('seo-feedback-list');
        
        if (feedbackList && feedbackPanel) {
            if (results.feedback.length > 0) {
                feedbackPanel.style.display = 'block';
                feedbackList.innerHTML = '';
                
                results.feedback.forEach(item => {
                    const feedbackItem = document.createElement('div');
                    feedbackItem.className = `seo-feedback-item seo-feedback-${item.type}`;
                    feedbackItem.innerHTML = `
                        <strong>${item.check}:</strong> ${item.message}
                    `;
                    feedbackList.appendChild(feedbackItem);
                });
            } else {
                feedbackPanel.style.display = 'none';
            }
        }
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

document.addEventListener("DOMContentLoaded", () => {
    const seoSnippet = document.querySelector('.seo_snippet');
    if (seoSnippet) {
        new SeoSnippet(seoSnippet);
    }
});
