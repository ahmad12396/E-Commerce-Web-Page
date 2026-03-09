import logging
from django.db import transaction
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView

from store.models import Category, Product, Order
from .serializers import AdminTokenSerializer, AdminProductDetailSerializer,AdminOrderListSerializer

logger = logging.getLogger(__name__)

class AdminTokenObtainView(TokenObtainPairView):
    """Custom JWT View to ensure only staff can generate tokens."""
    serializer_class = AdminTokenSerializer


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    """
    Returns aggregated business metrics for the dashboard.
    Optimized with single-pass aggregation where possible.
    """
    try:
        revenue_data = Order.objects.aggregate(total=Sum('total_price'))
        total_revenue = revenue_data.get('total') or 0
        
        context = {
            "stats": [
                {"label": "Revenue", "value": f"${total_revenue:,.2f}", "color": "text-green-600"},
                {"label": "Total Orders", "value": Order.objects.count(), "color": "text-blue-600"},
                {"label": "Products", "value": Product.objects.count(), "color": "text-purple-600"},
                {"label": "Customers", "value": User.objects.count(), "color": "text-orange-600"},
            ],
            # Use select_related or prefetch_related if Category had complex relations
            "categories": Category.objects.annotate(p_count=Count('product')).values('name', 'p_count'),
            "recent_orders": [
                {
                    "id": o.id,
                    "customer": getattr(o, 'full_name', 'Anonymous'),
                    "total": float(o.total_price),
                    "status": getattr(o, 'status', 'Pending'),
                    "date": o.created_at.strftime("%Y-%m-%d")
                } for o in Order.objects.all().order_by('-created_at')[:5]
            ]
        }
        return Response(context, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Dashboard Stats Error: {str(e)}", exc_info=True)
        return Response({"error": "Failed to fetch dashboard metrics."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_categories_list(request):
    """Simple helper for populating admin dropdowns."""
    categories = Category.objects.all().values('id', 'name')
    return Response(list(categories), status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
@transaction.atomic  
def admin_add_product(request):
    """Creates a new product with image support."""
    serializer = AdminProductDetailSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def admin_edit_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)
    serializer = AdminProductDetailSerializer(product, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        print(serializer.errors)
        return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_product(request, pk):
    """Permanently removes a product from inventory."""
    try:
        product = Product.objects.get(pk=pk)
        product_id = product.id 
        product.delete()
        return Response({"message": f"Product {product_id} deleted successfully."}, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
    
    
    
    

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_list(request):
    """
    Returns a list of all users.
    Includes search functionality for username or email.
    """
    search_query = request.query_params.get('search', '')
    users = User.objects.filter(
        Q(username__icontains=search_query) | Q(email__icontains=search_query)
    ).order_by('-date_joined')

    data = [{
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "is_staff": u.is_staff,
        "is_active": u.is_active,
        "date_joined": u.date_joined.strftime("%b %d, %Y"),
        "order_count": u.order_set.count() 
    } for u in users]
    
    return Response(data, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_toggle_staff(request, pk):
    """Allows an admin to promote/demote other users to staff status."""
    try:
        user = User.objects.get(pk=pk)
        if user.is_superuser:
            return Response({"error": "Cannot modify superuser status"}, status=403)
            
        user.is_staff = not user.is_staff
        user.save()
        return Response({"message": f"User staff status updated to {user.is_staff}"})
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_orders_all(request):
    try:
        orders = Order.objects.all().order_by('-created_at')
        serializer = AdminOrderListSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=500)