import serial
import pandas as pd
import numpy as np
from collections import defaultdict

# Serial port and baud rate
SERIAL_PORT = '/dev/tty.usbmodem2212202'
BAUD_RATE = 115200

# Reference values
CATEGORIES = {
    'SPUR':  100,
    'BIT_MARK': 560,
    'ONE_SPACE': 1690,
    'HEADER_SPACE': 4500,
    'HEADER_MARK': 9000,
    'GAP' : 100000
}

# Helper to categorize a value
def categorize(val):
    return min(CATEGORIES, key=lambda k: abs(val - CATEGORIES[k]))

# Data collection
all_data = []
cat_data = defaultdict(list)

with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1) as ser:
    print(f"Listening on {SERIAL_PORT} at {BAUD_RATE} baud...")
    try:
        while True:
            line = ser.readline().decode(errors='ignore').strip()
            if not line:
                continue
            # Split and filter out non-integer tokens
            try:
                numbers = [int(tok) for tok in line.split() if tok.isdigit()]
            except Exception:
                continue
            for n in numbers:
                cat = categorize(n)
                cat_data[cat].append(n)
                all_data.append({'value': n, 'category': cat})
            print(f"Collected {len(all_data)} values")
            # Optional: break after N lines for demo
            if len(all_data) > 500:
                break
    except KeyboardInterrupt:
        print("\nStopped by user.")

# Create DataFrame
if all_data:
    df = pd.DataFrame(all_data)
    df.to_csv('pulsetimes.csv', index=False)
    summary = df.groupby('category')['value'].agg(['mean', 'std', 'count'])
    # Calculate 1st and 99th percentiles for each group
    percentiles = df.groupby('category')['value'].quantile([0.01, 0.99]).unstack()
    percentiles.columns = ['p01', 'p99']
    summary = summary.join(percentiles)
    print("\nSummary by category:")
    # Round all columns to nearest 10 and convert to int, avoid scientific notation
    display_cols = ['mean', 'std', 'p01', 'p99']
    summary_disp = summary[display_cols].astype(int)
    pd.set_option('display.float_format', lambda x: f'{int(x):d}')
    print(summary_disp)
else:
    print("No data collected.")
