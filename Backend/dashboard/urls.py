from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.AdminTokenObtainView.as_view(), name='admin_login'),
    path('stats/', views.admin_dashboard_stats, name='admin_stats'),
    path('categories/', views.admin_categories_list, name='admin_categories'),
    path('products/add/', views.admin_add_product, name='admin_add_product'),
    path('products/edit/<int:pk>/', views.admin_edit_product, name='admin_edit_product'),
    path('products/delete/<int:pk>/', views.admin_delete_product, name='admin_delete_product'),
    path('users/', views.admin_users_list, name='admin_users'),
    path('users/toggle-staff/<int:pk>/', views.admin_toggle_staff, name='admin_toggle_staff'),
    path('orders/all/', views.admin_orders_all, name='admin_orders_all'),
]