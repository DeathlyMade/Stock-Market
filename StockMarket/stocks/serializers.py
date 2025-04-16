from rest_framework import serializers
from stocks.models import Stock, StockPrice, Portfolio, Watchlist, PortfolioStock
import datetime
from datetime import timedelta

class StockPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockPrice
        fields = '__all__'
        read_only_fields = list(fields)  # OR just list all fields manually, safer!

class StockSerializer(serializers.ModelSerializer):
    prices = StockPriceSerializer(many=True, read_only=True)  # uses related_name='prices'

    class Meta:
        model = Stock
        fields = '__all__'
        read_only_fields = list(fields)

class StockSerializerBasic(serializers.ModelSerializer):
    latest_price = serializers.SerializerMethodField()
    week_before_price = serializers.SerializerMethodField()
    month_before_price = serializers.SerializerMethodField()
    year_before_price = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        fields = ('id', 'ticker', 'company_name', 'series', 'industry', 
                  'latest_price', 'week_before_price', 'month_before_price', 'year_before_price')

    def get_latest_price(self, obj):
        latest = obj.prices.first()  # Assumes prices are ordered by '-date'
        if latest:
            return StockPriceSerializer(latest).data
        return None
    
    def get_week_before_price(self, obj):
        latest = obj.prices.first()
        if not latest:
            return None
        target_date = latest.date - timedelta(days=7)
        week_ago = obj.prices.filter(date__lte=target_date).order_by("-date").first()
        if week_ago:
            return StockPriceSerializer(week_ago).data
        return None

    def get_month_before_price(self, obj):
        latest = obj.prices.first()
        if not latest:
            return None
        # Subtract 30 days from latest date
        target_date = latest.date - timedelta(days=30)
        # Get the most recent price that is older than or equal to the target_date.
        month_ago = obj.prices.filter(date__lte=target_date).order_by("-date").first()
        if month_ago:
            return StockPriceSerializer(month_ago).data
        return None

    def get_year_before_price(self, obj):
        latest = obj.prices.first()
        if not latest:
            return None
        target_date = latest.date - timedelta(days=365)
        year_ago = obj.prices.filter(date__lte=target_date).order_by("-date").first()
        if year_ago:
            return StockPriceSerializer(year_ago).data
        return None


# Serializer for the through model PortfolioStock.
class PortfolioStockSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='stock.id', read_only=True)
    ticker = serializers.CharField(source='stock.ticker')
    current_close = serializers.SerializerMethodField()
    
    class Meta:
        model = PortfolioStock
        fields = ['id', 'ticker', 'buy_price', 'shares', 'current_close']
    
    def get_current_close(self, obj):
        latest_price = obj.stock.prices.first()  # Assuming ordering by descending date
        if latest_price and latest_price.close_price is not None:
            return latest_price.close_price
        return None


class PortfolioSerializer(serializers.ModelSerializer):
    # Use the through relation to receive nested stock entries.
    stocks = PortfolioStockSerializer(source='portfoliostock_set', many=True, required=False)

    class Meta:
        model = Portfolio
        fields = ['id', 'name', 'description', 'stocks']

    def create(self, validated_data):
        stocks_data = validated_data.pop('portfoliostock_set', [])
        portfolio = Portfolio.objects.create(**validated_data)
        for stock_data in stocks_data:
            # Expect the input to have a structure: {"stock": {"ticker": "AXISBANK"}, "buy_price": 10, "shares": 1000}
            ticker = stock_data.get('stock', {}).get('ticker')
            buy_price = stock_data.get('buy_price')
            shares = stock_data.get('shares')
            try:
                stock = Stock.objects.get(ticker=ticker)
                PortfolioStock.objects.create(
                    portfolio=portfolio,
                    stock=stock,
                    buy_price=buy_price,
                    shares=shares
                )
            except Stock.DoesNotExist:
                # Optionally log or skip the stock if not found.
                continue
        return portfolio

class NestedStockSerializer(serializers.ModelSerializer):
    ticker = serializers.CharField(required=True)
    id = serializers.IntegerField(read_only=True)  # fixed source reference

    class Meta:
        model = Stock
        fields = ('id', 'ticker')


class WatchlistSerializer(serializers.ModelSerializer):
    stocks = StockSerializerBasic(many=True, read_only=True)
    
    class Meta:
        model = Watchlist
        fields = ('id', 'stocks')