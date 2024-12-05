import pandas as pd
import scipy.stats as stats
from statsmodels.stats.multicomp import pairwise_tukeyhsd
import numpy as np

# 데이터 준비
# Klas Planner 데이터
klas_data = {
    'Group': ['그룹1', '그룹1', '그룹3', '그룹3', '그룹2', '그룹2', '그룹4', '그룹4'],
    'Major_Intuitive': [5, 5, 4, 5, 4, 5, 4, 4],
    'Gyoyang_Intuitive': [5, 5, 4, 5, 5, 5, 4, 4],
    'Specific_Intuitive': [5, 5, 5, 5, 4, 5, 4, 5],
    'Want_Use': [5, 5, 4, 5, 5, 5, 4, 5]
}

# Everytime 데이터
everytime_data = {
    'Group': ['그룹1', '그룹1', '그룹2', '그룹2', '그룹3', '그룹3', '그룹4', '그룹4'],
    'Major_Intuitive': [3, 3, 2, 4, 3, 1, 3, 3],
    'Gyoyang_Intuitive': [1, 3, 2, 2, 3, 1, 4, 4],
    'Specific_Intuitive': [1, 2, 3, 2, 4, 3, 2, 2],
    'Want_Use': [1, 4, 4, 2, 3, 2, 3, 5]
}

klas_df = pd.DataFrame(klas_data)
everytime_df = pd.DataFrame(everytime_data)

# ANOVA 실행
categories = ['Major_Intuitive', 'Gyoyang_Intuitive',
              'Specific_Intuitive', 'Want_Use']

print("=== ANOVA 결과 ===")
for category in categories:
    klas_values = klas_df[category]
    everytime_values = everytime_df[category]

    # ANOVA 실행
    f_stat, p_value = stats.f_oneway(klas_values, everytime_values)

    # Partial eta squared 계산
    # SS_between 계산
    grand_mean = np.mean(np.concatenate([klas_values, everytime_values]))
    n1, n2 = len(klas_values), len(everytime_values)
    m1, m2 = np.mean(klas_values), np.mean(everytime_values)
    ss_between = n1 * (m1 - grand_mean)**2 + n2 * (m2 - grand_mean)**2

    # SS_total 계산
    all_values = np.concatenate([klas_values, everytime_values])
    ss_total = np.sum((all_values - grand_mean)**2)

    # Partial eta squared 계산
    partial_eta_squared = ss_between / ss_total

    print(f"\n{category}:")
    print(f"F-value: {f_stat:.4f}")
    print(f"p-value: {p_value:.4f}")
    print(f"Partial η²: {partial_eta_squared:.4f}")
