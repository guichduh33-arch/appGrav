/* ============================================
   THE BREAKERY - DATA LAYER
   Processed from CSV files for Recipe & Costing
   ============================================ */

const RAW_PRODUCT_DATA = `
Lemon Cheesecake Small 16cm,9901,Cake,,,0,250000,0,0,0,0,Pcs,0,0,,
Aluminium Foil,9901,KITCHEN SUPLLIES,,,36000,0,0,0,0,0,,0,0,,
Coffee Bean Pack 500gr,9901,Coffee,,,0,250000,0,0,0,0,Bag,0,0,,
Caramel Latte,2902,Speciale Latte,"hot/ice,Fresh/oat","Hot,Fresh milk",0,50000,0,0,0,0,Cup,1,0,,https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6890221c7ceee.jpg
Hazelnut Latte,2902,Speciale Latte,"hot/ice,Fresh/oat","Hot,Fresh milk",0,50000,0,0,0,0,Cup,1,0,,https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689021c0c8506.jpg
Croissant,9901,Classic Viennoiserie,,,5902.12,25000,0,0,0,0,Pcs,1,0,,https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879fe7ace724.jpg
Pain au Chocolat,9901,Classic Viennoiserie,,,6000,28000,0,0,0,0,Pcs,1,0,,https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_6879feda899eb.jpg
Cappuccino,9901,Coffee,"hot/ice,Fresh/oat","Hot,Fresh milk",0,35000,0,0,0,0,Cup,1,0,,https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0a8cdb0ea.jpg
Americano,9901,Coffee,hot/ice,hot,0,35000,0,0,0,0,Cup,1,0,,https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a0b2c69a9c.jpg
Matcha Latte,2902,Speciale Latte,"hot/ice,Fresh/oat","Hot,Fresh milk",0,50000,0,0,0,0,PCS,1,0,,https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_689023eadd94e.jpg
Burger,2901,Classic Sandwiches,,,37414.94,100000,0,0,0,0,Pcs,1,0,,https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a01cc6b01e.jpg
Black Forest,9901,Individual Pastries,,,15232.94,48000,1,1,0,0,Pcs,1,0,,https://d1d8o7q9jg8pjk.cloudfront.net/p/lg_687a04dd63a07.jpg
`;

const RAW_RECIPE_DATA = `
Affogato,,,Coffee bean,18,Gr, 240
Affogato,,,Ice Cream Vanilla,117.5,Gr, 41
Americano,hot,,Coffee bean,18,Gr, 240
Americano,ICED,,Coffee bean,18,Gr, 240
Bagels,,,White Flour,78,Gr, 2
Bagels,,,Maizena Flour,2.3,Gr, 2
Bagels,,,Mix Butter,5,Gr, 2
Bagels,,,Salt,1.4,Gr, 2
Bagels,,,Yeast,1.1,Gr, 2
Bagels,,,White Sugar,5.4,Gr, 2
Bagels,,,White Sesame Seed,0.25,Gr, 2
Bagels,,,Black Sesame Seed,0.25,Gr, 2
Bagels,,,Milk (Uht),12,Ml, 2
Bagels,,,Olive Oil,2,Ml, 2
Bagels,,,Water,40.4,Ml, 2
Bagels,,,Egg,0.334,Pcs, 2
Black Forest,,,Chocolat Sponge Cake,126,Gr, 15
Black Forest,,,Chantilly,50,Gr, 15
Black Forest,,,Strawberry Jam,15,Gr, 15
Black Forest,,,Chocolate Dark Couverture,20,Gr, 15
Black Forest,,,Cake Cardboard Round,1,Pcs, 15
Burger,,,Cheddar Cheese,15,Gr, 37
Burger,,,LETTUCE,20,Gr, 37
Burger,,,Minced Beef,150,Gr, 37
Burger,,,TOMATO,20,Gr, 37
Burger,,,Caramelized Onion,20,Gr, 37
Burger,,,Smoked Beef,25,Gr, 37
Burger,,,Bbq Sauce,30,Ml, 37
Burger,,,Burger Buns,1,Pcs, 37
Burger,,,French Fries,1,Pcs, 37
Cappuccino,HOT,,Coffee bean,18,Gr, 240
Cappuccino,HOT,,Fresh Milk,200,Ml, 21
Caramel Latte,Hot,,Coffee bean,18,Gr, 240
Caramel Latte,Hot,,Syrup Caramel,30,Ml, 180
Caramel Latte,Hot,,Fresh Milk,200,Ml, 21
Croissant,,,Croissant stock,1,Pcs, 6
Croissant stock,,,Croissant Dough,90,Gr, 6
Croissant Dough,,,Butter Sheet Croissant,240,Gr, 66
Croissant Dough,,,Yeast,8,Gr, 66
Croissant Dough,,,White Sugar,61,Gr, 66
Croissant Dough,,,Mix Butter,25,Gr, 66
Croissant Dough,,,White Flour,411,Gr, 66
Croissant Dough,,,Milk Powder,21,Gr, 66
Croissant Dough,,,Salt,8,Gr, 66
Croissant Dough,,,Water,226,Ml, 66
Hazelnut Latte,HOT,,Coffee bean,18,Gr, 240
Hazelnut Latte,HOT,,Syrup Hazelnut,30,Ml, 180
Hazelnut Latte,HOT,,Fresh Milk,200,Ml, 21
Matcha Latte,HOT,,Matcha Powder,30,Gr, 203
Matcha Latte,HOT,,Fresh Milk,200,Ml, 21
`;

