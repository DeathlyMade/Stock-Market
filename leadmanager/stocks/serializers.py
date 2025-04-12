from rest_framework import serializers
from stocks.models import Stock, StockPrice, Portfolio, Watchlist, PortfolioStock

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

# For nested representation in Portfolio and Watchlist, we require only the ticker.
# When creating/updating a Watchlist, the client can send a list of dictionaries with only "ticker"
class NestedStockSerializer(serializers.ModelSerializer):
    ticker = serializers.CharField(required=True)
    class Meta:
        model = Stock
        fields = ('ticker',)

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

# Watchlist CRUD serializer.
class WatchlistSerializer(serializers.ModelSerializer):
    stocks = NestedStockSerializer(many=True, required=False)
    owner = serializers.ReadOnlyField(source='owner.id')
    
    class Meta:
        model = Watchlist
        fields = '__all__'
    
    def create(self, validated_data):
        stocks_data = validated_data.pop('stocks', [])
        watchlist = Watchlist.objects.create(**validated_data)
        for stock_item in stocks_data:
            try:
                stock = Stock.objects.get(ticker=stock_item.get('ticker'))
                watchlist.stocks.add(stock)
            except Stock.DoesNotExist:
                continue
        return watchlist

    def update(self, instance, validated_data):
        stocks_data = validated_data.pop('stocks', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if stocks_data is not None:
            instance.stocks.clear()
            for stock_item in stocks_data:
                try:
                    stock = Stock.objects.get(ticker=stock_item.get('ticker'))
                    instance.stocks.add(stock)
                except Stock.DoesNotExist:
                    continue
        return instance

