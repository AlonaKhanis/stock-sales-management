// 'use strict';

// document.addEventListener('DOMContentLoaded', function () {
//     const filterColor = document.getElementById('filterColor');
//     const filterMaterial = document.getElementById('filterMaterial');
//     const alertBox = document.getElementById('alertBox');
//     const materialTableBody = document.querySelector("#materialTable tbody");

//     let materials = [];

//     async function fetchMaterials() {
//         try {
//             const response = await fetch('/api/materials');
//             if (response.ok) {
//                 materials = await response.json();
//                 console.log(materials);
//                 displayMaterials(materials);
//             } else {
//                 const errorData = await response.json();
//                 formAlert(`Error: ${errorData.error}`, alertBox);

//             }
//         } catch (error) {
//             formAlert(`Error: ${errorData.error}`, alertBox);
//         }
//     }

//     function formatStockAmount(amount) {
//         if (amount < 1) {
//             return `${(amount * 1000).toFixed(0)}g`;
//         }
//         return `${amount}kg`;
//     }




//     function displayMaterials(materialsToDisplay) {
//         materialTableBody.innerHTML = '';
//         materialsToDisplay.forEach(material => {
//             const row = document.createElement('tr');

//             row.innerHTML = `
//                 <td>${material.material_name}</td>
//                 <td>🪙${material.price_per_kg}/kg</td>
//                 <td>${formatStockAmount(material.stock_amount)}</td>
//                 <td style="color: ${material.color};">${material.color}</td>
//             `;

//             materialTableBody.appendChild(row);
//         });
//     }


//     function filterMaterials() {
//         const colorFilter = filterColor.value.toLowerCase();
//         const materialFilter = filterMaterial.value.toLowerCase();

//         const filteredMaterials = materials.filter(material => {
//             const colorMatch = material.color && material.color.toLowerCase().includes(colorFilter);
//             const materialNameMatch = material.material_name && material.material_name.toLowerCase().includes(materialFilter);
//             return colorMatch && materialNameMatch;
//         });

//         displayMaterials(filteredMaterials);
//     }

//     filterColor.addEventListener('input', filterMaterials);
//     filterMaterial.addEventListener('input', filterMaterials);

//     fetchMaterials();
// });
