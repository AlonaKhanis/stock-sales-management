const availableColors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White'];
const availableMaterials = ['PLA', 'ABS', 'PETG', 'TPU'];


//TODO: interactive color and material selection
// TODO: Change succsses message color to green

function getAvailableColors() {
    return availableColors;
}

function getAvailableMaterials() {
    return availableMaterials;
}

function createSelectWithOptions(selectElement, options) {
    selectElement.forEach(selectElement => {
        options.forEach(material => {
            const option = document.createElement('option');
            option.value = material;
            option.textContent = material;
            selectElement.appendChild(option);
        });
    });
}


function formAlert(message, alertBox, response) {
    // Set message text and make alert box visible
    alertBox.textContent = message;
    alertBox.style.display = 'block';
    alertBox.style.color = 'white'; // Assuming white text color for both success and error

    // Check if response is valid and has the 'ok' property
    if (response && response.ok) {
        console.log('Setting background to green for success');
        alertBox.style.backgroundColor = 'green';
    } else {
        console.log('Setting background to red for error');
        alertBox.style.backgroundColor = 'red';
    }

    // Hide alert box after 2 seconds
    setTimeout(() => {
        alertBox.textContent = ''; // Clear message
        alertBox.style.display = 'none'; // Hide alert box
    }, 2000);
}
