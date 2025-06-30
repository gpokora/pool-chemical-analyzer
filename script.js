// Initialize app when page loads
window.addEventListener('load', function() {
    console.log('Page loaded, setting up event listeners...');
    setupEventListeners();
    loadCustomerOptions();
    checkReminders();
});

// Also try DOMContentLoaded as backup
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up event listeners...');
    setupEventListeners();
    loadCustomerOptions();
    checkReminders();
});

// Product database
const products = {
    phUp: [
        { name: "Arm & Hammer Super Washing Soda", type: "Budget Option" },
        { name: "HTH pH Up Granular", type: "Pool Specific" },
        { name: "Clorox Pool&Spa pH Up", type: "Professional" },
        { name: "In The Swim pH Increaser", type: "Bulk Option" }
    ],
    phDown: [
        { name: "Klean Strip Muriatic Acid", type: "Budget Option" },
        { name: "Leslie's Dry Acid", type: "Pool Specific" },
        { name: "HTH pH Minus Granular", type: "Professional" },
        { name: "Sodium Bisulfate (Bulk)", type: "Bulk Option" }
    ],
    chlorine: [
        { name: "HTH Super Shock", type: "Budget Option" },
        { name: "Clorox Shock Xtra Blue", type: "Pool Specific" },
        { name: "Liquid Chlorine 12.5%", type: "Professional" },
        { name: "Calcium Hypochlorite (Bulk)", type: "Bulk Option" }
    ],
    alkalinity: [
        { name: "Baking Soda (Sodium Bicarbonate)", type: "Budget Option" },
        { name: "HTH Alkalinity Up", type: "Pool Specific" },
        { name: "Leslie's Alkalinity Increaser", type: "Professional" },
        { name: "Sodium Bicarbonate (Bulk)", type: "Bulk Option" }
    ],
    hardness: [
        { name: "Dow Flake Calcium Chloride", type: "Budget Option" },
        { name: "HTH Hardness Increaser", type: "Pool Specific" },
        { name: "Leslie's Hardness Plus", type: "Professional" },
        { name: "Calcium Chloride Dihydrate (Bulk)", type: "Bulk Option" }
    ],
    cyanuric: [
        { name: "HTH Stabilizer", type: "Budget Option" },
        { name: "Clorox Pool&Spa Stabilizer", type: "Pool Specific" },
        { name: "Leslie's Conditioner", type: "Professional" },
        { name: "Cyanuric Acid (Bulk)", type: "Bulk Option" }
    ]
};

// Chemical ranges
const ranges = {
    pool: {
        ph: { min: 7.2, max: 7.6, optimal: 7.4 },
        chlorine: { min: 1.0, max: 3.0, optimal: 2.0 },
        alkalinity: { min: 80, max: 120, optimal: 100 },
        hardness: { min: 150, max: 300, optimal: 225 },
        cyanuric: { min: 30, max: 50, optimal: 40 }
    },
    spa: {
        ph: { min: 7.2, max: 7.8, optimal: 7.4 },
        chlorine: { min: 2.0, max: 5.0, optimal: 3.0 },
        alkalinity: { min: 80, max: 120, optimal: 100 },
        hardness: { min: 150, max: 300, optimal: 225 },
        cyanuric: { min: 0, max: 30, optimal: 15 }
    }
};

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Water type change listener
    const radioButtons = document.querySelectorAll('input[name="waterType"]');
    console.log('Found radio buttons:', radioButtons.length);
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            updateVolumeGuide();
            clearResults(); // Clear results when water type changes
        });
    });

    // Form submit listener
    const form = document.getElementById('poolForm');
    const button = document.querySelector('.analyze-btn');
    
    console.log('Found form:', !!form);
    console.log('Found button:', !!button);
    
    if (form) {
        form.addEventListener('submit', function(e) {
            console.log('Form submitted!');
            handleFormSubmit(e);
        });
    }
    
    if (button) {
        button.addEventListener('click', function(e) {
            console.log('Button clicked!');
            e.preventDefault();
            handleFormSubmit(e);
        });
    }

    // Customer management listeners
    const saveCustomerBtn = document.getElementById('saveCustomerBtn');
    const deleteCustomerBtn = document.getElementById('deleteCustomerBtn');
    const customerSelect = document.getElementById('customerSelect');

    if (saveCustomerBtn) {
        saveCustomerBtn.addEventListener('click', saveCustomer);
    }
    if (deleteCustomerBtn) {
        deleteCustomerBtn.addEventListener('click', deleteCustomer);
    }
    if (customerSelect) {
        customerSelect.addEventListener('change', loadCustomer);
    }

    // History and reminder listeners
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    const setReminderBtn = document.getElementById('setReminderBtn');

    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', viewTestHistory);
    }
    if (setReminderBtn) {
        setReminderBtn.addEventListener('click', openReminderModal);
    }

    // Modal listeners
    const modal = document.getElementById('reminderModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelReminderBtn');
    const saveReminderBtn = document.getElementById('saveReminderBtn');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeReminderModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeReminderModal);
    }
    if (saveReminderBtn) {
        saveReminderBtn.addEventListener('click', saveReminder);
    }
    if (modal) {
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeReminderModal();
            }
        });
    }
}

function updateVolumeGuide() {
    const waterType = document.querySelector('input[name="waterType"]:checked').value;
    const guide = document.getElementById('volumeGuide');
    
    if (waterType === 'pool') {
        guide.textContent = 'Pool typical volume: 10,000 - 50,000 gallons';
    } else {
        guide.textContent = 'Spa/Hot Tub typical volume: 200 - 1,500 gallons';
    }
}

