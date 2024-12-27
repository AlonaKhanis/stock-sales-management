document.addEventListener('DOMContentLoaded', function () {
    const filterModel = document.getElementById('filterModel');
    const filterMonth = document.getElementById('filterMonth');
    const filterYear = document.getElementById('filterYear');
    const alertBox = document.getElementById('alertBox');
    const saleTableBody = document.querySelector("#materialTable tbody");

    const totalCostElement = document.getElementById('total-cost');
    const totalSaleElement = document.getElementById('total-sale');
    const totalProfitElement = document.getElementById('total-profit');

    let sales = [];
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

    function formatStockAmount(amount) {
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(2)}kg`;
        }
        return `${amount.toFixed(0)}g`;
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
                <td class="editable" data-id="${sale.id}">${formatStockAmount(sale.total_use)}</td>
                <td class="editable" data-id="${sale.id}">${sale.selling_price}</td>
                <td class="editable" data-id="${sale.id}">${formattedPrintTime}</td>
                <td class="editable" data-id="${sale.id}">🪙${sale.profit}</td>
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
        console.log(saleId);

        document.getElementById('modal').dataset.id = saleId;
        document.getElementById('modal').style.display = 'flex';
    }

    function openEditModal() {
        const saleId = document.getElementById('modal').dataset.id;
        const sale = sales.find(s => s.id == saleId);

        document.getElementById('editModel').value = sale.model_name;
        document.getElementById('editCustomer').value = sale.customer_name;
        document.getElementById('editPrice').value = sale.selling_price;

        document.getElementById('editModal').style.display = 'flex';
        document.getElementById('modal').style.display = 'none';
    }

    function openDeleteModal() {
        const saleId = document.getElementById('modal').dataset.id;
        document.getElementById('deleteModal').style.display = 'flex';
        document.getElementById('modal').style.display = 'none';

        document.getElementById('confirmDeleteBtn').onclick = async function () {
            await deleteSale(saleId);
        };
    }

    async function deleteSale(saleId) {
        try {
            const response = await fetch(`/api/sales/${saleId}`, { method: 'DELETE' });

            if (response.ok) {
                fetchSales();
                document.getElementById('deleteModal').style.display = 'none';
            } else {
                const errorData = await response.json();
                formAlert(`Error: ${errorData.error}`, alertBox);
            }
        } catch (error) {
            formAlert('Error deleting sale', alertBox, { ok: false });
        }
    }

    function updateTotals(sales) {
        const totalCost = sales.reduce((total, sale) => total + sale.material_cost, 0);
        const totalSale = sales.reduce((total, sale) => total + sale.selling_price, 0);
        const totalProfit = sales.reduce((total, sale) => total + sale.profit, 0);

        totalCostElement.textContent = `€${totalCost.toFixed(2)}`;
        totalSaleElement.textContent = `€${totalSale.toFixed(2)}`;
        totalProfitElement.textContent = `€${totalProfit.toFixed(2)}`;
    }

    function formAlert(message, alertBox, { ok = true } = {}) {
        alertBox.innerHTML = `<div class="alert ${ok ? 'success' : 'error'}">${message}</div>`;
    }

    // Initial setup
    generateMonthYearOptions();
    fetchSales();

    document.getElementById('filterModel').addEventListener('input', function () {
        const filteredSales = sales.filter(sale => sale.model_name.toLowerCase().includes(filterModel.value.toLowerCase()));
        displaySales(filteredSales);
        updateTotals(filteredSales);
    });

    document.getElementById('filterMonth').addEventListener('change', function () {
        const filteredSales = sales.filter(sale => new Date(sale.print_date).getMonth() === parseInt(filterMonth.value));
        displaySales(filteredSales);
        updateTotals(filteredSales);
    });

    document.getElementById('filterYear').addEventListener('change', function () {
        const filteredSales = sales.filter(sale => new Date(sale.print_date).getFullYear() === parseInt(filterYear.value));
        displaySales(filteredSales);
        updateTotals(filteredSales);
    });

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
