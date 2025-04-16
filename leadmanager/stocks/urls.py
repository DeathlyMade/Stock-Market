from rest_framework.routers import DefaultRouter
from .api import StockViewSet, PortfolioViewSet
from django.urls import path
from stocks.api import get_watchlist, change_watchlist

urlpatterns = [
    path('api/watchlist/', get_watchlist, name='get_watchlist'),
    path('api/watchlist/<int:stock_id>', change_watchlist, name='change_watchlist'),  # Use POST to add
    path('api/watchlist/<int:stock_id>/', change_watchlist, name='change_watchlist'),
]

router = DefaultRouter()
router.register('api/stocks', StockViewSet, basename='stock')
router.register('api/portfolios', PortfolioViewSet, basename='portfolio')
# router.register('api/watchlists', WatchlistViewSet, basename='watchlist')

urlpatterns += router.urls 



