import os
import csv
import glob
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand, CommandError
from stocks.models import Stock, StockPrice
from decimal import Decimal, InvalidOperation

class Command(BaseCommand):
    help = 'Import stock and historical price data from all CSV files in a given dataset folder, limiting to the last two calendar years in each CSV file'

    def add_arguments(self, parser):
        parser.add_argument(
            'dataset_path',
            type=str,
            help='Path to the folder containing CSV files'
        )

    def handle(self, *args, **options):
        dataset_path = options['dataset_path']

        if not os.path.isdir(dataset_path):
            raise CommandError(f"Directory '{dataset_path}' does not exist or is not a directory.")
        
        # Reading metadata from stock_metadata.csv
        metadata_file = os.path.join(dataset_path, 'stock_metadata.csv')
        try:
            with open(metadata_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    ticker = row.get('Symbol', '').strip()
                    company_name = row.get('Company Name', '').strip()
                    series = row.get('Series', '').strip() or "EQ"
                    industry = row.get('Industry', '').strip()

                    # Get or create the Stock record.
                    stock_obj, created = Stock.objects.get_or_create(
                        ticker=ticker,
                        defaults={'company_name': company_name, 'series': series, 'industry': industry}
                    )
                    if not created:
                        stock_obj.company_name = company_name
                        stock_obj.series = series
                        stock_obj.save()
        except FileNotFoundError:
            self.stdout.write(self.style.WARNING(f"Metadata file '{metadata_file}' not found. Skipping metadata import."))

        # Find all CSV files in the directory.
        csv_files = glob.glob(os.path.join(dataset_path, '*.csv'))
        if not csv_files:
            self.stdout.write(self.style.WARNING("No CSV files found in the provided dataset directory."))
            return

        total_records = 0

        # Process each CSV file.
        for csv_file in csv_files:
            self.stdout.write(self.style.SUCCESS(f"Processing file: {csv_file}"))

            # Use the file name (without extension) as the default ticker if Symbol is not provided.
            ticker_from_filename = os.path.splitext(os.path.basename(csv_file))[0].upper()
            if ticker_from_filename == 'STOCK_METADATA':
                continue

            try:
                with open(csv_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    rows = list(reader)

                    # Determine the maximum date available in this CSV file.
                    max_date = None
                    for row in rows:
                        date_str = row.get('Date', '').strip()
                        try:
                            d = datetime.strptime(date_str, '%Y-%m-%d').date()
                            if (max_date is None) or (d > max_date):
                                max_date = d
                        except ValueError:
                            # skip invalid dates while finding max_date
                            continue

                    # Calculate threshold: If max_date exists then keep data with date 
                    # on or after January 1 of (max_date.year - 1)
                    threshold_date = None
                    if max_date:
                        threshold_date = datetime(max_date.year - 1, 1, 1).date()

                    for row in rows:
                        # Map CSV columns to Stock model fields.
                        ticker = row.get('Symbol', '').strip() or ticker_from_filename

                        # Get the corresponding Stock object (assumes it already exists)
                        stock_obj = Stock.objects.get(ticker=ticker)

                        # Parse the Date column (assumes format 'YYYY-MM-DD').
                        date_str = row.get('Date', '').strip()
                        try:
                            date = datetime.strptime(date_str, '%Y-%m-%d').date()
                        except ValueError:
                            self.stdout.write(
                                self.style.WARNING(f"Skipping row with invalid date: {date_str} in file {csv_file}")
                            )
                            continue

                        # Skip rows older than the calculated threshold for this CSV (if threshold was determined).
                        if threshold_date and date < threshold_date:
                            continue

                        def to_decimal(val):
                            if val is None:
                                return None
                            val = val.strip()
                            if val == '':
                                return None
                            try:
                                return Decimal(val.replace(',', ''))  # remove commas if any
                            except InvalidOperation:
                                print(f"Invalid decimal value: {val} in file {csv_file} on date {date_str}")
                                return None

                        try:
                            # Map CSV columns to the StockPrice model fields.
                            stock_price_data = {
                                'prev_close_price': to_decimal(row.get('Prev Close')),
                                'open_price': to_decimal(row.get('Open')),
                                'high_price': to_decimal(row.get('High')),
                                'last_price': to_decimal(row.get('Last')),
                                'low_price': to_decimal(row.get('Low')),
                                'close_price': to_decimal(row.get('Close')),
                                'VWAP': to_decimal(row.get('VWAP')),
                                'volume': to_decimal(row.get('Volume')),
                            }
                        except Exception as e:
                            self.stdout.write(
                                self.style.WARNING(f"Error converting numeric values on {date_str} in file {csv_file}: {e}")
                            )
                            continue

                        # Create or update the StockPrice record.
                        StockPrice.objects.update_or_create(
                            stock=stock_obj,
                            date=date,
                            defaults=stock_price_data
                        )
                        total_records += 1

            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Error processing file {csv_file}: {e}"))
                # Optionally print detailed error info.
                print(f"❌ Error in row: {row}")

        self.stdout.write(self.style.SUCCESS(
            f"Successfully processed {len(csv_files)} files and imported {total_records} records."
        ))