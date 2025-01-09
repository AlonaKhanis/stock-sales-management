document.addEventListener('DOMContentLoaded', () => {
    const materialForm = document.getElementById('material-form');
    const filterColor = document.getElementById('filterColor');
    const filterMaterial = document.getElementById('filterMaterial');
    const alertBox = createAlertBox(materialForm);

    const materialTableBody = document.querySelector("#materialTable tbody");

    let materials = [];

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
            // Round the stockAmount to two decimal places for display
            const stockAmount = material.stock_amount ? material.stock_amount.toFixed(3) : '0.00';
            const color = material.color || 'No color';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${materialName}</td>
                <td>₪${pricePerKg}/kg</td>
                <td>
                    <span class="stock-amount" data-material-id="${material.id}">${stockAmount}</span>
                    <input type="number" class="stock-input" data-material-id="${material.id}"  step="0.01" value="" />
                    <button class="update-stock-btn" data-material-id="${material.id}">Update</button>
                </td>
                <td style="color: ${color};">${color}</td>
            `;
            materialTableBody.appendChild(row);
        });

        const updateStockButtons = document.querySelectorAll('.update-stock-btn');
        updateStockButtons.forEach(button => {
            button.addEventListener('click', () => {
                const materialId = button.dataset.materialId;
                const inputElement = document.querySelector(`.stock-input[data-material-id="${materialId}"]`);
                const change = parseFloat(inputElement.value);
                if (!isNaN(change)) {
                    updateStock(materialId, change, inputElement);
                } else {
                    formAlert("Please enter a valid number!", alertBox);
                }
            });
        });
    }

    async function updateStock(materialId, change, inputElement) {
        const stockElement = document.querySelector(`.stock-amount[data-material-id="${materialId}"]`);
        const currentStock = parseFloat(stockElement.textContent);
        const newStockAmount = currentStock + change;


        const roundedStockAmount = Math.max(newStockAmount, 0);
        if (newStockAmount < 0) {
            formAlert("Stock cannot be negative!", alertBox);
            return;
        }

        try {
            const response = await fetch(`/api/update-stock/${materialId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock_amount: change })
            });

            if (response.ok) {

                const formattedStockAmount = roundedStockAmount.toFixed(3);
                stockElement.textContent = formattedStockAmount;
                inputElement.value = '';

                formAlert("Stock updated successfully!", alertBox, "success");
            } else {
                const errorData = await response.json();
                formAlert(`Error: ${errorData.error}`, alertBox);
            }
        } catch (error) {
            formAlert(`Error: ${error.message}`, alertBox);
        }
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

    fetchMaterials();


    window.fetchMaterials = fetchMaterials;
});