// Parse CSV-like string to Objects
function parseCSV(csvString) {
    const lines = csvString.trim().split('\n');
    return lines.map(line => line.split(','));
}

// ============================================
// DATA PROCESSING
// ============================================

// 1. Process Products
const productsMap = {};
const productLines = parseCSV(RAW_PRODUCT_DATA);

productLines.forEach(cols => {
    // Columns based on product data.csv structure (approx based on view)
    // name, class_id, category, ..., sell_price, ..., photo

    // Handling quoted fields usually requires a real CSV parser, 
    // but we'll do simple split for this demo data set

    const name = cols[0];
    const category = cols[2];
    const sellPrice = parseFloat(cols[6] || 0); // pos_sell_price
    const image = cols[cols.length - 1]; // photo is last

    productsMap[name] = {
        name: name,
        category: category,
        sellPrice: sellPrice,
        image: image,
        materials: []
    };
});

// 2. Process Recipes
const recipeLines = parseCSV(RAW_RECIPE_DATA);

recipeLines.forEach(cols => {
    // product, variant, sku, material, qty, uom, buy_price_material
    // Note: indices might shift if fields are empty

    const productName = cols[0];
    const materialName = cols[3];
    const qty = parseFloat(cols[4]);
    const unit = cols[5];
    const costPerUnit = parseFloat(cols[6]); // This seems to be unit cost or total cost? 
    // "Buy Price Materials" usually means price per unit
    // But checking data: Coffee bean 18Gr, 240 cost. 
    // If 1kg is 240k, then 1g is 240. 18g * 240 = 4320. 
    // Let's assume the column 6 is COST PER UNIT (e.g. per Gr).

    if (productsMap[productName]) {
        productsMap[productName].materials.push({
            name: materialName,
            qty: qty,
            unit: unit,
            costPerUnit: costPerUnit,
            totalCost: qty * costPerUnit
        });
    } else {
        // If product doesn't exist in main list, create a partial entry
        productsMap[productName] = {
            name: productName,
            category: 'Unknown',
            sellPrice: 0,
            image: '',
            materials: [{
                name: materialName,
                qty: qty,
                unit: unit,
                costPerUnit: costPerUnit,
                totalCost: qty * costPerUnit
            }]
        };
    }
});

// Export functions
function getProductCosting(productName) {
    const product = productsMap[productName];
    if (!product) return null;

    const totalCost = product.materials.reduce((sum, mat) => sum + mat.totalCost, 0);
    const marginValue = product.sellPrice - totalCost;
    const marginPercent = product.sellPrice > 0 ? (marginValue / product.sellPrice) * 100 : 0;

    return {
        ...product,
        totalCost,
        marginValue,
        marginPercent
    };
}

function getAllProductsWithRecipes() {
    return Object.values(productsMap).filter(p => p.materials.length > 0);
}
