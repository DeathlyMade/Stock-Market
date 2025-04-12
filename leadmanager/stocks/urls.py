from rest_framework.routers import DefaultRouter
from .api import StockViewSet, PortfolioViewSet, WatchlistViewSet

router = DefaultRouter()
router.register('api/stocks', StockViewSet, basename='stock')
router.register('api/portfolios', PortfolioViewSet, basename='portfolio')
router.register('api/watchlists', WatchlistViewSet, basename='watchlist')

urlpatterns = router.urls