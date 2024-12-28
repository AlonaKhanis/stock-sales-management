'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const materialForm = document.getElementById('printForm');
    const materialContainer = document.getElementById('material-container');
    const addMaterialBtn = document.getElementById('add-material-btn');
    const firstMaterialUse = document.getElementById('material-usage');
    const materialNameDropdowns = document.querySelectorAll('.material-name');
    const colorDropdowns = document.querySelectorAll('.material-color');
    const spanCost = document.getElementById('material_cost');
    const spanTotalUse = document.getElementById('total_use');
    const alertBox = createAlertBox(materialForm);


    const availableMaterials = getAvailableMaterials();
    const availableColors = getAvailableColors();

    materialNameDropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', updateMaterialData);
    });
    colorDropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', updateMaterialData);
    });


    createSelectWithOptions(materialNameDropdowns, availableMaterials);
    createSelectWithOptions(colorDropdowns, availableColors);


    let materialsData = [];


    addMaterialBtn.addEventListener('click', addMaterialItem);
    firstMaterialUse.addEventListener('blur', updateMaterialData);
    materialForm.addEventListener('submit', handleFormSubmit);


    function addMaterialItem() {
        const materialItem = document.createElement('div');
        materialItem.classList.add('material-item');


        materialItem.innerHTML = `
            <label for="material_name">Material Name:</label>
            <select name="material_name[]" class="input-field material-name"></select>
            <label for="material_color">Material Color:</label>
            <select name="material_color[]" class="input-field material-color"></select>
            <label for="material_usage">Usage (grams):</label>
            <input type="text" name="material_usage[]" class="input-field material-usage" placeholder="Usage">
            <button type="button" class="remove-material-btn">-</button>
        `;


        const newMaterialNameDropdown = materialItem.querySelector('.material-name');
        const newColorDropdown = materialItem.querySelector('.material-color');

        createSelectWithOptions([newMaterialNameDropdown], availableMaterials);
        createSelectWithOptions([newColorDropdown], availableColors);


        materialItem.querySelector('.material-usage').addEventListener('blur', updateMaterialData);
        materialItem.querySelector('.remove-material-btn').addEventListener('click', () => {
            materialContainer.removeChild(materialItem);
            updateMaterialData();
        });

        materialContainer.appendChild(materialItem);

    }


    function updateMaterialData() {
        const usageInputs = document.querySelectorAll('.material-usage');
        const materialNameInputs = document.querySelectorAll('.material-name');
        const colorInputs = document.querySelectorAll('.material-color');


        materialsData = Array.from(usageInputs).map((usageInput, index) => {
            const materialName = materialNameInputs[index].value;
            const color = colorInputs[index].value;
            const usage = parseFloat(usageInput.value);

            return materialName && color && !isNaN(usage) && usage > 0
                ? { name: materialName, color, usage }
                : null;
        }).filter(Boolean);

        fetch('/api/calculate-material-costs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(materialsData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    spanCost.textContent = parseFloat(data.total_cost || 0).toFixed(2);
                    spanTotalUse.textContent = materialsData.reduce((acc, curr) => acc + curr.usage, 0).toFixed(2);
                } else {
                    formAlert(`Error: ${data.error}`, alertBox, { ok: false });
                }
            })
            .catch(error => formAlert(`Error: ${error}`, alertBox, { ok: false }));
    }

    function handleFormSubmit(event) {
        event.preventDefault();

        let hours = parseFloat(document.getElementById('print_time_hours').value) || 0;
        let minutes = parseFloat(document.getElementById('print_time_minutes').value) || 0;

        let totalTimeInMinutes = (hours * 60) + minutes;

        const data = {
            model_name: document.getElementById('model_name').value,
            customer_name: document.getElementById('customer_name').value,
            material_cost: document.getElementById('material_cost').textContent,
            total_use: document.getElementById('total_use').textContent,
            selling_price: document.getElementById('selling_price').value,
            print_time: totalTimeInMinutes,
            materialsData,
        };


        fetch('/api/add_print', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    materialForm.reset();
                    materialsData = [];
                    spanCost.textContent = "";
                    spanTotalUse.textContent = "";
                    formAlert('Print saved successfully!', alertBox, { ok: true });
                } else {
                    formAlert(`Error: ${data.message}`, alertBox, { ok: false });
                }
            })
            .catch(error => formAlert(`Error: ${error}`, alertBox, { ok: false }));
    }
});