function handleFormSubmit(e) {
    console.log('handleFormSubmit called');
    e.preventDefault();
    
    try {
        const waterTypeElement = document.querySelector('input[name="waterType"]:checked');
        const waterType = waterTypeElement ? waterTypeElement.value : 'pool';
        console.log('Water type:', waterType);
        
        const volume = parseFloat(document.getElementById('volume').value) || 20000;
        console.log('Volume:', volume);
        
        const values = {
            ph: parseFloat(document.getElementById('ph').value),
            chlorine: parseFloat(document.getElementById('chlorine').value),
            alkalinity: parseFloat(document.getElementById('alkalinity').value),
            hardness: parseFloat(document.getElementById('hardness').value),
            cyanuric: parseFloat(document.getElementById('cyanuric').value)
        };
        console.log('Values:', values);

        // Get checked issues
        const issues = [];
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        console.log('Found checked checkboxes:', checkboxes.length);
        checkboxes.forEach(checkbox => {
            issues.push(checkbox.value);
        });
        console.log('Issues:', issues);

        // Validate inputs
        let hasValidData = false;
        for (let key in values) {
            if (!isNaN(values[key]) && values[key] > 0) {
                hasValidData = true;
                break;
            }
        }

        if (!hasValidData) {
            alert('Please enter at least one chemical level to analyze.');
            return;
        }

        console.log('Calling analysis functions...');
        const safetyStatus = determineSafetyStatus(values, waterType, issues);
        console.log('Safety status:', safetyStatus);
        
        const recommendations = generateRecommendations(values, waterType, volume, issues);
        console.log('Recommendations:', recommendations.length);

        // Save test to history
        saveTestToHistory(values, waterType, volume, issues, safetyStatus);

        displayResults(values, waterType, safetyStatus, recommendations);
    } catch (error) {
        console.error('Error in handleFormSubmit:', error);
        alert('An error occurred while analyzing your water. Please check your inputs and try again.');
    }
}

function calculateChemicalAmount(currentLevel, targetLevel, volume, chemicalFactor) {
    const difference = Math.abs(targetLevel - currentLevel);
    const amount = (difference * volume * chemicalFactor) / 10000;
    
    if (amount < 0.5) {
        return "Small amount (follow product label)";
    }
    
    return amount < 10 ? amount.toFixed(1) + " lbs" : Math.round(amount) + " lbs";
}

function determineSafetyStatus(values, waterType, issues) {
    const r = ranges[waterType];
    
    // Critical safety checks
    if (!isNaN(values.ph) && (values.ph < 6.8 || values.ph > 8.2)) return 'unsafe';
    if (!isNaN(values.chlorine) && (values.chlorine < 0.5 || values.chlorine > 10)) return 'unsafe';
    if (issues.includes('green') || issues.includes('irritation')) return 'unsafe';
    
    // Warning conditions
    if (!isNaN(values.ph) && (values.ph < r.ph.min || values.ph > r.ph.max)) return 'caution';
    if (!isNaN(values.chlorine) && (values.chlorine < r.chlorine.min || values.chlorine > r.chlorine.max)) return 'caution';
    if (!isNaN(values.alkalinity) && (values.alkalinity < r.alkalinity.min || values.alkalinity > r.alkalinity.max)) return 'caution';
    
    return 'safe';
}

function getChemicalStatus(value, range) {
    if (isNaN(value)) return 'good';
    if (value < range.min || value > range.max) return 'danger';
    if (Math.abs(value - range.optimal) > (range.max - range.min) * 0.2) return 'warning';
    return 'good';
}

