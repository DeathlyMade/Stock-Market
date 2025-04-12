import os
import csv
import glob
from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from stocks.models import Stock, StockPrice

class Command(BaseCommand):
    help = 'Import stock and historical price data from all CSV files in a given dataset folder'

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

            try:
                with open(csv_file, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        # Map CSV columns to Stock model fields.
                        ticker = row.get('Symbol', '').strip() or ticker_from_filename
                        company_name = row.get('Symbol', '').strip() or ticker_from_filename
                        series = row.get('Series', '').strip() or "EQ"

                        # Get or create the Stock record.
                        stock_obj, created = Stock.objects.get_or_create(
                            ticker=ticker,
                            defaults={'company_name': company_name, 'series': series}
                        )
                        if not created:
                            stock_obj.company_name = company_name
                            stock_obj.series = series
                            stock_obj.save()

                        # Parse the Date column (assumes format 'YYYY-MM-DD').
                        date_str = row.get('Date', '').strip()
                        try:
                            date = datetime.strptime(date_str, '%Y-%m-%d').date()
                        except ValueError:
                            self.stdout.write(
                                self.style.WARNING(f"Skipping row with invalid date: {date_str} in file {csv_file}")
                            )
                            continue

                        # Helper function to convert numeric fields (empty strings become None).
                        def to_decimal(val):
                            return val.strip() if val and val.strip() != '' else None

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
                                'volume': int(row['Volume']) if row.get('Volume', '').strip() != '' else None,
                                'turnover': to_decimal(row.get('Turnover')),
                                # 'trades' column from CSV is not used since there is no corresponding model field.
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

        self.stdout.write(self.style.SUCCESS(
            f"Successfully processed {len(csv_files)} files and imported {total_records} records."
        ))
