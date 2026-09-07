from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from decimal import Decimal
from .models import Category, Product


class ProductAPITests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Electrónica')
        self.products_url = reverse('product-list')

    # Requisito: Test 1: Creación correcta de un producto
    def test_create_product_success(self):
        """
        Verifica la creación exitosa de un producto con datos válidos:
        - Retorna HTTP 201 Created.
        - El producto se almacena en la base de datos con los datos suministrados.
        - Retorna la representación correcta incluyendo category_name.
        """
        payload = {
            'name': 'Laptop ThinkPad',
            'description': 'Laptop para desarrollo',
            'price': '1250.99',
            'stock': 15,
            'category': self.category.id
        }

        response = self.client.post(self.products_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 1)

        product = Product.objects.get()
        self.assertEqual(product.name, 'Laptop ThinkPad')
        self.assertEqual(product.description, 'Laptop para desarrollo')
        self.assertEqual(product.price, Decimal('1250.99'))
        self.assertEqual(product.stock, 15)
        self.assertEqual(product.category, self.category)
        self.assertEqual(response.data['category_name'], 'Electrónica')

    # Requisito: Test 2: Rechazo de datos inválidos
    def test_create_product_invalid_data_rejected(self):
        """
        Verifica el rechazo de datos inválidos:
        - Precio negativo
        - Stock negativo
        - Categoría inexistente
        - Nombre vacío / faltante
        - Todos deben devolver HTTP 400 Bad Request con mensaje comprensible.
        """
        # Caso A: Precio negativo
        res_price = self.client.post(self.products_url, {
            'name': 'Mouse',
            'price': '-10.00',
            'stock': 5,
            'category': self.category.id
        }, format='json')
        self.assertEqual(res_price.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('price', res_price.data)

        # Caso B: Stock negativo
        res_stock = self.client.post(self.products_url, {
            'name': 'Mouse',
            'price': '10.00',
            'stock': -1,
            'category': self.category.id
        }, format='json')
        self.assertEqual(res_stock.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('stock', res_stock.data)

        # Caso C: Categoría inexistente
        res_cat = self.client.post(self.products_url, {
            'name': 'Mouse',
            'price': '10.00',
            'stock': 5,
            'category': 99999
        }, format='json')
        self.assertEqual(res_cat.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('category', res_cat.data)

        # Caso D: Nombre vacío
        res_name = self.client.post(self.products_url, {
            'name': '   ',
            'price': '10.00',
            'stock': 5,
            'category': self.category.id
        }, format='json')
        self.assertEqual(res_name.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', res_name.data)

        # Caso E: Campos obligatorios faltantes
        res_missing = self.client.post(self.products_url, {}, format='json')
        self.assertEqual(res_missing.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', res_missing.data)
        self.assertIn('price', res_missing.data)
        self.assertIn('stock', res_missing.data)
        self.assertIn('category', res_missing.data)

        # Confirmar que no se creó ningún producto en BD
        self.assertEqual(Product.objects.count(), 0)

    def test_filter_by_category_and_search_by_name(self):
        """
        Pruebas adicionales para filtrar por categoría y buscar por nombre.
        """
        cat_hogar = Category.objects.create(name='Hogar')
        p1 = Product.objects.create(name='Monitor Samsung', price=200, stock=5, category=self.category)
        p2 = Product.objects.create(name='Cafetera Express', price=80, stock=2, category=cat_hogar)

        # Filtrar por categoría
        res_filter = self.client.get(f'{self.products_url}?category={self.category.id}')
        self.assertEqual(res_filter.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_filter.data), 1)
        self.assertEqual(res_filter.data[0]['name'], 'Monitor Samsung')

        # Buscar por nombre
        res_search = self.client.get(f'{self.products_url}?search=Cafetera')
        self.assertEqual(res_search.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_search.data), 1)
        self.assertEqual(res_search.data[0]['name'], 'Cafetera Express')
