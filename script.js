// ==========================================
// 1. API DETAILS (Aapki original details)
// ==========================================
const API_TOKEN = 'patL6Y9wJh26zm4wY.b0a6829c3b97c9c6d8606f24091e37f897a1bb3ad0dfac4f343516505daa9896'; 
const BASE_ID = 'appRByaynF00JmMay'; 
const TABLE_NAME = 'Daily Pricing'; 

const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

// HTML Elements Connect Karna
const gridContainer = document.getElementById('product-grid');
const loadingMsg = document.getElementById('loading-msg');
const searchInput = document.getElementById('searchInput');
const categoryDropdown = document.getElementById('category-dropdown');

// Global Variables
let allProducts = [];
let currentCategory = 'All'; // By default sab dikhega

// ==========================================
// 2. DATA FETCH KAREIN (With 'Publish to App' Logic)
// ==========================================
async function fetchPrices() {
    try {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${API_TOKEN}` }});
        const data = await response.json();
        
        // 1000 IQ FIX: Sirf wahi item rakho jinka "Publish to App?" box tick kiya hua hai
        allProducts = data.records.filter(record => record.fields['Publish to App?'] === true);
        
        // Buttons banao aur items dikhao
        setupCategoryFilters();
        applyFilters(); 

        // Data aate hi "Fetching..." text ko hamesha ke liye gayab kar do
        if(loadingMsg) {
            loadingMsg.style.display = 'none';
        }

    } catch (error) {
        console.error('System Error:', error);
        if(loadingMsg) {
            loadingMsg.innerHTML = 'data not found.';
            loadingMsg.style.color = 'red';
        }
    }
}

// ==========================================
// 3. DYNAMIC CATEGORY DROPDOWN GENERATOR
// ==========================================
function setupCategoryFilters() {
    if(!categoryDropdown) return;

    // Airtable se unique categories dhoondo
    const categories = new Set();
    categories.add('All Categories'); // Default option ka naam thoda bada kiya
    allProducts.forEach(record => {
        const cat = record.fields['Category'];
        if(cat) categories.add(cat);
    });

    // Dropdown ke andar HTML Options dalo
    categoryDropdown.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        // Engine ko samajhne ke liye 'All Categories' ko wapas 'All' padhao
        option.value = cat === 'All Categories' ? 'All' : cat; 
        option.innerText = cat;
        categoryDropdown.appendChild(option);
    });

    // Jab customer dropdown se kuch select karega
    categoryDropdown.addEventListener('change', (e) => {
        currentCategory = e.target.value; // Nayi category set karo
        applyFilters(); // Items filter karke dikhao
    });
}

// ==========================================
// 4. SMART FILTER ENGINE (Category + SEO Search)
// ==========================================
function applyFilters() {
    const searchWord = searchInput ? searchInput.value.toLowerCase() : '';

    const filteredProducts = allProducts.filter(record => {
        // Name, Description aur Category ko Airtable se nikalna (Agar khali ho toh error se bachna)
        const itemName = (record.fields['Item Name'] || '').toLowerCase();
        const itemDesc = (record.fields['Description'] || '').toLowerCase(); // NAYA: SEO Description
        const itemCat = record.fields['Category'] || '';

        // Check 1: Kya item us category ka hai jo customer ne select ki hai?
        const matchesCategory = currentCategory === 'All' || itemCat === currentCategory;

        // Check 2: Kya search word 'Name' YA 'Description' mein kahin bhi hai?
        const matchesSearch = itemName.includes(searchWord) || itemDesc.includes(searchWord);

        // Agar dono theek hain, tabhi item dikhao
        return matchesCategory && matchesSearch;
    });

    displayProducts(filteredProducts);
}

// Search bar me type karte hi naya engine (applyFilters) chalega
if(searchInput) {
    searchInput.addEventListener('input', applyFilters);
}

// ==========================================
// 5. CARDS DISPLAY FUNCTION (Aapka purana Unit aur Image Logic safe hai)
// ==========================================
function displayProducts(recordsToDisplay) {
    if(!gridContainer) return;
    gridContainer.innerHTML = ''; // Pehle grid khali karo
    
    if(recordsToDisplay.length === 0) {
        gridContainer.innerHTML = '<p style="color:#718096; grid-column:span 2; text-align:center; padding: 40px;">No Products Found.</p>';
        return;
    }

    recordsToDisplay.forEach(record => {
        const itemName = record.fields['Item Name']; 
        const price = record.fields["₹ Today's Price"] || record.fields["Today's Price"]; 
        
        // Unit Logic (Aapka banaya hua)
        const unit = record.fields['Unit'];
        const unitText = unit ? `/${unit}` : ''; 
        
        // Image Fallback Logic
        let photoHtml = `<div style="height:140px; background:#e2e8f0; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#a0aec0; margin-bottom:18px;">🖼️ No Photo</div>`; 
        
        if(record.fields['Item Photo'] && record.fields['Item Photo'].length > 0) {

           // NAYA: 'loading="lazy"' add kiya gaya hai
photoHtml = `<img src="${record.fields['Item Photo'][0].url}" alt="${itemName}" loading="lazy" decoding="async">`;
        }

        // Card Render
        if(itemName && price) { 
            const cardHTML = `
                <div class="product-card">
                    ${photoHtml}
                    <h3>${itemName}</h3>
                    <div class="price-tag">
                        ₹${price} <span style="font-size: 0.85rem; color: #718096; font-weight: 500;">${unitText}</span>
                    </div>
                </div>
            `;
            gridContainer.innerHTML += cardHTML;
        }
    });
}

// Engine Start
fetchPrices();
// ==========================================
// SCROLL-HIDING NAVBAR LOGIC
// ==========================================
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 70) {
        // User neeche scroll kar raha hai -> Navbar chhupao
        navbar.classList.add('navbar-hidden');
    } else {
        // User upar scroll kar raha hai -> Navbar wapas lao
        navbar.classList.remove('navbar-hidden');
    }
    lastScrollTop = scrollTop;
});