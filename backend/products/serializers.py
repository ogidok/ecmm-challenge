from rest_framework import serializers
from decimal import Decimal
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ProductSerializer(serializers.ModelSerializer):
    # Campo de solo lectura para obtener el nombre de la categoría fácilmente en el frontend
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'price',
            'stock',
            'category',
            'category_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'name': {
                'error_messages': {
                    'blank': 'El nombre del producto no puede estar vacío.',
                    'required': 'El nombre del producto es obligatorio.',
                }
            },
            'price': {
                'error_messages': {
                    'required': 'El precio es obligatorio.',
                    'invalid': 'Ingresa un precio válido.',
                    'min_value': 'El precio debe ser mayor o igual a 0.00.',
                }
            },
            'stock': {
                'error_messages': {
                    'required': 'El stock es obligatorio.',
                    'invalid': 'Ingresa un número entero válido.',
                    'min_value': 'El stock debe ser un entero mayor o igual a 0.',
                }
            },
            'category': {
                'error_messages': {
                    'required': 'Debes seleccionar una categoría.',
                    'null': 'Debes seleccionar una categoría.',
                    'does_not_exist': 'La categoría seleccionada no existe.',
                    'incorrect_type': 'Identificador de categoría inválido.',
                }
            },
        }

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre del producto no puede estar vacío.")
        return value.strip()

    def validate_price(self, value):
        if value < Decimal('0.00'):
            raise serializers.ValidationError("El precio debe ser mayor o igual a 0.00.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock debe ser un entero mayor o igual a 0.")
        return value
