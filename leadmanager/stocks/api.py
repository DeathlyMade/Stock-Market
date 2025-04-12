from rest_framework import viewsets, permissions, filters
from stocks.models import Stock, StockPrice
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import (
    StockSerializer, 
    StockPriceSerializer, 
)

# Read-only endpoint for Stock objects.
class StockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    
    search_fields = ['ticker']            # for ?search=ADANI
    filterset_fields = ['industry']       # for ?industry=Logistics (exact match)

# Read-only endpoint for StockPrice objects.
class StockPriceViewSet(viewsets.ReadOnlyModelViewSet):
    # permission_classes = [permissions.IsAuthenticated]
    queryset = StockPrice.objects.all()
    serializer_class = StockPriceSerializer
