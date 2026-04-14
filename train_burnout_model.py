
import os
import time
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
import joblib
import warnings
warnings.filterwarnings('ignore')

# Set random state for reproducibility
RANDOM_STATE = 42
USER_INPUT_FEATURES = [
    "age",
    "gender",
    "academic_year",
    "study_hours_per_day",
    "exam_pressure",
    "academic_performance",
    "stress_level",
    "anxiety_score",
    "depression_score",
    "sleep_hours",
    "physical_activity",
    "social_support",
    "screen_time",
    "financial_stress",
    "family_expectation",
]

RANDOM_FOREST_MODEL_PATH = os.path.join("model", "burnout_model.pkl")
SCALER_PATH = os.path.join("model", "scaler.pkl")
MODEL_DIR = "model"
DATA_FILENAME = "student_mental_health_burnout_1M.csv"
EXPECTED_COLUMNS = USER_INPUT_FEATURES + ["burnout_level"]


def load_data(file_path):
    df = pd.read_csv(file_path)
    print("Dataset loaded with shape: {}".format(df.shape))
    return df


def handle_missing_values(df):
    print("Missing values before handling:")
    print(df.isnull().sum())

    df = df.dropna(subset=['burnout_level'])

    num_cols = df.select_dtypes(include=[np.number]).columns
    for col in num_cols:
        if df[col].isnull().sum() > 0:
            df[col].fillna(df[col].median(), inplace=True)

    cat_cols = df.select_dtypes(include=['object']).columns
    for col in cat_cols:
        if col != 'burnout_level' and df[col].isnull().sum() > 0:
            df[col].fillna(df[col].mode()[0], inplace=True)

    print("Missing values after handling:")
    print(df.isnull().sum())
    return df


def preprocess_data(df):
    if 'student_id' in df.columns:
        df = df.drop('student_id', axis=1)

    available_columns = [col for col in EXPECTED_COLUMNS if col in df.columns]
    df = df[available_columns].copy()

    cat_cols = df.select_dtypes(include=['object']).columns.tolist()
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    if 'burnout_level' in cat_cols:
        cat_cols.remove('burnout_level')

    print("Categorical columns: {}".format(cat_cols))
    print("Numerical columns: {}".format(num_cols))

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), num_cols),
            ('cat', OneHotEncoder(drop='first', sparse_output=False), cat_cols)
        ])

    return df, preprocessor, cat_cols, num_cols


def split_data(df, target_col='burnout_level'):
    X = df.drop(target_col, axis=1)
    y = df[target_col]

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=RANDOM_STATE, stratify=y_encoded
    )

    return X_train, X_test, y_train, y_test, label_encoder


def train_models(X_train, y_train, preprocessor):
    start_time = time.time()

    model = Pipeline(
        steps=[
            ('preprocessor', preprocessor),
            ('classifier', RandomForestClassifier(
                n_estimators=50,
                max_depth=10,
                random_state=RANDOM_STATE,
                n_jobs=1
            ))
        ]
    )

    model.fit(X_train, y_train)

    print("Training completed in {:.2f} seconds".format(time.time() - start_time))

    return {'RandomForest': model}


def evaluate_models(best_models, X_test, y_test, label_encoder):
    results = {}
    best_f1 = 0
    best_model = None
    best_name = None

    for name, model in best_models.items():
        print("\\nEvaluating {}...".format(name))
        y_pred = model.predict(X_test)

        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='macro')
        recall = recall_score(y_test, y_pred, average='macro')
        f1 = f1_score(y_test, y_pred, average='macro')

        results[name] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_macro': f1
        }

        print("Accuracy: {:.4f}".format(accuracy))
        print("Precision (macro): {:.4f}".format(precision))
        print("Recall (macro): {:.4f}".format(recall))
        print("F1 Score (macro): {:.4f}".format(f1))

        print("\\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

        print("Confusion Matrix:")
        cm = confusion_matrix(y_test, y_pred)
        print(cm)

        if f1 > best_f1:
            best_f1 = f1
            best_model = model
            best_name = name

    print("\\nBest model: {} with F1 macro: {:.4f}".format(best_name, best_f1))

    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, "burnout_model.pkl")
    joblib.dump(best_model, model_path)
    print("Best model saved as '{}'".format(model_path))

    scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
    joblib.dump(best_model.named_steps['preprocessor'], scaler_path)
    print("Scaler saved as '{}'".format(scaler_path))

    return best_model, results


def main():
    file_path = os.path.join("data", DATA_FILENAME)

    if not os.path.exists(file_path):
        raise FileNotFoundError(
            "Dataset not found at expected location: {}. Make sure the dataset is inside the 'data' folder.".format(file_path)
        )

    df = load_data(file_path)

    if len(df) > 10000:
        df = df.sample(n=10000, random_state=42)
    print("Dataset shape after sampling: {}".format(df.shape))

    df['burnout_level'] = pd.qcut(
        df['burnout_score'],
        q=3,
        labels=['Low', 'Medium', 'High']
    )

    df['burnout_encoded'] = df['burnout_level'].map({
        'Low': 0,
        'Medium': 1,
        'High': 2
    }).astype(int)

    print("\\nBurnout Level Distribution:")
    print(df['burnout_level'].value_counts())

    print("\\nEncoded Sample:")
    print(df[['burnout_level', 'burnout_encoded']].head())

    print("\\nData type of burnout_encoded:")
    print(df['burnout_encoded'].dtype)

    print("\\nCorrelation with burnout_level:")
    correlations = df.select_dtypes(include=[np.number]).corr()
    print(
        correlations['burnout_encoded']
        .sort_values(ascending=False)
    )

    print("\\nFirst 5 rows:")
    print(df.head())

    leakage_columns = ['burnout_score', 'burnout_encoded']
    for col in leakage_columns:
        if col in df.columns:
            df = df.drop(col, axis=1)

    print("\\nModel training starting...")

    df, preprocessor, cat_cols, num_cols = preprocess_data(df)

    print("\\nTraining with these final features:")
    print([col for col in df.columns if col != "burnout_level"])

    X_train, X_test, y_train, y_test, label_encoder = split_data(df)

    best_models = train_models(X_train, y_train, preprocessor)

    best_model, results = evaluate_models(best_models, X_test, y_test, label_encoder)


if __name__ == "__main__":
    main()
