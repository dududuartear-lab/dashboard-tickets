import pandas as pd
import numpy as np
import random
import uuid
from datetime import datetime, timedelta

def generate_ticket_data(num_rows=50000):
    print(f"Iniciando geração de {num_rows} linhas...")

    # 1. Definição dos dados da imagem (Valores em Reais R$)
    # Meses: Jul, Ago, Set, Out, Nov, Dez (Indices 0 a 5)
    months_labels = ['July', 'August', 'September', 'October', 'November', 'December']
    
    payments_data = {
        'Campaign': {
            'cc': 'OPS Driver',
            'values': [22806.49, 34682.35, 29101.77, 113408.03, 206494.00, 715224.71]
        },
        'Bugs': {
            'cc': 'Product UX/UI',
            'values': [9305.69, 18073.68, 22371.44, 38708.41, 52580.91, 45050.90]
        },
        'Optimizer miscalculation': {
            'cc': 'Product UX/UI',
            'values': [14348.16, 6760.40, 7295.26, 20242.88, 44891.66, 32092.60]
        },
        'Others': {
            'cc': 'OPS Driver',
            'values': [9500.02, 21752.44, 16836.95, 17360.24, 18027.76, 24616.75]
        },
        'Car Wash (UAU)': {
            'cc': 'UAU',
            'values': [91.13, 3014.00, 5585.00, 10880.00, 15415.59, 14832.00]
        },
        'Not Validated PIN': {
            'cc': 'Product UX/UI',
            'values': [3688.61, 5187.01, 9039.97, 15126.90, 5399.26, 12595.95]
        },
        'Improper collection of ride tax': {
            'cc': 'Product UX/UI',
            'values': [7612.61, 3511.85, 4375.05, 5227.56, 9696.92, 9054.51]
        },
        'Miscalculation of road toll': {
            'cc': 'Product UX/UI',
            'values': [9964.65, 9719.67, 13715.53, 7963.46, 7421.01, 4235.95]
        },
        'Ride with assault (Safety)': {
            'cc': 'OPS Driver',
            'values': [2124.08, 3945.21, 997.40, 1183.15, 1875.95, 1590.23]
        },
        'Ride cancellation (CSI Only)': {
            'cc': 'CSI',
            'values': [6129.20, 12263.90, 1623.15, 80.04, 553.52, 2134.76]
        },
        'Driver Get Driver': {
            'cc': 'OPS Driver',
            'values': [688.81, 1700.00, 1750.00, 400.00, 323.88, 200.00]
        }
    }

    # Cálculo do valor total de Payments
    total_payments_value = 0
    for reason in payments_data:
        total_payments_value += sum(payments_data[reason]['values'])

    # 2. Distribuição de Macros
    # Payments = 36%, Onboarding = 20%, General = 12%, Others = 32%
    rows_payments = int(num_rows * 0.36)
    rows_onboarding = int(num_rows * 0.20)
    rows_general = int(num_rows * 0.12)
    rows_others_macros = num_rows - rows_payments - rows_onboarding - rows_general

    data = []

    # 3. Gerador de IDs de Usuário (96% únicos)
    num_unique_users = int(num_rows * 0.96)
    unique_user_pool = [str(uuid.uuid4())[:8].upper() for _ in range(num_unique_users)]
    
    def get_user_id():
        if random.random() > 0.96: # 4% de chance de repetir
            return random.choice(unique_user_pool)
        return unique_user_pool.pop() if unique_user_pool else str(uuid.uuid4())[:8].upper()

    # 4. Geração dos dados de Payments (Baseado na Imagem)
    # Para cumprir a regra de 80% das linhas < 100 somarem 50% do valor total:
    # Vamos dividir o valor de cada "célula" (motivo/mês) em duas partes.
    
    total_rows_created = 0
    
    for reason, info in payments_data.items():
        for month_idx, month_val in enumerate(info['values']):
            # Quantos tickets esse motivo/mês deve ter proporcionalmente ao valor?
            # Nota: Ajustamos para que a soma de tickets de payments dê rows_payments
            share_of_value = month_val / total_payments_value
            target_tickets = int(rows_payments * share_of_value)
            if target_tickets < 2: target_tickets = 2 # Mínimo para o split 80/20
            
            # Split de Tickets: 80% baratos, 20% caros
            n_cheap = int(target_tickets * 0.8)
            n_expensive = target_tickets - n_cheap
            
            if n_cheap == 0: n_cheap = 1
            if n_expensive == 0: n_expensive = 1
            
            # Split de Valor: 50% do valor total da célula para cada grupo
            val_cheap_total = month_val * 0.5
            val_expensive_total = month_val * 0.5
            
            # Gerar valores individuais
            # Baratos (< 100)
            avg_cheap = val_cheap_total / n_cheap
            # Se a média for > 100, precisamos de mais tickets. 
            # Mas como o volume total de tickets é alto (50k), a média costuma ser baixa.
            cheap_vals = np.random.uniform(low=0.5, high=min(99.99, avg_cheap*1.5), size=n_cheap)
            # Ajuste fino para bater a soma exata
            cheap_vals = cheap_vals * (val_cheap_total / cheap_vals.sum())
            
            # Caros (>= 100)
            expensive_vals = np.random.uniform(low=100.0, high=max(100.1, (val_expensive_total/n_expensive)*1.5), size=n_expensive)
            expensive_vals = expensive_vals * (val_expensive_total / expensive_vals.sum())
            
            all_vals = np.concatenate([cheap_vals, expensive_vals])
            
            for v in all_vals:
                data.append({
                    'User ID': get_user_id(),
                    'Month': months_labels[month_idx],
                    'Macro Reason': 'payments',
                    'Micro Reason': reason,
                    'Financial Value (BRL)': round(v, 2),
                    'Cost Center': info['cc']
                })

    # 5. Outros Macros (Onboarding, General, etc.)
    # Atribuímos valores baixos para manter a meta de 80% das linhas totais < 100
    other_macros = [
        ('onboarding', rows_onboarding, ['App Download', 'ID Verification', 'First Ride Guide']),
        ('general questions', rows_general, ['App Navigation', 'Referral Program', 'Terms of Service']),
        ('bugs', int(rows_others_macros*0.2), ['App Crash', 'GPS Glitch']),
        ('card', int(rows_others_macros*0.2), ['Card Linking', 'Expired Card']),
        ('incentives', int(rows_others_macros*0.2), ['Promo Code Not Working', 'Bonus Eligibility']),
        ('feedbacks', int(rows_others_macros*0.2), ['Driver Compliment', 'Suggestion']),
        ('others', rows_others_macros - 4*int(rows_others_macros*0.2), ['Miscellaneous'])
    ]

    for macro, count, micros in other_macros:
        for _ in range(count):
            data.append({
                'User ID': get_user_id(),
                'Month': random.choice(months_labels),
                'Macro Reason': macro,
                'Micro Reason': random.choice(micros),
                'Financial Value (BRL)': round(random.uniform(0.1, 10.0), 2), # Valores simbólicos
                'Cost Center': 'OPS Driver' if macro != 'bugs' else 'Product UX/UI'
            })

    # Criar DataFrame e embaralhar
    df = pd.DataFrame(data)
    df = df.sample(frac=1).reset_index(drop=True)

    # Exportar
    output_file = 'simulacao_tickets_atendimento.csv'
    df.to_csv(output_file, index=False, decimal=',', sep=';')
    
    print(f"Arquivo '{output_file}' gerado com sucesso!")
    
    # Validação rápida no console
    total_val = df['Financial Value (BRL)'].sum()
    cheap_rows = df[df['Financial Value (BRL)'] < 100]
    print(f"\n--- Validação dos Dados ---")
    print(f"Total de Linhas: {len(df)}")
    print(f"Percentual de Linhas < 100: {(len(cheap_rows)/len(df))*100:.1f}% (Meta: 80%)")
    print(f"Soma financeira das linhas < 100: {cheap_rows['Financial Value (BRL)'].sum():.2f}")
    print(f"Percentual do Valor Total em linhas < 100: {(cheap_rows['Financial Value (BRL)'].sum()/total_val)*100:.1f}% (Meta: 50%)")
    print(f"Proporção Macro 'payments': {(len(df[df['Macro Reason'] == 'payments'])/len(df))*100:.1f}% (Meta: 36%)")

if __name__ == "__main__":
    # Gerar 50.000 linhas para garantir que os volumes financeiros altos de Dezembro 
    # possam ser diluídos em tickets individuais respeitando a regra de < 100 reais.
    generate_ticket_data(50000)