function generateRecommendations(values, waterType, volume, issues) {
    const recommendations = [];
    const r = ranges[waterType];

    // pH recommendations
    if (!isNaN(values.ph)) {
        if (values.ph < r.ph.min) {
            const amount = calculateChemicalAmount(values.ph, r.ph.optimal, volume, 1.5);
            recommendations.push({
                priority: values.ph < 6.8 ? 'high' : 'medium',
                chemical: 'pH Up',
                issue: `pH too low (${values.ph}) - Target: ${r.ph.min}-${r.ph.max}`,
                amount: amount,
                products: products.phUp,
                instructions: [
                    "Test current pH level to confirm reading",
                    "Calculate exact amount needed based on your pool volume",
                    "Pre-dissolve granular pH increaser in a bucket of water",
                    "Add solution to pool while pump is running",
                    "Wait 4-6 hours before retesting",
                    "Retest and adjust if necessary",
                    "Monitor for 24 hours to ensure stability"
                ],
                safety: "Always add chemicals to water, never water to chemicals. Wear safety goggles and gloves."
            });
        } else if (values.ph > r.ph.max) {
            const amount = calculateChemicalAmount(values.ph, r.ph.optimal, volume, 1.2);
            recommendations.push({
                priority: values.ph > 8.2 ? 'high' : 'medium',
                chemical: 'pH Down',
                issue: `pH too high (${values.ph}) - Target: ${r.ph.min}-${r.ph.max}`,
                amount: amount,
                products: products.phDown,
                instructions: [
                    "Ensure proper ventilation when handling acid",
                    "Pre-dissolve dry acid in water (never add water to acid)",
                    "Add solution slowly to deep end while pump runs",
                    "Allow 2-4 hours of circulation",
                    "Retest pH level",
                    "Add more if needed in small increments",
                    "Wait 24 hours between major adjustments"
                ],
                safety: "Handle muriatic acid with extreme care. Use in well-ventilated areas only."
            });
        }
    }

    // Chlorine recommendations
    if (!isNaN(values.chlorine)) {
        if (values.chlorine < r.chlorine.min) {
            const amount = calculateChemicalAmount(values.chlorine, r.chlorine.optimal, volume, 1.0);
            recommendations.push({
                priority: values.chlorine < 0.5 ? 'high' : 'medium',
                chemical: 'Free Chlorine',
                issue: `Chlorine too low (${values.chlorine} ppm) - Target: ${r.chlorine.min}-${r.chlorine.max} ppm`,
                amount: amount,
                products: products.chlorine,
                instructions: [
                    "Calculate shock dose: 1 lb per 10,000 gallons typically",
                    "Apply shock treatment in evening after sunset",
                    "Pre-dissolve granular chlorine in bucket",
                    "Add around perimeter while pump is running",
                    "Run pump for 8-12 hours continuously",
                    "Test chlorine level after 24 hours",
                    "Maintain proper circulation until levels stabilize"
                ],
                safety: "Never mix different types of chlorine. Store in cool, dry place away from other chemicals."
            });
        } else if (values.chlorine > r.chlorine.max) {
            recommendations.push({
                priority: values.chlorine > 5 ? 'high' : 'medium',
                chemical: 'Chlorine Reduction',
                issue: `Chlorine too high (${values.chlorine} ppm) - Target: ${r.chlorine.min}-${r.chlorine.max} ppm`,
                amount: "Time and sunlight exposure",
                products: [
                    { name: "Sodium Thiosulfate", type: "Chemical Reducer" },
                    { name: "Natural Sunlight Exposure", type: "Natural Method" },
                    { name: "Partial Water Replacement", type: "Dilution Method" },
                    { name: "Activated Carbon Filter", type: "Filtration Method" }
                ],
                instructions: [
                    "Stop adding chlorine immediately",
                    "Remove pool cover to allow UV breakdown",
                    "Run pump continuously for faster circulation",
                    "Test levels every 4-6 hours",
                    "If urgent, use sodium thiosulfate (very small amounts)",
                    "Consider partial water replacement if extremely high",
                    "Wait for levels to naturally decrease before swimming"
                ],
                safety: "Do not swim until chlorine levels drop below 4 ppm. High chlorine can cause skin and eye irritation."
            });
        }
    }

    console.log('Alkalinity value:', values.alkalinity, 'Range:', r.alkalinity);

    // Alkalinity recommendations
    if (!isNaN(values.alkalinity) && values.alkalinity > 0) {
        if (values.alkalinity < r.alkalinity.min) {
            console.log('Alkalinity too low, adding recommendation');
            const amount = calculateChemicalAmount(values.alkalinity, r.alkalinity.optimal, volume, 1.5);
            recommendations.push({
                priority: 'medium',
                chemical: 'Total Alkalinity',
                issue: `Alkalinity too low (${values.alkalinity} ppm) - Target: ${r.alkalinity.min}-${r.alkalinity.max} ppm`,
                amount: amount,
                products: products.alkalinity,
                instructions: [
                    "Use sodium bicarbonate (baking soda) for gentle adjustment",
                    "Calculate: 1.5 lbs per 10,000 gallons raises TA by 10 ppm",
                    "Dissolve in bucket of warm water first",
                    "Add slowly to shallow end while pump runs",
                    "Allow 6-8 hours of circulation",
                    "Retest and adjust pH if necessary",
                    "May need to lower pH after raising alkalinity"
                ],
                safety: "Raising alkalinity may also raise pH. Monitor both levels closely."
            });
        } else if (values.alkalinity > r.alkalinity.max) {
            console.log('Alkalinity too high, adding recommendation');
            recommendations.push({
                priority: 'low',
                chemical: 'Alkalinity Reduction',
                issue: `Alkalinity too high (${values.alkalinity} ppm) - Target: ${r.alkalinity.min}-${r.alkalinity.max} ppm`,
                amount: "Gradual pH adjustment",
                products: products.phDown,
                instructions: [
                    "Lower pH to 7.0-7.2 to help reduce alkalinity",
                    "Use muriatic acid in small doses",
                    "Allow pH to rise naturally, then lower again",
                    "Repeat cycle 2-3 times over several days",
                    "Test alkalinity after each cycle",
                    "Final pH adjustment to optimal range",
                    "Be patient - this process takes time"
                ],
                safety: "This is a gradual process. Never try to lower alkalinity quickly as it can cause pH instability."
            });
        }
    }

    // Hardness recommendations
    if (!isNaN(values.hardness)) {
        if (values.hardness < r.hardness.min) {
            const amount = calculateChemicalAmount(values.hardness, r.hardness.optimal, volume, 1.2);
            recommendations.push({
                priority: 'low',
                chemical: 'Calcium Hardness',
                issue: `Hardness too low (${values.hardness} ppm) - Target: ${r.hardness.min}-${r.hardness.max} ppm`,
                amount: amount,
                products: products.hardness,
                instructions: [
                    "Use calcium chloride dihydrate for hardness increase",
                    "Calculate: 1 lb per 10,000 gallons raises CH by 8 ppm",
                    "Dissolve completely in warm water before adding",
                    "Add slowly to deep end with pump running",
                    "Circulate for 2-4 hours before testing",
                    "Low hardness can cause equipment corrosion",
                    "Monitor for improved water 'feel' and reduced foaming"
                ],
                safety: "Low hardness is primarily an equipment protection issue, not an immediate health concern."
            });
        } else if (values.hardness > r.hardness.max) {
            recommendations.push({
                priority: 'low',
                chemical: 'Hardness Reduction',
                issue: `Hardness too high (${values.hardness} ppm) - Target: ${r.hardness.min}-${r.hardness.max} ppm`,
                amount: "Partial drain and refill",
                products: [
                    { name: "Fresh Water", type: "Dilution Method" },
                    { name: "Sequestering Agent", type: "Chemical Treatment" },
                    { name: "Scale Prevention", type: "Preventive Treatment" }
                ],
                instructions: [
                    "Test source water hardness before draining",
                    "Drain 25-50% of pool water if severely high",
                    "Refill with fresh water (lower hardness)",
                    "Use sequestering agents to prevent scaling",
                    "Monitor for white scale deposits on surfaces",
                    "Consider professional water balancing service",
                    "Regular partial water changes prevent buildup"
                ],
                safety: "High hardness causes scaling but is not dangerous. Address to protect equipment and surface finish."
            });
        }
    }

    // Cyanuric acid recommendations
    if (!isNaN(values.cyanuric)) {
        if (values.cyanuric < r.cyanuric.min && waterType === 'pool') {
            const amount = calculateChemicalAmount(values.cyanuric, r.cyanuric.optimal, volume, 0.8);
            recommendations.push({
                priority: 'low',
                chemical: 'Cyanuric Acid (Stabilizer)',
                issue: `Stabilizer too low (${values.cyanuric} ppm) - Target: ${r.cyanuric.min}-${r.cyanuric.max} ppm`,
                amount: amount,
                products: products.cyanuric,
                instructions: [
                    "Use cyanuric acid to protect chlorine from UV breakdown",
                    "Calculate: 1 lb per 10,000 gallons raises CYA by 10 ppm",
                    "Dissolve in warm water or use sock method",
                    "Add directly to skimmer while pump runs (sock method)",
                    "Allow 2-3 days for complete dissolution",
                    "Test after 72 hours - cyanuric dissolves slowly",
                    "Stabilizer protects chlorine but slows its effectiveness"
                ],
                safety: "Cyanuric acid dissolves very slowly. Be patient and don't overdose."
            });
        } else if (values.cyanuric > r.cyanuric.max) {
            recommendations.push({
                priority: waterType === 'spa' ? 'medium' : 'low',
                chemical: 'Cyanuric Acid Reduction',
                issue: `Stabilizer too high (${values.cyanuric} ppm) - Target: ${r.cyanuric.min}-${r.cyanuric.max} ppm`,
                amount: "Partial drain and refill",
                products: [
                    { name: "Fresh Water Dilution", type: "Primary Method" },
                    { name: "Complete Drain/Refill", type: "Extreme Cases" },
                    { name: "CYA Reducer", type: "Chemical Option" }
                ],
                instructions: [
                    "High CYA makes chlorine less effective - 'chlorine lock'",
                    "Drain 30-50% of water and refill with fresh water",
                    "Test new levels after refilling and balancing",
                    "May need complete drain if extremely high (>100 ppm)",
                    "Consider non-stabilized chlorine products going forward",
                    "Monitor chlorine effectiveness after adjustment",
                    "Prevent buildup by using liquid chlorine periodically"
                ],
                safety: "High cyanuric acid reduces chlorine effectiveness, potentially allowing harmful bacteria growth."
            });
        }
    }

    // Visual issue treatments
    if (issues.includes('green')) {
        recommendations.push({
            priority: 'high',
            chemical: 'Algae Treatment',
            issue: 'Green Tint (Algae) - Pool unsafe for use',
            amount: "Shock treatment + algaecide",
            products: [
                { name: "Calcium Hypochlorite Shock", type: "Primary Treatment" },
                { name: "Copper-Based Algaecide", type: "Algae Killer" },
                { name: "Pool Brush", type: "Physical Removal" },
                { name: "Clarifier", type: "Dead Algae Removal" }
            ],
            instructions: [
                "DO NOT SWIM - Pool is unsafe until cleared",
                "Brush all pool surfaces vigorously to break up algae",
                "Shock with 2-3x normal dose of chlorine",
                "Add algaecide per manufacturer directions",
                "Run pump continuously for 24-48 hours",
                "Brush pool surfaces twice daily",
                "Vacuum dead algae when it settles to bottom"
            ],
            safety: "POOL CLOSURE REQUIRED. Do not use pool until water is crystal clear."
        });
    }

    if (issues.includes('cloudy')) {
        recommendations.push({
            priority: 'medium',
            chemical: 'Water Clarification',
            issue: 'Cloudy/Hazy Water - Multiple potential causes',
            amount: "Clarifier and filtration",
            products: [
                { name: "Pool Clarifier", type: "Chemical Treatment" },
                { name: "Filter Cleaning", type: "Mechanical Solution" },
                { name: "Shock Treatment", type: "Oxidation" }
            ],
            instructions: [
                "Clean or backwash filter system thoroughly",
                "Test and balance all chemical levels first",
                "Add clarifier according to package directions",
                "Run pump 24 hours continuously",
                "Vacuum pool bottom to remove settled debris"
            ],
            safety: "Cloudy water may indicate bacterial growth. Test chlorine levels immediately."
        });
    }

    // Sort by priority
    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
}

