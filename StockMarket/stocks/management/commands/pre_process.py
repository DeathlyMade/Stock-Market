import os
import csv
#get directorry from where running the script

root_dir = os.path.dirname(os.path.abspath(__file__))
#go up one level to get the project root directory
root_dir = os.path.dirname(root_dir)
root_dir = os.path.dirname(root_dir)
root_dir = os.path.dirname(root_dir)

dataset_dir = os.path.join(root_dir, 'dataset')
files = os.listdir(dataset_dir)

# go through each csv
for file in files:
    if file.endswith('.csv') and file != 'stock_metadata.csv':
        file_path = os.path.join(dataset_dir, file)
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            new_csv = []
            for row in reader:
                ticker = row.get('Symbol', '').strip()

                if(ticker != file.split('.')[0].upper() and ticker != 'M&M'):
                    ticker = file.split('.')[0].upper()
                
                new_row = {}

                for key in row.keys():
                    new_row[key] = row[key]
                new_row['Symbol'] = ticker
                new_csv.append(new_row)
            #print count
        # write the new csv file into the same file
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=reader.fieldnames)
            writer.writeheader()
            writer.writerows(new_csv)
