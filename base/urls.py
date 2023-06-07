from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('webmap', views.webmap, name='webmap'),
    path('tax-assessment', views.tax_assessment, name='tax_assessment'),
    path('login', views.login, name='login'),
    path('notify/ptin/<str:year>/<str:code>', views.notify, name='notify'),
    path('tax-assessment/ptin/<str:year>/<str:code>', views.property_detail, name='property_detail'),
]