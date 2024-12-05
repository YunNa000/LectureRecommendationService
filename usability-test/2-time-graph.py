import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# 시간 데이터를 분 단위로 변환하는 함수


def convert_to_minutes(time_str):
    if '분' in time_str:
        if '초' in time_str:
            minutes, seconds = time_str.split('분')
            seconds = seconds.replace('초', '').strip()
            return float(minutes) + float(seconds)/60
        return float(time_str.replace('분', ''))
    return 0


# 데이터 생성
klas_data = {
    'platform': ['klas']*8,
    'group': ['그룹1', '그룹1', '그룹3', '그룹3', '그룹2', '그룹2', '그룹4', '그룹4'],
    'person': ['p1', 'p2', 'p3', 'p6', 'p4', 'p5', 'p7', 'p8'],
    'time': ['9분', '6분 30초', '9분 24초', '5분', '6분 03초', '7분 30초', '9분 16초', '7분 57초']
}

everytime_data = {
    'platform': ['everytime']*8,
    'group': ['그룹1', '그룹1', '그룹2', '그룹2', '그룹3', '그룹3', '그룹4', '그룹4'],
    'person': ['p1', 'p2', 'p4', 'p5', 'p3', 'p6', 'p7', 'p8'],
    'time': ['13분', '7분 26초', '12분', '8분 23초', '11분 41초', '8분 50초', '14분 2초', '14분 32초']
}

# DataFrame 생성 및 결합
df_klas = pd.DataFrame(klas_data)
df_everytime = pd.DataFrame(everytime_data)
df = pd.concat([df_klas, df_everytime])

# 시간 변환
df['minutes'] = df['time'].apply(convert_to_minutes)

# 오류 데이터 생성
error_data = {
    'platform': ['K.P.', 'E.T.'],
    'errors': [0, 4]
}
error_df = pd.DataFrame(error_data)

# 서브플롯 생성
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(
    9, 6), gridspec_kw={'width_ratios': [8, 1]})

# 첫 번째 그래프 (시간 분포)
sns.kdeplot(data=df[df['platform'] == 'klas'], x='minutes',
            label='KLAS Planner', color='blue', ax=ax1)
sns.kdeplot(data=df[df['platform'] == 'everytime'],
            x='minutes', label='Everytime', color='red', ax=ax1)

ax1.set_title(
    'Time Distribution Comparison\nbetween KLAS Planner and Everytime', fontsize=14)
ax1.set_xlabel('Time (minutes)', fontsize=14)
ax1.set_ylabel('Frequency', fontsize=14)
ax1.legend(fontsize=14)
ax1.grid(True, alpha=0.3)

# 두 번째 그래프 (오류 횟수)
bars = ax2.bar(error_df['platform'], error_df['errors'], color=['blue', 'red'])
ax2.set_title('Num of Err', fontsize=14)
ax2.set_ylabel('Num of Err', fontsize=12)
ax2.grid(True, alpha=0.3, axis='y')

# y축 범위 설정
ax2.set_ylim(0, 6)

# 막대 위에 값 표시
for bar in bars:
    height = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2., height,
             f'{int(height)}',
             ha='center', va='bottom')

plt.tight_layout()
plt.show()