function displayResults(values, waterType, safetyStatus, recommendations) {
    const resultsDiv = document.getElementById('results');
    const r = ranges[waterType];

    // Safety banner
    let safetyHTML = '';
    let safetyClass = '';
    let safetyText = '';

    switch (safetyStatus) {
        case 'safe':
            safetyClass = 'safety-safe';
            safetyText = '✅ SAFE FOR USE - Water chemistry is within acceptable ranges';
            break;
        case 'caution':
            safetyClass = 'safety-caution';
            safetyText = '⚠️ CAUTION - Minor adjustments needed before optimal use';
            break;
        case 'unsafe':
            safetyClass = 'safety-unsafe';
            safetyText = '🚫 NOT SAFE FOR USE - Critical issues must be addressed immediately';
            break;
    }

    safetyHTML = `<div class="safety-banner ${safetyClass}">${safetyText}</div>`;

    // Chemical status cards
    let statusHTML = '<div class="status-grid">';
    
    const chemicals = [
        { name: 'pH Level', value: values.ph, range: r.ph, unit: '' },
        { name: 'Free Chlorine', value: values.chlorine, range: r.chlorine, unit: ' ppm' },
        { name: 'Total Alkalinity', value: values.alkalinity, range: r.alkalinity, unit: ' ppm' },
        { name: 'Calcium Hardness', value: values.hardness, range: r.hardness, unit: ' ppm' },
        { name: 'Cyanuric Acid', value: values.cyanuric, range: r.cyanuric, unit: ' ppm' }
    ];

    chemicals.forEach(chem => {
        if (!isNaN(chem.value) && chem.value > 0) {
            const status = getChemicalStatus(chem.value, chem.range);
            const statusClass = `status-${status}`;
            
            // Determine if too high or too low
            let statusText = '';
            if (chem.value < chem.range.min) {
                statusText = ' (TOO LOW)';
            } else if (chem.value > chem.range.max) {
                statusText = ' (TOO HIGH)';
            } else if (status === 'warning') {
                if (chem.value < chem.range.optimal) {
                    statusText = ' (SLIGHTLY LOW)';
                } else {
                    statusText = ' (SLIGHTLY HIGH)';
                }
            } else {
                statusText = ' (OPTIMAL)';
            }
            
            statusHTML += `
                <div class="status-card ${statusClass}">
                    <h4>${chem.name}</h4>
                    <div><strong>${chem.value}${chem.unit}${statusText}</strong></div>
                    <div>Target: ${chem.range.min}-${chem.range.max}${chem.unit}</div>
                </div>
            `;
        }
    });
    
    statusHTML += '</div>';

    // Recommendations
    let recommendationsHTML = '';
    if (recommendations.length > 0) {
        recommendationsHTML = '<h3>📋 Treatment Recommendations</h3>';
        recommendationsHTML += '<div class="export-controls">';
        recommendationsHTML += '<button class="export-btn export-pdf" type="button" id="exportPDFBtn">📄 Export to PDF</button>';
        recommendationsHTML += '<button class="export-btn export-print" type="button" id="printReportBtn">🖨️ Print Report</button>';
        recommendationsHTML += '</div>';
        recommendationsHTML += '<div class="recommendations">';
        
        recommendations.forEach(rec => {
            const priorityClass = `priority-${rec.priority}`;
            const badgeClass = `badge-${rec.priority}`;
            const priorityText = rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1);

            let productsHTML = '<div class="products">';
            rec.products.forEach(product => {
                productsHTML += `
                    <div class="product">
                        <div class="product-name">${product.name}</div>
                        <div class="product-type">${product.type}</div>
                    </div>
                `;
            });
            productsHTML += '</div>';

            let instructionsHTML = '<div class="instructions">';
            instructionsHTML += '<h5>Application Instructions:</h5><ol>';
            rec.instructions.forEach(instruction => {
                instructionsHTML += `<li>${instruction}</li>`;
            });
            instructionsHTML += '</ol></div>';

            if (rec.safety) {
                instructionsHTML += `<div class="warning"><strong>⚠️ Safety Warning:</strong> ${rec.safety}</div>`;
            }

            recommendationsHTML += `
                <div class="recommendation ${priorityClass}">
                    <span class="priority-badge ${badgeClass}">${priorityText} Priority</span>
                    <h4>${rec.chemical} - ${rec.issue}</h4>
                    <p><strong>Amount needed:</strong> ${rec.amount}</p>
                    <h5>💡 Recommended Products:</h5>
                    ${productsHTML}
                    ${instructionsHTML}
                </div>
            `;
        });
        
        recommendationsHTML += '</div>';
    } else {
        recommendationsHTML = '<div class="safety-banner safety-safe">🎉 Excellent! Your water chemistry is perfectly balanced. No adjustments needed.</div>';
    }

    resultsDiv.innerHTML = safetyHTML + statusHTML + recommendationsHTML;
    resultsDiv.classList.add('show');
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
    
    // Add event listeners for export buttons after they are created
    setTimeout(() => {
        const exportPDFBtn = document.getElementById('exportPDFBtn');
        const printReportBtn = document.getElementById('printReportBtn');
        
        console.log('Looking for export buttons...');
        console.log('Export PDF button found:', !!exportPDFBtn);
        console.log('Print button found:', !!printReportBtn);
        
        if (exportPDFBtn) {
            exportPDFBtn.onclick = function() {
                console.log('Export PDF button clicked');
                exportToPDF();
            };
        }
        if (printReportBtn) {
            printReportBtn.onclick = function() {
                console.log('Print button clicked');
                printReport();
            };
        }
    }, 200);
}

