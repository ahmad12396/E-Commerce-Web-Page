from rest_framework import serializers
from .models import Cart, CartItem, Category, Product




class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = Product
        # Include 'embedding' if you need it for debugging, 
        # though usually, the frontend only needs the product details.
        fields = ['id', 'name', 'price', 'stock', 'category_name', 'image', 'embedding']
        extra_kwargs = {
            'embedding': {'write_only': True}  # Hide embedding from standard GET responses if preferred
        }
    
class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    image = serializers.ImageField(source='product.image', read_only=True)
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'image', 'subtotal']

class CartSerializer(serializers.ModelSerializer):
    cart_items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'cart_items', 'total']
        


