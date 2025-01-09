from flask import Blueprint, request, jsonify
from models.prints import Print
from models.materials import Material
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

print_bp = Blueprint('print_bp', __name__)

@print_bp.route('/add_print', methods=['POST'])
def create_print():
    try:
        data = request.get_json()


        materials_data = data.get('materialsData')  
        if not materials_data:
            return jsonify({'error': 'Missing materialsData'}), 400

        model_name = data.get('model_name')
        customer_name = data.get('customer_name')
        material_cost = data.get('material_cost')
        selling_price = data.get('selling_price')
        print_time = data.get('print_time')
        total_use = data.get('total_use')

        if not all([model_name, material_cost, selling_price, print_time, total_use]):
            return jsonify({'error': 'Missing required fields'}), 400

        for material in materials_data:
            material_name = material.get('name')
            material_color = material.get('color')
            material_usage = material.get('usage')

            if not all([material_name, material_color, material_usage]):
                return jsonify({'error': 'Incomplete material data'}), 400

            try:
                material_usage_value = float(material_usage) 
                
            except ValueError:
                return jsonify({'error': f'Invalid material usage value for {material_name}'}), 400

            material_entry = Material.query.filter_by(material_name=material_name, color=material_color).first()
            if not material_entry:
                return jsonify({'error': f'Material {material_name} with color {material_color} not found'}), 400

            material_usage_value_kg = material_usage_value / 1000.0

            if material_entry.stock_amount < material_usage_value_kg:
                return jsonify({'error': f'Not enough stock for material {material_name} with color {material_color}'}), 400

            material_entry.stock_amount -= material_usage_value_kg  
    

            print_date = datetime.now().date()

            profit = float(selling_price) - float(material_cost)

            new_print, message = Print.create(
                model_name=model_name,
                material_used=materials_data, 
                material_cost=material_cost,
                selling_price=selling_price,
                print_time=print_time,
                total_use=total_use,
                customer_name=customer_name,
                print_date=print_date, 
                profit=profit
            )

            if new_print:
                return jsonify({'status': 'ok', 'message': message}), 201
            else:
    
                return jsonify({'status': 'error', 'message': message}), 500

    except SQLAlchemyError as e:

        return jsonify({'error': 'Database error: ' + str(e)}), 500
    except Exception as e:

        return jsonify({'error': str(e)}), 500


@print_bp.route('/sales', methods=['GET'])
def get_sales():
    try:
        data = Print.get_all()
        serialized_data = [item.to_dict() for item in data]
        return jsonify({"sales": serialized_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@print_bp.route('/delete_sale/<int:saleId>', methods=['DELETE'])
def delete_sale(saleId):
    try:
        response, status_code = Print.delete_print(saleId)
        return response, status_code

    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}"}, 500


@print_bp.route('/update_sale/<int:sale_id>', methods=['PUT'])
def update_sale(sale_id):
    try:
        data = request.get_json()
      
        response , status_code = Print.update_sale(
            sale_id,
            model_name=data.get('model_name'),
            customer_name=data.get('customer_name'),
            selling_price=data.get('selling_price'),
            selling_date=data.get('selling_date')
        )

        return response, status_code

    except Exception as e:
        print(str(e))
        return jsonify({'message': 'An error occurred while updating the sale.'}), 500