// Customer Management Functions
function saveCustomer() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    
    if (!customerName) {
        alert('Please enter a customer name.');
        return;
    }

    const customer = {
        name: customerName,
        address: customerAddress,
        created: new Date().toISOString(),
        lastTest: null,
        testHistory: []
    };

    // Get existing customers
    let customers = getStoredData('poolCustomers') || {};
    customers[customerName] = customer;

    // Save customers
    setStoredData('poolCustomers', customers);

    showCustomerNotification(`Customer "${customerName}" saved successfully!`);
    loadCustomerOptions();
    document.getElementById('customerName').value = '';
    document.getElementById('customerAddress').value = '';
}

function loadCustomerOptions() {
    const select = document.getElementById('customerSelect');
    if (!select) return;
    
    // Clear existing options except the first one
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    // Get customers
    const customers = getStoredData('poolCustomers') || {};

    // Add customer options
    Object.keys(customers).forEach(customerName => {
        const option = document.createElement('option');
        option.value = customerName;
        option.textContent = customerName;
        select.appendChild(option);
    });
}

function loadCustomer() {
    const customerName = document.getElementById('customerSelect').value;
    if (!customerName) return;

    const customers = getStoredData('poolCustomers') || {};
    const customer = customers[customerName];
    
    if (!customer) {
        alert('Customer not found.');
        return;
    }

    // Load customer information
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerAddress').value = customer.address || '';

    // Load last test data if available
    if (customer.lastTest) {
        const lastTest = customer.lastTest;
        document.querySelector(`input[name="waterType"][value="${lastTest.waterType}"]`).checked = true;
        updateVolumeGuide();
        
        document.getElementById('ph').value = lastTest.values.ph || '';
        document.getElementById('chlorine').value = lastTest.values.chlorine || '';
        document.getElementById('alkalinity').value = lastTest.values.alkalinity || '';
        document.getElementById('hardness').value = lastTest.values.hardness || '';
        document.getElementById('cyanuric').value = lastTest.values.cyanuric || '';
        document.getElementById('volume').value = lastTest.volume || '';

        // Clear checkboxes first
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

        // Load issues
        if (lastTest.issues) {
            lastTest.issues.forEach(issue => {
                const checkbox = document.querySelector(`input[type="checkbox"][value="${issue}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    }

    clearResults();
    showCustomerNotification(`Customer "${customerName}" loaded successfully!`);
}

function deleteCustomer() {
    const customerName = document.getElementById('customerSelect').value;
    if (!customerName) {
        alert('Please select a customer to delete.');
        return;
    }

    if (!confirm(`Are you sure you want to delete customer "${customerName}" and all their test history?`)) {
        return;
    }

    const customers = getStoredData('poolCustomers') || {};
    delete customers[customerName];

    setStoredData('poolCustomers', customers);

    showCustomerNotification(`Customer "${customerName}" deleted successfully!`);
    loadCustomerOptions();
    document.getElementById('customerSelect').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('customerAddress').value = '';
}

function showCustomerNotification(message) {
    const notification = document.getElementById('customerNotification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Test History Functions
function saveTestToHistory(values, waterType, volume, issues, safetyStatus) {
    const customerName = document.getElementById('customerName').value.trim();
    if (!customerName) return; // Don't save if no customer selected

    const testData = {
        date: new Date().toISOString(),
        values: values,
        waterType: waterType,
        volume: volume,
        issues: issues,
        safetyStatus: safetyStatus
    };

    const customers = getStoredData('poolCustomers') || {};
    if (customers[customerName]) {
        if (!customers[customerName].testHistory) {
            customers[customerName].testHistory = [];
        }
        customers[customerName].testHistory.unshift(testData); // Add to beginning
        customers[customerName].lastTest = testData;

        // Keep only last 50 tests
        if (customers[customerName].testHistory.length > 50) {
            customers[customerName].testHistory = customers[customerName].testHistory.slice(0, 50);
        }

        setStoredData('poolCustomers', customers);
    }
}

function viewTestHistory() {
    const customerName = document.getElementById('customerName').value.trim();
    if (!customerName) {
        alert('Please enter or select a customer name first.');
        return;
    }

    const customers = getStoredData('poolCustomers') || {};
    const customer = customers[customerName];
    
    if (!customer || !customer.testHistory || customer.testHistory.length === 0) {
        alert('No test history found for this customer.');
        return;
    }

    const historyDiv = document.getElementById('testHistory');
    historyDiv.innerHTML = '<h4>Test History for ' + customerName + '</h4>';

    customer.testHistory.slice(0, 10).forEach(test => { // Show last 10 tests
        const date = new Date(test.date).toLocaleDateString();
        const time = new Date(test.date).toLocaleTimeString();
        
        const entryDiv = document.createElement('div');
        entryDiv.className = 'history-entry';
        
        entryDiv.innerHTML = `
            <div class="history-date">${date} at ${time}</div>
            <div class="history-readings">
                pH: ${test.values.ph || 'N/A'} | 
                Chlorine: ${test.values.chlorine || 'N/A'} ppm | 
                Alkalinity: ${test.values.alkalinity || 'N/A'} ppm | 
                Status: ${test.safetyStatus.toUpperCase()}
            </div>
        `;
        
        historyDiv.appendChild(entryDiv);
    });

    historyDiv.classList.add('show');
}

// Reminder Functions
function openReminderModal() {
    const modal = document.getElementById('reminderModal');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    document.getElementById('reminderDate').value = tomorrow.toISOString().split('T')[0];
    modal.style.display = 'block';
}

function closeReminderModal() {
    const modal = document.getElementById('reminderModal');
    modal.style.display = 'none';
}

function saveReminder() {
    const customerName = document.getElementById('customerName').value.trim();
    const reminderDate = document.getElementById('reminderDate').value;
    const reminderType = document.getElementById('reminderType').value;
    const reminderNotes = document.getElementById('reminderNotes').value.trim();

    if (!customerName) {
        alert('Please enter a customer name first.');
        return;
    }

    if (!reminderDate) {
        alert('Please select a reminder date.');
        return;
    }

    const reminder = {
        customerName: customerName,
        date: reminderDate,
        type: reminderType,
        notes: reminderNotes,
        created: new Date().toISOString()
    };

    const reminders = getStoredData('poolReminders') || [];
    reminders.push(reminder);
    setStoredData('poolReminders', reminders);

    closeReminderModal();
    alert('Reminder set successfully!');
    checkReminders();

    // Clear form
    document.getElementById('reminderNotes').value = '';
}

function checkReminders() {
    const reminders = getStoredData('poolReminders') || [];
    const today = new Date().toISOString().split('T')[0];
    const reminderDiv = document.getElementById('nextTestReminder');

    // Filter active reminders (today or overdue)
    const activeReminders = reminders.filter(reminder => reminder.date <= today);

    if (activeReminders.length > 0) {
        const reminder = activeReminders[0]; // Show first active reminder
        reminderDiv.innerHTML = `
            <strong>⏰ Test Reminder:</strong> ${reminder.type.replace('_', ' ').toUpperCase()} due for ${reminder.customerName}
            ${reminder.notes ? '<br><em>' + reminder.notes + '</em>' : ''}
        `;
        reminderDiv.classList.add('show');

        // Remove processed reminders
        const updatedReminders = reminders.filter(r => r.date > today);
        setStoredData('poolReminders', updatedReminders);
    } else {
        reminderDiv.classList.remove('show');
    }
}

// Storage helper functions
function getStoredData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.log('Using fallback storage for', key);
        return window[key] || null;
    }
}

function setStoredData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.log('Storing in memory for', key);
        window[key] = data;
    }
}

// Export functions
function exportToPDF() {
    console.log('Export to PDF clicked');
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const waterTypeElement = document.querySelector('input[name="waterType"]:checked');
    const waterType = waterTypeElement ? waterTypeElement.value : 'pool';
    
    // Get current values
    const values = {
        ph: parseFloat(document.getElementById('ph').value),
        chlorine: parseFloat(document.getElementById('chlorine').value),
        alkalinity: parseFloat(document.getElementById('alkalinity').value),
        hardness: parseFloat(document.getElementById('hardness').value),
        cyanuric: parseFloat(document.getElementById('cyanuric').value),
        volume: parseFloat(document.getElementById('volume').value) || 20000
    };

    // Get customer info
    const customerName = document.getElementById('customerName').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();

    // Create filename with customer name and date
    const today = new Date();
    const dateStr = today.getFullYear() + '-' + 
               String(today.getMonth() + 1).padStart(2, '0') + '-' + 
               String(today.getDate()).padStart(2, '0');
    const cleanCustomerName = customerName ? customerName.replace(/[^a-zA-Z0-9]/g, '_') : 'Customer';
    const filename = `Pool_Analysis_${cleanCustomerName}_${dateStr}`;

    // Get checked issues
    const issues = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        const label = document.querySelector(`label[for="${checkbox.id}"]`).textContent;
        issues.push(label);
    });

    // Get ranges for this water type
    const r = ranges[waterType];
    
    // Generate safety assessment
    const safetyStatus = determineSafetyStatus(values, waterType, issues.map(i => i.split(' ')[1]?.toLowerCase()));
    let safetyText = '';
    switch (safetyStatus) {
        case 'safe':
            safetyText = 'SAFE FOR USE - Water chemistry is within acceptable ranges';
            break;
        case 'caution':
            safetyText = 'CAUTION - Minor adjustments needed before optimal use';
            break;
        case 'unsafe':
            safetyText = 'NOT SAFE FOR USE - Critical issues must be addressed immediately';
            break;
    }

    // Generate recommendations
    const recommendations = generateRecommendations(values, waterType, values.volume, issues.map(i => i.split(' ')[1]?.toLowerCase()));

    // Build textual report
    let reportContent = `
POOL CHEMICAL ANALYSIS REPORT
===============================================

Report Generated: ${currentDate} at ${currentTime}
${customerName ? `Customer: ${customerName}` : ''}
${customerAddress ? `Address: ${customerAddress}` : ''}
Water Type: ${waterType.charAt(0).toUpperCase() + waterType.slice(1)}
Water Volume: ${values.volume.toLocaleString()} gallons

OVERALL SAFETY ASSESSMENT
===============================================
${safetyText}

CURRENT CHEMICAL READINGS
===============================================`;

    // Add chemical readings
    const chemicals = [
        { name: 'pH Level', value: values.ph, range: r.ph, unit: '', optimal: r.ph.optimal },
        { name: 'Free Chlorine', value: values.chlorine, range: r.chlorine, unit: ' ppm', optimal: r.chlorine.optimal },
        { name: 'Total Alkalinity', value: values.alkalinity, range: r.alkalinity, unit: ' ppm', optimal: r.alkalinity.optimal },
        { name: 'Calcium Hardness', value: values.hardness, range: r.hardness, unit: ' ppm', optimal: r.hardness.optimal },
        { name: 'Cyanuric Acid', value: values.cyanuric, range: r.cyanuric, unit: ' ppm', optimal: r.cyanuric.optimal }
    ];

    chemicals.forEach(chem => {
        if (!isNaN(chem.value) && chem.value > 0) {
            let status = '';
            if (chem.value < chem.range.min) {
                status = 'TOO LOW';
            } else if (chem.value > chem.range.max) {
                status = 'TOO HIGH';
            } else if (Math.abs(chem.value - chem.optimal) > (chem.range.max - chem.range.min) * 0.2) {
                status = chem.value < chem.optimal ? 'SLIGHTLY LOW' : 'SLIGHTLY HIGH';
            } else {
                status = 'OPTIMAL';
            }

            reportContent += `

${chem.name}:
  Current Reading: ${chem.value}${chem.unit}
  Target Range: ${chem.range.min}-${chem.range.max}${chem.unit}
  Optimal Level: ${chem.optimal}${chem.unit}
  Status: ${status}`;
        }
    });

    // Add visual observations
    if (issues.length > 0) {
        reportContent += `

VISUAL OBSERVATIONS
===============================================`;
        issues.forEach((issue, index) => {
            reportContent += `
${index + 1}. ${issue}`;
        });
    }

    // Add treatment recommendations
    if (recommendations.length > 0) {
        reportContent += `

TREATMENT RECOMMENDATIONS
===============================================`;

        recommendations.forEach((rec, index) => {
            const priorityText = rec.priority.toUpperCase();
            
            reportContent += `

${index + 1}. ${rec.chemical} Treatment (${priorityText} PRIORITY)
   Issue: ${rec.issue}
   Amount Needed: ${rec.amount}

   Recommended Products:`;
            
            rec.products.forEach((product, pIndex) => {
                reportContent += `
   ${String.fromCharCode(97 + pIndex)}. ${product.name} (${product.type})`;
            });

            reportContent += `

   Application Instructions:`;
            rec.instructions.forEach((instruction, iIndex) => {
                reportContent += `
   ${iIndex + 1}. ${instruction}`;
            });

            if (rec.safety) {
                reportContent += `

   SAFETY WARNING: ${rec.safety}`;
            }

            reportContent += `
   ${'='.repeat(60)}`;
        });
    } else {
        reportContent += `

TREATMENT RECOMMENDATIONS
===============================================
No chemical adjustments required. Water chemistry is properly balanced.
Continue regular testing and maintenance schedule.`;
    }

    // Add general notes
    reportContent += `

GENERAL NOTES AND RECOMMENDATIONS
===============================================
- Always follow product label instructions for exact dosing
- Never mix different pool chemicals together
- Add chemicals to water, never water to chemicals
- Allow adequate circulation time between chemical additions
- Test water again 6-8 hours after chemical application
- Maintain proper pump operation and filtration
- Keep accurate records of all chemical additions
- Consult a pool professional for persistent problems

EMERGENCY CONTACT INFORMATION
===============================================
- For chemical emergencies, contact Poison Control: 1-800-222-1222
- Always have fresh water available for rinsing
- Keep Material Safety Data Sheets (MSDS) for all pool chemicals
- Store chemicals in cool, dry, well-ventilated area

TESTING SCHEDULE RECOMMENDATIONS
===============================================
Daily: Free chlorine and pH levels
Weekly: Total alkalinity, calcium hardness
Monthly: Cyanuric acid levels
Seasonally: Complete water analysis

===============================================
Report generated by Pool Chemical Analyzer
This report is for informational purposes only.
Always follow manufacturer instructions and consult
professionals for complex water chemistry issues.
===============================================`;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${filename}</title>
            <style>
                body { 
                    font-family: 'Courier New', monospace; 
                    margin: 40px; 
                    line-height: 1.4; 
                    color: #000;
                    background: #fff;
                    font-size: 12px;
                }
                .report-content {
                    white-space: pre-wrap;
                    max-width: 800px;
                    margin: 0 auto;
                }
                @media print {
                    body { margin: 20px; font-size: 11px; }
                    .report-content { margin: 0; }
                    @page { 
                        margin: 0.5in;
                        @bottom-left { content: none; }
                        @bottom-center { content: none; }
                        @bottom-right { content: none; }
                    }
                }
            </style>
        </head>
        <body>
            <div class="report-content">${reportContent}</div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 1000);
}

function printReport() {
    console.log('Print report clicked');
    
    // Create the same textual report as PDF export
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const waterTypeElement = document.querySelector('input[name="waterType"]:checked');
    const waterType = waterTypeElement ? waterTypeElement.value : 'pool';
    
    // Get current values
    const values = {
        ph: parseFloat(document.getElementById('ph').value),
        chlorine: parseFloat(document.getElementById('chlorine').value),
        alkalinity: parseFloat(document.getElementById('alkalinity').value),
        hardness: parseFloat(document.getElementById('hardness').value),
        cyanuric: parseFloat(document.getElementById('cyanuric').value),
        volume: parseFloat(document.getElementById('volume').value) || 20000
    };

    // Get customer info
    const customerName = document.getElementById('customerName').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();

    // Create filename with customer name and date
    const today = new Date();
    const dateStr = today.getFullYear() + '-' + 
                  String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(today.getDate()).padStart(2, '0');
    const cleanCustomerName = customerName ? customerName.replace(/[^a-zA-Z0-9]/g, '_') : 'Customer';
    const filename = `Pool_Analysis_${cleanCustomerName}_${dateStr}`;

    // Get checked issues
    const issues = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        const label = document.querySelector(`label[for="${checkbox.id}"]`).textContent;
        issues.push(label);
    });

    // Get ranges for this water type
    const r = ranges[waterType];
    
    // Generate safety assessment
    const safetyStatus = determineSafetyStatus(values, waterType, issues.map(i => i.split(' ')[1]?.toLowerCase()));
    let safetyText = '';
    switch (safetyStatus) {
        case 'safe':
            safetyText = 'SAFE FOR USE - Water chemistry is within acceptable ranges';
            break;
        case 'caution':
            safetyText = 'CAUTION - Minor adjustments needed before optimal use';
            break;
        case 'unsafe':
            safetyText = 'NOT SAFE FOR USE - Critical issues must be addressed immediately';
            break;
    }

    // Generate recommendations
    const recommendations = generateRecommendations(values, waterType, values.volume, issues.map(i => i.split(' ')[1]?.toLowerCase()));

    // Build textual report
    let reportContent = `
POOL CHEMICAL ANALYSIS REPORT
===============================================

Report Generated: ${currentDate} at ${currentTime}
${customerName ? `Customer: ${customerName}` : ''}
${customerAddress ? `Address: ${customerAddress}` : ''}
Water Type: ${waterType.charAt(0).toUpperCase() + waterType.slice(1)}
Water Volume: ${values.volume.toLocaleString()} gallons

OVERALL SAFETY ASSESSMENT
===============================================
${safetyText}

CURRENT CHEMICAL READINGS
===============================================`;

    // Add chemical readings
    const chemicals = [
        { name: 'pH Level', value: values.ph, range: r.ph, unit: '', optimal: r.ph.optimal },
        { name: 'Free Chlorine', value: values.chlorine, range: r.chlorine, unit: ' ppm', optimal: r.chlorine.optimal },
        { name: 'Total Alkalinity', value: values.alkalinity, range: r.alkalinity, unit: ' ppm', optimal: r.alkalinity.optimal },
        { name: 'Calcium Hardness', value: values.hardness, range: r.hardness, unit: ' ppm', optimal: r.hardness.optimal },
        { name: 'Cyanuric Acid', value: values.cyanuric, range: r.cyanuric, unit: ' ppm', optimal: r.cyanuric.optimal }
    ];

    chemicals.forEach(chem => {
        if (!isNaN(chem.value) && chem.value > 0) {
            let status = '';
            if (chem.value < chem.range.min) {
                status = 'TOO LOW';
            } else if (chem.value > chem.range.max) {
                status = 'TOO HIGH';
            } else if (Math.abs(chem.value - chem.optimal) > (chem.range.max - chem.range.min) * 0.2) {
                status = chem.value < chem.optimal ? 'SLIGHTLY LOW' : 'SLIGHTLY HIGH';
            } else {
                status = 'OPTIMAL';
            }

            reportContent += `

${chem.name}:
  Current Reading: ${chem.value}${chem.unit}
  Target Range: ${chem.range.min}-${chem.range.max}${chem.unit}
  Optimal Level: ${chem.optimal}${chem.unit}
  Status: ${status}`;
        }
    });

    // Add visual observations
    if (issues.length > 0) {
        reportContent += `

VISUAL OBSERVATIONS
===============================================`;
        issues.forEach((issue, index) => {
            reportContent += `
${index + 1}. ${issue}`;
        });
    }

    // Add treatment recommendations
    if (recommendations.length > 0) {
        reportContent += `

TREATMENT RECOMMENDATIONS
===============================================`;

        recommendations.forEach((rec, index) => {
            const priorityText = rec.priority.toUpperCase();
            
            reportContent += `

${index + 1}. ${rec.chemical} Treatment (${priorityText} PRIORITY)
   Issue: ${rec.issue}
   Amount Needed: ${rec.amount}

   Recommended Products:`;
            
            rec.products.forEach((product, pIndex) => {
                reportContent += `
   ${String.fromCharCode(97 + pIndex)}. ${product.name} (${product.type})`;
            });

            reportContent += `

   Application Instructions:`;
            rec.instructions.forEach((instruction, iIndex) => {
                reportContent += `
   ${iIndex + 1}. ${instruction}`;
            });

            if (rec.safety) {
                reportContent += `

   SAFETY WARNING: ${rec.safety}`;
            }

            reportContent += `
   ${'='.repeat(60)}`;
        });
    } else {
        reportContent += `

TREATMENT RECOMMENDATIONS
===============================================
No chemical adjustments required. Water chemistry is properly balanced.
Continue regular testing and maintenance schedule.`;
    }

    // Add general notes
    reportContent += `

GENERAL NOTES AND RECOMMENDATIONS
===============================================
- Always follow product label instructions for exact dosing
- Never mix different pool chemicals together
- Add chemicals to water, never water to chemicals
- Allow adequate circulation time between chemical additions
- Test water again 6-8 hours after chemical application
- Maintain proper pump operation and filtration
- Keep accurate records of all chemical additions
- Consult a pool professional for persistent problems

EMERGENCY CONTACT INFORMATION
===============================================
- For chemical emergencies, contact Poison Control: 1-800-222-1222
- Always have fresh water available for rinsing
- Keep Material Safety Data Sheets (MSDS) for all pool chemicals
- Store chemicals in cool, dry, well-ventilated area

TESTING SCHEDULE RECOMMENDATIONS
===============================================
Daily: Free chlorine and pH levels
Weekly: Total alkalinity, calcium hardness
Monthly: Cyanuric acid levels
Seasonally: Complete water analysis

===============================================
Report generated by Pool Chemical Analyzer
This report is for informational purposes only.
Always follow manufacturer instructions and consult
professionals for complex water chemistry issues.
===============================================`;

    // Create a hidden iframe for printing
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-1000px';
    printFrame.style.left = '-1000px';
    document.body.appendChild(printFrame);

    const printDoc = printFrame.contentDocument || printFrame.contentWindow.document;
    printDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${filename}</title>
            <style>
                body { 
                    font-family: 'Courier New', monospace; 
                    margin: 40px; 
                    line-height: 1.4; 
                    color: #000;
                    background: #fff;
                    font-size: 12px;
                }
                .report-content {
                    white-space: pre-wrap;
                    max-width: 800px;
                    margin: 0 auto;
                }
                @media print {
                    body { margin: 20px; font-size: 11px; }
                    .report-content { margin: 0; }
                    @page { 
                        margin: 0.5in;
                        @bottom-left { content: none; }
                        @bottom-center { content: none; }
                        @bottom-right { content: none; }
                    }
                }
            </style>
        </head>
        <body>
            <div class="report-content">${reportContent}</div>
        </body>
        </html>
    `);
    
    printDoc.close();
    
    setTimeout(() => {
        printFrame.contentWindow.print();
        setTimeout(() => {
            document.body.removeChild(printFrame);
        }, 1000);
    }, 500);
}

function clearResults() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('show');
    resultsDiv.innerHTML = '';
}