'use strict';

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

            // Convert print_time to hours and minutes
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
                <td>${sale.model_name}</td>
                <td>${sale.customer_name}</td>
                <td>${sale.material_cost}</td>
                <td>${formatStockAmount(sale.total_use)}</td>
                <td>${sale.selling_price}</td>
                <td>${formattedPrintTime}</td> 
                <td>🪙${sale.profit}</td>
                <td>${saleDate}</td>
            `;

            saleTableBody.appendChild(row);
        });

    }


    function updateTotals(salesToCalculate) {
        const totalCost = salesToCalculate.reduce((sum, sale) => sum + parseFloat(sale.material_cost || 0), 0);
        const totalSelling = salesToCalculate.reduce((sum, sale) => sum + parseFloat(sale.selling_price || 0), 0);
        const totalProfit = salesToCalculate.reduce((sum, sale) => sum + parseFloat(sale.profit || 0), 0);

        totalCostElement.textContent = totalCost.toFixed(2);
        totalSaleElement.textContent = `${totalSelling}`;
        totalProfitElement.textContent = `🪙${totalProfit.toFixed(2)}`;
    }

    function filterSales() {

        if (!Array.isArray(sales)) return;

        const modelFilter = filterModel.value.toLowerCase();
        const monthFilter = parseInt(filterMonth.value, 10);
        const yearFilter = parseInt(filterYear.value, 10);

        const filteredSales = sales.filter(sale => {
            const modelMatch = sale.model_name && sale.model_name.toLowerCase().includes(modelFilter);

            let dateMatch = true;
            if (monthFilter >= 0 && yearFilter) {
                const saleDate = new Date(sale.print_date);
                dateMatch = saleDate.getFullYear() === yearFilter && saleDate.getMonth() === monthFilter;
            }

            return modelMatch && dateMatch;
        });

        displaySales(filteredSales);
        updateTotals(filteredSales);
    }

    filterModel.addEventListener('input', filterSales);
    filterMonth.addEventListener('change', filterSales);
    filterYear.addEventListener('change', filterSales);

    generateMonthYearOptions();
    fetchSales();
});
