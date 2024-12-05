import pandas as pd
import scipy.stats as stats
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

klas_data = {
    'find specific major': [5, 5, 4, 4, 5, 5, 4, 4],
    'find specific gyoyang': [5, 5, 4, 5, 5, 5, 4, 4],
    'find specific subjects': [5, 5, 5, 4, 5, 5, 4, 5],
    'want to use it later': [5, 5, 4, 5, 5, 5, 4, 5]
}

everytime_data = {
    'find specific major': [3, 3, 3, 2, 4, 1, 3, 3],
    'find specific gyoyang': [1, 3, 3, 2, 2, 1, 4, 4],
    'find specific subjects': [1, 2, 4, 3, 2, 3, 2, 2],
    'want to use it later': [1, 4, 3, 4, 2, 2, 3, 5]
}

categories = ['find specific major', 'find specific gyoyang',
              'find specific subjects', 'want to use it later']
results = {}

for category in categories:
    klas_scores = klas_data[category]
    everytime_scores = everytime_data[category]

    statistic, p_value = stats.wilcoxon(klas_scores, everytime_scores)
    results[category] = {
        'statistic': statistic,
        'p_value': p_value,
        'klas_mean': np.mean(klas_scores),
        'everytime_mean': np.mean(everytime_scores)
    }

# Create box plot
plt.figure(figsize=(12, 6))

# Prepare data for box plot
klas_box_data = [klas_data[cat] for cat in categories]
everytime_box_data = [everytime_data[cat] for cat in categories]

# Create positions for box plots
positions = np.arange(len(categories)) * 2
width = 0.8

# Create box plots
bp1 = plt.boxplot(klas_box_data, positions=positions - width/2, widths=width,
                  patch_artist=True, labels=[''] * len(categories))
bp2 = plt.boxplot(everytime_box_data, positions=positions + width/2, widths=width,
                  patch_artist=True, labels=[''] * len(categories))

# Customize box plots
for box in bp1['boxes']:
    box.set(facecolor='skyblue')
for box in bp2['boxes']:
    box.set(facecolor='lightcoral')

plt.xlabel('Categories')
plt.ylabel('Scores')
plt.title('Comparison of KLAS vs Everytime Scores')
plt.xticks(positions, categories, rotation=45)

# Add legend
plt.plot([], [], color='skyblue', label='KLAS', linewidth=10)
plt.plot([], [], color='lightcoral', label='Everytime', linewidth=10)
plt.legend()

# Add p-values above box plots
for i, cat in enumerate(categories):
    plt.text(positions[i], 5.5,
             f'p={results[cat]["p_value"]:.4f}', ha='center')

plt.tight_layout()
plt.show()

# Print numerical results
for category in categories:
    print(f"\n{category}:")
    print(f"KLAS Mean: {results[category]['klas_mean']:.2f} | Everytime Mean: {
          results[category]['everytime_mean']:.2f}")
    print(f"Wilcoxon statistic: {results[category]['statistic']:.4f}")
    print(f"p-value: {results[category]['p_value']:.4f}")
