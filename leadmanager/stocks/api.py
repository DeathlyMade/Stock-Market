from rest_framework import viewsets, permissions
from stocks.models import Stock, StockPrice
from .serializers import (
    StockSerializer, 
    StockPriceSerializer, 
)

# Read-only endpoint for Stock objects.
class StockViewSet(viewsets.ReadOnlyModelViewSet):
    # permission_classes = [permissions.IsAuthenticated]

    queryset = Stock.objects.all()
    serializer_class = StockSerializer

# Read-only endpoint for StockPrice objects.
class StockPriceViewSet(viewsets.ReadOnlyModelViewSet):
    # permission_classes = [permissions.IsAuthenticated]
    queryset = StockPrice.objects.all()
    serializer_class = StockPriceSerializer
