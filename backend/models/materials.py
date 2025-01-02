from flask_sqlalchemy import SQLAlchemy
from . import db
import logging

logger = logging.getLogger(__name__)

class Material(db.Model):
    __tablename__ = 'materials'

    id = db.Column(db.Integer, primary_key=True)
    material_name = db.Column(db.String(100), nullable=False)
    stock_amount = db.Column(db.Float, nullable=False)
    color = db.Column(db.String(50), nullable=False)
    price_per_kg = db.Column(db.Float, nullable=False)

    def __init__(self, material_name, stock_amount, color, price_per_kg):
        self.material_name = material_name
        self.stock_amount = stock_amount
        self.color = color
        self.price_per_kg = price_per_kg

    @classmethod
    def add(cls, material_name, stock_amount, color, price_per_kg):
        """Add a new material to the database."""
        try:
            new_material = cls(material_name, stock_amount, color, price_per_kg)
            db.session.add(new_material)
            db.session.commit()
        except Exception as e:
            logger.error(f"Error adding material: {e}")
            raise

    @classmethod
    def get_all(cls):
        """Retrieve all materials."""
        return cls.query.all()
    
    @classmethod
    def get_by_name_and_color(cls, material_name, color):
        """Retrieve material by name and color."""
        try:
            return cls.query.filter_by(material_name=material_name, color=color).first()
        except Exception as e:
            logger.error(f"Error querying material: {e}")
            return None

    def reduce_stock(self, amount_used):
        """Reduce stock amount after usage."""
        if self.stock_amount >= amount_used:
            self.stock_amount -= amount_used
            db.session.commit()
            return True
        logger.warning(f"Insufficient stock for {self.material_name} ({self.color}).")
        return False

    def to_dict(self):
        """Convert material object to dictionary."""
        return {
            'id': self.id,
            'material_name': self.material_name,
            'stock_amount': self.stock_amount,
            'color': self.color,
            'price_per_kg': self.price_per_kg
        }
    

    @classmethod
    def get_price_per_kg(cls, material_name, color):
        try:
        
            material = cls.query.filter_by(material_name=material_name, color=color).first()

            if material:
                return material.price_per_kg 
            else:
                print(f"No material found for {material_name} with color {color}")
                return None
        except Exception as e:
            print(f"Error querying material: {e}")
            return None


    def save(self):
        """Commit changes to the database."""
        db.session.commit()

    @classmethod
    def update_stock(cls, stock_id, stock_change):
        try:
            # Ensure stock_change is a float
            stock_change = float(stock_change)  # Convert the stock change to a float
            print(stock_change)
            
            stock = cls.query.get(stock_id)
            if stock:
                new_stock_amount = stock.stock_amount + stock_change  # Add the float change to the current stock
                if new_stock_amount < 0:
                    return {"error": "Stock amount cannot be negative"}, 400

                stock.stock_amount = new_stock_amount  # Update the stock amount in the database
                db.session.commit()
                return {"message": "Stock updated successfully", "new_stock_amount": new_stock_amount}, 200
            else:
                return {"error": "Stock not found"}, 404
        except Exception as e:
            db.session.rollback()
            return {"error": f"An error occurred: {str(e)}"}, 500

