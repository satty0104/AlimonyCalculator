// Form field configurations
const femaleFields = [
    { id: 'spouse_income', label: '💰 Spouse\'s Monthly Income (₹)', type: 'number' },
    { id: 'property', label: '🏠 Spouse\'s Property Value (₹)', type: 'number' },
    { id: 'past_relationships', label: '💑 Spouse\'s Past Relationships', type: 'number' },
    { id: 'job_type', label: '🏢 Spouse\'s Job Type', type: 'select', options: [
        { value: '0', text: 'Private' },
        { value: '1', text: 'Government' }
    ]},
    { id: 'own_income', label: '💰 Your Monthly Income (₹)', type: 'number' },
    { id: 'num_children', label: '👶 Number of Children', type: 'number' }
];

const maleFields = [
    { id: 'own_income', label: '💰 Your Monthly Income (₹)', type: 'number' },
    { id: 'property', label: '🏠 Your Property Value (₹)', type: 'number' },
    { id: 'past_relationships', label: '💑 Spouse\'s Past Relationships', type: 'number' },
    { id: 'job_type', label: '🏢 Your Job Type', type: 'select', options: [
        { value: '0', text: 'Private' },
        { value: '1', text: 'Government' }
    ]},
    { id: 'spouse_income', label: '💰 Spouse\'s Monthly Income (₹)', type: 'number' },
    { id: 'num_children', label: '👶 Number of Children', type: 'number' }
];

// Generate dynamic form fields based on gender
document.getElementById('gender').addEventListener('change', function() {
    const fields = this.value === '1' ? femaleFields : maleFields;
    generateFields(fields);
});

function generateFields(fields) {
    const container = document.getElementById('dynamicFields');
    container.innerHTML = '';

    fields.forEach(field => {
        const div = document.createElement('div');
        div.className = 'form-group';

        const label = document.createElement('label');
        label.htmlFor = field.id;
        label.textContent = field.label;

        let input;
        if (field.type === 'select') {
            input = document.createElement('select');
            input.className = 'form-select';
            field.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.text;
                input.appendChild(option);
            });
        } else {
            input = document.createElement('input');
            input.type = field.type;
            input.className = 'form-input';
        }
        input.id = field.id;

        div.appendChild(label);
        div.appendChild(input);
        container.appendChild(div);
    });

    // Add children custody field if children exist
    const numChildrenInput = document.getElementById('num_children');
    if (numChildrenInput) {
        numChildrenInput.addEventListener('change', function() {
            if (this.value > 0) {
                addChildrenCustodyField();
            }
        });
    }
}

function addChildrenCustodyField() {
    const container = document.getElementById('dynamicFields');
    const div = document.createElement('div');
    div.className = 'form-group';
    
    const label = document.createElement('label');
    label.htmlFor = 'desired_children';
    label.textContent = '👶 Number of Children Staying with Spouse';
    
    const input = document.createElement('input');
    input.type = 'number';
    input.id = 'desired_children';
    input.className = 'form-input';
    
    div.appendChild(label);
    div.appendChild(input);
    container.appendChild(div);
}

// Validation
function validateForm() {
    const errorMessage = document.getElementById('errorMessage');
    const fields = document.querySelectorAll('input, select');
    let isValid = true;
    
    // Reset previous errors
    errorMessage.style.display = 'none';
    fields.forEach(field => field.classList.remove('error-field'));

    // Check each field
    fields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error-field');
            isValid = false;
        }
    });

    if (!isValid) {
        errorMessage.style.display = 'flex';
        // Scroll to error message
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return isValid;
}

// Corrected calculateAlimony function
function calculateAlimony() {
    if (!validateForm()) {
        return;
    }

    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = 'block';

    // Get all input values
    const values = {
        gender: parseInt(document.getElementById('gender').value),
        own_income: parseInt(document.getElementById('own_income').value) || 0,
        spouse_income: parseInt(document.getElementById('spouse_income').value) || 0,
        property: parseInt(document.getElementById('property').value) || 0,
        past_relationships: parseInt(document.getElementById('past_relationships').value) || 0,
        job_type: parseInt(document.getElementById('job_type').value),
        num_children: parseInt(document.getElementById('num_children').value) || 0,
        desired_children: parseInt(document.getElementById('desired_children')?.value) || 0
    };

    setTimeout(() => {
        overlay.style.display = 'none';

        // Calculate alimony
        let alimony = 0;
        
        // Base alimony based on job type
        if (values.job_type === 1) { // Government job
            alimony = values.own_income * 24;
        } else { // Private job
            alimony = values.own_income * 18;
        }
        
        // Add property component
        alimony += values.property * 0.4;
        
        // Add children component - only if children stay with the person claiming alimony
        let childrenWithPerson = 0;

        if (values.gender === 1) { 
            // Female → children with wife
            childrenWithPerson = values.num_children - values.desired_children;
        } else { 
            // Male → children with husband
            childrenWithPerson = values.desired_children;
        }

        if (childrenWithPerson > 0) {
            alimony += childrenWithPerson * 1000000;
        }
        
        // Past relationships reduction
        if (values.past_relationships > 0) {
            alimony *= (1.0 - (values.past_relationships * 0.1));
        }

        // Calculate monthly allowance
        let monthlyAllowance = 0;
        if (values.gender === 0 && values.own_income > values.spouse_income) {
            monthlyAllowance = (values.own_income - values.spouse_income) / 2;
        } else if (values.gender === 1 && values.spouse_income > values.own_income) {
            monthlyAllowance = (values.spouse_income - values.own_income) / 2;
        }

        showResults(alimony, monthlyAllowance, values.gender);
    }, 500);
}

function showResults(alimony, monthlyAllowance, gender) {
    // Create modal overlay if it doesn't exist
    if (!document.querySelector('.modal-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
    }

    document.querySelector('.modal-overlay').style.display = 'block';
    document.getElementById('results').style.display = 'block';
    
    const prefix = gender === 1 ? "You will receive: ₹" : "You need to pay: ₹";
    document.getElementById('alimonyAmount').textContent = prefix + alimony.toLocaleString();
    document.getElementById('monthlyAllowance').textContent = 
        monthlyAllowance > 0 ? prefix + monthlyAllowance.toLocaleString() + "/month" : "No monthly allowance";
}

// Add event listeners for closing modal
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            overlay.style.display = 'none';
            document.getElementById('results').style.display = 'none';
        });
    }

    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
            e.target.classList.remove('error-field');
            if (document.querySelectorAll('.error-field').length === 0) {
                document.getElementById('errorMessage').style.display = 'none';
            }
        }
    });
});
