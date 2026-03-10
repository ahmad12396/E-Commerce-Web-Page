from rest_framework import status
from rest_framework.decorators import api_view, permission_classes,parser_classes
from django.db import transaction
from rest_framework.response import Response
from .models import Category, Product, Cart, CartItem, Order, OrderItem
from .serializers import CategorySerializer, ProductSerializer, CartSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Product
from pgvector.django import CosineDistance
from rest_framework.parsers import MultiPartParser, FormParser
from sentence_transformers import SentenceTransformer
from .utils import get_image_vector

# --- PUBLIC VIEWS ---

@api_view(['GET'])
@permission_classes([AllowAny])
def category_list(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)


# --- PRIVATE VIEWS (Requires JWT) ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_detail(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    if not product_id:
        return Response({'error': 'Product ID is required'}, status=400)

    try:
        product = Product.objects.get(id=product_id)
        
        # Check if product is even in stock at all
        if product.stock < 1:
            return Response({'error': 'Product is out of stock'}, status=400)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product,
            defaults={'quantity': 1}
        )

        if not created:
            # Check if adding one more exceeds stock
            if cart_item.quantity + 1 > product.stock:
                return Response({'error': f'Cannot add more. Only {product.stock} in stock.'}, status=400)
            cart_item.quantity += 1
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response({'message': 'Added to cart', 'cart': serializer.data})
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request):  
    product_id = request.data.get('product_id')
    CartItem.objects.filter(cart__user=request.user, product_id=product_id).delete()
    return Response({'message': 'Product removed from cart'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart(request):
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity'))
    
    try:
        cart_item = CartItem.objects.get(cart__user=request.user, product_id=product_id)
        if quantity > 0:
            # Prevent updating cart to a quantity higher than stock
            if quantity > cart_item.product.stock:
                return Response({'error': f'Only {cart_item.product.stock} items available'}, status=400)
            
            cart_item.quantity = quantity
            cart_item.save()
            return Response({'message': 'Quantity updated'})
        else:
            cart_item.delete()
            return Response({'message': 'Item removed'})
    except CartItem.DoesNotExist:
        return Response({'error': 'Item not found in cart'}, status=404)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        name = request.data.get('name')
        address = request.data.get('address')
        phone = request.data.get('phone')
        print(f"DEBUG: Creating order for {name}")

        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=400)

        with transaction.atomic():
            items = cart.cart_items.all()
            total_price = sum(item.product.price * item.quantity for item in items)
            print(f"DEBUG: Total calculated: {total_price}")

            order = Order.objects.create(
                user=request.user, 
                full_name=name,
                address=address,
                phone=phone,
                total_price=total_price,
            )
            print(f"DEBUG: Order created with ID: {order.id}")

            for item in items:
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.product.price 
                )
                print(f"DEBUG: Linked product {item.product.name} to order")
                
                product = item.product
                product.stock -= item.quantity
                product.save()
            
            items.delete() 

        return Response({'message': 'Order created', 'order_id': order.id}, status=201)
    except Exception as e:
        print(f"ERROR OCCURRED: {str(e)}") 
        return Response({'error': str(e)}, status=500)
    


# store/views.py
model = SentenceTransformer('clip-ViT-B-32')


@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def search_by_image(request):
    image_file = request.FILES.get("search_image")
    if not image_file:
        return Response({"error": "No image provided"}, status=400)

    try:
        # 1. Generate the CLIP vector
        query_vector = get_image_vector(image_file)
        
        # 2. EXACT MATCH FILTERING
        # 0.20 is very strict. It will block anything that isn't almost identical.
        results = Product.objects.annotate(
            distance=CosineDistance("embedding", query_vector)
        ).filter(distance__lte=0.20).order_by("distance")

        # 3. Return results
        if not results.exists():
            # If distance is > 0.20, we return nothing to ensure "Exact Only"
            return Response([], status=200)

        serializer = ProductSerializer(results, many=True, context={'request': request})
        return Response(serializer.data)

    except Exception as e:
        print(f"Internal Search Error: {e}")
        return Response({"error": "Search failed"}, status=500)