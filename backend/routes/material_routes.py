from flask import Blueprint, request, jsonify
from models.materials import Material
import logging

logger = logging.getLogger(__name__)


material_bp = Blueprint('material_bp', __name__)

@material_bp.route('/add_material', methods=['POST'])
def create_material():
    data = request.get_json()
    material_name = data.get('material_name')
    stock_amount = data.get('stock_amount')
    color = data.get('color')
    price_per_kg = data.get('price_per_kg')

    if not all([material_name, stock_amount, color, price_per_kg]):
        return jsonify({'error': 'Missing data'}), 400

    try:
        existing_material = Material.get_by_name_and_color(material_name, color)
        if existing_material:
            
            existing_material.stock_amount += float(stock_amount)
            existing_material.price_per_kg = float(price_per_kg)
            existing_material.save()
            message = f"Stock updated for material '{material_name}' with color '{color}'."
        else:
            
            Material.add(material_name, stock_amount, color, price_per_kg)
            message = "Material created successfully."

        return jsonify({'message': message}), 201
    except Exception as e:
        logger.error(f"Error in create_material: {e}")
        return jsonify({'error': str(e)}), 500


@material_bp.route('/materials', methods=['GET'])
def get_materials():
    try:
        materials = Material.get_all()
        return jsonify([material.to_dict() for material in materials]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@material_bp.route('/calculate-material-costs', methods=['POST'])
def calculate_material_costs():

    try:
        materials_data = request.get_json() 
        total_cost = 0
        for material in materials_data:
            material_name = material['name']
            color = material['color']
            usage_grams = material['usage']

            material_price_per_kg  = Material.get_price_per_kg(material_name, color)
    

            if not material_price_per_kg:
                return jsonify({'error': f'Material {material_name} with color {color} not found'}), 400

            price_per_kg = material_price_per_kg  
            cost = (usage_grams / 1000) * price_per_kg 
            total_cost += cost
        
 
        return jsonify({'success': True, 'total_cost': total_cost}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@material_bp.route('/update-stock/<int:stock_id>', methods=['PUT'])
def update_stock(stock_id):
    try:
        data = request.get_json()
        stock_amount = data.get('stock_amount')
        response , status_code = Material.update_stock(stock_id , stock_amount)

        return response , status_code
    except Exception as e:
        print(str(e))
        return jsonify({'message': 'An error occurred while updating the stock.'}), 500
