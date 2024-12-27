
from . import db
from sqlalchemy.exc import SQLAlchemyError



from datetime import date

class Print(db.Model):
    __tablename__ = 'prints'

    id = db.Column(db.Integer, primary_key=True)
    model_name = db.Column(db.String(100), nullable=False)
    material_used = db.Column(db.JSON, nullable=False)
    material_cost = db.Column(db.Float, nullable=False)
    selling_price = db.Column(db.Float, nullable=False)
    print_time = db.Column(db.Float, nullable=False)
    total_use = db.Column(db.Integer, nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    print_date = db.Column(db.Date, nullable=False) 
    profit = db.Column(db.Float, nullable=False)

    def __init__(self, model_name, material_used, material_cost, selling_price, print_time, total_use, customer_name, print_date, profit):
        self.model_name = model_name
        self.material_used = material_used
        self.material_cost = material_cost
        self.selling_price = selling_price
        self.print_time = print_time
        self.total_use = total_use
        self.customer_name = customer_name
        self.print_date = print_date
        self.profit = profit

    @staticmethod
    def convert_print_time(print_time_input):
        try:
            print_time = float(print_time_input)
            if print_time.is_integer():
                return int(print_time)
            else:
                return int(print_time * 60)
        except ValueError:
            print("Invalid input for print time.")
            return None

    @classmethod
    def create(cls, model_name, material_used, material_cost, selling_price, print_time, total_use, customer_name, print_date, profit):
        try:

            print_time_in_minutes = cls.convert_print_time(print_time)

            if print_time_in_minutes is None:
                print("Error: Invalid print time input.")
                return None, "Invalid print time input."

            if isinstance(print_date, str):
                print_date = date.fromisoformat(print_date) 

            new_print = cls(
                model_name=model_name,
                material_used=material_used,
                material_cost=material_cost,
                selling_price=selling_price,
                print_time=print_time_in_minutes,
                total_use=total_use,
                customer_name=customer_name,
                print_date=print_date,
                profit=profit
            )
            
            db.session.add(new_print)
            db.session.commit()

            return new_print, 'Print created successfully.'

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Error occurred while saving to database: {str(e)}")
            return None, 'Database error: ' + str(e)
        except Exception as e:
            db.session.rollback()
            print(f"An unexpected error occurred: {str(e)}")
            return None, 'An unexpected error occurred: ' + str(e)


    @classmethod
    def get_all(cls):
        return cls.query.all()

    def to_dict(self):
        return {
            'id': self.id,
            'model_name': self.model_name,
            'material_used': self.material_used,
            'material_cost': self.material_cost,
            'selling_price': self.selling_price,
            'print_time': self.print_time,
            'total_use': self.total_use,
            'customer_name': self.customer_name,
            'print_date': self.print_date,
            'profit': self.profit
        }
