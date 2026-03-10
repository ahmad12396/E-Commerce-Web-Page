from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.category_list),
    path('products/', views.product_list),
    path('search/', views.search_by_image),
    path('products/<int:pk>/', views.product_detail),
    path('cart/', views.cart_detail),
    path('cart/add/', views.add_to_cart),
    path('cart/update/', views.update_cart),
    path('cart/remove/', views.remove_from_cart),
    path('order/create/', views.create_order),
]