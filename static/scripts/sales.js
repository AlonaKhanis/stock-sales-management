document.addEventListener('DOMContentLoaded', function () {
    const filterModel = document.getElementById('filterModel');
    const filterMonth = document.getElementById('filterMonth');
    const filterYear = document.getElementById('filterYear');
    const alertBox = document.getElementById('alertBox');
    const saleTableBody = document.querySelector("#materialTable tbody");

    const totalCostElement = document.getElementById('total-cost');
    const totalSaleElement = document.getElementById('total-sale');
    const totalProfitElement = document.getElementById('total-profit');

    const editModal = document.getElementById('edit-btn');
    const deleteModel = document.getElementById('delete-btn');

    let sales = [];


    async function fetchSales() {
        try {
            const response = await fetch('/api/sales');
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data.sales)) {
                    sales = data.sales;
                    displaySales(sales);
                    updateTotals(sales);
                } else {
                    formAlert("Error: Sales data is not an array.", alertBox);
                }
            } else {
                const errorData = await response.json();
                formAlert(`Error: ${errorData.error}`, alertBox);
            }
        } catch (error) {
            formAlert(`Error: Could not fetch sales data`, alertBox, { ok: false });
        }
    }


    function displaySales(salesToDisplay) {
        saleTableBody.innerHTML = '';
        salesToDisplay.forEach(sale => {
            const row = document.createElement('tr');
            const saleDate = new Date(sale.print_date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const printTimeInMinutes = sale.print_time;
            let formattedPrintTime = '';

            if (printTimeInMinutes >= 60) {
                const hours = Math.floor(printTimeInMinutes / 60);
                const minutes = printTimeInMinutes % 60;
                formattedPrintTime = `${hours}h ${minutes}m`;
            } else {
                formattedPrintTime = `${printTimeInMinutes}m`;
            }

            row.innerHTML = `
                <td class="editable" data-id="${sale.id}">${sale.model_name}</td>
                <td class="editable" data-id="${sale.id}">${sale.customer_name}</td>
                <td class="editable" data-id="${sale.id}">${sale.material_cost}</td>
                <td class="editable" data-id="${sale.id}">${formatStockAmount(sale.total_use, true)}</td>
                <td class="editable" data-id="${sale.id}">${sale.selling_price}</td>
                <td class="editable" data-id="${sale.id}">${formattedPrintTime}</td>
                <td class="editable" data-id="${sale.id}">₪${sale.profit}</td>
                <td class="editable" data-id="${sale.id}">${saleDate}</td>
            `;

            saleTableBody.appendChild(row);
        });

        document.querySelectorAll('.editable').forEach(td => {
            td.addEventListener('click', handleTdClick);
        });
    }

    function handleTdClick(event) {
        const td = event.target;
        const saleId = td.dataset.id;


        document.getElementById('modal').dataset.id = saleId;
        document.getElementById('modal').style.display = 'flex';
    }


    function openEditModal() {
        const modal = document.getElementById('modal');
        const saleId = modal ? modal.dataset.id : null;

        if (!saleId) {
            console.error('Sale ID not found.');
            return;
        }

        const sale = sales.find(s => s.id == saleId);

        if (!sale) {
            console.error(`No sale found with ID: ${saleId}`);
            return;
        }

        const editModelInput = document.getElementById('editModel');
        const editCustomerInput = document.getElementById('editCustomer');
        const editPriceInput = document.getElementById('editPrice');
        const editDateInput = document.getElementById('editDate');

        if (!editModelInput || !editCustomerInput || !editPriceInput || !editDateInput) {
            console.error('Edit modal fields not found.');
            return;
        }

        const formattedDate = new Date(sale.print_date).toISOString().split('T')[0];


        editModelInput.value = sale.model_name;
        editCustomerInput.value = sale.customer_name;
        editPriceInput.value = sale.selling_price;
        editDateInput.value = formattedDate;

        const editModal = document.getElementById('editModal');
        if (editModal) {
            editModal.style.display = 'flex';
        } else {
            console.error('Edit modal not found.');
        }

        if (modal) {
            modal.style.display = 'none';
        }
    }


    function saveEditedSale() {
        const saleId = document.getElementById('modal').dataset.id;
        const sale = sales.find(s => s.id == saleId);


        const model_name = document.getElementById('editModel').value;
        const customer_name = document.getElementById('editCustomer').value;
        const selling_price = document.getElementById('editPrice').value;
        const selling_date = document.getElementById('editDate').value;

        const updatedData = {};

        if (model_name) updatedData.model_name = model_name;
        if (customer_name) updatedData.customer_name = customer_name;
        if (selling_price) updatedData.selling_price = selling_price;
        if (selling_date) updatedData.selling_date = selling_date;

        fetch(`/api/update_sale/${saleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    formAlert(`${sale.model_name} Update Succssesfuly!`, alertBox, { ok: true })
                    document.getElementById('editModal').style.display = 'none';

                } else {
                    formAlert('Error to Update', alertBox, { ok: false })
                }
            })
            .catch(error => {
                formAlert(`Error updating sale: ${error}`, alertBox, { ok: false });
            });
    }


    document.getElementById('saveEditBtn').addEventListener('click', saveEditedSale);

    function openDeleteModal() {
        const saleId = document.getElementById('modal').dataset.id;
        const modelName = document.getElementById('deleteNameModel');
        const sale = sales.find(s => s.id == saleId);
        document.getElementById('deleteModal').style.display = 'flex';
        document.getElementById('modal').style.display = 'none';
        modelName.textContent = `Are you sure you want to delete ${sale.model_name}?`
        document.getElementById('confirmDeleteBtn').onclick = async function () {
            await deleteSale(saleId);
        };
    }

    editModal.addEventListener('click', openEditModal);
    deleteModel.addEventListener('click', openDeleteModal);

    const modal = document.getElementById('modal');
    const closeModal = () => {
        modal.style.display = 'none';
    };

    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeModal();
        }

    });

    async function deleteSale(saleId) {
        const sale = sales.find(s => s.id == saleId);
        try {
            const response = await fetch(`/api/delete_sale/${saleId}`, { method: 'DELETE' });
            console.log(response);
            if (response.ok) {
                fetchSales();
                document.getElementById('deleteModal').style.display = 'none';
                formAlert(`${sale.model_name} was delete succssesful!`, alertBox, { ok: true })
            } else {
                const errorData = await response.json();
                formAlert(`Error: ${errorData.error}`, alertBox, { ok: false });
            }
        } catch (error) {
            formAlert('Error deleting sale', alertBox, { ok: false });
        }
    }

    function updateTotals(sales) {
        const totalCost = sales.reduce((total, sale) => total + sale.material_cost, 0);
        const totalSale = sales.reduce((total, sale) => total + sale.selling_price, 0);
        const totalProfit = sales.reduce((total, sale) => total + sale.profit, 0);

        totalCostElement.textContent = `₪${totalCost.toFixed(2)}`;
        totalSaleElement.textContent = `₪${totalSale.toFixed(2)}`;
        totalProfitElement.textContent = `₪${totalProfit.toFixed(2)}`;
    }



    generateMonthYearOptions();
    fetchSales();



    document.getElementById('filterModel').addEventListener('input', function () {
        filterSales();
    });

    document.getElementById('filterMonth').addEventListener('change', function () {
        filterSales();
    });

    document.getElementById('filterYear').addEventListener('change', function () {
        filterSales();
    });
    function filterSales() {
        const filterModelValue = document.getElementById('filterModel').value.toLowerCase();
        const selectedMonth = parseInt(document.getElementById('filterMonth').value);
        const selectedYear = parseInt(document.getElementById('filterYear').value);

        const adjustedSelectedMonth = selectedMonth + 1;


        const filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.print_date);
            const saleYear = saleDate.getUTCFullYear();
            const saleMonth = saleDate.getUTCMonth() + 1;

            const modelMatch = sale.model_name.toLowerCase().includes(filterModelValue);
            const yearMatch = isNaN(selectedYear) || saleYear === selectedYear;
            const monthMatch = adjustedSelectedMonth === -1 || saleMonth === adjustedSelectedMonth || isNaN(selectedMonth);

            return modelMatch && yearMatch && monthMatch;
        });

        displaySales(filteredSales);
        updateTotals(filteredSales);
    }

    document.getElementById('cancelEditBtn').addEventListener('click', function () {
        document.getElementById('editModal').style.display = 'none';
    });

    document.getElementById('cancelDeleteBtn').addEventListener('click', function () {
        document.getElementById('deleteModal').style.display = 'none';
    });

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            btn.closest('.modal').style.display = 'none';
        });
    });
});
