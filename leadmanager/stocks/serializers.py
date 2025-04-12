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

class StockSerializerBasic(serializers.ModelSerializer):
    latest_price = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        fields = ('id', 'ticker', 'company_name', 'series', 'industry', 'latest_price')

    def get_latest_price(self, obj):
        latest = obj.prices.first()  # Assumes prices are ordered by '-date'
        if latest:
            return StockPriceSerializer(latest).data
        return None


# Serializer for the through model PortfolioStock.
class PortfolioStockSerializer(serializers.ModelSerializer):
    ticker = serializers.CharField(source='stock.ticker')

    class Meta:
        model = PortfolioStock
        fields = ['ticker', 'buy_price', 'shares']

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
    stocks = NestedStockSerializer(many=True, required=False)
    owner = serializers.ReadOnlyField(source='owner.id')

    class Meta:
        model = Watchlist
        fields = '__all__'

    def create(self, validated_data):
        stocks_data = validated_data.pop('stocks', [])
        watchlist = Watchlist.objects.create(**validated_data)

        tickers = [s.get('ticker') for s in stocks_data]
        stocks = Stock.objects.filter(ticker__in=tickers)
        watchlist.stocks.set(stocks)

        return watchlist

    def update(self, instance, validated_data):
        stocks_data = validated_data.pop('stocks', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if stocks_data is not None:
            tickers = [s.get('ticker') for s in stocks_data]
            stocks = Stock.objects.filter(ticker__in=tickers)
            instance.stocks.set(stocks)

        return instance


