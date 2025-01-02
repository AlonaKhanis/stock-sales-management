'use strict';

const availableMaterials = ['PLA', 'ABS', 'PETG', 'TPU'];


function getAvailableMaterials() {
    return availableMaterials;
}

function getAvailableColors() {
    return colors.map(color => color.name);
}

function createSelectWithOptions(selectElement, options, type = 'material') {
    selectElement.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.textContent = `Select ${type}`;
    selectElement.appendChild(defaultOption);

    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

function formAlert(message, alertBox, response) {
    alertBox.textContent = message;
    alertBox.style.display = 'block';
    alertBox.style.color = 'white';

    if (response && response.ok) {
        alertBox.style.backgroundColor = 'green';
    } else {
        alertBox.style.backgroundColor = 'red';
    }


    setTimeout(() => {
        alertBox.textContent = '';
        alertBox.style.display = 'none';
    }, 3000);
}


function createAlertBox(form) {
    const alertBox = document.createElement('div');
    alertBox.style.display = 'none';
    alertBox.style.padding = '10px';
    alertBox.style.marginTop = '10px';
    alertBox.style.borderRadius = '5px';
    // form.insertBefore(alertBox, document.getElementById('model_name_label'));
    return alertBox;
}



function createSelectWithOptions(dropdowns, options) {
    dropdowns.forEach(dropdown => {
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            dropdown.appendChild(opt);
        });
    });
}

function formatStockAmount(amount, isForSale = false) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Invalid amount';
    }
    if (isForSale) {
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(2)}kg`;
        }
        return `${amount.toFixed(0)}g`;
    }
    if (amount < 1) {
        return `${(amount * 1000).toFixed(2)}g`;
    }
    return `${amount.toFixed(2)}kg`;
}


let months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function generateMonthYearOptions() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;

    if (currentMonth === 11) {
        nextMonth = 0;
        nextYear += 1;
    }

    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        filterMonth.appendChild(option);
    });

    for (let year = currentYear; year <= nextYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        filterYear.appendChild(option);
    }
}





