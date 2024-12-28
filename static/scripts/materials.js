
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const materialNameDropdown = document.getElementById('material_name');
    const colorDropdown = document.getElementById('color');
    const materialForm = document.getElementById('material-form');
    const pricePerKgInput = document.getElementById('price_per_kg');
    const filterColor = document.getElementById('filterColor');
    const filterMaterial = document.getElementById('filterMaterial');
    const alertBox = createAlertBox(materialForm);

    const materialTableBody = document.querySelector("#materialTable tbody");

    let materials = [];

    pricePerKgInput.value = 90;

    const availableMaterials = getAvailableMaterials();
    const availableColors = getAvailableColors();


    availableMaterials.forEach(material => {
        const option = document.createElement('option');
        option.value = material;
        option.textContent = material;
        materialNameDropdown.appendChild(option);
    });

    availableColors.forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = color;
        colorDropdown.appendChild(option);
    });

    async function fetchMaterials() {
        try {
            const response = await fetch('/api/materials');
            if (response.ok) {
                materials = await response.json();
                displayMaterials(materials);
            } else {
                const errorData = await response.json();
                formAlert(`Error: ${errorData.error}`, alertBox);
            }
        } catch (error) {
            formAlert(`Error: ${error.message}`, alertBox);
        }
    }

    function displayMaterials(materialsToDisplay) {
        materialTableBody.innerHTML = '';
        materialsToDisplay.forEach(material => {

            const materialName = material.material_name || 'Unknown';
            const pricePerKg = material.price_per_kg || 'N/A';
            const stockAmount = material.stock_amount || 0;
            const color = material.color || 'No color';

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${materialName}</td>
                <td>🪙${pricePerKg}/kg</td>
                <td>${formatStockAmount(stockAmount)}</td>
                <td style="color: ${color};">${color}</td>
            `;

            materialTableBody.appendChild(row);
        });
    }


    function filterMaterials() {
        const colorFilter = filterColor.value.toLowerCase();
        const materialFilter = filterMaterial.value.toLowerCase();

        const filteredMaterials = materials.filter(material => {
            const colorMatch = material.color && material.color.toLowerCase().includes(colorFilter);
            const materialNameMatch = material.material_name && material.material_name.toLowerCase().includes(materialFilter);
            return colorMatch && materialNameMatch;
        });

        displayMaterials(filteredMaterials);
    }

    filterColor.addEventListener('input', filterMaterials);
    filterMaterial.addEventListener('input', filterMaterials);

    materialForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const materialName = materialNameDropdown.value;
        const stockAmount = document.getElementById('stock_amount').value;
        const color = colorDropdown.value;
        const pricePerKg = pricePerKgInput.value;

        const materialData = {
            material_name: materialName,
            stock_amount: stockAmount,
            color: color,
            price_per_kg: pricePerKg
        };

        try {
            const response = await fetch('/api/add_material', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(materialData)
            });

            if (response.ok) {
                fetchMaterials();
                formAlert('Material added successfully!', alertBox, response);

                materialForm.reset();
                pricePerKgInput.value = 90;


            } else {
                const errorData = await response.json();
                formAlert(`Error: ${errorData.error}`, alertBox, response);

            }
        } catch (error) {
            formAlert(`Error: ${error.message}`, alertBox, { ok: false });

        }

    });

    fetchMaterials();

});
