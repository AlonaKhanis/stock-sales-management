# Stock and Sales Management System
A browser-based application for managing stock, sales, and profit calculations. The system includes a locally-hosted backend powered by Python, packaged as a standalone executable (app.exe). This hybrid approach combines the accessibility of a browser interface with the simplicity of a desktop-like experience.

## Features
Stock Management:

- Add materials with details like name, color, stock amount, and price per kilogram.
- View and print the stock table with dynamic updates.

Sales Management:

- Record sales transactions, including sold material, quantity, and price.
Calculate profits based on material costs and sale prices.
Dynamic Reporting:

- View the total cost of materials.
See sales profits and compare against stock costs.
Real-Time Updates:

- Stock levels update dynamically based on sales.
Automatically formatted display for stock quantities (e.g., grams for values below 1kg).

## How to Get Started
Prerequisites
Python Installation (Optional):
If you wish to modify or run the backend Python script instead of the precompiled app.exe, ensure you have Python 3.8+ installed.

Clone the Repository:

```bash
git clone https://github.com/AlonaKhanis/stock-sales-management
cd stock-sales-management
```
Install Required Python Libraries (Optional):
If you're running the backend script (app.py):

```bash
pip install -r requirements.txt
```
## How to Run
**Option 1: Using app.exe (Recommended)**

Start the Backend:

Locate the app.exe file in the project folder.
Double-click app.exe to start the backend server.
You should see a console window indicating that the server is running.

**Option 2: Using the Python Script**

1. Navigate to the Project Directory:
Navigate to the /backend folder in your terminal:
```bash
cd stock-sales-management/backend
```
2. Run the Backend:
Start the server with the following command:
```bash
python app.py
```
The backend server will start running on http://127.0.0.1:5000.



