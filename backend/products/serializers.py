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

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("El nombre del producto no puede estar vacío.")
        return value.strip()

    def validate_price(self, value):
        if value < Decimal('0.00'):
            raise serializers.ValidationError("El precio debe ser mayor o igual a cero.")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock debe ser un entero mayor o igual a cero.")
        return value
