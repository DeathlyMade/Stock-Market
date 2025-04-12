from stocks.models import Stock, StockPrice, Portfolio, Watchlist, PortfolioStock
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import (
    StockSerializer, 
    StockPriceSerializer, 
    StockSerializerBasic,
    PortfolioSerializer, 
    WatchlistSerializer,
    NestedStockSerializer,
    PortfolioStockSerializer
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

# Read-only endpoint for Stock objects.
class StockViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    
    search_fields = ['ticker']            # for ?search=ADANI
    filterset_fields = ['industry']       # for ?industry=Logistics (exact match)


    def get_serializer_class(self):
        if self.request.query_params.get('with_prices') == 'true':
            return StockSerializer
        return StockSerializerBasic


# Read-only endpoint for StockPrice objects.
class StockPriceViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = StockPrice.objects.all()
    serializer_class = StockPriceSerializer

# CRUD endpoint for Portfolio objects.

class PortfolioViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PortfolioSerializer

    def get_queryset(self):
        return Portfolio.objects.filter(owner=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    # Custom action to add, retrieve, or delete a stock on a portfolio.
    # URL: /api/portfolios/<portfolio_pk>/<stock_param>/
    # When POST: interprets stock_param as the Stock's primary key to add.
    # When GET or DELETE: interprets stock_param as a 1-indexed position in the portfolio.
    @action(detail=True, methods=['get', 'post', 'delete'], url_path=r'(?P<stock_param>\d+)')
    def stock(self, request, pk=None, stock_param=None):
        portfolio = self.get_object()
        
        if request.method.lower() == 'post':
            # Interpret stock_param as the Stock's primary key.
            try:
                stock_pk = int(stock_param)
                stock = Stock.objects.get(pk=stock_pk)
            except (ValueError, Stock.DoesNotExist):
                return Response({'detail': 'Stock not found'}, status=status.HTTP_404_NOT_FOUND)
            
            buy_price = request.data.get("buy_price")
            shares = request.data.get("shares")
            if buy_price is None or shares is None:
                return Response({'detail': 'buy_price and shares are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                buy_price = float(buy_price)
                shares = float(shares)
            except ValueError:
                return Response({'detail': 'Invalid buy_price or shares format.'}, status=status.HTTP_400_BAD_REQUEST)
            
            ps, created = PortfolioStock.objects.get_or_create(
                portfolio=portfolio, stock=stock,
                defaults={'buy_price': buy_price, 'shares': shares}
            )
            if not created:
                ps.buy_price = buy_price
                ps.shares = shares
                ps.save()
                return Response({'detail': 'Stock updated in portfolio.'}, status=status.HTTP_200_OK)
            return Response({'detail': 'Stock added to portfolio.'}, status=status.HTTP_200_OK)
        
        # For GET and DELETE, treat stock_param as a 1-indexed position within portfolio.portfoliostock_set.
        try:
            index = int(stock_param) - 1  # Convert 1-indexed value to 0-indexed.
            ps = portfolio.portfoliostock_set.all()[index]
        except (ValueError, IndexError):
            return Response({'detail': 'Stock not found in portfolio'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method.lower() == 'delete':
            ps.delete()
            return Response({'detail': 'Stock removed from portfolio.'}, status=status.HTTP_204_NO_CONTENT)
        
        # GET: return the portfolio stock details.
        serializer = PortfolioStockSerializer(ps)
        return Response(serializer.data)

# CRUD endpoint for Watchlist objects.
class WatchlistViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WatchlistSerializer

    def get_queryset(self):
        return Watchlist.objects.filter(owner=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    # Custom action on the collection to DELETE all watchlists for the user.
    @action(detail=False, methods=['delete'], url_path='')
    def delete_all(self, request):
        qs = self.get_queryset()
        count = qs.count()
        qs.delete()
        return Response({'detail': f'{count} watchlist(s) deleted.'}, status=status.HTTP_204_NO_CONTENT)

    # Custom action to GET, POST, or DELETE a specific stock in a watchlist.
    # GET /api/watchlists/<watchlist_pk>/<stock_index>/
    #   -> Returns the stock at the given 1-indexed position in the watchlist.
    # DELETE /api/watchlists/<watchlist_pk>/<stock_index>/
    #   -> Removes the stock at that 1-indexed position from the watchlist.
    # POST /api/watchlists/<watchlist_pk>/<stock_id>/
    #   -> Adds the stock (identified by its primary key) from the database to the watchlist.
    @action(detail=True, methods=['get', 'delete', 'post'], url_path=r'(?P<stock_index>\d+)')
    def stock(self, request, pk=None, stock_index=None):
        watchlist = self.get_object()
        if request.method.lower() == 'post':
            # Interpret the URL parameter as the stock's primary key.
            try:
                stock_pk = int(stock_index)
                stock = Stock.objects.get(pk=stock_pk)
            except (ValueError, Stock.DoesNotExist):
                return Response({'detail': 'Stock not found'}, status=status.HTTP_404_NOT_FOUND)
            watchlist.stocks.add(stock)
            return Response({'detail': 'Stock added to watchlist.'}, status=status.HTTP_200_OK)
        
        # For GET and DELETE, treat the parameter as a 1-indexed position in the watchlist's stocks.
        try:
            index = int(stock_index) - 1  # Convert 1-indexed value to 0-indexed.
            stock = watchlist.stocks.all()[index]
        except (ValueError, IndexError):
            return Response({'detail': 'Stock not found in watchlist'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method.lower() == 'delete':
            watchlist.stocks.remove(stock)
            return Response({'detail': 'Stock removed from watchlist.'}, status=status.HTTP_204_NO_CONTENT)
        
        # GET: return the stock details.
        serializer = NestedStockSerializer(stock)
        return Response(serializer.data)