document.addEventListener('DOMContentLoaded', () => {
    const availableMaterials = getAvailableMaterials();


    const addStockBtn = document.getElementById('addToStock');
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.style.display = 'none';


    const formContainer = document.createElement('form');
    formContainer.classList.add('add_container');
    formContainer.innerHTML = `
        <div class="modal-content">
        <label for="material_name">Material Name</label>
        <select id="material_name" name="material_name" class="input-field"></select>
        <label for="stock_amount">Stock Amount</label>
        <input type="number" id="stock_amount" name="stock_amount" class="input-field" step="any">
        <label for="color">Color</label>
        <select id="color" name="color" class="input-field"></select>
        <label for="price_per_kg">Price per Kg</label>
        <input type="number" id="price_per_kg" name="price_per_kg" class="input-field" step="any" value="90">
        <button type="submit" class="submit-btn">Add Material</button>
        </div>
    `;


    modal.appendChild(formContainer);
    document.body.appendChild(modal);

    const alertBox = createAlertBox(formContainer);
    formContainer.insertBefore(alertBox, formContainer.firstChild);


    const materialNameDropdown = formContainer.querySelector('#material_name');
    availableMaterials.forEach(material => {
        const option = document.createElement('option');
        option.value = material;
        option.textContent = material;
        materialNameDropdown.appendChild(option);
    });

    const colorDropdown = formContainer.querySelector('#color');
    getAvailableColors().forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = color;
        colorDropdown.appendChild(option);
    });

    addStockBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    formContainer.addEventListener('submit', async (event) => {
        event.preventDefault();
        const materialData = {
            material_name: materialNameDropdown.value,
            stock_amount: formContainer.querySelector('#stock_amount').value,
            color: colorDropdown.value,
            price_per_kg: formContainer.querySelector('#price_per_kg').value,
        };

        try {
            const response = await fetch('/api/add_material', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(materialData),
            });

            if (response.ok) {
                formContainer.reset();
                modal.style.display = 'none';
                formAlert('Material added successfully!', alertBox, { ok: true });

                // Fetch and update the material list
                if (typeof window.fetchMaterials === 'function') {
                    window.fetchMaterials();
                }
            } else {
                const errorData = await response.json();
                formAlert(`Error: ${errorData.error}`, alertBox, { ok: false });
            }
        } catch (error) {
            formAlert(`Error: ${error.message}`, alertBox, { ok: false });
        }
    });


    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});
