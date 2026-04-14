import joblib
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

m = joblib.load('models/best_model.pkl')
print('Model type:', type(m))
print(m)

if isinstance(m, Pipeline):
    print('Pipeline steps:', list(m.named_steps.keys()))
    pre = m.named_steps.get('preprocessor')
    if isinstance(pre, ColumnTransformer):
        print('Pipeline preprocessor transformers:')
        for nm, trans, cols in pre.transformers:
            print(' -', nm, 'transformer type:', type(trans), 'columns:', cols)
            if hasattr(trans, 'categories_'):
                print('   categories:', trans.categories_)
            if hasattr(trans, 'get_feature_names_out'):
                try:
                    names = trans.get_feature_names_out(cols)
                    print('   output names:', names)
                except Exception as e:
                    print('   could not get feature names', e)
    clf = m.named_steps.get('classifier')
    print('Classifier:', clf)
